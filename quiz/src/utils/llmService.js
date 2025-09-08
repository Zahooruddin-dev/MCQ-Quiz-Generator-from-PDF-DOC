// LLMService.js - Main service class
import { REQUEST_TIMEOUT_MS } from './constants.js';
import { detectLanguage, getLanguagePrompt } from './languageUtils.js';
import { trimForPrompt, extractJson } from './textUtils.js';
import { readFileContent } from './fileReader.js';
import { saveQuizResults, getDashboardData, saveChatMessage } from './firebaseService.js';
import { withRetry } from './retryUtils.js';
import { shuffleArray, validateQuestions } from './quizValidator.js';

export class LLMService {
	constructor(apiKey, baseUrl) {
		if (!apiKey) throw new Error('API key is required');
		this.apiKey = apiKey;
		this.baseUrl = baseUrl;
		this.language = 'en';
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

	async generateQuizQuestions(fileOrText, options = {}) {
		const { numQuestions = 10, difficulty = 'medium' } = options;
		return withRetry(async () => {
			try {
				const sourceText =
					typeof fileOrText === 'string'
						? fileOrText
						: await this.readFileContent(fileOrText);
				if (!sourceText || sourceText.trim().length < 50)
					throw new Error('The document seems empty or too short.');
				this.language = detectLanguage(sourceText);
				console.log(`Detected language: ${this.language}`);
				const text = trimForPrompt(sourceText);
				const languagePrompt = getLanguagePrompt(
					this.language,
					numQuestions,
					difficulty
				);

				const prompt = `${languagePrompt}

IMPORTANT: For "context", use a direct quote from the source text, NOT a reference to "the passage" or "the text".

Format:
{
  "questions": [
    { "question": "string", "options": ["string","string","string","string"], "correctAnswer": 0, "explanation": "string", "context": "string" }
  ]
}

Content:
${text}`;

				const controller = new AbortController();
				const timeout = setTimeout(
					() => controller.abort(),
					REQUEST_TIMEOUT_MS
				);
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
					signal: controller.signal,
				});
				clearTimeout(timeout);
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
				const parsed = extractJson(rawText);
				let questions = parsed?.questions;
				if (!Array.isArray(questions) || questions.length === 0)
					throw new Error('Model returned no questions.');
				if (questions.length > numQuestions)
					questions = questions.slice(0, numQuestions);

				const processedQuestions = questions.map((q, index) => {
					const options = Array.isArray(q.options) ? [...q.options] : [];
					if (options.length !== 4)
						throw new Error(`Question ${index + 1} must have 4 options.`);
					const cleanOptions = options.map((opt) =>
						(opt || '').toString().trim().replace(/\s+/g, ' ')
					);
					const uniqueOptions = [...new Set(cleanOptions)];
					if (uniqueOptions.length !== 4)
						throw new Error(`Question ${index + 1} has duplicate options.`);
					const correctOption = cleanOptions[q.correctAnswer];
					if (!correctOption)
						throw new Error(
							`Question ${index + 1} has invalid correctAnswer index.`
						);
					const shuffledOptions = this.shuffleArray([...cleanOptions]);
					const newCorrectIndex = shuffledOptions.indexOf(correctOption);
					let cleanContext = (q.context || '')
						.toString()
						.trim()
						.replace(
							/(according to|in|from) (the|this) (passage|text|document|article)/gi,
							''
						)
						.trim();
					return {
						question: (q.question || '').toString().trim(),
						options: shuffledOptions,
						correctAnswer: newCorrectIndex,
						explanation: (q.explanation || '').toString().trim(),
						context: cleanContext || 'Context not available',
						language: this.language,
					};
				});

				return this.validateQuestions(processedQuestions);
			} catch (error) {
				if (error?.name === 'AbortError')
					throw new Error('The request timed out.');
				console.error('Quiz generation error:', error);
				throw new Error(error?.message || 'Failed to generate quiz.');
			}
		});
	}
}