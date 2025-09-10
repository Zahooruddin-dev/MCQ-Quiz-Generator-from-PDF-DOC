// LLMService.js - Main service class
import { REQUEST_TIMEOUT_MS } from './constants.js';
import { detectLanguage, getLanguagePrompt } from './languageUtils.js';
import { trimForPrompt, extractJson } from './textUtils.js';
import { readFileContent } from './fileReader.js';
import {
	saveQuizResults,
	getDashboardData,
	saveChatMessage,
	debugCheckApiKey,
} from './firebaseService.js';
import { withRetry } from './retryUtils.js';
import { shuffleArray, validateQuestions } from './quizValidator.js';

export class LLMService {
	static instance = null;
	// Cache for API responses
	static responseCache = new Map();

	constructor(apiKey, baseUrl) {
		if (!apiKey) throw new Error('API key is required');
		this.apiKey = apiKey;
		this.baseUrl =
			baseUrl ||
			'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
		this.language = 'en';
		this.controller = null;
	}

	static async getInstance() {
		if (!this.instance) {
			const apiKey = await debugCheckApiKey();
			if (!apiKey) throw new Error('Failed to get API key');

			this.instance = new LLMService(apiKey);
		}
		return this.instance;
	}

	// Firebase methods
	async saveQuizResults(quizData) {
		return saveQuizResults(quizData);
	}

	async getDashboardData() {
		return getDashboardData();
	}

	async saveChatMessage(message, isUserMessage = true) {
		return saveChatMessage(message, isUserMessage);
	}

	// File reading method
	async readFileContent(file) {
		return withRetry(async () => readFileContent(file));
	}

	// Utility methods
	shuffleArray(array) {
		return shuffleArray(array);
	}

	validateQuestions(questions) {
		return validateQuestions(questions);
	}

	// Add cache key generator
	static generateCacheKey(content, options) {
		return `${content.slice(0, 100)}-${JSON.stringify(options)}`;
	}

	async generateQuizQuestions(fileOrText, options = {}) {
		const { numQuestions = 10, difficulty = 'medium' } = options;

		if (this.controller) {
			this.controller.abort();
		}
		this.controller = new AbortController();

		return withRetry(async () => {
			try {
				const sourceText =
					typeof fileOrText === 'string'
						? fileOrText
						: await this.readFileContent(fileOrText);

				if (!sourceText?.trim() || sourceText.trim().length < 50) {
					throw new Error('The document seems empty or too short.');
				}

				// Check cache first
				const cacheKey = LLMService.generateCacheKey(sourceText, options);
				if (LLMService.responseCache.has(cacheKey)) {
					return LLMService.responseCache.get(cacheKey);
				}

				this.language = detectLanguage(sourceText);
				const text = trimForPrompt(sourceText);
				const languagePrompt = getLanguagePrompt(
					this.language,
					numQuestions,
					difficulty
				);

				const prompt = this._buildPrompt(languagePrompt, text);
				const questions = await this._makeApiRequest(
					prompt,
					this.controller.signal
				);

				const processedQuestions = this._processQuestions(
					questions,
					numQuestions
				);

				// Cache the result
				LLMService.responseCache.set(cacheKey, processedQuestions);

				return processedQuestions;
			} catch (error) {
				if (error?.name === 'AbortError') throw new Error('Request cancelled.');
				console.error('Quiz generation error:', error);
				throw error;
			} finally {
				this.controller = null;
			}
		});
	}

	// Break down into smaller methods for better maintainability
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
		const timeout = setTimeout(
			() => this.controller?.abort(),
			REQUEST_TIMEOUT_MS
		);

		try {
			const response = await fetch(this.baseUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-goog-api-key': this.apiKey,
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
