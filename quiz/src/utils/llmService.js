// LLMService.js - Dynamic API key & baseUrl from Firestore
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
import { withRetry } from './retryUtils.js';
import { shuffleArray, validateQuestions } from './quizValidator.js';

export class LLMService {
  static instance = null;
  static responseCache = new Map();

  constructor() {
    // ----- ADDED: preload from sessionStorage -----
    this.baseUrl = sessionStorage.getItem('llm_baseUrl') || null;
    this.apiKey = sessionStorage.getItem('llm_apiKey') || null;
    // ---------------------------------------------
    this.language = 'en';
    this.controller = null;
    console.log('✅ LLMService initialized (endpoint & API key will be fetched dynamically if missing)');
  }

  // ----- NEW STATIC METHOD: Preload API key and endpoint -----
  static async preloadApiConfig() {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    await LLMService.instance.ensureApiKey();
    await LLMService.instance.ensureEndpoint();
    console.log('🚀 LLMService preloaded API key and endpoint in the background.');
  }
  // -----------------------------------------------------------

  async ensureApiKey() {
    if (!this.apiKey) {
      // ----- ADDED: check sessionStorage first -----
      this.apiKey = sessionStorage.getItem('llm_apiKey') || (await getGlobalApiKey());
      if (!this.apiKey) throw new Error('No global API key configured in Firestore.');
      sessionStorage.setItem('llm_apiKey', this.apiKey);
      console.log('✅ Global API key loaded successfully (preloaded)');
      // ---------------------------------------------
    }
    return this.apiKey;
  }

  async ensureEndpoint() {
    if (!this.baseUrl) {
      const config = await getGlobalApiConfig();
      if (!config?.baseUrl) throw new Error('No API endpoint (baseUrl) configured in Firestore.');
      this.baseUrl = config.baseUrl;
      // ----- ADDED: cache in sessionStorage -----
      sessionStorage.setItem('llm_baseUrl', this.baseUrl);
      console.log(`✅ Dynamic endpoint loaded (preloaded): ${this.baseUrl}`);
      // -----------------------------------------
    }
    return this.baseUrl;
  }

  async refreshApiKey() {
    this.apiKey = null;
    sessionStorage.removeItem('llm_apiKey'); // ----- ADDED -----
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
    return `${content.slice(0, 100)}-${JSON.stringify(options)}`;
  }

  async generateQuizQuestions(fileOrText, options = {}) {
    const { numQuestions = 10, difficulty = 'medium' } = options;

    await this.ensureApiKey();
    await this.ensureEndpoint();

    console.log(`🚀 Starting quiz generation at: ${this.baseUrl}`);

    return withRetry(async () => {
      if (this.controller) this.controller.abort();
      this.controller = new AbortController();

      try {
        const sourceText =
          typeof fileOrText === 'string'
            ? fileOrText
            : await this.readFileContent(fileOrText);

        if (!sourceText?.trim() || sourceText.trim().length < 50) {
          throw new Error('The document seems empty or too short.');
        }

        const cacheKey = LLMService.generateCacheKey(sourceText, options);
        if (LLMService.responseCache.has(cacheKey)) {
          console.log('📋 Using cached quiz questions');
          return LLMService.responseCache.get(cacheKey);
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
        const questions = await this._makeApiRequest(
          prompt,
          this.controller.signal
        );

        const processedQuestions = this._processQuestions(questions, numQuestions);
        LLMService.responseCache.set(cacheKey, processedQuestions);

        console.log('✅ Quiz questions generated and cached successfully');
        return processedQuestions;
      } catch (error) {
        if (error?.name === 'AbortError') throw new Error('Request cancelled.');

        if (
          error.message?.includes('API key') ||
          error.message?.includes('401') ||
          error.message?.includes('403')
        ) {
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

Format:
{
  "questions": [
    { "question": "string", "options": ["string","string","string","string"], "correctAnswer": 0, "explanation": "string", "context": "string" }
  ]
}

Content:
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
        if (response.status === 401 || response.status === 403) this.apiKey = null;

        throw new Error(
          `API failed: ${response.status} - ${
            errorData.error?.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      const rawText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        data?.candidates?.[0]?.content?.parts?.[0]?.inline_data?.data ??
        '';

      if (!rawText) throw new Error('Empty response from the model.');

      return extractJson(rawText)?.questions ?? [];
    } finally {
      clearTimeout(timeout);
    }
  }

  _processQuestions(questions, numQuestions) {
    if (!Array.isArray(questions) || questions.length === 0)
      throw new Error('Model returned no questions.');
    return questions
      .slice(0, numQuestions)
      .map(this._processQuestion.bind(this));
  }

  _processQuestion(q, index) {
    const options = Array.isArray(q.options) ? [...q.options] : [];
    if (options.length !== 4)
      throw new Error(`Question ${index + 1} must have 4 options.`);

    const cleanOptions = this._cleanAndValidateOptions(options, index);
    const correctOption = cleanOptions[q.correctAnswer];
    const shuffledOptions = this.shuffleArray([...cleanOptions]);

    return {
      question: (q.question || '').toString().trim(),
      options: shuffledOptions,
      correctAnswer: shuffledOptions.indexOf(correctOption),
      explanation: (q.explanation || '').toString().trim(),
      context: this._cleanContext(q.context),
      language: this.language,
    };
  }

  _cleanAndValidateOptions(options, index) {
    const cleanOptions = options.map((opt) =>
      (opt || '').toString().trim().replace(/\s+/g, ' ')
    );
    const uniqueOptions = [...new Set(cleanOptions)];
    if (uniqueOptions.length !== 4)
      throw new Error(`Question ${index + 1} has duplicate options.`);
    return cleanOptions;
  }

  _cleanContext(context) {
    return (
      (context || '')
        .toString()
        .trim()
        .replace(
          /(according to|in|from) (the|this) (passage|text|document|article)/gi,
          ''
        )
        .trim() || 'Context not available'
    );
  }
}