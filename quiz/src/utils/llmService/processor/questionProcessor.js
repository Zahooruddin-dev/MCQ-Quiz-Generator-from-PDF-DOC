// questionProcessor.js
import { extractJson } from '../../textUtils.js';

/**
 * Service for processing and validating questions from LLM responses.
 */
export class QuestionProcessor {
  constructor(language = 'en') {
    this.language = language;
  }

  /**
   * Extracts and processes questions from raw LLM response.
   * @param {string|Array} rawOrArray Raw response or array of questions.
   * @param {object} opts Processing options.
   * @returns {Array} Array of processed question objects.
   */
  extractAndProcess(rawOrArray, opts = { relaxed: false }) {
    let questionsArr = [];
    if (Array.isArray(rawOrArray)) {
      questionsArr = rawOrArray;
    } else {
      const rawText = rawOrArray || '';
      try {
        const extracted = extractJson(rawText);
        if (extracted?.questions && Array.isArray(extracted.questions)) questionsArr = extracted.questions;
      } catch (e) {
        try {
          const jsonMatch = rawText.match(/\{[\s\S]*"questions"[\s\S]*\]/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            questionsArr = parsed.questions || [];
          }
        } catch (e2) {
          try {
            const questionsMatch = rawText.match(/"questions"\s*:\s*\[[\s\S]*\]/);
            if (questionsMatch) {
              const wrapped = `{${questionsMatch[0]}}`;
              const parsed = JSON.parse(wrapped);
              questionsArr = parsed.questions || [];
            }
          } catch (e3) {
            console.warn('JSON extraction fell through; attempting heuristic parsing');
            questionsArr = this._heuristicParse(rawText);
          }
        }
      }
    }

    const processed = [];
    for (let i = 0; i < questionsArr.length; i++) {
      try {
        const p = this._processQuestion(questionsArr[i], i, opts);
        if (p) processed.push(p);
      } catch (err) {
        console.warn(`Skipping invalid question #${i + 1}: ${err.message}`);
      }
    }
    return processed;
  }

  /**
   * Processes a single question object.
   * @param {object} q Raw question object.
   * @param {number} idx Question index.
   * @param {object} opts Processing options.
   * @returns {object} Processed question object.
   */
  _processQuestion(q, idx, opts = { relaxed: false }) {
    if (!q || typeof q !== 'object') throw new Error('Invalid question object');
    const rawQuestion = (q.question || q.q || '').toString().trim();
    if (!rawQuestion || rawQuestion.length < 6) throw new Error('Question text too short');

    let options = Array.isArray(q.options) ? q.options.map(o => (o || '').toString().trim()) : [];
    if (!options || options.length === 0) {
      for (let n = 1; n <= 4; n++) {
        if (q[`option${n}`]) options.push(q[`option${n}`].toString().trim());
      }
    }

    if (!opts.relaxed && options.length !== 4) throw new Error('Options must be an array of 4 items');
    if (opts.relaxed && options.length < 2) throw new Error('Not enough options in relaxed mode');

    options = options.map(o => o.replace(/\s+/g, ' ').trim()).filter(Boolean);
    if (options.length === 0) throw new Error('No valid options');

    let correctIndex = -1;
    if (typeof q.correctAnswer === 'number' || typeof q.correctAnswer === 'string') {
      correctIndex = parseInt(q.correctAnswer);
      if (isNaN(correctIndex)) correctIndex = -1;
    }
    if (correctIndex < 0 || correctIndex >= options.length) {
      if (typeof q.correct === 'string') {
        const match = options.findIndex(o => o.toLowerCase() === q.correct.toString().trim().toLowerCase());
        if (match >= 0) correctIndex = match;
      }
    }

    while (options.length < 4) {
      options.push(this._generateDistractor(options));
    }

    const distinct = [...new Set(options.map(o => o.toLowerCase()))];
    if (distinct.length !== 4) {
      for (let i = 0; i < options.length && distinct.length < 4; i++) {
        const candidate = options[i] + ` (${i + 1})`;
        options[i] = candidate;
        const dd = [...new Set(options.map(o => o.toLowerCase()))];
        if (dd.length > distinct.length) distinct.splice(0, distinct.length, ...dd);
      }
    }
    if ([...new Set(options.map(o => o.toLowerCase()))].length !== 4) {
      throw new Error('Options are not unique enough');
    }

    if (correctIndex < 0 || correctIndex >= options.length) correctIndex = 0;

    const explanation = (q.explanation || q.explain || '').toString().trim() || 'No explanation provided';
    const context = (q.context || q.source || '').toString().trim() || '';

    return {
      question: rawQuestion,
      options,
      correctAnswer: correctIndex,
      explanation,
      context: this._cleanContext(context),
      language: this.language,
    };
  }

  /**
   * Parses questions using heuristic methods when JSON parsing fails.
   * @param {string} text Raw text to parse.
   * @returns {Array} Array of parsed question objects.
   */
  _heuristicParse(text) {
    const lines = (text || '').split('\n').map(l => l.trim()).filter(Boolean);
    const results = [];
    for (let i = 0; i < lines.length; i++) {
      const ln = lines[i];
      if (/^\d+\./.test(ln) || /^[Qq]:/.test(ln) || ln.endsWith('?')) {
        const question = ln.replace(/^\d+\.\s*/, '').replace(/^Q:\s*/i, '').trim();
        const options = [];
        for (let j = i + 1; j < Math.min(i + 7, lines.length); j++) {
          const L = lines[j];
          if (/^[A-D]\)/.test(L) || /^[A-D]\./.test(L) || /^-/.test(L)) {
            const opt = L.replace(/^[A-D]\)|^[A-D]\.|^-\s*/, '').trim();
            options.push(opt);
          }
        }
        if (options.length >= 2) {
          while (options.length < 4) options.push('None of the above');
          results.push({ question, options: options.slice(0, 4), correctAnswer: 0, explanation: 'Heuristic parsed', context: '' });
        }
      }
    }
    return results;
  }

  /**
   * Generates a distractor option.
   * @param {Array} existingOptions Existing options to avoid duplication.
   * @returns {string} A distractor option.
   */
  _generateDistractor(existingOptions) {
    const pool = [
      'Not applicable',
      'None of the above',
      'All of the above',
      'A plausible distractor',
      'An unlikely distractor',
      'Incorrect option'
    ];
    const idx = existingOptions.length % pool.length;
    let candidate = pool[idx];
    let suffix = 1;
    while (existingOptions.map(o => o.toLowerCase()).includes(candidate.toLowerCase())) {
      candidate = `${pool[idx]} (${suffix++})`;
    }
    return candidate;
  }

  /**
   * Cleans and truncates context text.
   * @param {string} context Raw context text.
   * @returns {string} Cleaned context.
   */
  _cleanContext(context) {
    if (!context) return 'Context not available';
    let cleaned = context.toString().trim();
    cleaned = cleaned.replace(/(according to|in|from|as mentioned in) (the|this) (passage|text|document|article|above|following)/gi, '')
      .replace(/\b(the above|aforementioned|as stated|as shown|as described)\b/gi, '')
      .replace(/^(in|from|according to)\s+/gi, '')
      .trim();
    if (cleaned.length < 10) return 'Context not available';
    if (cleaned.length > 150) cleaned = cleaned.substring(0, 147) + '...';
    return cleaned;
  }
}