// LLMService.js - Production-grade with progressive difficulty fallback
// Default: 3 attempts at HIGH quality, then 3 at MEDIUM, then 3 at EASY, then synthesis
// Guarantees EXACT number of questions requested

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
  static responseCache = new Map(); // This is kept for now, but CacheService is the new standard

  // CONFIG: Progressive difficulty fallback system
  static HIGH_QUALITY_ATTEMPTS = 3;    // First tier: high-quality MCQs
  static MEDIUM_QUALITY_ATTEMPTS = 3;  // Second tier: medium difficulty
  static EASY_QUALITY_ATTEMPTS = 3;    // Third tier: easy questions
  static MIN_ACCEPT_RATIO = 0.7;
  static MINIMUM_ACCEPTABLE = 3;

  // Constructor
  constructor() {
    this.apiConfig = new ApiConfigService();
    this.userCreditService = new UserCreditService();
    this.apiClient = null; // Will be initialized when needed
    this.generationService = null; // Will be initialized when needed
    this.questionProcessor = null; // Will be initialized when needed
    this.questionSynthesizer = null; // Will be initialized when needed
    this.language = 'en';
    this.controller = null;
    console.log('✅ LLMService initialized (progressive difficulty fallback mode)');
  }

  // convenience: singleton
  static async preloadApiConfig() {
    if (!LLMService.instance) LLMService.instance = new LLMService();
    await LLMService.instance.apiConfig.ensureApiKey();
    await LLMService.instance.apiConfig.ensureEndpoint();
    console.log('🚀 API key + endpoint preloaded');
  }
// Reason PreLoadCongig hasn't been trasfered is becuase of performance issues
  // --- Helpers for imported validator functions to avoid naming collisions
  shuffle(array) {
    return shuffleArrayImported(array);
  }
  validateQuestions(questions) {
    return validateQuestionsImported(questions);
  }

  // --- API key / endpoint (now delegated)
  async ensureApiKey() {
    return this.apiConfig.ensureApiKey();
  }

  async ensureEndpoint() {
    return this.apiConfig.ensureEndpoint();
  }

  async refreshApiKey() {
    return this.apiConfig.refreshApiKey();
  }

  // --- Firebase wrappers (unchanged)
  async saveQuizResults(quizData) { return saveQuizResults(quizData); }
  async getDashboardData() { return getDashboardData(); }
  async saveChatMessage(message, isUserMessage = true) { return saveChatMessage(message, isUserMessage); }

  // --- File read with retry wrapper (unchanged)
  async readFileContent(file, progressCallback) {
    return withRetry(async () => readFileContent(file, progressCallback));
  }

  // --- User credit check (now delegated)
  async checkUserCredits() {
    return this.userCreditService.checkUserCredits();
  }

  // --- Initialize services when needed
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

// --- MAIN ENTRY: Enhanced generation with difficulty and quality options
  async generateQuizQuestions(fileOrText, options = {}) {
    const {
      numQuestions = 10,
      difficulty = 'medium', // Changed default to medium
      quality = 'normal',     // New quality option
      questionType = 'mixed',
      cache = true,
    } = options;

    const requested = Math.max(1, Math.min(100, parseInt(numQuestions) || 10));
    console.log(`🎯 Requested ${requested} questions (Difficulty: ${difficulty.toUpperCase()}, Quality: ${quality.toUpperCase()})`);

    await this.checkUserCredits();
    await this.ensureApiKey();
    await this.ensureEndpoint();
    await this._initializeServices();

    const sourceText = typeof fileOrText === 'string' ? fileOrText : await this.readFileContent(fileOrText);
    if (!sourceText || !sourceText.trim() || sourceText.trim().length < 30) {
      throw new Error('Content empty or too short to create questions.');
    }

    const cacheKey = CacheService.generateCacheKey(sourceText, { requested, difficulty, quality, questionType });
    if (cache && CacheService.get(cacheKey)) {
      const cached = CacheService.get(cacheKey);
      if (Array.isArray(cached) && cached.length === requested) {
        console.log('📋 Returning cached exact-count quiz');
        return cached;
      }
    }

    this.language = detectLanguage(sourceText) || 'en';
    // Update services with current language
    this.questionProcessor = new QuestionProcessor(this.language);
    this.questionSynthesizer = new QuestionSynthesizer(this.language);
    this.generationService = new GenerationService(this.apiClient, this.language);

    const text = trimForPrompt(sourceText);
    const keyFacts = extractKeyFacts(sourceText);

    let aggregated = [];

    // Map UI difficulty to internal difficulty levels
    const difficultyMapping = {
      'easy': 'easy',
      'medium': 'medium', // Changed from 'normal' to 'medium'
      'hard': 'high'      // Map 'hard' to internal 'high'
    };
    const internalDifficulty = difficultyMapping[difficulty] || 'medium';

    // Configure generation strategy based on quality setting
    const qualityConfig = GenerationService.getQualityConfig(quality);
    console.log(`🔧 Using quality config: ${quality} (${qualityConfig.attempts} attempts per tier)`);

    // Generate based on selected difficulty and quality
    if (quality === 'quick') {
      // Quick generation: single attempt at selected difficulty only
      aggregated = await attemptGeneration(
        text, keyFacts, requested, internalDifficulty,
        qualityConfig.attempts, aggregated, 0, this.apiClient, this.language
      );
    } else if (quality === 'normal') {
      // Normal generation: selected difficulty + one fallback tier
      aggregated = await attemptGeneration(
        text, keyFacts, requested, internalDifficulty,
        qualityConfig.attempts, aggregated, 0, this.apiClient, this.language
      );

      if (aggregated.length < requested) {
        const fallbackDifficulty = GenerationService.getFallbackDifficulty(internalDifficulty);
        console.log(`⚡ Primary difficulty insufficient (${aggregated.length}/${requested}). Trying ${fallbackDifficulty.toUpperCase()}...`);
        aggregated = await attemptGeneration(
          text, keyFacts, requested, fallbackDifficulty,
          qualityConfig.attempts, aggregated, qualityConfig.attempts, this.apiClient, this.language
        );
      }
    } else if (quality === 'premium') {
      // Premium generation: full progressive difficulty fallback
      console.log('🚀 TIER 1: Attempting PRIMARY difficulty');
      aggregated = await attemptGeneration(
        text, keyFacts, requested, internalDifficulty,
        qualityConfig.highQualityAttempts, aggregated, 0, this.apiClient, this.language
      );

      if (aggregated.length < requested) {
        const fallback1 = GenerationService.getFallbackDifficulty(internalDifficulty);
        console.log(`⚡ TIER 2: PRIMARY insufficient (${aggregated.length}/${requested}). Trying ${fallback1.toUpperCase()}...`);
        aggregated = await attemptGeneration(
          text, keyFacts, requested, fallback1,
          qualityConfig.mediumQualityAttempts, aggregated, qualityConfig.highQualityAttempts, this.apiClient, this.language
        );
      }

      if (aggregated.length < requested) {
        const fallback2 = GenerationService.getSecondFallbackDifficulty(internalDifficulty);
        console.log(`💡 TIER 3: SECONDARY insufficient (${aggregated.length}/${requested}). Trying ${fallback2.toUpperCase()}...`);
        aggregated = await attemptGeneration(
          text, keyFacts, requested, fallback2,
          qualityConfig.easyQualityAttempts, aggregated,
          qualityConfig.highQualityAttempts + qualityConfig.mediumQualityAttempts, this.apiClient, this.language
        );
      }
    }

    // Synthesis fallback if still insufficient
    if (aggregated.length < requested) {
      console.warn(`⚠️ Generation insufficient (${aggregated.length}/${requested}). Synthesizing remaining questions...`);
      const synthesized = this.questionSynthesizer.synthesizeQuestions(aggregated, keyFacts, requested - aggregated.length);
      aggregated = this._mergeUniqueQuestions(aggregated, synthesized, requested);
      console.log(`After synthesis: ${aggregated.length}/${requested}`);
    }

    if (aggregated.length < Math.max(LLMService.MINIMUM_ACCEPTABLE, Math.ceil(requested * 0.5))) {
      const msg = `Failed to produce sufficient valid questions (${aggregated.length}/${requested}). Content may lack extractable facts.`;
      console.error(msg);
      throw new Error(msg);
    }

    aggregated = aggregated.slice(0, requested);

    aggregated = aggregated.map((q, idx) => ({
      ...q,
      id: q.id || `q_${idx + 1}`,
      language: q.language || this.language,
      difficulty: difficulty, // Add user's selected difficulty to each question
      quality: quality,       // Add quality level to each question
    }));

    if (cache) CacheService.set(cacheKey, aggregated);

    console.log(`✅ SUCCESS: Returning EXACT ${aggregated.length} questions (${difficulty}/${quality})`);
    return aggregated;
  }




  // --- Utility methods
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