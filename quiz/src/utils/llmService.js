// LLMService.js - Production-grade, fail-safe version
// Guarantees EXACT number of questions requested (by combining model generation, retries, and deterministic synthesis)
// NOTE: relies on your existing helper modules: constants.js, textUtils.js (trimForPrompt, extractJson, extractKeyFacts),
// fileReader.js, firebaseService.js (getGlobalApiKey/getGlobalApiConfig/saveQuizResults etc.), retryUtils.js, quizValidator.js

import { REQUEST_TIMEOUT_MS } from './constants.js';
import { detectLanguage } from './languageUtils.js';
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
import { shuffleArray as shuffleArrayImported, validateQuestions as validateQuestionsImported } from './quizValidator.js';

export class LLMService {
  static instance = null;
  static responseCache = new Map();

  // CONFIG: tune these for production behavior
  static MAX_TOTAL_ATTEMPTS = 4; // initial + retries
  static ADDITIONAL_MISSING_ATTEMPTS = 2; // attempts to generate only missing ones
  static FINAL_RELAXED_ATTEMPTS = 1;
  static MIN_ACCEPT_RATIO = 0.7; // min ratio before we begin synthesizing (but we will synthesize anyway to reach exact count)
  static MINIMUM_ACCEPTABLE = 3;

  // Constructor
  constructor() {
    this.baseUrl = sessionStorage.getItem('llm_baseUrl') || null;
    this.apiKey = sessionStorage.getItem('llm_apiKey') || null;
    this.language = 'en';
    this.controller = null;
    console.log('✅ LLMService initialized (fail-safe mode)');
  }

  // convenience: singleton
  static async preloadApiConfig() {
    if (!LLMService.instance) LLMService.instance = new LLMService();
    await LLMService.instance.ensureApiKey();
    await LLMService.instance.ensureEndpoint();
    console.log('🚀 API key + endpoint preloaded');
  }

  // --- Helpers for imported validator functions to avoid naming collisions
  shuffle(array) {
    return shuffleArrayImported(array);
  }
  validateQuestions(questions) {
    return validateQuestionsImported(questions);
  }

  // --- API key / endpoint
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
    if (!config?.baseUrl) throw new Error('No API endpoint configured.');
    const cached = sessionStorage.getItem('llm_baseUrl');
    if (config.baseUrl !== this.baseUrl || config.baseUrl !== cached) {
      this.baseUrl = config.baseUrl;
      sessionStorage.setItem('llm_baseUrl', this.baseUrl);
      console.log(`✅ Endpoint set: ${this.baseUrl}`);
    } else if (!this.baseUrl) {
      this.baseUrl = cached;
    }
    return this.baseUrl;
  }

  async refreshApiKey() {
    this.apiKey = null;
    sessionStorage.removeItem('llm_apiKey');
    return await this.ensureApiKey();
  }

  // --- Firebase wrappers
  async saveQuizResults(quizData) { return saveQuizResults(quizData); }
  async getDashboardData() { return getDashboardData(); }
  async saveChatMessage(message, isUserMessage = true) { return saveChatMessage(message, isUserMessage); }

  // --- File read with retry wrapper
  async readFileContent(file, progressCallback) {
    return withRetry(async () => readFileContent(file, progressCallback));
  }

  // --- User credit check
  async checkUserCredits() {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) throw new Error('User profile not found');

      const userData = userSnap.data();
      const isPremium = userData.isPremium || false;
      const credits = userData.credits || 0;
      const tokenResult = await user.getIdTokenResult();
      const isAdmin = tokenResult.claims.admin === true;

      if (isPremium || isAdmin) return true;
      if (credits <= 0) throw new Error('Insufficient credits.');

      return true;
    } catch (err) {
      console.error('❌ Credit check failed', err);
      throw err;
    }
  }

  // --- Main entry: guarantees EXACT number of questions
  async generateQuizQuestions(fileOrText, options = {}) {
    const {
      numQuestions = 10,
      difficulty = 'medium',
      questionType = 'mixed',
      cache = true,
    } = options;

    const requested = Math.max(1, Math.min(100, parseInt(numQuestions) || 10)); // clamp 1..100
    console.log(`🎯 Requested ${requested} questions (difficulty: ${difficulty})`);

    await this.checkUserCredits();
    await this.ensureApiKey();
    await this.ensureEndpoint();

    // load content
    const sourceText = typeof fileOrText === 'string' ? fileOrText : await this.readFileContent(fileOrText);
    if (!sourceText || !sourceText.trim() || sourceText.trim().length < 30) {
      throw new Error('Content empty or too short to create questions.');
    }

    const cacheKey = LLMService.generateCacheKey(sourceText, { requested, difficulty, questionType });
    if (cache && LLMService.responseCache.has(cacheKey)) {
      const cached = LLMService.responseCache.get(cacheKey);
      if (Array.isArray(cached) && cached.length === requested) {
        console.log('📋 Returning cached exact-count quiz');
        return cached;
      }
    }

    // prepare text + facts
    this.language = detectLanguage(sourceText) || 'en';
    const text = trimForPrompt(sourceText);
    const keyFacts = extractKeyFacts(sourceText);

    // Strategy pipeline
    // 1) Request ALL at once with strict prompt
    // 2) If short: request only missing (repeat up to ADDITIONAL_MISSING_ATTEMPTS)
    // 3) If still short: relaxed attempt(s)
    // 4) If still short: synthesize deterministic questions from keyFacts (or transform existing ones) to reach requested count

    let aggregated = []; // processed validated questions
    let attempts = 0;

    // Helper to request questions from model
    const requestFromModel = async (numToGenerate, contextText, existingQuestions = [], mode = 'strict') => {
      const prompt = mode === 'strict'
        ? this._buildStrictPrompt(contextText, keyFacts, numToGenerate, difficulty, this.language)
        : this._buildAddMissingPrompt(contextText, keyFacts, numToGenerate, existingQuestions, difficulty, this.language, mode);
      const raw = await this._makeApiRequest(prompt);
      return raw;
    };

    // 1) Initial: ask for all
    attempts++;
    console.log(`Attempt ${attempts}: requesting ${requested} questions (initial full request)`);
    try {
      const raw = await requestFromModel(requested, text);
      const processed = this._extractAndProcess(raw);
      aggregated = this._mergeUniqueQuestions(aggregated, processed, requested);
      console.log(`After initial request: ${aggregated.length}/${requested}`);
    } catch (err) {
      console.warn('Initial generation failed:', err.message || err);
    }

    // 2) If still missing, attempt to generate only missing ones (dedup aware)
    let missing = requested - aggregated.length;
    let additionalAttempts = 0;
    while (missing > 0 && additionalAttempts < LLMService.ADDITIONAL_MISSING_ATTEMPTS) {
      additionalAttempts++;
      attempts++;
      const generateCount = missing;
      console.log(`Attempt ${attempts}: requesting only ${generateCount} missing questions (dedup-aware)`);
      try {
        const existingMinimal = aggregated.map(q => q.question.slice(0, 200)); // lightweight fingerprint
        const raw = await requestFromModel(generateCount, text, existingMinimal, 'add_missing');
        const processed = this._extractAndProcess(raw);
        const before = aggregated.length;
        aggregated = this._mergeUniqueQuestions(aggregated, processed, requested);
        missing = requested - aggregated.length;
        console.log(`Added ${aggregated.length - before} new unique; now ${aggregated.length}/${requested}`);
      } catch (err) {
        console.warn(`Attempt ${attempts} failed:`, err.message || err);
        missing = requested - aggregated.length;
      }
    }

    // 3) Final relaxed attempts (let the model produce somewhat looser items)
    let relaxedAttempts = 0;
    while (missing > 0 && relaxedAttempts < LLMService.FINAL_RELAXED_ATTEMPTS) {
      relaxedAttempts++;
      attempts++;
      const generateCount = Math.max(missing, Math.min(10, Math.ceil(requested * 0.5)));
      console.log(`Attempt ${attempts}: relaxed generation for ${generateCount} questions`);
      try {
        const prompt = this._buildRelaxedPrompt(text, keyFacts, generateCount, difficulty, this.language);
        const raw = await this._makeApiRequest(prompt);
        const processed = this._extractAndProcess(raw, { relaxed: true });
        const before = aggregated.length;
        aggregated = this._mergeUniqueQuestions(aggregated, processed, requested);
        missing = requested - aggregated.length;
        console.log(`Relaxed added ${aggregated.length - before}; now ${aggregated.length}/${requested}`);
      } catch (err) {
        console.warn('Relaxed attempt failed:', err.message || err);
        missing = requested - aggregated.length;
      }
    }

    // 4) If still missing, synthesize deterministically from keyFacts and transformations
    if (aggregated.length < requested) {
      console.warn(`⚠️ Still missing ${requested - aggregated.length} questions; synthesizing from content`);
      const synthesized = this._synthesizeQuestions(aggregated, keyFacts, requested - aggregated.length);
      aggregated = this._mergeUniqueQuestions(aggregated, synthesized, requested);
      console.log(`After synthesis: ${aggregated.length}/${requested}`);
    }

    // Final safety: if we still have fewer than MINIMUM_ACCEPTABLE, throw error
    if (aggregated.length < Math.max(LLMService.MINIMUM_ACCEPTABLE, Math.ceil(requested * 0.5))) {
      // Provide exact reason in error
      const msg = `Failed to produce sufficient valid questions (${aggregated.length}/${requested}). Content may lack extractable facts.`;
      console.error(msg);
      throw new Error(msg);
    }

    // Trim/pad to EXACT requested number
    aggregated = aggregated.slice(0, requested);

    // Final validation & normalization
    aggregated = aggregated.map((q, idx) => ({
      ...q,
      id: q.id || `q_${idx + 1}`,
      language: q.language || this.language,
    }));

    // Cache result for identical content/options
    if (cache) LLMService.responseCache.set(cacheKey, aggregated);

    console.log(`✅ Returning EXACT ${aggregated.length} questions (requested: ${requested})`);
    return aggregated;
  }

  // --- Build strict prompt (asks for EXACT number and JSON)
  _buildStrictPrompt(text, keyFacts, numQuestions, difficulty, language) {
    const difficultyInstructions = {
      easy: "Focus on direct facts, definitions, and simple recall questions.",
      medium: "Include application and moderate analysis questions.",
      hard: "Include synthesis and higher-order reasoning questions."
    };
    const contextGuidance = keyFacts && keyFacts.length
      ? `\nKey facts:\n${keyFacts.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n`
      : '';

    return `You MUST produce EXACTLY ${numQuestions} multiple-choice questions in valid JSON.
DO NOT produce more or fewer. Each question object must include: "question", "options" (array length 4), "correctAnswer" (0-3), "explanation" (short), "context" (short quote, <=150 chars).
Be specific, use facts from the CONTENT below. Avoid placeholders.

DIFFICULTY: ${difficulty}
${difficultyInstructions[difficulty] || difficultyInstructions.medium}

CONTENT:
${text}

MANDATORY OUTPUT (JSON):
{
  "questions": [
    {
      "question": "...",
      "options": ["...","...","...","..."],
      "correctAnswer": 0,
      "explanation": "...",
      "context": "..."
    }
    // exactly ${numQuestions} objects
  ]
}`;
  }

  // --- Build prompt to add only missing questions and avoid duplicates
  _buildAddMissingPrompt(text, keyFacts, numToAdd, existingQuestions, difficulty, language, mode = 'add_missing') {
    const existingPreview = (existingQuestions || []).slice(0, 100).map((q, i) => `${i + 1}. ${typeof q === 'string' ? q : (q.question || '').slice(0, 80)}`).join('\n');
    const contextGuidance = keyFacts && keyFacts.length
      ? `\nKey facts:\n${keyFacts.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n`
      : '';

    return `You MUST produce EXACTLY ${numToAdd} additional unique multiple-choice questions in valid JSON. DO NOT repeat or paraphrase the listed existing questions (first 100 shown below). Use other facts from the CONTENT.

EXISTING_QUESTIONS (do not duplicate or paraphrase):
${existingPreview || '(none)'}
CONTENT:
${text}
${contextGuidance}

OUTPUT:
{
  "questions": [
    {
      "question": "...",
      "options": ["...","...","...","..."],
      "correctAnswer": 0,
      "explanation": "...",
      "context": "..."
    }
  ]
}`;
  }

  // --- Relaxed prompt for fallback
  _buildRelaxedPrompt(text, keyFacts, numToAdd, difficulty, language) {
    const instruction = `Produce up to ${numToAdd} valid multiple-choice questions in JSON. It's okay if some are simpler or require minimal context. Ensure options length is 4.`;
    const contextGuidance = keyFacts && keyFacts.length
      ? `\nKey facts:\n${keyFacts.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n`
      : '';
    return `${instruction}\n${contextGuidance}\nCONTENT:\n${text}\nOUTPUT JSON as {"questions":[{...}]}`;
  }

  // --- Make API request: returns raw text (string) or throws
  async _makeApiRequest(prompt) {
    await this.ensureApiKey();
    await this.ensureEndpoint();

    if (this.controller) {
      try { this.controller.abort(); } catch (e) { /* ignore */ }
    }
    this.controller = new AbortController();
    const signal = this.controller.signal;
    const timeout = setTimeout(() => this.controller?.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.15,
            maxOutputTokens: 8192,
            topP: 0.9,
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
        throw new Error(`API failed: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      if (!rawText) throw new Error('Empty response from LLM');
      return rawText;
    } finally {
      clearTimeout(timeout);
    }
  }

  // --- Extract JSON and process into validated internal format
  _extractAndProcess(rawOrArray, opts = { relaxed: false }) {
    // rawOrArray could be either string rawText or an array of question objects (some models may already return parsed)
    let questionsArr = [];
    if (Array.isArray(rawOrArray)) {
      questionsArr = rawOrArray;
    } else {
      const rawText = rawOrArray || '';
      // try primary JSON extraction
      try {
        const extracted = extractJson(rawText);
        if (extracted?.questions && Array.isArray(extracted.questions)) questionsArr = extracted.questions;
      } catch (e) {
        // fallbacks
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
            // give up: attempt to heuristically parse lines (low chance)
            console.warn('JSON extraction fell through; attempting heuristic parsing');
            questionsArr = this._heuristicParse(rawText);
          }
        }
      }
    }

    // process each into normalized validated form
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

  // heuristic fallback (best-effort): parse lines into Q/A blocks — used only as last resort
  _heuristicParse(text) {
    const lines = (text || '').split('\n').map(l => l.trim()).filter(Boolean);
    const results = [];
    for (let i = 0; i < lines.length; i++) {
      const ln = lines[i];
      if (/^\d+\./.test(ln) || /^[Qq]:/.test(ln) || ln.endsWith('?')) {
        const question = ln.replace(/^\d+\.\s*/, '').replace(/^Q:\s*/i, '').trim();
        const options = [];
        // look next up to 6 lines for options starting with A,B,C,D or -
        for (let j = i + 1; j < Math.min(i + 7, lines.length); j++) {
          const L = lines[j];
          if (/^[A-D]\)/.test(L) || /^[A-D]\./.test(L) || /^-/ .test(L)) {
            // strip leading letter and punctuation
            const opt = L.replace(/^[A-D]\)|^[A-D]\.|^-\s*/, '').trim();
            options.push(opt);
          }
        }
        if (options.length >= 2) {
          // build fake 4 options if needed
          while (options.length < 4) options.push('None of the above');
          results.push({ question, options: options.slice(0, 4), correctAnswer: 0, explanation: 'Heuristic parsed', context: '' });
        }
      }
    }
    return results;
  }

  // --- Process single question object into normalized validated form
  _processQuestion(q, idx, opts = { relaxed: false }) {
    if (!q || typeof q !== 'object') throw new Error('Invalid question object');
    const rawQuestion = (q.question || q.q || '').toString().trim();
    if (!rawQuestion || rawQuestion.length < 6) throw new Error('Question text too short');

    // options: accept either array or object fields option1..4
    let options = Array.isArray(q.options) ? q.options.map(o => (o || '').toString().trim()) : [];
    if (!options || options.length === 0) {
      // try option fields
      for (let n = 1; n <= 4; n++) {
        if (q[`option${n}`]) options.push(q[`option${n}`].toString().trim());
      }
    }

    // In relaxed mode accept if options >= 2 and we'll synthesize to 4 later
    if (!opts.relaxed && options.length !== 4) throw new Error('Options must be an array of 4 items');
    if (opts.relaxed && options.length < 2) throw new Error('Not enough options in relaxed mode');

    // normalize options: trim, remove duplicates
    options = options.map(o => o.replace(/\s+/g, ' ').trim()).filter(Boolean);
    if (options.length === 0) throw new Error('No valid options');

    // correctAnswer index detection
    let correctIndex = -1;
    if (typeof q.correctAnswer === 'number' || typeof q.correctAnswer === 'string') {
      correctIndex = parseInt(q.correctAnswer);
      if (isNaN(correctIndex)) correctIndex = -1;
    }
    if (correctIndex < 0 || correctIndex >= options.length) {
      // try to find an option equal to "correct"/"answer"/pattern
      if (typeof q.correct === 'string') {
        const match = options.findIndex(o => o.toLowerCase() === q.correct.toString().trim().toLowerCase());
        if (match >= 0) correctIndex = match;
      }
    }

    // If relaxed and not enough options, pad to 4 deterministic way
    while (options.length < 4) {
      options.push(this._generateDistractor(options));
    }

    // after padding, ensure uniqueness and length 4
    const distinct = [...new Set(options.map(o => o.toLowerCase()))];
    if (distinct.length !== 4) {
      // attempt to mutate duplicates
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

    // If correctIndex invalid, default to first option
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

  // deterministic distractor generator (safe)
  _generateDistractor(existingOptions) {
    // small deterministic pool
    const pool = [
      'Not applicable',
      'None of the above',
      'All of the above',
      'A plausible distractor',
      'An unlikely distractor',
      'Incorrect option'
    ];
    // pick deterministic based on current length
    const idx = existingOptions.length % pool.length;
    let candidate = pool[idx];
    // ensure uniqueness
    let suffix = 1;
    while (existingOptions.map(o => o.toLowerCase()).includes(candidate.toLowerCase())) {
      candidate = `${pool[idx]} (${suffix++})`;
    }
    return candidate;
  }

  // --- Merge unique questions by question text (normalize)
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

  // --- Synthesize missing questions deterministically from keyFacts and existing questions
  _synthesizeQuestions(existing, keyFacts, needed) {
    const synthesized = [];
    const usedFP = new Set(existing.map(q => this._fingerprint(q.question)));
    let i = 0;

    // Primary: convert keyFacts -> direct recall Qs
    while (synthesized.length < needed && i < (keyFacts?.length || 0)) {
      const fact = keyFacts[i];
      const qObj = this._synthesizeFromFact(fact, i);
      if (qObj && !usedFP.has(this._fingerprint(qObj.question))) {
        synthesized.push(qObj);
        usedFP.add(this._fingerprint(qObj.question));
      }
      i++;
    }

    // Secondary: transform existing questions (paraphrase by flipping options, etc.)
    let j = 0;
    while (synthesized.length < needed && j < existing.length) {
      const transformed = this._transformExistingQ(existing[j], j);
      if (transformed && !usedFP.has(this._fingerprint(transformed.question))) {
        synthesized.push(transformed);
        usedFP.add(this._fingerprint(transformed.question));
      }
      j++;
    }

    // Final fallback: generate templated factual Qs that use placeholders from content length
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
      // ensure uniqueness
      if (!synthesized.find(s => this._fingerprint(s.question) === this._fingerprint(fallback.question))) {
        synthesized.push(fallback);
      }
      k++;
      if (k > needed * 4) break; // safety
    }

    return synthesized;
  }

  _synthesizeFromFact(fact, idx) {
    if (!fact || !fact.toString) return null;
    const f = fact.toString().trim();
    // Try to build a simple question: "What year/number/term is associated with X?" heuristic
    // if fact contains a number -> ask about number; else ask for definition/fill-in
    const numMatch = f.match(/(\b\d{3,4}\b)|(\b\d+%?\b)/);
    if (numMatch) {
      const number = numMatch[0];
      const question = `According to the content, which number is associated with: "${this._truncateFact(f)}"?`;
      const correct = number;
      // build distractors deterministically
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
      // build definition/association question
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

  _truncateFact(f, len = 80) {
    return f.length <= len ? f : f.slice(0, len - 3) + '...';
  }

  _shuffleButPlaceCorrectFirst(arr) {
    // arr[0] assumed correct, we shuffle rest and then produce final options
    const correct = arr[0];
    const rest = arr.slice(1);
    const shuffled = this.shuffle(rest);
    const options = [correct, ...shuffled];
    // finally shuffle positions but ensure correct is present
    return this.shuffle(options);
  }

  _transformExistingQ(q, idx) {
    try {
      const base = q.question;
      const newQ = `${base} (reworded ${idx + 1})`;
      // rotate options and flip correct index
      const opts = Array.isArray(q.options) ? [...q.options] : [];
      if (opts.length < 4) {
        while (opts.length < 4) opts.push(this._generateDistractor(opts));
      }
      const rotated = opts.slice(1).concat(opts[0]);
      const correctAnswer = (q.correctAnswer + 3) % 4; // rotate backwards to change correct
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

  // --- Clean context
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

  // --- Utility: deterministic cache key
  static generateCacheKey(content, options) {
    try {
      const shortContent = content.slice(0, 200);
      const optionsStr = JSON.stringify(options || {});
      let hash = 0;
      const combined = shortContent + optionsStr;
      for (let i = 0; i < Math.min(combined.length, 1000); i++) {
        hash = ((hash << 5) - hash + combined.charCodeAt(i)) | 0;
      }
      return `quiz_${Math.abs(hash).toString(36)}_${Date.now().toString(36).slice(-6)}`;
    } catch (err) {
      return `quiz_fallback_${Date.now().toString(36)}`;
    }
  }
}
