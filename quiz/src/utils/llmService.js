// LLMService.js - Enhanced with custom instructions support (fixed synthesis call)
import { REQUEST_TIMEOUT_MS } from './constants.js';
import { detectLanguage } from './languageUtils.js';
import { trimForPrompt, extractKeyFacts } from './textUtils.js';
import { readFileContent } from './fileReader.js';
import {
  saveQuizResults,
  getDashboardData,
  saveChatMessage,
} from './firebaseService.js';
import { withRetry } from './retryUtils.js';
import { shuffleArray as shuffleArrayImported, validateQuestions as validateQuestionsImported } from './quizValidator.js';
import { ApiConfigService }   from './llmService/apiConfigService.js';
import { UserCreditService }  from './llmService/userCreditService.js';
import { CacheService } from './llmService/cacheService.js';
import { ApiClient } from './llmService/apiClient.js';
import { GenerationService, attemptGeneration } from './llmService/generationService.js';
import { PromptBuilder } from './llmService/promptBuilder.js';
import { QuestionProcessor } from './llmService/questionProcessor.js';
import { QuestionSynthesizer } from './llmService/questionSynthesizer.js';

export class LLMService {
  static instance = null;
  static responseCache = new Map(); // Legacy cache, prefer CacheService

  // CONFIG
  static HIGH_QUALITY_ATTEMPTS = 3;
  static MEDIUM_QUALITY_ATTEMPTS = 3;
  static EASY_QUALITY_ATTEMPTS = 3;
  static MIN_ACCEPT_RATIO = 0.7;
  static MINIMUM_ACCEPTABLE = 3;

  constructor() {
    this.apiConfig = new ApiConfigService();
    this.userCreditService = new UserCreditService();
    this.apiClient = null;
    this.generationService = null;
    this.questionProcessor = null;
    this.questionSynthesizer = null;
    this.language = 'en';
    this.controller = null;
    console.log('✅ LLMService initialized (progressive difficulty fallback mode)');
  }

  static async preloadApiConfig() {
    if (!LLMService.instance) LLMService.instance = new LLMService();
    await LLMService.instance.apiConfig.ensureApiKey();
    await LLMService.instance.apiConfig.ensureEndpoint();
    console.log('🚀 API key + endpoint preloaded');
  }

  shuffle(array) {
    return shuffleArrayImported(array);
  }
  validateQuestions(questions) {
    return validateQuestionsImported(questions);
  }

  async ensureApiKey() { return this.apiConfig.ensureApiKey(); }
  async ensureEndpoint() { return this.apiConfig.ensureEndpoint(); }
  async refreshApiKey() { return this.apiConfig.refreshApiKey(); }

  async saveQuizResults(quizData) { return saveQuizResults(quizData); }
  async getDashboardData() { return getDashboardData(); }
  async saveChatMessage(message, isUserMessage = true) { return saveChatMessage(message, isUserMessage); }

  async readFileContent(file, progressCallback) {
    return withRetry(async () => readFileContent(file, progressCallback));
  }

  async checkUserCredits() {
    return this.userCreditService.checkUserCredits();
  }

  async _initializeServices() {
    if (!this.apiClient) {
      const apiKey = await this.apiConfig.ensureApiKey();
      const baseUrl = await this.apiConfig.ensureEndpoint();
      this.apiClient = new ApiClient(baseUrl, apiKey);
    }
    if (!this.generationService) {
      this.generationService = new GenerationService(this.apiClient, this.language);
    }
    if (!this.questionProcessor) {
      this.questionProcessor = new QuestionProcessor(this.language);
    }
    if (!this.questionSynthesizer) {
      this.questionSynthesizer = new QuestionSynthesizer(this.language);
    }
  }

  /**
   * MAIN ENTRY: Enhanced generation with difficulty, quality, and custom instructions
   */
  async generateQuizQuestions(fileOrText, options = {}) {
    const {
      numQuestions = 10,
      difficulty = 'medium',
      quality = 'normal',
      questionType = 'mixed',
      customInstructions = '', // NEW
      cache = true,
    } = options;

    const requested = Math.max(1, Math.min(100, parseInt(numQuestions) || 10));
    console.log(`🎯 Requested ${requested} questions (Difficulty: ${difficulty.toUpperCase()}, Quality: ${quality.toUpperCase()})`);
    if (customInstructions) {
      console.log(`📝 Custom Instructions: ${customInstructions.substring(0, 120)}...`);
    }

    await this.checkUserCredits();
    await this.ensureApiKey();
    await this.ensureEndpoint();
    await this._initializeServices();

    const sourceText = typeof fileOrText === 'string' ? fileOrText : await this.readFileContent(fileOrText);
    if (!sourceText || !sourceText.trim() || sourceText.trim().length < 30) {
      throw new Error('Content empty or too short to create questions.');
    }

    // Cache key includes custom instructions
    const cacheKey = CacheService.generateCacheKey(sourceText, { 
      requested, difficulty, quality, questionType,
      customInstructions: customInstructions ? customInstructions.substring(0, 100) : ''
    });
    if (cache && CacheService.get(cacheKey)) {
      const cached = CacheService.get(cacheKey);
      if (Array.isArray(cached) && cached.length === requested) {
        console.log('📋 Returning cached exact-count quiz');
        return cached;
      }
    }

    this.language = detectLanguage(sourceText) || 'en';
    this.questionProcessor = new QuestionProcessor(this.language);
    this.questionSynthesizer = new QuestionSynthesizer(this.language);
    this.generationService = new GenerationService(this.apiClient, this.language);

    const text = trimForPrompt(sourceText);
    const keyFacts = extractKeyFacts(sourceText);
    let aggregated = [];

    // Map UI difficulty to internal difficulty
    const difficultyMapping = { easy: 'easy', medium: 'medium', hard: 'high' };
    const internalDifficulty = difficultyMapping[difficulty] || 'medium';

    // Configure generation strategy
    const qualityConfig = GenerationService.getQualityConfig(quality);
    console.log(`🔧 Using quality config: ${quality} (${JSON.stringify(qualityConfig)})`);

    // Helper wrapper to inject custom instructions
    const attemptGenerationWithCustom = async (
      text, keyFacts, requested, difficulty, maxAttempts,
      aggregated, attemptOffset, apiClient, language
    ) => {
      return attemptGeneration(
        text, keyFacts, requested, difficulty,
        maxAttempts, aggregated, attemptOffset,
        apiClient, language, customInstructions // Pass custom instructions
      );
    };

    if (quality === 'quick') {
      aggregated = await attemptGenerationWithCustom(
        text, keyFacts, requested, internalDifficulty,
        qualityConfig.attempts, aggregated, 0, this.apiClient, this.language
      );
    } else if (quality === 'normal') {
      aggregated = await attemptGenerationWithCustom(
        text, keyFacts, requested, internalDifficulty,
        qualityConfig.attempts, aggregated, 0, this.apiClient, this.language
      );

      if (aggregated.length < requested) {
        const fallbackDifficulty = GenerationService.getFallbackDifficulty(internalDifficulty);
        console.log(`⚡ Primary difficulty insufficient (${aggregated.length}/${requested}). Trying ${fallbackDifficulty.toUpperCase()}...`);
        aggregated = await attemptGenerationWithCustom(
          text, keyFacts, requested, fallbackDifficulty,
          qualityConfig.attempts, aggregated, qualityConfig.attempts, this.apiClient, this.language
        );
      }
    } else if (quality === 'premium') {
      console.log('🚀 TIER 1: PRIMARY difficulty');
      aggregated = await attemptGenerationWithCustom(
        text, keyFacts, requested, internalDifficulty,
        qualityConfig.highQualityAttempts, aggregated, 0, this.apiClient, this.language
      );
      if (aggregated.length < requested) {
        const fallback1 = GenerationService.getFallbackDifficulty(internalDifficulty);
        console.log(`⚡ TIER 2: Trying ${fallback1.toUpperCase()}...`);
        aggregated = await attemptGenerationWithCustom(
          text, keyFacts, requested, fallback1,
          qualityConfig.mediumQualityAttempts, aggregated,
          qualityConfig.highQualityAttempts, this.apiClient, this.language
        );
      }
      if (aggregated.length < requested) {
        const fallback2 = GenerationService.getSecondFallbackDifficulty(internalDifficulty);
        console.log(`💡 TIER 3: Trying ${fallback2.toUpperCase()}...`);
        aggregated = await attemptGenerationWithCustom(
          text, keyFacts, requested, fallback2,
          qualityConfig.easyQualityAttempts, aggregated,
          qualityConfig.highQualityAttempts + qualityConfig.mediumQualityAttempts,
          this.apiClient, this.language
        );
      }
    }

    // Synthesis fallback if still insufficient
    if (aggregated.length < requested) {
      console.warn(`⚠️ Generation insufficient (${aggregated.length}/${requested}). Synthesizing remaining questions...`);
      // <-- FIXED: use existing synthesizeQuestions (function exists) and merge results
      const synthesized = this.questionSynthesizer.synthesizeQuestions(
        aggregated,
        keyFacts,
        requested - aggregated.length
      );
      aggregated = this._mergeUniqueQuestions(aggregated, synthesized, requested);
      console.log(`After synthesis: ${aggregated.length}/${requested}`);
    }

    if (aggregated.length < Math.max(LLMService.MINIMUM_ACCEPTABLE, Math.ceil(requested * 0.5))) {
      const msg = `Failed to produce sufficient valid questions (${aggregated.length}/${requested}). Content may lack extractable facts.`;
      console.error(msg);
      throw new Error(msg);
    }

    // Ensure exact count and attach metadata
    aggregated = aggregated.slice(0, requested);

    aggregated = aggregated.map((q, idx) => ({
      ...q,
      id: q.id || `q_${idx + 1}`,
      language: q.language || this.language,
      difficulty: difficulty,
      quality: quality,
    }));

    if (cache) CacheService.set(cacheKey, aggregated);

    console.log(`✅ SUCCESS: Returning EXACT ${aggregated.length} questions (${difficulty}/${quality})`);
    return aggregated;
  }

  // Utility helpers (kept from original)
  _mergeUniqueQuestions(existing, toAdd, limit) {
    const out = [...existing];
    const seen = new Set(existing.map(q => this._fingerprint(q.question)));
    for (let i = 0; i < toAdd.length && out.length < limit; i++) {
      const candidate = toAdd[i];
      const fp = this._fingerprint(candidate.question);
      if (!seen.has(fp)) {
        out.push(candidate);
        seen.add(fp);
      }
    }
    return out;
  }

  _fingerprint(text) {
    return (text || '').toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 200);
  }
}
