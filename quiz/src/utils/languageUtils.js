// Enhanced + Balanced languageUtils.js

// -------------------
// Language Detection
// -------------------
export function detectLanguage(text) {
    if (!text || text.length < 10) return 'en';

    const scriptPatterns = {
        ar: {
            pattern: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g,
            keywords: ['في', 'من', 'إلى', 'على', 'هذا', 'التي', 'اور', 'کے', 'میں', 'کی', 'سے']
        },
        hi: {
            pattern: /[\u0900-\u097F]/g,
            keywords: ['है', 'में', 'का', 'के', 'की', 'से', 'को', 'और', 'यह', 'वह']
        },
        bn: { pattern: /[\u0980-\u09FF]/g, keywords: ['এর', 'একটি', 'করে'] },
        pa: { pattern: /[\u0A00-\u0A7F]/g, keywords: ['ਦੇ', 'ਵਿੱਚ', 'ਨੂੰ'] },
        gu: { pattern: /[\u0A80-\u0AFF]/g, keywords: ['છે', 'માં', 'ના'] },
        ta: { pattern: /[\u0B80-\u0BFF]/g, keywords: ['இல்', 'ஒரு', 'அந்த'] },
        te: { pattern: /[\u0C00-\u0C7F]/g, keywords: ['లో', 'ఒక', 'అని'] },
        kn: { pattern: /[\u0C80-\u0CFF]/g, keywords: ['ಇದು', 'ಒಂದು', 'ಅದು'] },
        ml: { pattern: /[\u0D00-\u0D7F]/g, keywords: ['ഒരു', 'അത്', 'ഇത്'] },
        th: { pattern: /[\u0E00-\u0E7F]/g, keywords: ['ที่', 'ใน', 'ของ'] },
        zh: { pattern: /[\u4E00-\u9FFF\u3400-\u4DBF]/g, keywords: ['的', '了', '在'] },
        ja: { pattern: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, keywords: ['です', 'ます', 'この'] },
        ko: { pattern: /[\uAC00-\uD7AF\u1100-\u11FF]/g, keywords: ['이', '그', '의'] },
        ru: { pattern: /[\u0400-\u04FF]/g, keywords: ['и', 'в', 'не'] },
        es: { pattern: /[áéíóúñü¿¡]/g, keywords: ['que', 'de', 'el', 'la'] },
        fr: { pattern: /[àâçéèêëîïôûùüÿ]/g, keywords: ['le', 'de', 'et'] },
        de: { pattern: /[äöüß]/g, keywords: ['der', 'die', 'und'] },
        it: { pattern: /[àèéìíîòóùú]/g, keywords: ['che', 'di', 'il'] },
        pt: { pattern: /[áàâãçéêíóôõú]/g, keywords: ['que', 'de', 'o', 'a'] }
    };

    const scores = {};
    const textLower = text.toLowerCase();

    for (const [lang, config] of Object.entries(scriptPatterns)) {
        const scriptScore = (text.match(config.pattern) || []).length;
        let keywordScore = 0;
        for (const keyword of config.keywords) {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            keywordScore += (textLower.match(regex) || []).length * 2;
        }
        scores[lang] = (scriptScore + keywordScore) / text.length;
    }

    let dominantLang = 'en';
    let maxScore = 0;
    for (const [lang, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            dominantLang = lang;
        }
    }

    const threshold = ['ar','hi','bn','pa','gu','ta','te','kn','ml','th','zh','ja','ko','ru'].includes(dominantLang) ? 0.05 : 0.1;

    // ✅ fallback to English if weak signal
    return maxScore > threshold ? dominantLang : 'en';
}

// -------------------
// Context Analyzer
// -------------------
export function analyzeContext(content) {
    if (!content || content.length < 10) {
        return { type: 'none', description: 'No content provided', hasVisualElements: false, suggestedInstructions: 'Ask user to provide content first' };
    }

    const patterns = {
        chart: /\b(chart|graph|bar|pie|line|axis|plot)\b/gi,
        table: /\b(table|row|column|cell)\b/gi,
        image: /\b(image|figure|diagram|illustration)\b/gi,
        dialogue: /\b(dialogue|conversation|speaker)\b/gi,
        story: /\b(story|character|plot|theme)\b/gi,
        research: /\b(study|research|analysis|conclusion)\b/gi,
    };

    let primaryType = 'text', maxMatches = 0, structure = [];
    for (const [type, pattern] of Object.entries(patterns)) {
        const count = (content.match(pattern) || []).length;
        if (count > 0) structure.push({ type, count });
        if (count > maxMatches) { maxMatches = count; primaryType = type; }
    }

    return {
        type: ['chart','table','image'].includes(primaryType) ? 'visual' : primaryType,
        description: `Detected ${primaryType} content`,
        hasVisualElements: ['chart','table','image'].includes(primaryType),
        suggestedInstructions: primaryType === 'dialogue'
            ? 'Reference speakers directly'
            : primaryType === 'story'
            ? 'Reference characters/events directly'
            : primaryType === 'research'
            ? 'Reference specific findings directly'
            : 'Embed necessary context directly',
        structure,
        wordCount: content.split(/\s+/).length
    };
}

// -------------------
// Prompt Generator
// -------------------
export function generateSmartPrompt(language, numQuestions, difficulty, contextAnalysis) {
    const BASE_RULES = [
        "Each question MUST be self-contained",
        "NEVER reference 'the passage', 'the text', or similar",
        "Include ALL necessary context in the question itself",
        "Focus on content, not document structure"
    ];

    const LANGUAGE_PROMPTS = {
        en: { instruction: `Create {numQuestions} {difficulty} multiple choice questions from the content.` },
        ur: { instruction: `فراہم کردہ مواد سے {numQuestions} {difficulty} کثیر انتخابی سوالات بنائیں۔` },
        ar: { instruction: `أنشئ {numQuestions} أسئلة اختيار من متعدد {difficulty} من المحتوى المقدم.` },
        hi: { instruction: `प्रदान की गई सामग्री से {numQuestions} {difficulty} बहुविकल्पीय प्रश्न बनाएं।` }
    };

    const template = LANGUAGE_PROMPTS[language] || LANGUAGE_PROMPTS.en;
    let prompt = template.instruction
        .replace(/{numQuestions}/g, numQuestions)
        .replace(/{difficulty}/g, difficulty);

    prompt += `\n\nContext: ${contextAnalysis.description}. ${contextAnalysis.suggestedInstructions}\n`;

    prompt += "\nCRITICAL RULES:\n";
    BASE_RULES.forEach((r, i) => { prompt += `${i+1}. ${r}\n`; });

    prompt += `\nFormat each question as JSON:\n- "question": self-contained question\n- "options": 4 unique plausible answers\n- "correctAnswer": index of correct option (0-3)\n- "explanation": brief explanation\n- "context": direct supporting quote or fact (max 150 chars)`;

    return prompt;
}

// -------------------
// Quality Validator
// -------------------
export function validateQuestionQuality(questions) {
    const issues = [];
    questions.forEach((q, i) => {
        const badRefs = /\b(the passage|the text|according to (it|this)|as mentioned|in the above)\b/gi;
        if (badRefs.test(q.question)) {
            issues.push({ questionIndex: i, type: 'bad_reference', issue: q.question });
        }
        if (q.question.length < 50) {
            issues.push({ questionIndex: i, type: 'short_question', issue: q.question });
        }
    });
    return { isValid: issues.length === 0, issues, score: Math.max(0, 100 - issues.length * 20) };
}

// -------------------
// Legacy Wrapper (to prevent breaking llmService.js)
// -------------------
export function getLanguagePrompt(language, numQuestions, difficulty, contextAnalysis) {
    return generateSmartPrompt(language, numQuestions, difficulty, contextAnalysis);
}
