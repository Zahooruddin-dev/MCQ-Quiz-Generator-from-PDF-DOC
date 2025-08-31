
export class LLMService {
  constructor(apiKey, baseUrl) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async generateQuizQuestions(text, options = {}) {
    const {
      numQuestions = 10,
      difficulty = 'medium',
      questionTypes = ['multiple-choice']
    } = options;

    const prompt = `
Based on the following text, generate ${numQuestions} multiple choice questions with 4 options each. 
Format your response as a JSON array where each question has:
- question: the question text
- options: array of 4 possible answers  
- correctAnswer: index (0-3) of the correct answer
- explanation: brief explanation of why the answer is correct

Difficulty: ${difficulty}
Text: ${text}

Return only valid JSON, no other text.
`;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': this.apiKey // Use your API key here
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Parse the JSON response
      const questions = JSON.parse(generatedText.replace(/```json\n?|\n?```/g, ''));
      return questions;

    } catch (error) {
      console.error('Error generating questions with LLM:', error);
      throw new Error('Failed to generate questions. Please try again.');
    }
  }
}