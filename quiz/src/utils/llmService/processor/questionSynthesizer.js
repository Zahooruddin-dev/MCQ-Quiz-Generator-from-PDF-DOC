// questionSynthesizer.js

/**
 * Service for synthesizing fallback questions when generation is insufficient.
 */
export class QuestionSynthesizer {
  constructor(language = 'en') {
    this.language = language;
  }

  /**
   * Synthesizes questions when the main generation doesn't produce enough.
   * @param {Array} existing Existing questions.
   * @param {string[]} keyFacts Key facts from the content.
   * @param {number} needed Number of questions needed.
   * @returns {Array} Array of synthesized questions.
   */
  synthesizeQuestions(existing, keyFacts, needed) {
    const synthesized = [];
    const usedFP = new Set(existing.map(q => this._fingerprint(q.question)));
    let i = 0;

    while (synthesized.length < needed && i < (keyFacts?.length || 0)) {
      const fact = keyFacts[i];
      const qObj = this._synthesizeFromFact(fact, i);
      if (qObj && !usedFP.has(this._fingerprint(qObj.question))) {
        synthesized.push(qObj);
        usedFP.add(this._fingerprint(qObj.question));
      }
      i++;
    }

    let j = 0;
    while (synthesized.length < needed && j < existing.length) {
      const transformed = this._transformExistingQ(existing[j], j);
      if (transformed && !usedFP.has(this._fingerprint(transformed.question))) {
        synthesized.push(transformed);
        usedFP.add(this._fingerprint(transformed.question));
      }
      j++;
    }

    let k = 0;
    while (synthesized.length < needed) {
      const fallback = {
        question: `Which of the following is true based on the content (auto-generated)? (${k + 1})`,
        options: ['Statement A', 'Statement B', 'Statement C', 'Statement D'],
        correctAnswer: 0,
        explanation: 'Auto-generated fallback question',
        context: 'Context not available',
        language: this.language,
      };
      if (!synthesized.find(s => this._fingerprint(s.question) === this._fingerprint(fallback.question))) {
        synthesized.push(fallback);
      }
      k++;
      if (k > needed * 4) break;
    }

    return synthesized;
  }

  /**
   * Synthesizes a question from a single fact.
   * @param {string} fact The fact to base the question on.
   * @param {number} idx Index for uniqueness.
   * @returns {object|null} Synthesized question object or null.
   */
  _synthesizeFromFact(fact, idx) {
    if (!fact || !fact.toString) return null;
    const f = fact.toString().trim();
    const numMatch = f.match(/(\b\d{3,4}\b)|(\b\d+%?\b)/);
    if (numMatch) {
      const number = numMatch[0];
      const question = `According to the content, which number is associated with: "${this._truncateFact(f)}"?`;
      const correct = number;
      const distractors = [
        String((parseInt(number.replace('%', '')) + 1) || (number + '1')),
        String((parseInt(number.replace('%', '')) + 2) || (number + '2')),
        'None of the above'
      ].slice(0, 3);
      const options = this._shuffleButPlaceCorrectFirst([correct, ...distractors]);
      return {
        question,
        options,
        correctAnswer: options.indexOf(correct),
        explanation: `The fact explicitly mentions ${correct}`,
        context: this._truncateFact(f, 140),
        language: this.language,
      };
    } else {
      const tokens = f.split(/[,:;-]/).map(s => s.trim()).filter(Boolean);
      const seed = tokens[0] || f;
      const question = `Which statement best describes: "${this._truncateFact(seed)}"?`;
      const options = [
        f,
        'A plausible incorrect paraphrase',
        'An unrelated statement',
        'None of the above'
      ];
      const finalOptions = this._shuffleButPlaceCorrectFirst(options);
      return {
        question,
        options: finalOptions,
        correctAnswer: finalOptions.indexOf(f),
        explanation: 'Derived from the fact extracted from content',
        context: this._truncateFact(f, 140),
        language: this.language,
      };
    }
  }

  /**
   * Transforms an existing question for fallback purposes.
   * @param {object} q Existing question object.
   * @param {number} idx Index for uniqueness.
   * @returns {object|null} Transformed question or null.
   */
  _transformExistingQ(q, idx) {
    try {
      const base = q.question;
      const newQ = `${base} (reworded ${idx + 1})`;
      const opts = Array.isArray(q.options) ? [...q.options] : [];
      if (opts.length < 4) {
        while (opts.length < 4) opts.push(this._generateDistractor(opts));
      }
      const rotated = opts.slice(1).concat(opts[0]);
      const correctAnswer = (q.correctAnswer + 3) % 4;
      return {
        question: newQ,
        options: rotated,
        correctAnswer,
        explanation: q.explanation || 'Transformed from existing question',
        context: q.context || 'Context not available',
        language: this.language,
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * Generates a distractor option.
   * @param {Array} existingOptions Existing options.
   * @returns {string} Distractor option.
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
   * Truncates a fact for display.
   * @param {string} f Fact text.
   * @param {number} len Maximum length.
   * @returns {string} Truncated fact.
   */
  _truncateFact(f, len = 80) {
    return f.length <= len ? f : f.slice(0, len - 3) + '...';
  }

  /**
   * Shuffles options but places the correct one first.
   * @param {Array} arr Options array.
   * @returns {Array} Shuffled array with correct answer first.
   */
  _shuffleButPlaceCorrectFirst(arr) {
    const correct = arr[0];
    const rest = arr.slice(1);
    const shuffled = this._shuffleArray(rest);
    const options = [correct, ...shuffled];
    return this._shuffleArray(options);
  }

  /**
   * Simple array shuffle utility.
   * @param {Array} array Array to shuffle.
   * @returns {Array} Shuffled array.
   */
  _shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Creates a fingerprint for question deduplication.
   * @param {string} text Question text.
   * @returns {string} Fingerprint.
   */
  _fingerprint(text) {
    return (text || '').toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 200);
  }
}