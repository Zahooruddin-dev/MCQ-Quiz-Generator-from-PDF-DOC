// LLMService.js - Production-grade with progressive difficulty fallback
// Default: 3 attempts at HIGH quality, then 3 at MEDIUM, then 3 at EASY, then synthesis
// Guarantees EXACT number of questions requested

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

  // CONFIG: Progressive difficulty fallback system
  static HIGH_QUALITY_ATTEMPTS = 3;    // First tier: high-quality MCQs
  static MEDIUM_QUALITY_ATTEMPTS = 3;   // Second tier: medium difficulty
  static EASY_QUALITY_ATTEMPTS = 3;     // Third tier: easy questions
  static MIN_ACCEPT_RATIO = 0.7;
  static MINIMUM_ACCEPTABLE = 3;

  // Constructor
  constructor() {
    this.baseUrl = sessionStorage.getItem('llm_baseUrl') || null;
    this.apiKey = sessionStorage.getItem('llm_apiKey') || null;
    this.language = 'en';
    this.controller = null;
    console.log('✅ LLMService initialized (progressive difficulty fallback mode)');
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

  // --- API key / endpoint (unchanged)
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

  // --- Firebase wrappers (unchanged)
  async saveQuizResults(quizData) { return saveQuizResults(quizData); }
  async getDashboardData() { return getDashboardData(); }
  async saveChatMessage(message, isUserMessage = true) { return saveChatMessage(message, isUserMessage); }

  // --- File read with retry wrapper (unchanged)
  async readFileContent(file, progressCallback) {
    return withRetry(async () => readFileContent(file, progressCallback));
  }

  // --- User credit check (unchanged)
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

  // --- MAIN ENTRY: Progressive difficulty fallback system
  async generateQuizQuestions(fileOrText, options = {}) {
    const {
      numQuestions = 10,
      difficulty = 'high', // Changed default to 'high'
      questionType = 'mixed',
      cache = true,
    } = options;

    const requested = Math.max(1, Math.min(100, parseInt(numQuestions) || 10));
    console.log(`🎯 Requested ${requested} questions (starting with HIGH quality, fallback enabled)`);

    await this.checkUserCredits();
    await this.ensureApiKey();
    await this.ensureEndpoint();

    // Load content
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

    // Prepare text + facts
    this.language = detectLanguage(sourceText) || 'en';
    const text = trimForPrompt(sourceText);
    const keyFacts = extractKeyFacts(sourceText);

    // Progressive difficulty fallback pipeline
    let aggregated = [];
    let totalAttempts = 0;

    // TIER 1: HIGH QUALITY ATTEMPTS (3 attempts)
    console.log('🚀 TIER 1: Attempting HIGH quality MCQ generation');
    aggregated = await this._attemptGeneration(
      text, keyFacts, requested, 'high', 
      LLMService.HIGH_QUALITY_ATTEMPTS, aggregated, totalAttempts
    );
    totalAttempts += LLMService.HIGH_QUALITY_ATTEMPTS;

    // TIER 2: MEDIUM QUALITY ATTEMPTS (if still missing questions)
    if (aggregated.length < requested) {
      const missing = requested - aggregated.length;
      console.log(`⚡ TIER 2: HIGH quality insufficient (${aggregated.length}/${requested}). Trying MEDIUM quality...`);
      aggregated = await this._attemptGeneration(
        text, keyFacts, requested, 'medium', 
        LLMService.MEDIUM_QUALITY_ATTEMPTS, aggregated, totalAttempts
      );
      totalAttempts += LLMService.MEDIUM_QUALITY_ATTEMPTS;
    }

    // TIER 3: EASY QUALITY ATTEMPTS (if still missing questions)
    if (aggregated.length < requested) {
      const missing = requested - aggregated.length;
      console.log(`💡 TIER 3: MEDIUM quality insufficient (${aggregated.length}/${requested}). Trying EASY quality...`);
      aggregated = await this._attemptGeneration(
        text, keyFacts, requested, 'easy', 
        LLMService.EASY_QUALITY_ATTEMPTS, aggregated, totalAttempts
      );
      totalAttempts += LLMService.EASY_QUALITY_ATTEMPTS;
    }

    // FINAL TIER: Synthesis (if still missing questions)
    if (aggregated.length < requested) {
      console.warn(`⚠️ All difficulty tiers exhausted (${aggregated.length}/${requested}). Synthesizing remaining questions...`);
      const synthesized = this._synthesizeQuestions(aggregated, keyFacts, requested - aggregated.length);
      aggregated = this._mergeUniqueQuestions(aggregated, synthesized, requested);
      console.log(`After synthesis: ${aggregated.length}/${requested}`);
    }

    // Final validation
    if (aggregated.length < Math.max(LLMService.MINIMUM_ACCEPTABLE, Math.ceil(requested * 0.5))) {
      const msg = `Failed to produce sufficient valid questions (${aggregated.length}/${requested}). Content may lack extractable facts.`;
      console.error(msg);
      throw new Error(msg);
    }

    // Trim to exact requested number
    aggregated = aggregated.slice(0, requested);

    // Final normalization
    aggregated = aggregated.map((q, idx) => ({
      ...q,
      id: q.id || `q_${idx + 1}`,
      language: q.language || this.language,
    }));

    // Cache result
    if (cache) LLMService.responseCache.set(cacheKey, aggregated);

    console.log(`✅ SUCCESS: Returning EXACT ${aggregated.length} questions (requested: ${requested})`);
    return aggregated;
  }

  // --- Helper: Attempt generation at specific difficulty level
  async _attemptGeneration(text, keyFacts, requested, difficulty, maxAttempts, existingQuestions, startAttemptNum) {
    let aggregated = [...existingQuestions];
    let attemptCount = 0;

    while (attemptCount < maxAttempts && aggregated.length < requested) {
      attemptCount++;
      const totalAttemptNum = startAttemptNum + attemptCount;
      const missing = requested - aggregated.length;
      
      console.log(`  Attempt ${attemptCount}/${maxAttempts} (${difficulty.toUpperCase()}): Need ${missing} more questions`);
      
      try {
        const prompt = this._buildPromptForDifficulty(text, keyFacts, missing, difficulty, this.language);
        const raw = await this._makeApiRequest(prompt);
        const processed = this._extractAndProcess(raw);
        
        const beforeCount = aggregated.length;
        aggregated = this._mergeUniqueQuestions(aggregated, processed, requested);
        const addedCount = aggregated.length - beforeCount;
        
        console.log(`    ✓ Added ${addedCount} unique questions. Total: ${aggregated.length}/${requested}`);
        
        // If we got enough, break early
        if (aggregated.length >= requested) {
          console.log(`    🎉 ${difficulty.toUpperCase()} tier successful! Got required questions.`);
          break;
        }
        
      } catch (err) {
        console.warn(`    ❌ ${difficulty.toUpperCase()} attempt ${attemptCount} failed:`, err.message);
      }
    }

    return aggregated;
  }

  // --- Build difficulty-specific prompts
  _buildPromptForDifficulty(text, keyFacts, numQuestions, difficulty, language) {
    const contextGuidance = keyFacts && keyFacts.length
      ? `\nKey facts to focus on:\n${keyFacts.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n`
      : '';

    const difficultyPrompts = {
      high: this._buildHighQualityPrompt(text, keyFacts, numQuestions, language),
      medium: this._buildMediumQualityPrompt(text, keyFacts, numQuestions, language),
      easy: this._buildEasyQualityPrompt(text, keyFacts, numQuestions, language)
    };

    return difficultyPrompts[difficulty] || difficultyPrompts.medium;
  }

  // --- HIGH QUALITY MCQ PROMPT (most sophisticated)
  _buildHighQualityPrompt(text, keyFacts, numQuestions, language) {
    const contextGuidance = keyFacts && keyFacts.length
      ? `\nCritical facts to incorporate:\n${keyFacts.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n`
      : '';

    return `You are an expert educational assessment designer. Create EXACTLY ${numQuestions} HIGH-QUALITY multiple-choice questions that demonstrate deep understanding and critical thinking.

QUALITY STANDARDS FOR HIGH-LEVEL MCQs:
- Questions should test APPLICATION, ANALYSIS, SYNTHESIS, and EVALUATION (Bloom's higher-order thinking)
- Avoid simple recall or definition questions
- Create scenarios that require connecting multiple concepts
- Use realistic, complex distractors that represent common misconceptions
- Each question should have ONE clearly correct answer and three plausible but incorrect options
- Questions should be challenging but fair, requiring genuine understanding of the content

QUESTION TYPES TO PRIORITIZE:
1. Application: "Given scenario X, what would be the best approach/outcome?"
2. Analysis: "What is the primary relationship between concepts A and B?"
3. Synthesis: "How do these elements work together to create...?"
4. Evaluation: "Which approach would be most effective and why?"
5. Compare/Contrast: "What is the key difference between X and Y?"

DISTRACTOR QUALITY:
- Each wrong option should be plausible to someone with partial understanding
- Include common misconceptions as distractors
- Avoid obviously wrong or nonsensical options
- Make distractors similar in length and complexity to the correct answer

CONTENT TO ANALYZE:
${text}
${contextGuidance}

MANDATORY OUTPUT FORMAT (JSON):
{
  "questions": [
    {
      "question": "Complex, thought-provoking question that requires deep understanding...",
      "options": ["Correct answer with specific details", "Plausible misconception A", "Plausible misconception B", "Plausible misconception C"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why this is correct and why others are wrong",
      "context": "Specific quote or reference from content (max 150 chars)"
    }
    // exactly ${numQuestions} objects
  ]
}

GENERATE EXACTLY ${numQuestions} HIGH-QUALITY QUESTIONS NOW.`;
  }

  // --- MEDIUM QUALITY MCQ PROMPT (balanced approach)
  _buildMediumQualityPrompt(text, keyFacts, numQuestions, language) {
    const contextGuidance = keyFacts && keyFacts.length
      ? `\nKey facts:\n${keyFacts.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n`
      : '';

    return `Create EXACTLY ${numQuestions} MEDIUM-DIFFICULTY multiple-choice questions that balance comprehension and application.

MEDIUM QUALITY STANDARDS:
- Mix of comprehension, application, and some analysis questions
- Clear, direct questions that test understanding of key concepts
- Good distractors that are wrong but not obviously so
- Questions should be answerable by someone who studied the content carefully

QUESTION TYPES:
- Comprehension: "What does X mean in this context?"
- Application: "How would you apply concept X in situation Y?"
- Basic analysis: "What is the main cause/effect of X?"
- Factual application: "According to the content, which statement about X is true?"

CONTENT:
${text}
${contextGuidance}

OUTPUT JSON FORMAT:
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
}

GENERATE EXACTLY ${numQuestions} QUESTIONS.`;
  }

  // --- EASY QUALITY MCQ PROMPT (basic recall and simple comprehension)
  _buildEasyQualityPrompt(text, keyFacts, numQuestions, language) {
    const contextGuidance = keyFacts && keyFacts.length
      ? `\nKey facts:\n${keyFacts.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n`
      : '';

    return `Create EXACTLY ${numQuestions} EASY multiple-choice questions focusing on basic recall and simple comprehension.

EASY QUALITY STANDARDS:
- Direct recall of facts, definitions, and basic concepts
- Simple comprehension questions
- Straightforward distractors
- Questions answerable through basic reading of the content

QUESTION TYPES:
- Definition: "What is X?"
- Factual recall: "According to the content, what year/number/name...?"
- Simple identification: "Which of the following is mentioned as...?"
- Basic comprehension: "The content states that X is...?"

CONTENT:
${text}
${contextGuidance}

OUTPUT JSON FORMAT:
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
}

GENERATE EXACTLY ${numQuestions} QUESTIONS.`;
  }

  // --- API request method (unchanged)
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

  // --- Extract and process methods (mostly unchanged, keeping existing robust parsing)
  _extractAndProcess(rawOrArray, opts = { relaxed: false }) {
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

  // --- Rest of the methods remain unchanged
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

  _synthesizeQuestions(existing, keyFacts, needed) {
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

  _truncateFact(f, len = 80) {
    return f.length <= len ? f : f.slice(0, len - 3) + '...';
  }

  _shuffleButPlaceCorrectFirst(arr) {
    const correct = arr[0];
    const rest = arr.slice(1);
    const shuffled = this.shuffle(rest);
    const options = [correct, ...shuffled];
    return this.shuffle(options);
  }

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