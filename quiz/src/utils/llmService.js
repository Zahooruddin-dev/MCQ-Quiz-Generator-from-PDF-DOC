export class LLMService {
	constructor(apiKey, baseUrl) {
		this.apiKey = apiKey;
		this.baseUrl = baseUrl;
	}

	async generateQuizQuestions(text, options = {}) {
		const { numQuestions = 10, difficulty = 'medium' } = options;

		const prompt = `Generate ${numQuestions} self-contained multiple choice questions based on the following text. 
Each question must:
- Be completely understandable without referring to external context
- Include relevant context from the source text within the question itself
- Avoid phrases like "according to the text" or "in the passage"
- Be direct and specific

Format your response as a JSON array where each question has:
- question: the complete, self-contained question text
- options: array of 4 possible answers
- correctAnswer: index (0-3) of the correct answer
- explanation: brief explanation of why the answer is correct

Example format:
{
  "question": "What was the temperature at which water boils at sea level, as explained by scientist John Smith in his 1920 research?",
  // Instead of: "According to the text, what is the boiling point of water?"
  "options": ["100°C", "90°C", "110°C", "95°C"],
  "correctAnswer": 0,
  "explanation": "Smith's research definitively showed that water boils at 100°C at sea level"
}

Difficulty: ${difficulty}
Text: ${text}

Return only valid JSON, no other text.`;

		try {
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

			// Parse and validate questions
			const questions = JSON.parse(
				generatedText.replace(/```json\n?|\n?```/g, '')
			);

			// Validate each question
			const validatedQuestions = questions.map((q) =>
				this.validateAndFixQuestion(q)
			);

			return validatedQuestions;
		} catch (error) {
			console.error('Error generating questions with LLM:', error);
			throw new Error('Failed to generate questions. Please try again.');
		}
	}

	validateAndFixQuestion(question) {
		// Remove reference phrases
		const referencePhrasesToRemove = [
			'according to the text',
			'in the passage',
			'in this text',
			'the text states',
			'as mentioned',
			'as described',
		];

		let cleanedQuestion = question.question;
		referencePhrasesToRemove.forEach((phrase) => {
			const regex = new RegExp(phrase, 'gi');
			cleanedQuestion = cleanedQuestion.replace(regex, '');
		});

		// Ensure question doesn't start with common reference phrases
		cleanedQuestion = cleanedQuestion.trim();
		if (
			/^(what|which|who|where|when|how|why)/i.test(cleanedQuestion) === false
		) {
			cleanedQuestion = `What is ${cleanedQuestion}`;
		}

		// Validate options
		if (!Array.isArray(question.options) || question.options.length !== 4) {
			throw new Error('Invalid options format');
		}

		// Validate correct answer
		const correctAnswer = parseInt(question.correctAnswer);
		if (isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer > 3) {
			throw new Error('Invalid correct answer index');
		}

		return {
			...question,
			question: cleanedQuestion,
		};
	}
}
