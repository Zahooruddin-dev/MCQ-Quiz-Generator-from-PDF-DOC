// promptBuilder.js

/**
 * Service for building prompts for different difficulty levels and quality settings.
 */
export class PromptBuilder {
  /**
   * Builds a prompt based on difficulty level and quality requirements.
   * @param {string} text The source text content.
   * @param {string[]} keyFacts Array of key facts extracted from the text.
   * @param {number} numQuestions Number of questions to generate.
   * @param {string} difficulty The difficulty level ('high', 'medium', 'easy').
   * @param {string} language The language for the prompt.
   * @returns {string} The constructed prompt.
   */
  static buildPrompt(text, keyFacts, numQuestions, difficulty, language) {
    const contextGuidance = keyFacts && keyFacts.length
      ? `\nKey facts to focus on:\n${keyFacts.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n`
      : '';

    const difficultyPrompts = {
      high: this._buildHighQualityPrompt(text, keyFacts, numQuestions, language),
      medium: this._buildMediumQualityPrompt(text, keyFacts, numQuestions, language),
      easy: this._buildEasyQualityPrompt(text, keyFacts, numQuestions, language)
    };

    return difficultyPrompts[difficulty] || difficultyPrompts.medium;
  }

  static _buildHighQualityPrompt(text, keyFacts, numQuestions, language) {
    const contextGuidance = keyFacts && keyFacts.length
      ? `\nCritical facts to incorporate:\n${keyFacts.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n`
      : '';

    return `You are an expert educational assessment designer. Create EXACTLY ${numQuestions} HIGH-QUALITY multiple-choice questions that demonstrate deep understanding and critical thinking.

QUALITY STANDARDS FOR HIGH-LEVEL MCQs:
- Questions should test APPLICATION, ANALYSIS, SYNTHESIS, and EVALUATION (Bloom's higher-order thinking)
- Avoid simple recall or definition questions
- Create scenarios that require connecting multiple concepts
- Use realistic, complex distractors that represent common misconceptions
- Each question should have ONE clearly correct answer and three plausible but incorrect options
- Questions should be challenging but fair, requiring genuine understanding of the content

QUESTION TYPES TO PRIORITIZE:
1. Application: "Given scenario X, what would be the best approach/outcome?"
2. Analysis: "What is the primary relationship between concepts A and B?"
3. Synthesis: "How do these elements work together to create...?"
4. Evaluation: "Which approach would be most effective and why?"
5. Compare/Contrast: "What is the key difference between X and Y?"

DISTRACTOR QUALITY:
- Each wrong option should be plausible to someone with partial understanding
- Include common misconceptions as distractors
- Avoid obviously wrong or nonsensical options
- Make distractors similar in length and complexity to the correct answer

CONTENT TO ANALYZE:
${text}
${contextGuidance}

MANDATORY OUTPUT FORMAT (JSON):
{
  "questions": [
    {
      "question": "Complex, thought-provoking question that requires deep understanding...",
      "options": ["Correct answer with specific details", "Plausible misconception A", "Plausible misconception B", "Plausible misconception C"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why this is correct and why others are wrong",
      "context": "Specific quote or reference from content (max 150 chars)"
    }
    // exactly ${numQuestions} objects
  ]
}

GENERATE EXACTLY ${numQuestions} HIGH-QUALITY QUESTIONS NOW.`;
  }

  static _buildMediumQualityPrompt(text, keyFacts, numQuestions, language) {
    const contextGuidance = keyFacts && keyFacts.length
      ? `\nKey facts:\n${keyFacts.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n`
      : '';

    return `Create EXACTLY ${numQuestions} MEDIUM-DIFFICULTY multiple-choice questions that balance comprehension and application.

MEDIUM QUALITY STANDARDS:
- Mix of comprehension, application, and some analysis questions
- Clear, direct questions that test understanding of key concepts
- Good distractors that are wrong but not obviously so
- Questions should be answerable by someone who studied the content carefully

QUESTION TYPES:
- Comprehension: "What does X mean in this context?"
- Application: "How would you apply concept X in situation Y?"
- Basic analysis: "What is the main cause/effect of X?"
- Factual application: "According to the content, which statement about X is true?"

CONTENT:
${text}
${contextGuidance}

OUTPUT JSON FORMAT:
{
  "questions": [
    {
      "question": "...",
      "options": ["...","...","...","..."],
      "correctAnswer": 0,
      "explanation": "...",
      "context": "..."
    }
  ]
}

GENERATE EXACTLY ${numQuestions} QUESTIONS.`;
  }

  static _buildEasyQualityPrompt(text, keyFacts, numQuestions, language) {
    const contextGuidance = keyFacts && keyFacts.length
      ? `\nKey facts:\n${keyFacts.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n`
      : '';

    return `Create EXACTLY ${numQuestions} EASY multiple-choice questions focusing on basic recall and simple comprehension.

EASY QUALITY STANDARDS:
- Direct recall of facts, definitions, and basic concepts
- Simple comprehension questions
- Straightforward distractors
- Questions answerable through basic reading of the content

QUESTION TYPES:
- Definition: "What is X?"
- Factual recall: "According to the content, what year/number/name...?"
- Simple identification: "Which of the following is mentioned as...?"
- Basic comprehension: "The content states that X is...?"

CONTENT:
${text}
${contextGuidance}

OUTPUT JSON FORMAT:
{
  "questions": [
    {
      "question": "...",
      "options": ["...","...","...","..."],
      "correctAnswer": 0,
      "explanation": "...",
      "context": "..."
    }
  ]
}

GENERATE EXACTLY ${numQuestions} QUESTIONS.`;
  }
}