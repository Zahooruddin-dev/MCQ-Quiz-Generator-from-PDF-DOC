// LLMService.js - Improved version with enhanced prompt for academic MCQs
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
        
        const prompt = this._buildBetterPrompt(text, keyFacts, contextAnalysis, numQuestions, difficulty, this.language);

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

  _buildBetterPrompt(text, keyFacts, contextAnalysis, numQuestions, difficulty, language) {
    const difficultyInstructions = {
      easy: "Focus on basic recall of definitions, key terms, simple facts, and straightforward comprehension. Use simple language and avoid complex reasoning.",
      medium: "Include questions on application of concepts, relationships between ideas, basic analysis, and interpretation of data or examples.",
      hard: "Emphasize synthesis of multiple concepts, evaluation of arguments, advanced reasoning, critical thinking, and problem-solving that may require multi-step logic."
    };

    const contextGuidance = keyFacts.length > 0 
      ? `\nKey facts extracted from the content:\n${keyFacts.map((fact, i) => `${i+1}. ${fact}`).join('\n')}\n`
      : '';

    const analysisGuidance = contextAnalysis 
      ? `\nContext analysis of the content:\n- Type: ${contextAnalysis.type || 'General'}\n- Topics: ${contextAnalysis.topics?.join(', ') || 'N/A'}\n- Has math/equations: ${contextAnalysis.hasMath ? 'Yes' : 'No'}\n- Has graphs/diagrams: ${contextAnalysis.hasGraphs ? 'Yes (described in text)' : 'No'}\n- Complexity: ${contextAnalysis.complexity || 'Medium'}\n`
      : '';

    return `You are an expert academic quiz generator specializing in creating high-quality, rigorous multiple-choice questions (MCQs) for educational purposes. Your questions must be suitable for academic assessments, such as exams in subjects like science, history, literature, mathematics, or social studies.

CRITICAL REQUIREMENTS FOR ALL QUESTIONS:
- Each question MUST be 100% self-contained: Include ALL necessary context, details, data, descriptions, or excerpts directly in the question text. Never assume the reader has access to external content.
- NEVER use vague references like "the passage", "the text", "the document", "the article", "the graph above", "according to the study", "as mentioned", or any indirect pointers.
- ALWAYS incorporate specific details from the content: Use exact names (e.g., people, places, organizations), dates, numbers, quotes, formulas, data points, or descriptions of graphs/diagrams/processes.
- Make questions precise and academic: Avoid ambiguity; ensure options are plausible distractors based on common misconceptions or partial understandings.
- Vary question types: Include recall, comprehension, application, analysis, and evaluation where appropriate for the difficulty.
- Handle special content:
  - For mathematics: Use plain text for equations (e.g., "Solve for x in the equation 2x + 3 = 7"). Include calculation-based questions if the content supports it. Ensure correct answer is derivable from provided info.
  - For graphs/diagrams: If described in the content, rephrase the description inline (e.g., "In a graph showing temperature vs. time where temperature rises linearly from 20°C at t=0 to 100°C at t=10 minutes, what is the rate of change?").
  - For passages/excerpts: Quote or paraphrase key sentences inline (e.g., "In the sentence 'The mitochondria is the powerhouse of the cell,' what organelle is described?").
  - For academic subjects: Tailor to detected context (e.g., if scientific, focus on hypotheses, evidence; if historical, on causes/effects; if literary, on themes/motifs).
- Distractors: Make them plausible by basing on misinterpretations, near-misses, or related but incorrect facts from the content.
- Explanations: Provide detailed, educational explanations citing specific content details.
- Diversity: Ensure questions cover different sections/topics; avoid repetition.
- Language: Use formal, academic tone. Match the content's language (${language}).

EXAMPLES TO AVOID (BAD - NOT SELF-CONTAINED OR TOO VAGUE):
❌ "What does the graph in the passage show?"
❌ "According to the equation provided, solve for x."
❌ "The author argues that climate change is caused by what?"
❌ "In the study, what was the main variable?"

EXAMPLES OF GOOD ACADEMIC MCQS (SELF-CONTAINED, PRECISE):
✅ "In the process of photosynthesis, where carbon dioxide and water are converted into glucose and oxygen using sunlight, as described by the equation 6CO2 + 6H2O → C6H12O6 + 6O2, what is the primary energy source?"
   Options: ["Sunlight", "Glucose", "Carbon dioxide", "Oxygen"]
✅ "Based on the data from a 2020 study where 45% of participants reported improved sleep after exercise, 30% saw no change, and 25% reported worse sleep, what percentage experienced no change?"
   Options: ["30%", "45%", "25%", "70%"]
✅ "In Shakespeare's Hamlet, when the character says 'To be or not to be, that is the question,' what philosophical dilemma is being contemplated?"
   Options: ["Existence and suicide", "Love and betrayal", "Power and kingship", "Friendship and loyalty"]
✅ "For the quadratic equation x² - 5x + 6 = 0, what are the roots?"
   Options: ["2 and 3", "1 and 6", " -2 and -3", "5 and 1"]

DIFFICULTY LEVEL: ${difficulty}
${difficultyInstructions[difficulty] || difficultyInstructions.medium}

ADDITIONAL GUIDANCE BASED ON CONTENT ANALYSIS:
${analysisGuidance}
${contextGuidance}

Generate EXACTLY ${numQuestions} questions. Do not include any extra text outside the JSON.

Required STRICT JSON format (no markdown, no code blocks, pure JSON):
{
  "questions": [
    {
      "question": "Fully self-contained academic question text",
      "options": ["Option A (correct or distractor)", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,  // Index of the correct option (0-3)
      "explanation": "Detailed academic explanation with reference to specific content details"
    }
  ]
}

CONTENT FOR QUESTIONS:
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

    if (validQuestions.length < numQuestions) {
      console.warn(`⚠️ Only ${validQuestions.length}/${numQuestions} valid questions processed`);
    }

    console.log(`🔧 Processed ${validQuestions.length}/${questions.length} questions`);
    return validQuestions;
  }

  _processQuestion(q, index) {
    if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(`Missing required fields`);
    }

    const questionText = q.question.toString().trim();
    
    // Enhanced validation for academic quality - reject bad patterns more strictly
    const badPatterns = [
      /\b(the passage|the text|the document|the article|the graph|the diagram|the equation|the study|the research|the author|the content|as mentioned|according to|in the above|from the provided)\b/gi,
      /\b(X|Y|the company|the senator|the president|the variable|the process)\b/gi  // Generic placeholders
    ];
    
    for (const pattern of badPatterns) {
      if (pattern.test(questionText)) {
        console.warn(`Question ${index + 1} has bad pattern: ${pattern.source}`);
        return null;  // Skip instead of throw to allow partial success
      }
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