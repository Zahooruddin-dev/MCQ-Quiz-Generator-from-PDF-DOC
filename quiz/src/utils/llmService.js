// LLMService.js - Working version with improved validation
import { REQUEST_TIMEOUT_MS } from './constants.js';
import {
  detectLanguage,
  getLanguagePrompt,
  analyzeContext,
} from './languageUtils.js';
import { trimForPrompt, extractJson, extractKeyFacts } from './textUtils.js';
import { readFileContent } from './fileReader.js';
import {
  saveQuizResults,
  getDashboardData,
  saveChatMessage,
  getGlobalApiKey,
  getGlobalApiConfig,
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
    console.log('✅ LLMService initialized');
  }

  static async preloadApiConfig() {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    await LLMService.instance.ensureApiKey();
    await LLMService.instance.ensureEndpoint();
    console.log('🚀 LLMService preloaded API key and endpoint');
  }

  async ensureApiKey() {
    if (!this.apiKey) {
      this.apiKey = sessionStorage.getItem('llm_apiKey') || (await getGlobalApiKey());
      if (!this.apiKey) throw new Error('No global API key configured in Firestore.');
      sessionStorage.setItem('llm_apiKey', this.apiKey);
      console.log('✅ API key loaded');
    }
    return this.apiKey;
  }

  async ensureEndpoint() {
    const config = await getGlobalApiConfig();
    if (!config?.baseUrl) throw new Error('No API endpoint configured in Firestore.');

    const cached = sessionStorage.getItem('llm_baseUrl');
    if (config.baseUrl !== this.baseUrl || config.baseUrl !== cached) {
      this.baseUrl = config.baseUrl;
      sessionStorage.setItem('llm_baseUrl', this.baseUrl);
      console.log(`✅ Endpoint loaded: ${this.baseUrl}`);
    } else if (!this.baseUrl) {
      this.baseUrl = cached;
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

  static generateCacheKey(content, options) {
    try {
      const shortContent = content.slice(0, 100);
      const optionsStr = JSON.stringify(options);
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
      
      const tokenResult = await user.getIdTokenResult();
      const isAdmin = tokenResult.claims.admin === true;

      if (isPremium || isAdmin) {
        return true;
      }

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

    await this.checkUserCredits();
    await this.ensureApiKey();
    await this.ensureEndpoint();

    console.log(`🚀 Starting quiz generation`);

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
          console.log('📋 Using cached questions');
          return LLMService.responseCache.get(cacheKey);
        }

        this.language = detectLanguage(sourceText);
        const text = trimForPrompt(sourceText);
        const keyFacts = extractKeyFacts(sourceText);
        const contextAnalysis = analyzeContext(sourceText);
        
        const prompt = this._buildBetterPrompt(text, keyFacts, numQuestions, difficulty, this.language);

        console.log(`🔧 Making API request`);
        const questions = await this._makeApiRequest(prompt, this.controller.signal);

        const processedQuestions = this._processQuestions(questions, numQuestions);
        
        LLMService.responseCache.set(cacheKey, processedQuestions);

        console.log(`✅ Generated ${processedQuestions.length} questions`);
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
            console.log('🔄 Retrying with new API key...');
          } catch (keyError) {
            console.error('❌ Failed to refresh API key:', keyError);
          }
        }

        console.error('❌ Quiz generation error:', error);
        throw error;
      }
    });
  }

  _buildBetterPrompt(text, keyFacts, numQuestions, difficulty, language) {
    const difficultyInstructions = {
      easy: "Focus on direct facts, definitions, and basic recall questions.",
      medium: "Include application questions and simple analysis of relationships.",
      hard: "Create questions requiring synthesis, evaluation, and complex reasoning."
    };

    const contextGuidance = keyFacts.length > 0 
      ? `\nKey facts from the content:\n${keyFacts.map((fact, i) => `${i+1}. ${fact}`).join('\n')}\n`
      : '';

    return `You are creating ${numQuestions} high-quality multiple choice questions based on the provided content.

CRITICAL REQUIREMENTS:
- Each question MUST be completely self-contained with all necessary information
- NEVER reference "the passage", "the text", "the document", or "according to the above"
- Questions must test understanding of ACTUAL content provided, not generic scenarios
- Use specific names, dates, numbers, and facts from the content
- Avoid generic placeholders like "X company", "Y study", "the senator", "the author"

EXAMPLES OF WHAT TO AVOID:
❌ "The senator described in the passage was known for what characteristic?"
❌ "According to the research, what was the main finding?"
❌ "The company's strategy involved which approach?"

EXAMPLES OF GOOD QUESTIONS:
✅ "Senator John McCain of Arizona, who served from 1987 to 2018, was primarily known for which characteristic?"
✅ "The 2019 Harvard Medical School study found that what percentage of teenagers got less than 7 hours of sleep?"
✅ "Netflix's streaming strategy in 2015 focused on which business approach?"

DIFFICULTY LEVEL: ${difficulty}
${difficultyInstructions[difficulty] || difficultyInstructions.medium}

CREATE QUESTIONS ABOUT:
- Specific names, dates, numbers, and facts from the content
- Actual concepts, processes, and relationships described
- Cause-and-effect relationships mentioned
- Definitions and explanations provided
- Comparisons and contrasts made

${contextGuidance}

Required JSON format:
{
  "questions": [
    {
      "question": "Self-contained question with all necessary context included",
      "options": ["Correct answer based on content", "Plausible wrong answer", "Another plausible wrong answer", "Third plausible wrong answer"],
      "correctAnswer": 0,
      "explanation": "Clear explanation of why this answer is correct"
    }
  ]
}

CONTENT:
${text}`;
  }

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

      console.log(`📥 Received ${rawText.length} characters from AI`);

      let questions = [];
      try {
        const extracted = extractJson(rawText);
        questions = extracted?.questions || [];
      } catch (error) {
        console.warn('⚠️ Primary JSON extraction failed, trying fallbacks');
        
        try {
          const jsonMatch = rawText.match(/\{[\s\S]*"questions"[\s\S]*\]/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            questions = parsed.questions || [];
          }
        } catch (e) {
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
          console.warn(`⚠️ Skipping question ${index + 1}: ${error.message}`);
          return null;
        }
      })
      .filter(q => q !== null);

    if (validQuestions.length === 0) {
      throw new Error('No valid questions could be processed');
    }

    console.log(`🔧 Processed ${validQuestions.length}/${questions.length} questions`);
    return validQuestions;
  }

  _processQuestion(q, index) {
    if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(`Missing required fields`);
    }

    const questionText = q.question.toString().trim();
    
    // Simple validation - reject obviously bad patterns
    const badPatterns = [
      /\b(the passage|the text|the document|the article)\b/gi,
      /\baccording to (the|this)\b/gi,
      /\bas mentioned (above|earlier)\b/gi,
      /\bthe (author|researcher|senator|president|company)\b/gi
    ];
    
    let hasBadPattern = false;
    for (const pattern of badPatterns) {
      if (pattern.test(questionText)) {
        hasBadPattern = true;
        console.warn(`Question ${index + 1} has bad pattern: ${pattern.source}`);
        break;
      }
    }
    
    // Skip questions with bad patterns instead of throwing error
    if (hasBadPattern) {
      return null;
    }

    const cleanOptions = q.options
      .map(opt => (opt || '').toString().trim().replace(/\s+/g, ' '))
      .filter(opt => opt.length > 0);
    
    if (cleanOptions.length !== 4) {
      throw new Error(`Must have exactly 4 valid options`);
    }

    const uniqueOptions = [...new Set(cleanOptions.map(opt => opt.toLowerCase()))];
    if (uniqueOptions.length !== 4) {
      throw new Error(`Options must be unique`);
    }

    const correctAnswer = parseInt(q.correctAnswer);
    if (isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer >= 4) {
      throw new Error(`Invalid correct answer index`);
    }

    const correctOption = cleanOptions[correctAnswer];
    const shuffledOptions = this.shuffleArray([...cleanOptions]);

    return {
      question: questionText,
      options: shuffledOptions,
      correctAnswer: shuffledOptions.indexOf(correctOption),
      explanation: (q.explanation || 'No explanation provided').toString().trim(),
      language: this.language,
    };
  }
}