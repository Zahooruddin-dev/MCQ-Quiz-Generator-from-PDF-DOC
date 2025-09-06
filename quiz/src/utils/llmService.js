// LLMService.js - Enhanced with better language handling, OCR support, and Firebase dashboard integration

// --- Imports for PDF handling ---
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

// --- Firebase Imports for Dashboard Tracking ---
import {
	getFirestore,
	doc,
	setDoc,
	getDoc,
	updateDoc,
	increment,
	collection,
	addDoc,
	query,
	orderBy,
	limit,
	getDocs,
	deleteDoc,
	getCountFromServer,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firestore instance
const db = getFirestore();

// ======================================================
// Constants + helpers
// ======================================================
const MAX_CHARS = 18000;
const REQUEST_TIMEOUT_MS = 120000; // Increased timeout for OCR processing
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// Language detection
function detectLanguage(text) {
	if (!text || text.length < 50) return 'en';
	const scriptPatterns = {
		ar: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g,
		ur: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g,
		hi: /[\u0900-\u097F\uA8E0-\uA8FF]/g,
		bn: /[\u0980-\u09FF]/g,
		pa: /[\u0A00-\u0A7F]/g,
		gu: /[\u0A80-\u0AFF]/g,
		ta: /[\u0B80-\u0BFF]/g,
		te: /[\u0C00-\u0C7F]/g,
		kn: /[\u0C80-\u0CFF]/g,
		ml: /[\u0D00-\u0D7F]/g,
		th: /[\u0E00-\u0E7F]/g,
		zh: /[\u4E00-\u9FFF\u3400-\u4DBF]/g,
		ja: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g,
		ko: /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g,
		ru: /[\u0400-\u04FF]/g,
		es: /[áéíóúñüÁÉÍÓÚÑÜ]/g,
		fr: /[àâçéèêëîïôûùüÿÀÂÇÉÈÊËÎÏÔÛÙÜŸ]/g,
		de: /[äöüßÄÖÜ]/g,
		it: /[àèéìíîòóùúÀÈÉÌÍÎÒÓÙÚ]/g,
		pt: /[áàâãçéêíóôõúÁÀÂÃÇÉÊÍÓÔÕÚ]/g,
	};

	const scriptCounts = {};
	for (const [lang, pattern] of Object.entries(scriptPatterns)) {
		const matches = text.match(pattern);
		scriptCounts[lang] = matches ? matches.length : 0;
	}

	let dominantLang = 'en';
	let maxCount = 0;
	for (const [lang, count] of Object.entries(scriptCounts)) {
		if (count > maxCount) {
			maxCount = count;
			dominantLang = lang;
		}
	}

	if (maxCount > text.length * 0.1) return dominantLang;
	return 'en';
}

// Language prompts
const LANGUAGE_PROMPTS = {
	en: {
		instruction: `Create {numQuestions} {difficulty} multiple choice questions from the following text.

CRITICAL RULES:
1. Each question MUST be completely self-contained - NEVER reference "the passage", "the text", or "the article"
2. Include ALL necessary context within the question itself
3. ALWAYS frame questions based on the CONTENT, not the document structure

Each question must have:
- "question": self-contained
- "options": 4 unique options
- "correctAnswer": index of the correct option
- "explanation": 1-2 line explanation
- "context": direct quote (max 150 chars)`,
	},
	ur: {
		instruction: `درج ذیل متن سے {numQuestions} {difficulty} کثیر انتخابی سوالات بنائیں۔ ...`,
	},
	ar: {
		instruction: `أنشئ {numQuestions} أسئلة اختيار من متعدد {difficulty} من النص التالي. ...`,
	},
};

function getLanguagePrompt(lang, numQuestions, difficulty) {
	const prompt = LANGUAGE_PROMPTS[lang] || LANGUAGE_PROMPTS.en;
	return prompt.instruction
		.replace(/{numQuestions}/g, numQuestions)
		.replace(/{difficulty}/g, difficulty);
}

function trimForPrompt(text) {
	if (!text) return '';
	if (text.length <= MAX_CHARS) return text;
	const paragraphs = text.split(/\n\s*\n/);
	let trimmedText = '';
	for (const paragraph of paragraphs) {
		if ((trimmedText + paragraph).length <= MAX_CHARS) {
			trimmedText += paragraph + '\n\n';
		} else break;
	}
	return trimmedText.length > 0
		? trimmedText + '\n\n[CONTENT TRUNCATED]'
		: text.slice(0, MAX_CHARS) + '\n\n[CONTENT TRUNCATED]';
}

function extractJson(text) {
	if (!text) throw new Error('Empty LLM response');
	const jsonPatterns = [
		/```json\s*([\s\S]*?)\s*```/,
		/```\s*([\s\S]*?)\s*```/,
		/\{[\s\S]*\}/,
		/\[[\s\S]*\]/,
	];
	for (const pattern of jsonPatterns) {
		const match = text.match(pattern);
		if (match) {
			try {
				const jsonStr = match[1] || match[0];
				const parsed = JSON.parse(jsonStr);
				if (Array.isArray(parsed)) return { questions: parsed };
				if (parsed.questions && Array.isArray(parsed.questions)) return parsed;
				for (const key in parsed)
					if (Array.isArray(parsed[key])) return { questions: parsed[key] };
			} catch {
				continue;
			}
		}
	}
	try {
		const parsed = JSON.parse(text);
		if (Array.isArray(parsed)) return { questions: parsed };
		if (parsed.questions && Array.isArray(parsed.questions)) return parsed;
	} catch {
		throw new Error('No valid JSON found in LLM response');
	}
	throw new Error('No valid JSON found in LLM response');
}

async function withRetry(fn, maxRetries = MAX_RETRIES, delay = RETRY_DELAY_MS) {
	let lastError;
	for (let i = 0; i < maxRetries; i++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;
			if (
				error.message.includes('Empty LLM response') ||
				error.message.includes('Unsupported file type') ||
				error.message.includes('image-based')
			)
				throw error;
			if (i < maxRetries - 1)
				await new Promise((res) => setTimeout(res, delay * Math.pow(2, i)));
		}
	}
	throw lastError;
}

async function extractTextFromImagePDF(arrayBuffer) {
	try {
		const formData = new FormData();
		const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
		formData.append('file', blob);
		formData.append('language', 'eng');
		const response = await fetch('https://api.ocr.space/parse/image', {
			method: 'POST',
			headers: { apikey: 'helloworld' },
			body: formData,
		});
		const data = await response.json();
		if (data.IsErroredOnProcessing)
			throw new Error('OCR processing failed: ' + data.ErrorMessage);
		let text = '';
		if (data.ParsedResults?.length > 0)
			text = data.ParsedResults.map((r) => r.ParsedText).join('\n\n');
		return text.trim();
	} catch (error) {
		console.error('OCR extraction failed:', error);
		throw new Error(
			'This PDF appears to be image-based. Please use a text-based PDF or convert images to text first.'
		);
	}
}

// ======================================================
// Main LLMService Class
// ======================================================
export class LLMService {
	constructor(apiKey, baseUrl) {
		if (!apiKey) throw new Error('API key is required');
		this.apiKey = apiKey;
		this.baseUrl = baseUrl;
		this.language = 'en';
	}

	// ===================== FIREBASE METHODS =====================
	async saveQuizResults(quizData) {
		try {
			const auth = getAuth();
			const user = auth.currentUser;

			if (!user) {
				console.error('No user authenticated');
				return;
			}

			// Add metadata to quiz data
			const quizWithMetadata = {
				...quizData,
				userId: user.uid,
				completedAt: new Date(),
			};

			// Add to quizzes collection
			const quizRef = doc(collection(db, 'quizzes'));
			await setDoc(quizRef, quizWithMetadata);

			// Update user stats
			await this.updateUserStats(user.uid, quizData);

			console.log('Quiz results saved successfully');
		} catch (error) {
			console.error('Error saving quiz results:', error);
		}
	}
	async updateUserStats(userId, quizData) {
		try {
			const userRef = doc(db, 'users', userId);
			const userSnap = await getDoc(userRef);

			if (!userSnap.exists()) {
				// Create new user stats document
				await setDoc(userRef, {
					quizzesTaken: 1,
					totalScore: quizData.score,
					totalTime: quizData.timeTaken,
					avgScore: quizData.score,
					streak: quizData.score >= 70 ? 1 : 0,
					bestScore: quizData.score,
					lastActive: new Date(),
					topicsStudied: quizData.topic ? [quizData.topic] : [],
					completionRate: 100, // Since they completed 1 out of 1 quiz
				});
			} else {
				// Update existing user stats
				const currentData = userSnap.data();
				const newQuizzesTaken = (currentData.quizzesTaken || 0) + 1;
				const newTotalScore = (currentData.totalScore || 0) + quizData.score;
				const newTotalTime = (currentData.totalTime || 0) + quizData.timeTaken;
				const newAvgScore = newTotalScore / newQuizzesTaken;

				// Update streak
				let newStreak = currentData.streak || 0;
				if (quizData.score >= 70) {
					newStreak += 1;
				} else {
					newStreak = 0;
				}

				// Update best score
				const newBestScore = Math.max(
					currentData.bestScore || 0,
					quizData.score
				);

				// Update topics studied
				const topicsStudied = new Set(currentData.topicsStudied || []);
				if (quizData.topic) {
					topicsStudied.add(quizData.topic);
				}

				await updateDoc(userRef, {
					quizzesTaken: newQuizzesTaken,
					totalScore: newTotalScore,
					totalTime: newTotalTime,
					avgScore: newAvgScore,
					streak: newStreak,
					bestScore: newBestScore,
					lastActive: new Date(),
					topicsStudied: Array.from(topicsStudied),
					completionRate: 100, // Simplified for now
				});
			}
		} catch (error) {
			console.error('Error updating user stats:', error);
		}
	}

	async getDashboardData() {
		try {
			const auth = getAuth();
			const user = auth.currentUser;
			if (!user) throw new Error('No authenticated user');
			const userRef = doc(db, 'users', user.uid);
			const userSnap = await getDoc(userRef);
			if (!userSnap.exists()) {
				return {
					quizzesTaken: 0,
					avgScore: 0,
					totalTime: 0,
					streak: 0,
					recentQuizzes: [],
				};
			}
			return userSnap.data();
		} catch (error) {
			console.error('❌ Failed to fetch dashboard data:', error);
			return null;
		}
	}
	// Add this method to your LLMService class
	async saveChatMessage(message, isUserMessage = true) {
		try {
			const auth = getAuth();
			const user = auth.currentUser;

			if (!user) {
				console.error('No user authenticated');
				return;
			}

			// Get user's chat collection reference
			const userChatsRef = collection(db, 'users', user.uid, 'chats');

			// Add the new message
			await addDoc(userChatsRef, {
				message: message,
				isUserMessage: isUserMessage,
				timestamp: new Date(),
			});

			// Get total chat count
			const chatCount = await this.getChatCount(user.uid);

			// If more than 100 messages, delete the oldest ones
			if (chatCount > 100) {
				await this.trimChatHistory(user.uid, chatCount - 100);
			}

			console.log('Chat message saved successfully');
		} catch (error) {
			console.error('Error saving chat message:', error);
		}
	}

	async getChatCount(userId) {
		try {
			const userChatsRef = collection(db, 'users', userId, 'chats');
			const snapshot = await getCountFromServer(userChatsRef);
			return snapshot.data().count;
		} catch (error) {
			console.error('Error getting chat count:', error);
			return 0;
		}
	}

	async trimChatHistory(userId, countToDelete) {
		try {
			const userChatsRef = collection(db, 'users', userId, 'chats');
			const q = query(
				userChatsRef,
				orderBy('timestamp', 'asc'),
				limit(countToDelete)
			);
			const snapshot = await getDocs(q);

			const deletePromises = [];
			snapshot.forEach((doc) => {
				deletePromises.push(deleteDoc(doc.ref));
			});

			await Promise.all(deletePromises);
			console.log(`Trimmed ${countToDelete} old chat messages`);
		} catch (error) {
			console.error('Error trimming chat history:', error);
		}
	}
	// ===================== END FIREBASE METHODS =====================

	async readFileContent(file) {
		return withRetry(async () => {
			try {
				if (
					file.type.includes('text') ||
					file.name.endsWith('.txt') ||
					file.name.endsWith('.html')
				) {
					return await file.text();
				}
				if (
					file.type ===
						'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
					file.name.endsWith('.docx')
				) {
					const arrayBuffer = await file.arrayBuffer();
					const mammoth = await import('mammoth/mammoth.browser.js');
					const { value } = await mammoth.extractRawText({ arrayBuffer });
					return value;
				}
				if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
					const arrayBuffer = await file.arrayBuffer();
					try {
						const pdf = await pdfjsLib.getDocument({ data: arrayBuffer })
							.promise;
						let text = '',
							hasText = false;
						for (let i = 1; i <= pdf.numPages; i++) {
							const page = await pdf.getPage(i);
							const content = await page.getTextContent();
							if (content.items.length > 0) {
								hasText = true;
								text += content.items.map((it) => it.str).join(' ') + '\n';
							}
							if (text.length > MAX_CHARS * 1.5) break;
						}
						if (hasText && text.trim().length > 0) return text.trim();
						console.log('No text found in PDF, attempting OCR...');
						return await extractTextFromImagePDF(arrayBuffer);
					} catch (error) {
						console.error('PDF processing failed, attempting OCR:', error);
						return await extractTextFromImagePDF(arrayBuffer);
					}
				}
				throw new Error('Unsupported file type. Use TXT, HTML, DOCX, or PDF.');
			} catch (error) {
				console.error('File reading error:', error);
				throw new Error(`File reading failed: ${error.message}`);
			}
		});
	}

	shuffleArray(array) {
		const newArray = [...array];
		for (let i = newArray.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
		}
		return newArray;
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

	validateQuestions(questions) {
		return questions.map((q, index) => {
			if (!q.question || q.question.length < 10)
				throw new Error(`Question ${index + 1} is too short.`);
			const uniqueOptions = [...new Set(q.options.map((opt) => opt.trim()))];
			if (uniqueOptions.length !== 4)
				throw new Error(`Question ${index + 1} has duplicate options.`);
			if (q.correctAnswer < 0 || q.correctAnswer > 3)
				throw new Error(
					`Question ${index + 1} has invalid correctAnswer index.`
				);
			if (!q.options[q.correctAnswer])
				throw new Error(
					`Question ${index + 1} has correctAnswer index mismatch.`
				);
			return q;
		});
	}
}