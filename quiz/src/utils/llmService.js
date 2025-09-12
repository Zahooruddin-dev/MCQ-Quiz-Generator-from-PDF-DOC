// LLMService.js - Dynamic API key & baseUrl from Firestore - FIXED VERSION
import { REQUEST_TIMEOUT_MS } from './constants.js';
import {
  detectLanguage,
  getLanguagePrompt,
  analyzeContext,
} from './languageUtils.js';
import { trimForPrompt, extractJson } from './textUtils.js';
import { readFileContent } from './fileReader.js';
import {
  saveQuizResults,
  getDashboardData,
  saveChatMessage,
  getGlobalApiKey,
  getGlobalApiConfig, // fetch baseUrl & apiKey
} from './firebaseService.js';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig.js';
import { withRetry } from './retryUtils.js';
import { shuffleArray, validateQuestions } from './quizValidator.js';

export class LLMService {
  static instance = null;
  static responseCache = new Map();

  constructor() {
    this.baseUrl = sessionStorage.getItem('llm_baseUrl') || null;
    this.apiKey = sessionStorage.getItem('llm_apiKey') || null;
    this.language = 'en';
    this.controller = null;
    console.log('✅ LLMService initialized (endpoint & API key will be fetched dynamically if missing)');
  }

  static async preloadApiConfig() {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    await LLMService.instance.ensureApiKey();
    await LLMService.instance.ensureEndpoint();
    console.log('🚀 LLMService preloaded API key and endpoint in the background.');
  }

  async ensureApiKey() {
    if (!this.apiKey) {
      this.apiKey = sessionStorage.getItem('llm_apiKey') || (await getGlobalApiKey());
      if (!this.apiKey) throw new Error('No global API key configured in Firestore.');
      sessionStorage.setItem('llm_apiKey', this.apiKey);
      console.log('✅ Global API key loaded successfully (preloaded)');
    }
    return this.apiKey;
  }

  async ensureEndpoint() {
    if (!this.baseUrl) {
      const config = await getGlobalApiConfig();
      if (!config?.baseUrl) throw new Error('No API endpoint (baseUrl) configured in Firestore.');
      this.baseUrl = config.baseUrl;
      sessionStorage.setItem('llm_baseUrl', this.baseUrl);
      console.log(`✅ Dynamic endpoint loaded (preloaded): ${this.baseUrl}`);
    }
    return this.baseUrl;
  }

  async refreshApiKey() {
    this.apiKey = null;
    sessionStorage.removeItem('llm_apiKey');
    const newKey = await this.ensureApiKey();
    console.log('🔄 API key refreshed');
    return newKey;
  }

  async saveQuizResults(quizData) {
    return saveQuizResults(quizData);
  }

  async getDashboardData() {
    return getDashboardData();
  }

  async saveChatMessage(message, isUserMessage = true) {
    return saveChatMessage(message, isUserMessage);
  }

  async readFileContent(file) {
    return withRetry(async () => readFileContent(file));
  }

  shuffleArray(array) {
    return shuffleArray(array);
  }

  validateQuestions(questions) {
    return validateQuestions(questions);
  }

  // FIXED: Better cache key generation that handles Unicode
  static generateCacheKey(content, options) {
    try {
      const shortContent = content.slice(0, 100);
      const optionsStr = JSON.stringify(options);
      // Use a simple hash instead of btoa for Unicode safety
      let hash = 0;
      const combined = shortContent + optionsStr;
      for (let i = 0; i < Math.min(combined.length, 500); i++) {
        hash = ((hash << 5) - hash + combined.charCodeAt(i)) & 0xffffffff;
      }
      return `quiz_${Math.abs(hash).toString(36)}_${Date.now().toString(36).slice(-4)}`;
    } catch (error) {
      console.warn('Cache key fallback used:', error);
      return `quiz_fallback_${content.length}_${Date.now().toString(36)}`;
    }
  }

  // Check if user has sufficient credits (additional safety check)
  async checkUserCredits() {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('User profile not found');
      }

      const userData = userSnap.data();
      const isPremium = userData.isPremium || false;
      const credits = userData.credits || 0;
      
      // Check if user is admin
      const tokenResult = await user.getIdTokenResult();
      const isAdmin = tokenResult.claims.admin === true;

      // Premium users and admins have unlimited credits
      if (isPremium || isAdmin) {
        return true;
      }

      // Check if regular user has credits
      if (credits <= 0) {
        throw new Error('Insufficient credits. You need at least 1 credit to generate a quiz.');
      }

      return true;
    } catch (error) {
      console.error('❌ Credit check failed:', error);
      throw error;
    }
  }

  async generateQuizQuestions(fileOrText, options = {}) {
    const { numQuestions = 10, difficulty = 'medium' } = options;

    // Check credits first (safety check - UI should already handle this)
    await this.checkUserCredits();

    await this.ensureApiKey();
    await this.ensureEndpoint();

    console.log(`🚀 Starting quiz generation at: ${this.baseUrl}`);
    console.log('💳 Credit check passed - proceeding with generation');

    return withRetry(async () => {
      if (this.controller) this.controller.abort();
      this.controller = new AbortController();

      try {
        const sourceText = typeof fileOrText === 'string' 
          ? fileOrText 
          : await this.readFileContent(fileOrText);

        if (!sourceText?.trim() || sourceText.trim().length < 50) {
          throw new Error('The document seems empty or too short.');
        }

        const cacheKey = LLMService.generateCacheKey(sourceText, options);
        if (LLMService.responseCache.has(cacheKey)) {
          console.log('📋 Using cached quiz questions');
          const cached = LLMService.responseCache.get(cacheKey);
          return cached;
        }

        this.language = detectLanguage(sourceText);
        const text = trimForPrompt(sourceText);
        const contextAnalysis = analyzeContext(sourceText);
        const languagePrompt = getLanguagePrompt(
          this.language,
          numQuestions,
          difficulty,
          contextAnalysis
        );
        const prompt = this._buildPrompt(languagePrompt, text);

        console.log(`🔧 Making API request to: ${this.baseUrl}`);
        const questions = await this._makeApiRequest(prompt, this.controller.signal);

        const processedQuestions = this._processQuestions(questions, numQuestions);
        
        // Cache the processed questions
        LLMService.responseCache.set(cacheKey, processedQuestions);

        console.log(`✅ Quiz questions generated successfully - returning ${processedQuestions.length} questions`);
        
        // CRITICAL: Always return the questions array directly
        return processedQuestions;
        
      } catch (error) {
        if (error?.name === 'AbortError') {
          throw new Error('Request cancelled.');
        }

        if (error.message?.includes('API key') || 
            error.message?.includes('401') || 
            error.message?.includes('403')) {
          try {
            await this.refreshApiKey();
            console.log('🔄 API key refreshed, retrying request...');
          } catch (keyError) {
            console.error('❌ Failed to refresh API key:', keyError);
          }
        }

        console.error('❌ Quiz generation error:', error);
        throw error;
      }
    });
  }

  _buildPrompt(languagePrompt, text) {
    return `${languagePrompt}

IMPORTANT: For "context", use a direct quote from the source text, NOT a reference to "the passage" or "the text".

Create self-contained questions that include all necessary information within the question itself.

Format:
{
  "questions": [
    { "question": "string", "options": ["string","string","string","string"], "correctAnswer": 0, "explanation": "string", "context": "string" }
  ]
}

Content:
${text}`;
  }

  // ENHANCED: Better JSON extraction with fallback handling
  async _makeApiRequest(prompt, signal) {
    const apiKey = await this.ensureApiKey();
    await this.ensureEndpoint();

    const timeout = setTimeout(() => this.controller?.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 8192,
            topP: 0.8,
            topK: 40,
          },
        }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401 || response.status === 403) {
          this.apiKey = null;
          sessionStorage.removeItem('llm_apiKey');
        }

        throw new Error(
          `API failed: ${response.status} - ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      if (!rawText) {
        throw new Error('Empty response from the model.');
      }

      console.log(`📥 Received ${rawText.length} characters from AI model`);

      // ENHANCED: Better JSON extraction with multiple fallback methods
      let questions = [];
      try {
        const extracted = extractJson(rawText);
        questions = extracted?.questions || [];
      } catch (error) {
        console.warn('⚠️ Primary JSON extraction failed, trying fallback methods');
        
        // Fallback 1: Look for JSON object containing questions
        try {
          const jsonMatch = rawText.match(/\{[\s\S]*"questions"[\s\S]*\]/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            questions = parsed.questions || [];
          }
        } catch (e) {
          // Fallback 2: Look for questions array directly
          try {
            const questionsMatch = rawText.match(/"questions"\s*:\s*\[[\s\S]*\]/);
            if (questionsMatch) {
              const questionsJson = `{${questionsMatch[0]}}`;
              const parsed = JSON.parse(questionsJson);
              questions = parsed.questions || [];
            }
          } catch (e2) {
            console.error('❌ All JSON extraction methods failed');
            throw new Error('Failed to parse AI response as valid JSON');
          }
        }
      }

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('AI model returned no valid questions');
      }

      console.log(`✅ Successfully extracted ${questions.length} questions`);
      return questions;

    } finally {
      clearTimeout(timeout);
    }
  }

  _processQuestions(questions, numQuestions) {
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Model returned no questions.');
    }
    
    const validQuestions = questions
      .slice(0, numQuestions)
      .map((q, index) => {
        try {
          return this._processQuestion(q, index);
        } catch (error) {
          console.warn(`⚠️ Skipping invalid question ${index + 1}:`, error.message);
          return null;
        }
      })
      .filter(q => q !== null);

    if (validQuestions.length === 0) {
      throw new Error('No valid questions could be processed');
    }

    console.log(`🔧 Successfully processed ${validQuestions.length} out of ${questions.length} questions`);
    return validQuestions;
  }

  _processQuestion(q, index) {
    // Validate required fields
    if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(`Question ${index + 1} is missing required fields`);
    }

    const options = [...q.options];
    const cleanOptions = this._cleanAndValidateOptions(options, index);
    const correctAnswer = parseInt(q.correctAnswer);
    
    if (isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer >= 4) {
      throw new Error(`Question ${index + 1} has invalid correct answer index`);
    }

    const correctOption = cleanOptions[correctAnswer];
    const shuffledOptions = this.shuffleArray([...cleanOptions]);

    return {
      question: q.question.toString().trim(),
      options: shuffledOptions,
      correctAnswer: shuffledOptions.indexOf(correctOption),
      explanation: (q.explanation || 'No explanation provided').toString().trim(),
      context: this._cleanContext(q.context),
      language: this.language,
    };
  }

  _cleanAndValidateOptions(options, index) {
    const cleanOptions = options.map((opt) =>
      (opt || '').toString().trim().replace(/\s+/g, ' ')
    ).filter(opt => opt.length > 0);
    
    if (cleanOptions.length !== 4) {
      throw new Error(`Question ${index + 1} must have exactly 4 valid options`);
    }

    const uniqueOptions = [...new Set(cleanOptions.map(opt => opt.toLowerCase()))];
    if (uniqueOptions.length !== 4) {
      throw new Error(`Question ${index + 1} has duplicate or very similar options`);
    }
    
    return cleanOptions;
  }

  _cleanContext(context) {
    if (!context) return 'Context not available';
    
    return context
      .toString()
      .trim()
      .replace(/(according to|in|from) (the|this) (passage|text|document|article)/gi, '')
      .replace(/\b(the above|aforementioned)\b/gi, '')
      .trim() || 'Context not available';
  }
}