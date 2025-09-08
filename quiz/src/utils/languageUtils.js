// languageUtils.js
export function detectLanguage(text) {
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

export function getLanguagePrompt(lang, numQuestions, difficulty) {
	const prompt = LANGUAGE_PROMPTS[lang] || LANGUAGE_PROMPTS.en;
	return prompt.instruction
		.replace(/{numQuestions}/g, numQuestions)
		.replace(/{difficulty}/g, difficulty);
}