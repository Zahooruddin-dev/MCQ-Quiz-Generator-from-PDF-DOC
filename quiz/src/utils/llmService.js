// LLMService.js - Enhanced MCQ Generation with Superior Prompts (Context Removed)
import { REQUEST_TIMEOUT_MS } from './constants.js';
import {
  detectLanguage,
  generateSmartPrompt,
  analyzeContent,
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
  static MAX_CACHE_SIZE = 50; // Prevent memory bloat

  constructor() {
    this.baseUrl = sessionStorage.getItem('llm_baseUrl') || null;
    this.apiKey = sessionStorage.getItem('llm_apiKey') || null;
    this.language = 'en';
    this.controller = null;
    console.log('🚀 Enhanced LLMService initialized with superior MCQ generation');
  }

  static async preloadApiConfig() {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    await LLMService.instance.ensureApiKey();
    await LLMService.instance.ensureEndpoint();
    console.log('⚡ LLMService preloaded with optimized configuration');
  }

  async ensureApiKey() {
    if (!this.apiKey) {
      this.apiKey = sessionStorage.getItem('llm_apiKey') || (await getGlobalApiKey());
      if (!this.apiKey) throw new Error('No global API key configured in Firestore.');
      sessionStorage.setItem('llm_apiKey', this.apiKey);
      console.log('✅ API key loaded and cached');
    }
    return this.apiKey;
  }

  async ensureEndpoint() {
    const config = await getGlobalApiConfig();
    if (!config?.baseUrl) throw new Error('No API endpoint (baseUrl) configured in Firestore.');

    const cached = sessionStorage.getItem('llm_baseUrl');
    if (config.baseUrl !== this.baseUrl || config.baseUrl !== cached) {
      this.baseUrl = config.baseUrl;
      sessionStorage.setItem('llm_baseUrl', this.baseUrl);
      console.log(`🔗 Endpoint loaded: ${this.baseUrl}`);
    } else if (!this.baseUrl) {
      this.baseUrl = cached;
    }

    return this.baseUrl;
  }

  async refreshApiKey() {
    this.apiKey = null;
    sessionStorage.removeItem('llm_apiKey');
    const newKey = await this.ensureApiKey();
    console.log('🔄 API key refreshed successfully');
    return newKey;
  }

  // Utility methods (unchanged)
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

  // Enhanced cache management
  static generateCacheKey(content, options) {
    try {
      const contentSample = content.slice(0, 200);
      const optionsStr = `${options.numQuestions}-${options.difficulty}`;
      
      // Create a simple hash for Unicode safety
      let hash = 0;
      const combined = contentSample + optionsStr;
      for (let i = 0; i < Math.min(combined.length, 300); i++) {
        hash = ((hash << 5) - hash + combined.charCodeAt(i)) & 0xffffffff;
      }
      
      return `mcq_${Math.abs(hash).toString(36)}_${options.numQuestions}q_${options.difficulty}`;
    } catch (error) {
      console.warn('🟡 Cache key generation fallback used');
      return `mcq_fallback_${content.length}_${Date.now()}`;
    }
  }

  static manageCacheSize() {
    if (LLMService.responseCache.size > LLMService.MAX_CACHE_SIZE) {
      const entries = Array.from(LLMService.responseCache.entries());
      // Remove oldest entries (keep newest half)
      const toKeep = entries.slice(-Math.floor(LLMService.MAX_CACHE_SIZE / 2));
      LLMService.responseCache.clear();
      toKeep.forEach(([key, value]) => {
        LLMService.responseCache.set(key, value);
      });
      console.log('🧹 Cache cleaned to prevent memory bloat');
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

    // Credit check (safety check - UI should handle this)
    await this.checkUserCredits();
    await this.ensureApiKey();
    await this.ensureEndpoint();

    console.log(`🎯 Starting enhanced MCQ generation for ${numQuestions} ${difficulty} questions`);

    return withRetry(async () => {
      if (this.controller) this.controller.abort();
      this.controller = new AbortController();

      try {
        const sourceText = typeof fileOrText === 'string' 
          ? fileOrText 
          : await this.readFileContent(fileOrText);

        if (!sourceText?.trim() || sourceText.trim().length < 50) {
          throw new Error('Content is empty or too short for meaningful quiz generation.');
        }

        // Enhanced caching with better cache management
        const cacheKey = LLMService.generateCacheKey(sourceText, options);
        if (LLMService.responseCache.has(cacheKey)) {
          console.log('⚡ Using cached high-quality questions');
          return LLMService.responseCache.get(cacheKey);
        }

        // Intelligent content analysis
        this.language = detectLanguage(sourceText);
        const processedText = trimForPrompt(sourceText);
        const contentAnalysis = analyzeContent(sourceText);
        const keyFacts = extractKeyFacts(sourceText, numQuestions * 2); // More facts for better questions
        
        console.log(`📊 Content Analysis: ${contentAnalysis.type} (${contentAnalysis.complexity}) - ${contentAnalysis.wordCount} words`);
        console.log(`🔍 Key Facts Extracted: ${keyFacts.length} important points identified`);
        
        // Generate superior prompt using enhanced analysis
        const prompt = this._buildSuperiorPrompt(
          processedText, 
          keyFacts, 
          numQuestions, 
          difficulty, 
          this.language, 
          contentAnalysis
        );

        console.log(`🚀 Making optimized API request with ${prompt.length} char prompt`);
        const questions = await this._makeEnhancedApiRequest(prompt, this.controller.signal);

        const processedQuestions = this._processHighQualityQuestions(questions, numQuestions);
        
        // Cache management and storage
        LLMService.manageCacheSize();
        LLMService.responseCache.set(cacheKey, processedQuestions);

        console.log(`✅ Generated ${processedQuestions.length} high-quality MCQs`);
        return processedQuestions;
        
      } catch (error) {
        if (error?.name === 'AbortError') {
          throw new Error('Request was cancelled by user.');
        }

        if (error.message?.includes('API key') || 
            error.message?.includes('401') || 
            error.message?.includes('403')) {
          try {
            await this.refreshApiKey();
            console.log('🔄 API key refreshed, retrying...');
          } catch (keyError) {
            console.error('❌ Failed to refresh API key:', keyError);
          }
        }

        console.error('❌ Enhanced MCQ generation failed:', error);
        throw error;
      }
    });
  }

  _buildSuperiorPrompt(text, keyFacts, numQuestions, difficulty, language, contentAnalysis) {
    const prompt = generateSmartPrompt(language, numQuestions, difficulty, contentAnalysis);
    
    // Add key facts guidance for better question generation
    let enhancedPrompt = prompt;
    
    if (keyFacts.length > 0) {
      enhancedPrompt += `\nKEY CONTENT INSIGHTS FOR QUESTION GENERATION:\n`;
      keyFacts.slice(0, Math.min(10, numQuestions * 1.5)).forEach((fact, i) => {
        enhancedPrompt += `${i + 1}. ${fact}\n`;
      });
      enhancedPrompt += `\nPRIORITIZE questions that test understanding of these specific insights and facts.\n\n`;
    }

    // Add content-specific optimization
    enhancedPrompt += `CONTENT OPTIMIZATION NOTES:\n`;
    enhancedPrompt += `- Content complexity: ${contentAnalysis.complexity} (adjust question depth accordingly)\n`;
    enhancedPrompt += `- Primary structure: ${contentAnalysis.structure} (consider this in question design)\n`;
    
    if (contentAnalysis.hasVisualElements) {
      enhancedPrompt += `- Content includes visual elements - create questions about data, trends, or relationships described\n`;
    }
    
    enhancedPrompt += `- Word count: ${contentAnalysis.wordCount} words (sufficient detail available for specific questions)\n\n`;

    // Add difficulty-specific instructions
    const difficultyEnhancements = {
      easy: "Focus on explicit facts, clear definitions, and direct statements from the content. Questions should test recognition and basic comprehension.",
      medium: "Create questions requiring application of concepts and analysis of relationships. Test understanding of how different ideas connect.",
      hard: "Develop questions requiring synthesis of multiple concepts, evaluation of arguments, and critical thinking about implications."
    };
    
    enhancedPrompt += `DIFFICULTY-SPECIFIC GUIDANCE:\n${difficultyEnhancements[difficulty] || difficultyEnhancements.medium}\n\n`;

    // Add quality assurance reminders
    enhancedPrompt += `FINAL QUALITY CHECKS:\n`;
    enhancedPrompt += `- Each question must stand alone without referencing "the text" or similar phrases\n`;
    enhancedPrompt += `- Use actual names, dates, numbers, and specific details from the provided content\n`;
    enhancedPrompt += `- Ensure questions cannot be answered without reading the provided material\n`;
    enhancedPrompt += `- Make all distractors plausible but clearly distinguishable from correct answers\n\n`;

    enhancedPrompt += `SOURCE CONTENT:\n${text}`;

    return enhancedPrompt;
  }

  async _makeEnhancedApiRequest(prompt, signal) {
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
            temperature: 0.2, // Lower for more consistent, factual questions
            maxOutputTokens: 8192,
            topP: 0.9, // Slightly higher for better diversity
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
          `API request failed: ${response.status} - ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      if (!rawText) {
        throw new Error('Empty response received from AI model.');
      }

      console.log(`📥 Received ${rawText.length} characters from AI model`);

      // Enhanced JSON extraction with multiple fallback strategies
      return this._extractQuestionsFromResponse(rawText);

    } finally {
      clearTimeout(timeout);
    }
  }

  _extractQuestionsFromResponse(rawText) {
    let questions = [];
    
    try {
      // Primary extraction method
      const extracted = extractJson(rawText);
      questions = extracted?.questions || [];
      
      if (Array.isArray(questions) && questions.length > 0) {
        console.log(`✅ Primary extraction successful: ${questions.length} questions`);
        return questions;
      }
    } catch (error) {
      console.warn('⚠️ Primary JSON extraction failed, trying enhanced fallbacks');
    }

    // Enhanced fallback methods
    const fallbackMethods = [
      // Method 1: Look for complete JSON object
      () => {
        const jsonMatch = rawText.match(/\{[\s\S]*?"questions"\s*:\s*\[[\s\S]*?\]\s*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return parsed.questions || [];
        }
        return null;
      },

      // Method 2: Extract questions array directly
      () => {
        const questionsMatch = rawText.match(/"questions"\s*:\s*(\[[\s\S]*?\])/);
        if (questionsMatch) {
          const questionsJson = `{"questions": ${questionsMatch[1]}}`;
          const parsed = JSON.parse(questionsJson);
          return parsed.questions || [];
        }
        return null;
      },

      // Method 3: Look for question objects individually
      () => {
        const questionPattern = /\{\s*"question"\s*:\s*"[^"]+",\s*"options"\s*:\s*\[[^\]]+\],\s*"correctAnswer"\s*:\s*\d+[^}]*\}/g;
        const matches = rawText.match(questionPattern);
        if (matches) {
          const questions = [];
          for (const match of matches) {
            try {
              questions.push(JSON.parse(match));
            } catch (e) {
              console.warn('⚠️ Skipping malformed question object');
            }
          }
          return questions.length > 0 ? questions : null;
        }
        return null;
      }
    ];

    // Try each fallback method
    for (let i = 0; i < fallbackMethods.length; i++) {
      try {
        const result = fallbackMethods[i]();
        if (result && Array.isArray(result) && result.length > 0) {
          console.log(`✅ Fallback method ${i + 1} successful: ${result.length} questions`);
          return result;
        }
      } catch (error) {
        console.warn(`⚠️ Fallback method ${i + 1} failed:`, error.message);
      }
    }

    throw new Error('Failed to extract valid questions from AI response using all available methods');
  }

  _processHighQualityQuestions(questions, numQuestions) {
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('No valid questions received from AI model.');
    }
    
    const processedQuestions = [];
    let processedCount = 0;
    
    for (let i = 0; i < questions.length && processedCount < numQuestions; i++) {
      try {
        const processed = this._processIndividualQuestion(questions[i], i);
        if (processed) {
          processedQuestions.push(processed);
          processedCount++;
        }
      } catch (error) {
        console.warn(`⚠️ Skipping question ${i + 1}: ${error.message}`);
      }
    }

    if (processedQuestions.length === 0) {
      throw new Error('No valid questions could be processed from AI response');
    }

    if (processedQuestions.length < numQuestions * 0.7) {
      console.warn(`⚠️ Only processed ${processedQuestions.length}/${numQuestions} requested questions`);
    }

    console.log(`🔧 Successfully processed ${processedQuestions.length} high-quality questions`);
    return processedQuestions;
  }

  _processIndividualQuestion(q, index) {
    // Comprehensive validation
    if (!q.question || typeof q.question !== 'string') {
      throw new Error(`Question ${index + 1}: Missing or invalid question text`);
    }

    if (!Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(`Question ${index + 1}: Must have exactly 4 options`);
    }

    // Enhanced quality checks
    const questionText = q.question.trim();
    
    // Check for prohibited references
    const badReferencePatterns = [
      /\b(the|this)\s+(passage|text|document|article|material|content)\b/gi,
      /\baccording\s+to\s+(the|this|it)\b/gi,
      /\bas\s+mentioned\s+(above|earlier|in\s+the)\b/gi,
      /\bfrom\s+(the|this)\s+(text|passage|document)\b/gi
    ];
    
    for (const pattern of badReferencePatterns) {
      if (pattern.test(questionText)) {
        console.warn(`Question ${index + 1}: Contains bad reference - skipping`);
        return null; // Skip this question instead of throwing error
      }
    }

    // Check for generic placeholders
    if (/\b[xyz]\s+(company|study|graph|chart|example)\b/gi.test(questionText)) {
      console.warn(`Question ${index + 1}: Contains generic placeholder - skipping`);
      return null;
    }

    // Validate and clean options
    const cleanOptions = q.options
      .map(opt => (opt || '').toString().trim().replace(/\s+/g, ' '))
      .filter(opt => opt.length > 0);
    
    if (cleanOptions.length !== 4) {
      throw new Error(`Question ${index + 1}: All 4 options must be valid`);
    }

    // Check for duplicate options
    const uniqueOptions = [...new Set(cleanOptions.map(opt => opt.toLowerCase()))];
    if (uniqueOptions.length !== 4) {
      throw new Error(`Question ${index + 1}: Options must be unique`);
    }

    // Validate correct answer index
    const correctAnswer = parseInt(q.correctAnswer);
    if (isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer >= 4) {
      throw new Error(`Question ${index + 1}: Invalid correct answer index`);
    }

    // Create shuffled question with maintained correct answer tracking
    const correctOption = cleanOptions[correctAnswer];
    const shuffledOptions = this.shuffleArray([...cleanOptions]);
    const newCorrectAnswer = shuffledOptions.indexOf(correctOption);

    return {
      question: questionText,
      options: shuffledOptions,
      correctAnswer: newCorrectAnswer,
      explanation: this._cleanExplanation(q.explanation || 'Explanation not provided'),
      language: this.language,
      difficulty: q.cognitive_level || 'medium',
      questionType: q.question_type || 'conceptual'
    };
  }

  _cleanExplanation(explanation) {
    if (!explanation || typeof explanation !== 'string') {
      return 'Explanation not available';
    }
    
    let cleaned = explanation.toString().trim();
    
    // Remove bad references from explanations too
    cleaned = cleaned
      .replace(/\b(according\s+to|as\s+mentioned\s+in|from|in)\s+(the|this)\s+(passage|text|document|article|above|content)\b/gi, '')
      .replace(/\b(the\s+above|aforementioned|as\s+stated)\b/gi, '')
      .trim();
    
    // Ensure minimum explanation quality
    if (cleaned.length < 20 || /^(explanation|no\s+explanation)\s*(not\s*)?(available|provided)$/gi.test(cleaned)) {
      return 'Explanation not available';
    }
    
    // Truncate if too long
    if (cleaned.length > 300) {
      cleaned = cleaned.substring(0, 297) + '...';
    }
    
    return cleaned;
  }
}