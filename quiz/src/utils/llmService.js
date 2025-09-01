export class LLMService {
	constructor(apiKey, baseUrl) {
		this.apiKey = apiKey;
		this.baseUrl = baseUrl;
	}

	// Simple file reader that works with text-based files
	async readFileContent(file) {
		try {
			// For text files, docx, html - use direct text extraction
			if (
				file.type.includes('text') ||
				file.type.includes('document') ||
				file.name.endsWith('.txt') ||
				file.name.endsWith('.html')
			) {
				return await file.text();
			}

			// For PDFs - guide users to copy-paste text
			if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
				throw new Error(`For PDF files:
1. Open the PDF in your browser or PDF reader
2. Copy (Ctrl+A, then Ctrl+C) all the text
3. Paste it directly in the text input box below
4. Click 'Generate Questions'`);
			}

			throw new Error(
				'Unsupported file type. Please use text-based files or copy-paste PDF content.'
			);
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
		const { numQuestions = 10, difficulty = 'medium' } = options;

		try {
			// Handle both file uploads and direct text input
			const text =
				typeof fileOrText === 'string'
					? fileOrText
					: await this.readFileContent(fileOrText);

			const prompt = `Create ${numQuestions} multiple choice questions. For each question:
- Make it self-contained and clear
- Include relevant context
- Use varied answer patterns (don't make all correct answers the same letter)
- Make distractors plausible but clearly incorrect
- Include specific details from the source

Format as JSON array:
{
  "questions": [
    {
      "question": "Clear, specific question text",
      "options": ["Correct Answer", "Plausible Wrong 1", "Plausible Wrong 2", "Plausible Wrong 3"],
      "correctAnswer": 0,
      "explanation": "Brief explanation why this is correct"
    }
  ]
}

Content: ${text}`;

			const response = await fetch(this.baseUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-goog-api-key': this.apiKey,
				},
				body: JSON.stringify({
					contents: [
						{
							parts: [{ text: prompt }],
						},
					],
				}),
			});

			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`);
			}

			const data = await response.json();
			const generatedText = data.candidates[0].content.parts[0].text;

			let questions = JSON.parse(
				generatedText.replace(/```json\n?|\n?```/g, '')
			).questions;

			// Randomize options for each question
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
			console.error('Quiz generation error:', error);
			throw new Error(
				'Failed to generate quiz. Please try again or check your input.'
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

			// Ensure options are unique
			const uniqueOptions = [...new Set(q.options)];
			if (uniqueOptions.length !== 4) {
				throw new Error('All options must be unique');
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
