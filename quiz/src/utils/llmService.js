// LLMService.js - Enhanced with advanced caching, performance optimization, and error handling
import { REQUEST_TIMEOUT_MS } from './constants.js';
import { detectLanguage, getLanguagePrompt } from './languageUtils.js';
import { trimForPrompt, extractJson } from './textUtils.js';
import { readFileContent, FileReadError, getErrorMessage } from './fileReader.js';
import {
	saveQuizResults,
	getDashboardData,
	saveChatMessage,
} from './firebaseService.js';
import { withRetry } from './retryUtils.js';
import { shuffleArray, validateQuestions } from './quizValidator.js';
import { measurePerformance, memoize, debounce } from './performanceUtils.js';

// Enhanced cache with LRU eviction and statistics
class AdvancedCache {
	constructor(maxSize = 100, ttl = 30 * 60 * 1000) { // 30 min default TTL
		this.maxSize = maxSize;
		this.ttl = ttl;
		this.cache = new Map();
		this.accessTimes = new Map();
		this.stats = { hits: 0, misses: 0, evictions: 0, size: 0 };
	}

	generateKey(content, options) {
		// Create a more sophisticated cache key
		const contentHash = this.simpleHash(content.slice(0, 500)); // First 500 chars
		const optionsKey = JSON.stringify(options);
		return `${contentHash}-${this.simpleHash(optionsKey)}`;
	}

	simpleHash(str) {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash; // Convert to 32bit integer
		}
		return Math.abs(hash).toString(36);
	}

	get(key) {
		const item = this.cache.get(key);
		if (!item) {
			this.stats.misses++;
			return null;
		}

		// Check TTL
		if (Date.now() - item.timestamp > this.ttl) {
			this.cache.delete(key);
			this.accessTimes.delete(key);
			this.stats.misses++;
			this.stats.size = this.cache.size;
			return null;
		}

		// Update access time for LRU
		this.accessTimes.set(key, Date.now());
		this.stats.hits++;
		return item.value;
	}

	set(key, value) {
		// Implement LRU eviction
		if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
			this.evictLRU();
		}

		this.cache.set(key, {
			value,
			timestamp: Date.now()
		});
		this.accessTimes.set(key, Date.now());
		this.stats.size = this.cache.size;
	}

	evictLRU() {
		let oldestKey = null;
		let oldestTime = Date.now();

		for (const [key, time] of this.accessTimes) {
			if (time < oldestTime) {
				oldestTime = time;
				oldestKey = key;
			}
		}

		if (oldestKey) {
			this.cache.delete(oldestKey);
			this.accessTimes.delete(oldestKey);
			this.stats.evictions++;
		}
	}

	clear() {
		this.cache.clear();
		this.accessTimes.clear();
		this.stats = { hits: 0, misses: 0, evictions: 0, size: 0 };
	}

	getStats() {
		return {
			...this.stats,
			hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
			size: this.cache.size
		};
	}
}

export class LLMService {
	// Enhanced cache system
	static responseCache = new AdvancedCache(50, 30 * 60 * 1000); // 50 items, 30min TTL
	static fileCache = new AdvancedCache(20, 60 * 60 * 1000); // 20 files, 1hour TTL

	constructor(apiKey, baseUrl) {
		if (!apiKey) throw new Error('API key is required');
		this.apiKey = apiKey;
		this.baseUrl = baseUrl;
		this.language = 'en';
		this.controller = null;
		
		// Memoize expensive operations
		this.memoizedLanguageDetection = memoize(detectLanguage, { 
			maxSize: 100, 
			ttl: 10 * 60 * 1000 
		});
		
		// Debounced cache cleanup
		this.debouncedCacheCleanup = debounce(() => {
			this.cleanupCaches();
		}, 5000);
	}

	// Enhanced Firebase methods with error handling
	async saveQuizResults(quizData) {
		const endMeasure = measurePerformance('Save Quiz Results');
		try {
			const result = await saveQuizResults(quizData);
			endMeasure({ success: true, dataSize: JSON.stringify(quizData).length });
			return result;
		} catch (error) {
			endMeasure({ success: false, error: error.message });
			throw new Error(`Failed to save quiz results: ${error.message}`);
		}
	}

	async getDashboardData() {
		const endMeasure = measurePerformance('Get Dashboard Data');
		try {
			const data = await getDashboardData();
			endMeasure({ success: true, recordCount: data?.length || 0 });
			return data;
		} catch (error) {
			endMeasure({ success: false, error: error.message });
			throw new Error(`Failed to get dashboard data: ${error.message}`);
		}
	}

	async saveChatMessage(message, isUserMessage = true) {
		const endMeasure = measurePerformance('Save Chat Message');
		try {
			const result = await saveChatMessage(message, isUserMessage);
			endMeasure({ success: true, messageLength: message.length });
			return result;
		} catch (error) {
			endMeasure({ success: false, error: error.message });
			throw new Error(`Failed to save chat message: ${error.message}`);
		}
	}

	// Enhanced file reading with caching and progress
	async readFileContent(file, onProgress = null) {
		const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
		
		// Check file cache first
		const cached = LLMService.fileCache.get(fileKey);
		if (cached) {
			console.log('📁 File cache hit:', file.name);
			onProgress?.({ stage: 'cache_hit', progress: 100 });
			return cached;
		}

		try {
			const content = await readFileContent(file, { 
				onProgress,
				maxSize: 100 * 1024 * 1024 // 100MB
			});
			
			// Cache the result
			LLMService.fileCache.set(fileKey, content);
			this.debouncedCacheCleanup();
			
			return content;
		} catch (error) {
			// Enhance error with user-friendly information
			if (error instanceof FileReadError) {
				const errorInfo = getErrorMessage(error);
				throw new Error(`File Error: ${errorInfo.message}\nTechnical: ${errorInfo.technicalDetails}`);
			}
			throw error;
		}
	}

	// Utility methods
	shuffleArray(array) {
		return shuffleArray(array);
	}

	validateQuestions(questions) {
		return validateQuestions(questions);
	}

	// Cache management
	cleanupCaches() {
		const responseStats = LLMService.responseCache.getStats();
		const fileStats = LLMService.fileCache.getStats();
		
		console.debug('Cache stats:', {
			responses: responseStats,
			files: fileStats
		});

		// Auto-cleanup if hit rate is too low
		if (responseStats.hitRate < 0.2 && responseStats.size > 10) {
			console.log('🧹 Cleaning response cache due to low hit rate');
			LLMService.responseCache.clear();
		}
	}

	async generateQuizQuestions(fileOrText, options = {}) {
		const { 
			numQuestions = 10, 
			difficulty = 'medium',
			onProgress = null,
			forceRefresh = false 
		} = options;

		const endMeasure = measurePerformance('Generate Quiz Questions');

		// Cancel any pending requests
		if (this.controller) {
			this.controller.abort();
		}
		this.controller = new AbortController();

		return withRetry(async () => {
			try {
				onProgress?.({ stage: 'reading_file', progress: 10 });

				// Get source text with progress tracking
				const sourceText = typeof fileOrText === 'string'
					? fileOrText
					: await this.readFileContent(fileOrText, (fileProgress) => {
						onProgress?.({ 
							stage: 'reading_file', 
							progress: 10 + (fileProgress.progress * 0.2) 
						});
					});

				if (!sourceText?.trim() || sourceText.trim().length < 50) {
					throw new Error('The document content is empty or too short (minimum 50 characters required).');
				}

				onProgress?.({ stage: 'checking_cache', progress: 30 });

				// Enhanced cache checking
				const cacheKey = LLMService.responseCache.generateKey(sourceText, options);
				
				if (!forceRefresh) {
					const cachedResult = LLMService.responseCache.get(cacheKey);
					if (cachedResult) {
						console.log('🎯 Cache hit for quiz generation');
						onProgress?.({ stage: 'cache_hit', progress: 100 });
						endMeasure({ 
							cached: true, 
							numQuestions: cachedResult.length,
							success: true 
						});
						return cachedResult;
					}
				}

				onProgress?.({ stage: 'detecting_language', progress: 35 });

				// Use memoized language detection
				this.language = this.memoizedLanguageDetection(sourceText);
				const text = trimForPrompt(sourceText);
				const languagePrompt = getLanguagePrompt(this.language, numQuestions, difficulty);

				onProgress?.({ stage: 'generating_questions', progress: 40 });

				const prompt = this._buildPrompt(languagePrompt, text);
				
				onProgress?.({ stage: 'calling_api', progress: 50 });

				const questions = await this._makeApiRequest(
					prompt,
					this.controller.signal,
					(apiProgress) => {
						onProgress?.({ 
							stage: 'calling_api', 
							progress: 50 + (apiProgress * 0.3) 
						});
					}
				);

				onProgress?.({ stage: 'processing_questions', progress: 80 });

				const processedQuestions = this._processQuestions(questions, numQuestions);

				onProgress?.({ stage: 'caching_result', progress: 95 });

				// Cache the result
				LLMService.responseCache.set(cacheKey, processedQuestions);
				this.debouncedCacheCleanup();

				onProgress?.({ stage: 'complete', progress: 100 });

				endMeasure({ 
					cached: false,
					sourceLength: sourceText.length,
					numQuestions: processedQuestions.length,
					language: this.language,
					success: true 
				});

				return processedQuestions;

			} catch (error) {
				endMeasure({ success: false, error: error.message });
				
				if (error?.name === 'AbortError') {
					throw new Error('Quiz generation was cancelled.');
				}
				
				console.error('Quiz generation error:', error);
				
				// Provide more specific error messages
				if (error.message?.includes('API failed')) {
					throw new Error(`AI service error: ${error.message}. Please try again in a moment.`);
				}
				
				if (error.message?.includes('Empty response')) {
					throw new Error('The AI service returned no questions. Please try with different content or settings.');
				}
				
				throw error;
			} finally {
				this.controller = null;
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

	async _makeApiRequest(prompt, signal, onProgress = null) {
		const timeout = setTimeout(
			() => this.controller?.abort(),
			REQUEST_TIMEOUT_MS
		);

		try {
			onProgress?.(0.1);

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

			onProgress?.(0.5);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				const errorMessage = errorData.error?.message || response.statusText;
				throw new Error(`API failed (${response.status}): ${errorMessage}`);
			}

			onProgress?.(0.8);

			const data = await response.json();
			const rawText =
				data?.candidates?.[0]?.content?.parts?.[0]?.text ??
				data?.candidates?.[0]?.content?.parts?.[0]?.inline_data?.data ??
				'';

			if (!rawText) {
				throw new Error('The AI service returned an empty response.');
			}

			onProgress?.(1.0);

			return extractJson(rawText)?.questions ?? [];

		} catch (error) {
			if (error.name === 'AbortError') {
				throw new Error('Request timed out. Please try again with a shorter document.');
			}
			throw error;
		} finally {
			clearTimeout(timeout);
		}
	}

	_processQuestions(questions, numQuestions) {
		if (!Array.isArray(questions) || questions.length === 0) {
			throw new Error('The AI service generated no valid questions. Please try again or use different content.');
		}

		const processedQuestions = questions
			.slice(0, numQuestions)
			.map(this._processQuestion.bind(this))
			.filter(Boolean); // Remove any null results

		if (processedQuestions.length === 0) {
			throw new Error('No valid questions could be generated from the content.');
		}

		return processedQuestions;
	}

	_processQuestion(q, index) {
		try {
			const options = Array.isArray(q.options) ? [...q.options] : [];
			if (options.length !== 4) {
				console.warn(`Question ${index + 1} has ${options.length} options instead of 4, skipping`);
				return null;
			}

			const cleanOptions = this._cleanAndValidateOptions(options, index);
			if (!cleanOptions) return null; // Skip invalid questions

			const correctAnswer = parseInt(q.correctAnswer);
			if (correctAnswer < 0 || correctAnswer > 3 || !cleanOptions[correctAnswer]) {
				console.warn(`Question ${index + 1} has invalid correct answer index, skipping`);
				return null;
			}

			const correctOption = cleanOptions[correctAnswer];
			const shuffledOptions = this.shuffleArray([...cleanOptions]);

			return {
				question: (q.question || '').toString().trim(),
				options: shuffledOptions,
				correctAnswer: shuffledOptions.indexOf(correctOption),
				explanation: (q.explanation || '').toString().trim(),
				context: this._cleanContext(q.context),
				language: this.language,
				originalIndex: index
			};
		} catch (error) {
			console.warn(`Error processing question ${index + 1}:`, error);
			return null;
		}
	}

	_cleanAndValidateOptions(options, index) {
		try {
			const cleanOptions = options.map((opt) =>
				(opt || '').toString().trim().replace(/\s+/g, ' ')
			);

			// Check for empty options
			if (cleanOptions.some(opt => opt.length === 0)) {
				console.warn(`Question ${index + 1} has empty options, skipping`);
				return null;
			}

			// Check for duplicates
			const uniqueOptions = [...new Set(cleanOptions.map(opt => opt.toLowerCase()))];
			if (uniqueOptions.length !== 4) {
				console.warn(`Question ${index + 1} has duplicate options, skipping`);
				return null;
			}

			return cleanOptions;
		} catch (error) {
			console.warn(`Error validating options for question ${index + 1}:`, error);
			return null;
		}
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

	// Utility methods for cache management
	getCacheStats() {
		return {
			responses: LLMService.responseCache.getStats(),
			files: LLMService.fileCache.getStats()
		};
	}

	clearCaches() {
		LLMService.responseCache.clear();
		LLMService.fileCache.clear();
		console.log('🗑️ All caches cleared');
	}

	// Method to cancel current operation
	cancelCurrentOperation() {
		if (this.controller) {
			this.controller.abort();
			console.log('🚫 Current operation cancelled');
		}
	}

	// Health check method
	async healthCheck() {
		const endMeasure = measurePerformance('Health Check');
		
		try {
			const testPrompt = 'Generate a simple test question about colors.';
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 5000);

			const response = await fetch(this.baseUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-goog-api-key': this.apiKey,
				},
				body: JSON.stringify({
					contents: [{ parts: [{ text: testPrompt }] }],
					generationConfig: {
						temperature: 0.1,
						maxOutputTokens: 100,
					},
				}),
				signal: controller.signal,
			});

			clearTimeout(timeout);

			const isHealthy = response.ok;
			endMeasure({ success: isHealthy, status: response.status });

			return {
				healthy: isHealthy,
				status: response.status,
				latency: endMeasure.duration || 0,
				cache: this.getCacheStats()
			};

		} catch (error) {
			endMeasure({ success: false, error: error.message });
			return {
				healthy: false,
				error: error.message,
				cache: this.getCacheStats()
			};
		}
	}
}