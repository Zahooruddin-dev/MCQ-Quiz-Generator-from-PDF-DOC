// LLMService.js

// --- Imports for PDF handling ---
import * as pdfjsLib from "pdfjs-dist";

// Tell pdf.js where to find the worker (let Vite handle it)
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;


export class LLMService {
	constructor(apiKey, baseUrl) {
		this.apiKey = apiKey;
		this.baseUrl = baseUrl;
	}

	// Reads text content from common file formats
	async readFileContent(file) {
		try {
			// TXT / HTML
			if (
				file.type.includes("text") ||
				file.name.endsWith(".txt") ||
				file.name.endsWith(".html")
			) {
				return await file.text();
			}

			// DOCX (using mammoth)
			if (
				file.type ===
					"application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
				file.name.endsWith(".docx")
			) {
				const arrayBuffer = await file.arrayBuffer();
				const mammoth = await import("mammoth/mammoth.browser.js"); // browser build
				const { value } = await mammoth.extractRawText({ arrayBuffer });
				return value;
			}

			// PDF (using pdfjs-dist)
			if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
				const pdf = await pdfjsLib.getDocument({
					data: await file.arrayBuffer(),
				}).promise;

				let text = "";
				for (let i = 1; i <= pdf.numPages; i++) {
					const page = await pdf.getPage(i);
					const content = await page.getTextContent();
					text += content.items.map((item) => item.str).join(" ") + "\n";
				}
				return text.trim();
			}

			throw new Error("Unsupported file type. Use TXT, HTML, DOCX, or PDF.");
		} catch (error) {
			throw new Error(`File reading failed: ${error.message}`);
		}
	}

	shuffleArray(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	async generateQuizQuestions(fileOrText, options = {}) {
		const { numQuestions = 10, difficulty = "medium" } = options;

		try {
			// Support both direct text input and uploaded files
			const text =
				typeof fileOrText === "string"
					? fileOrText
					: await this.readFileContent(fileOrText);

			const prompt = `Create ${numQuestions} multiple choice questions from the following text.
Each question must have:
- 1 clear question
- 4 unique options
- "correctAnswer" as the index of the right option (0–3)
- "explanation" as a short reason
Return ONLY valid JSON. No extra text, no markdown fences.

Format:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": 0,
      "explanation": "string"
    }
  ]
}

Content:
${text}`;

			const response = await fetch(this.baseUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-goog-api-key": this.apiKey,
				},
				body: JSON.stringify({
					contents: [{ parts: [{ text: prompt }] }],
				}),
			});

			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`);
			}

			const data = await response.json();
			const rawText = data.candidates[0].content.parts[0].text;

			// --- Safe JSON extraction ---
			let jsonString = rawText.replace(/```json|```/g, "").trim();
			const match = jsonString.match(/\{[\s\S]*\}/);
			if (!match) throw new Error("No JSON found in LLM response");

			const parsed = JSON.parse(match[0]);
			let questions = parsed.questions;

			// Shuffle options for variety
			questions = questions.map((q) => {
				const options = [...q.options];
				const correctOption = options[q.correctAnswer];
				const shuffledOptions = this.shuffleArray([...options]);
				const newCorrectIndex = shuffledOptions.indexOf(correctOption);

				return {
					...q,
					options: shuffledOptions,
					correctAnswer: newCorrectIndex,
				};
			});

			return this.validateQuestions(questions);
		} catch (error) {
			console.error("Quiz generation error:", error);
			throw new Error(
				"Failed to generate quiz. Please try again or check your input."
			);
		}
	}

	validateQuestions(questions) {
		return questions.map((q) => {
			// Clean question text
			let questionText = q.question.trim();
			if (!/^[A-Z]/.test(questionText)) {
				questionText =
					questionText.charAt(0).toUpperCase() + questionText.slice(1);
			}

			// Ensure unique options
			const uniqueOptions = [...new Set(q.options)];
			if (uniqueOptions.length !== 4) {
				throw new Error("All options must be unique");
			}

			return {
				question: questionText,
				options: q.options,
				correctAnswer: q.correctAnswer,
				explanation: q.explanation,
			};
		});
	}
}
