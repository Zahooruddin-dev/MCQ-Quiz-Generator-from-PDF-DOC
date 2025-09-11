// LLMService.js - FIXED VERSION with safe contextAnalysis handling
import { REQUEST_TIMEOUT_MS } from './constants.js';
import { detectLanguage, getLanguagePrompt, analyzeContext } from './languageUtils.js';
import { trimForPrompt, extractJson } from './textUtils.js';
import { readFileContent } from './fileReader.js';
import {
	saveQuizResults,
	getDashboardData,
	saveChatMessage,
	getGlobalApiKey,
} from './firebaseService.js';
import { withRetry } from './retryUtils.js';
import { shuffleArray, validateQuestions } from './quizValidator.js';

export class LLMService {
	static instance = null;
	static responseCache = new Map();

	constructor() {
		this.baseUrl =
			'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
		this.language = 'en';
		this.controller = null;
		this.apiKey = null;

		console.log('✅ LLMService initialized with model: gemini-1.5-flash');
	}

	static async getInstance() {
		if (!this.instance) {
			this.instance = new LLMService();
		}
		return this.instance;
	}

	async ensureApiKey() {
		if (!this.apiKey) {
			this.apiKey = await getGlobalApiKey();
			if (!this.apiKey) {
				throw new Error(
					'No global API key configured in Firestore. Please contact administrator.'
				);
			}
			console.log('✅ Global API key loaded successfully');
		}
		return this.apiKey;
	}

	async refreshApiKey() {
		this.apiKey = null;
		const newKey = await this.ensureApiKey();
		console.log('🔄 API key refreshed');
		return newKey;
	}

	static MODEL_URLS = {
		'flash-1.5':
			'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
		'pro-1.5':
			'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
		'flash-2.0':
			'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
	};

	setModel(modelKey = 'flash-1.5') {
		if (LLMService.MODEL_URLS[modelKey]) {
			this.baseUrl = LLMService.MODEL_URLS[modelKey];
			console.log(`🔄 Switched to model: ${modelKey} - ${this.baseUrl}`);
		} else {
			console.error('❌ Invalid model key:', modelKey);
		}
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

		console.log(`🚀 Starting quiz generation with model: ${this.baseUrl}`);

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

				// ✅ Always ensure contextAnalysis exists
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

				const processedQuestions = this._processQuestions(
					questions,
					numQuestions
				);

				LLMService.responseCache.set(cacheKey, processedQuestions);
				console.log('✅ Quiz questions generated and cached successfully');

				return processedQuestions;
			} catch (error) {
				if (error?.name === 'AbortError')
					throw new Error('Request cancelled.');

				if (error.message?.includes('404') && error.message?.includes('gemini-pro')) {
					console.error(
						'❌ Using deprecated model gemini-pro! Check your code for old model references.'
					);
					this.setModel('flash-1.5');
					throw new Error(
						'Model not found. Switched to gemini-1.5-flash. Please try again.'
					);
				}

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

		console.log(`📡 API Request Details:
URL: ${this.baseUrl}
API Key: ${apiKey?.substring(0, 8)}...
Content Length: ${prompt.length} characters`);

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
				const errorMessage = `API failed: ${response.status} - ${
					errorData.error?.message || response.statusText
				}`;

				console.error(`❌ API Error Details:
Status: ${response.status}
URL: ${this.baseUrl}
Error: ${errorData.error?.message || response.statusText}`);

				if (response.status === 401 || response.status === 403) {
					this.apiKey = null;
				}

				throw new Error(errorMessage);
			}

			const data = await response.json();
			const rawText =
				data?.candidates?.[0]?.content?.parts?.[0]?.text ??
				data?.candidates?.[0]?.content?.parts?.[0]?.inline_data?.data ??
				'';
			if (!rawText) throw new Error('Empty response from the model.');

			console.log('✅ API request successful, processing response...');
			return extractJson(rawText)?.questions ?? [];
		} finally {
			clearTimeout(timeout);
		}
	}

	_processQuestions(questions, numQuestions) {
		if (!Array.isArray(questions) || questions.length === 0) {
			throw new Error('Model returned no questions.');
		}

		return questions
			.slice(0, numQuestions)
			.map(this._processQuestion.bind(this));
	}

	_processQuestion(q, index) {
		const options = Array.isArray(q.options) ? [...q.options] : [];
		if (options.length !== 4) {
			throw new Error(`Question ${index + 1} must have 4 options.`);
		}

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
		if (uniqueOptions.length !== 4) {
			throw new Error(`Question ${index + 1} has duplicate options.`);
		}

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
