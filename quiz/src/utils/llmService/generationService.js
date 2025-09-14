// generationService.js
import { PromptBuilder } from './promptBuilder.js';
import { QuestionProcessor } from './questionProcessor.js';
import { QuestionSynthesizer } from './questionSynthesizer.js';
import { shuffleArray as shuffleArrayImported } from '../quizValidator.js';

/**
 * Service for handling the main quiz generation logic.
 */
export class GenerationService {
  constructor(apiClient, language = 'en') {
    this.apiClient = apiClient;
    this.language = language;
    this.questionProcessor = new QuestionProcessor(language);
    this.questionSynthesizer = new QuestionSynthesizer(language);
  }

  /**
   * Attempts to generate questions at a specific difficulty level.
   * @param {string} text Source text.
   * @param {string[]} keyFacts Key facts.
   * @param {number} requested Number of questions requested.
   * @param {string} difficulty Difficulty level.
   * @param {number} maxAttempts Maximum attempts.
   * @param {Array} existingQuestions Existing questions.
   * @param {number} startAttemptNum Starting attempt number.
   * @returns {Promise<Array>} Array of generated questions.
   */
  async attemptGeneration(text, keyFacts, requested, difficulty, maxAttempts, existingQuestions, startAttemptNum) {
    let aggregated = [...existingQuestions];
    let attemptCount = 0;

    while (attemptCount < maxAttempts && aggregated.length < requested) {
      attemptCount++;
      const totalAttemptNum = startAttemptNum + attemptCount;
      const missing = requested - aggregated.length;

      console.log(`  Attempt ${attemptCount}/${maxAttempts} (${difficulty.toUpperCase()}): Need ${missing} more questions`);

      try {
        const prompt = PromptBuilder.buildPrompt(text, keyFacts, missing, difficulty, this.language);
        const raw = await this.apiClient.makeRequest(prompt);
        const processed = this.questionProcessor.extractAndProcess(raw);

        const beforeCount = aggregated.length;
        aggregated = this._mergeUniqueQuestions(aggregated, processed, requested);
        const addedCount = aggregated.length - beforeCount;

        console.log(`   ✓ Added ${addedCount} unique questions. Total: ${aggregated.length}/${requested}`);

        if (aggregated.length >= requested) {
          console.log(`   🎉 ${difficulty.toUpperCase()} tier successful! Got required questions.`);
          break;
        }

      } catch (err) {
        console.warn(`   ❌ ${difficulty.toUpperCase()} attempt ${attemptCount} failed:`, err.message);
      }
    }

    return aggregated;
  }

  /**
   * Merges unique questions from new batch into existing array.
   * @param {Array} existing Existing questions.
   * @param {Array} toAdd New questions to add.
   * @param {number} limit Maximum total questions.
   * @returns {Array} Merged questions array.
   */
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

  /**
   * Creates a fingerprint for question deduplication.
   * @param {string} text Question text.
   * @returns {string} Fingerprint.
   */
  _fingerprint(text) {
    return (text || '').toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 200);
  }

  /**
   * Gets fallback difficulty for progressive generation.
   * @param {string} primary Primary difficulty.
   * @returns {string} Fallback difficulty.
   */
  static getFallbackDifficulty(primary) {
    const fallbacks = {
      'high': 'medium',
      'medium': 'easy',
      'easy': 'medium'
    };
    return fallbacks[primary] || 'medium';
  }

  /**
   * Gets second fallback difficulty.
   * @param {string} primary Primary difficulty.
   * @returns {string} Second fallback difficulty.
   */
  static getSecondFallbackDifficulty(primary) {
    const fallbacks = {
      'high': 'easy',
      'medium': 'high',
      'easy': 'high'
    };
    return fallbacks[primary] || 'easy';
  }

  /**
   * Gets quality configuration based on quality setting.
   * @param {string} quality Quality level.
   * @returns {object} Quality configuration.
   */
  static getQualityConfig(quality) {
    const configs = {
      quick: {
        attempts: 2,
        highQualityAttempts: 2,
        mediumQualityAttempts: 0,
        easyQualityAttempts: 0,
      },
      normal: {
        attempts: 3,
        highQualityAttempts: 3,
        mediumQualityAttempts: 2,
        easyQualityAttempts: 0,
      },
      premium: {
        attempts: 4,
        highQualityAttempts: 4,
        mediumQualityAttempts: 3,
        easyQualityAttempts: 3,
      }
    };
    return configs[quality] || configs.normal;
  }

  /**
   * Synthesizes questions when generation is insufficient.
   * @param {Array} existing Existing questions.
   * @param {string[]} keyFacts Key facts.
   * @param {number} needed Number needed.
   * @returns {Array} Synthesized questions.
   */
  synthesizeQuestions(existing, keyFacts, needed) {
    return this.questionSynthesizer.synthesizeQuestions(existing, keyFacts, needed);
  }
}

/**
 * Convenience function for attempt generation (used by main LLMService).
 * @param {string} text Source text.
 * @param {string[]} keyFacts Key facts.
 * @param {number} requested Number requested.
 * @param {string} difficulty Difficulty level.
 * @param {number} maxAttempts Max attempts.
 * @param {Array} existingQuestions Existing questions.
 * @param {number} startAttemptNum Start attempt number.
 * @param {object} apiClient API client instance.
 * @param {string} language Language.
 * @returns {Promise<Array>} Generated questions.
 */
export async function attemptGeneration(text, keyFacts, requested, difficulty, maxAttempts, existingQuestions, startAttemptNum, apiClient, language = 'en') {
  const service = new GenerationService(apiClient, language);
  return service.attemptGeneration(text, keyFacts, requested, difficulty, maxAttempts, existingQuestions, startAttemptNum);
}