// Enhanced languageUtils.js
export function detectLanguage(text) {
    if (!text || text.length < 10) return 'en';
    
    // Enhanced script patterns with better Unicode coverage
    const scriptPatterns = {
        // Arabic script (covers Arabic, Urdu, Persian, etc.)
        ar: {
            pattern: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g,
            keywords: ['في', 'من', 'إلى', 'على', 'هذا', 'التي', 'اور', 'کے', 'میں', 'کی', 'سے']
        },
        // Devanagari (Hindi, Marathi, Nepali)
        hi: {
            pattern: /[\u0900-\u097F]/g,
            keywords: ['है', 'में', 'का', 'के', 'की', 'से', 'को', 'और', 'यह', 'वह']
        },
        // Bengali
        bn: {
            pattern: /[\u0980-\u09FF]/g,
            keywords: ['এর', 'একটি', 'করে', 'হয়', 'থেকে', 'সে', 'তার', 'আর']
        },
        // Gurmukhi (Punjabi)
        pa: {
            pattern: /[\u0A00-\u0A7F]/g,
            keywords: ['ਦੇ', 'ਵਿੱਚ', 'ਨੂੰ', 'ਦਾ', 'ਹੈ', 'ਤੇ', 'ਕਰ']
        },
        // Gujarati
        gu: {
            pattern: /[\u0A80-\u0AFF]/g,
            keywords: ['છે', 'માં', 'ના', 'ને', 'તે', 'અને', 'કર']
        },
        // Tamil
        ta: {
            pattern: /[\u0B80-\u0BFF]/g,
            keywords: ['இல்', 'ஒரு', 'அந்த', 'இந்த', 'மற்றும்', 'என்று']
        },
        // Telugu
        te: {
            pattern: /[\u0C00-\u0C7F]/g,
            keywords: ['లో', 'ఒక', 'అని', 'ఆ', 'ఈ', 'మరియు']
        },
        // Kannada
        kn: {
            pattern: /[\u0C80-\u0CFF]/g,
            keywords: ['ಇದು', 'ಒಂದು', 'ಅದು', 'ಮತ್ತು', 'ಆ', 'ಈ']
        },
        // Malayalam
        ml: {
            pattern: /[\u0D00-\u0D7F]/g,
            keywords: ['ഒരു', 'അത്', 'ഇത്', 'ആ', 'ഈ', 'കൂടെ']
        },
        // Thai
        th: {
            pattern: /[\u0E00-\u0E7F]/g,
            keywords: ['ที่', 'ใน', 'ของ', 'เป็น', 'และ', 'มี']
        },
        // Chinese (Simplified & Traditional)
        zh: {
            pattern: /[\u4E00-\u9FFF\u3400-\u4DBF]/g,
            keywords: ['的', '了', '在', '是', '我', '有', '他', '这', '中', '一个']
        },
        // Japanese
        ja: {
            pattern: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g,
            keywords: ['です', 'である', 'ます', 'した', 'する', 'この', 'その', 'あの']
        },
        // Korean
        ko: {
            pattern: /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g,
            keywords: ['이', '그', '의', '를', '에', '는', '가', '하다', '있다', '되다']
        },
        // Cyrillic (Russian, Ukrainian, Bulgarian, etc.)
        ru: {
            pattern: /[\u0400-\u04FF]/g,
            keywords: ['и', 'в', 'не', 'на', 'я', 'быть', 'он', 'с', 'что', 'а']
        },
        // European languages with diacritics
        es: {
            pattern: /[áéíóúñüÁÉÍÓÚÑÜ¿¡]/g,
            keywords: ['que', 'de', 'el', 'la', 'en', 'y', 'es', 'se', 'no', 'te', 'lo', 'le']
        },
        fr: {
            pattern: /[àâçéèêëîïôûùüÿÀÂÇÉÈÊËÎÏÔÛÙÜŸ]/g,
            keywords: ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour']
        },
        de: {
            pattern: /[äöüßÄÖÜ]/g,
            keywords: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf']
        },
        it: {
            pattern: /[àèéìíîòóùúÀÈÉÌÍÎÒÓÙÚ]/g,
            keywords: ['che', 'di', 'il', 'la', 'in', 'e', 'a', 'per', 'un', 'essere', 'con', 'tutto']
        },
        pt: {
            pattern: /[áàâãçéêíóôõúÁÀÂÃÇÉÊÍÓÔÕÚ]/g,
            keywords: ['que', 'de', 'o', 'a', 'em', 'e', 'do', 'da', 'um', 'para', 'é', 'com']
        }
    };

    // Calculate script and keyword scores
    const scores = {};
    const textLower = text.toLowerCase();
    
    for (const [lang, config] of Object.entries(scriptPatterns)) {
        let score = 0;
        
        // Script pattern matching
        const matches = text.match(config.pattern);
        const scriptScore = matches ? matches.length : 0;
        
        // Keyword matching
        let keywordScore = 0;
        for (const keyword of config.keywords) {
            const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
            const keywordMatches = textLower.match(regex);
            if (keywordMatches) {
                keywordScore += keywordMatches.length * 2; // Keywords weighted higher
            }
        }
        
        // Combined score with normalization
        score = (scriptScore + keywordScore) / text.length;
        scores[lang] = score;
    }

    // Find dominant language
    let dominantLang = 'en';
    let maxScore = 0;
    
    for (const [lang, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            dominantLang = lang;
        }
    }

    // Threshold for non-Latin scripts (more lenient)
    const threshold = ['ar', 'hi', 'bn', 'pa', 'gu', 'ta', 'te', 'kn', 'ml', 'th', 'zh', 'ja', 'ko', 'ru'].includes(dominantLang) ? 0.05 : 0.1;
    
    return maxScore > threshold ? dominantLang : 'en';
}

// Smart context analyzer
export function analyzeContext(content) {
    if (!content || content.length < 10) {
        return {
            type: 'none',
            description: 'No content provided',
            hasVisualElements: false,
            suggestedInstructions: 'Ask user to provide content first'
        };
    }
    
    const contentLower = content.toLowerCase();
    const contextAnalysis = {
        type: 'text',
        description: '',
        hasVisualElements: false,
        suggestedInstructions: '',
        wordCount: content.split(/\s+/).length,
        structure: []
    };
    
    // Detect various content types
    const patterns = {
        // Visual content indicators
        chart: /\b(chart|graph|bar|pie|line|axis|data|plot|visualization)\b/gi,
        table: /\b(table|row|column|cell|header)\b/gi,
        image: /\b(image|picture|photo|figure|diagram|illustration)\b/gi,
        
        // Document structure
        passage: /\b(passage|text|article|paragraph|section)\b/gi,
        dialogue: /\b(dialogue|conversation|speaker|says|asked|replied)\b/gi,
        list: /\b(list|items|bullet|numbered|points)\b/gi,
        
        // Academic content
        research: /\b(study|research|analysis|findings|conclusion|hypothesis)\b/gi,
        mathematical: /\b(equation|formula|theorem|proof|calculate|solve)\b/gi,
        
        // Literary content
        story: /\b(story|narrative|character|plot|setting|theme)\b/gi,
        poem: /\b(poem|verse|stanza|rhyme|meter|poetry)\b/gi
    };
    
    // Analyze content type
    let maxMatches = 0;
    let primaryType = 'text';
    
    for (const [type, pattern] of Object.entries(patterns)) {
        const matches = content.match(pattern);
        const matchCount = matches ? matches.length : 0;
        
        if (matchCount > maxMatches) {
            maxMatches = matchCount;
            primaryType = type;
        }
        
        if (matchCount > 0) {
            contextAnalysis.structure.push({ type, count: matchCount });
        }
    }
    
    // Determine if visual elements are likely present
    contextAnalysis.hasVisualElements = ['chart', 'table', 'image'].includes(primaryType);
    
    // Generate description and instructions
    switch (primaryType) {
        case 'chart':
        case 'table':
        case 'image':
            contextAnalysis.type = 'visual';
            contextAnalysis.description = `Content appears to contain ${primaryType} or visual elements`;
            contextAnalysis.suggestedInstructions = `Questions should reference the specific ${primaryType} data directly, not "the ${primaryType}"`;
            break;
            
        case 'dialogue':
            contextAnalysis.type = 'dialogue';
            contextAnalysis.description = 'Content appears to be a conversation or dialogue';
            contextAnalysis.suggestedInstructions = 'Questions should reference specific speakers or conversation details directly';
            break;
            
        case 'story':
            contextAnalysis.type = 'narrative';
            contextAnalysis.description = 'Content appears to be a story or narrative';
            contextAnalysis.suggestedInstructions = 'Questions should reference characters, events, or plot details directly';
            break;
            
        case 'research':
            contextAnalysis.type = 'academic';
            contextAnalysis.description = 'Content appears to be research or academic material';
            contextAnalysis.suggestedInstructions = 'Questions should reference specific findings, studies, or conclusions directly';
            break;
            
        default:
            contextAnalysis.type = 'text';
            contextAnalysis.description = `General text content (${contextAnalysis.wordCount} words)`;
            contextAnalysis.suggestedInstructions = 'Questions should include necessary context and avoid referencing "the text" or "the passage"';
    }
    
    return contextAnalysis;
}

// Intelligent prompt generator
export function generateSmartPrompt(language, numQuestions, difficulty, contextAnalysis) {
    // Base instruction template that works for all languages
    const baseTemplate = {
        rules: [
            "Each question MUST be completely self-contained",
            "NEVER reference 'the passage', 'the text', 'the article', or similar document references",
            "Include ALL necessary context within the question itself",
            "Frame questions based on the CONTENT, not the document structure",
            "Provide specific details rather than vague references"
        ],
        structure: {
            question: "self-contained question with embedded context",
            options: "4 unique, plausible options",
            correctAnswer: "index of the correct option (0-3)",
            explanation: "brief explanation of why the answer is correct",
            context: "direct quote or specific detail (max 150 characters)"
        }
    };
    
    // Language-specific templates
    const languageTemplates = {
        en: {
            instruction: `Create {numQuestions} {difficulty} multiple choice questions from the provided content.`,
            contextGuidance: getContextGuidance('en', contextAnalysis),
            rules: baseTemplate.rules,
            structure: baseTemplate.structure
        },
        ur: {
            instruction: `فراہم کردہ مواد سے {numQuestions} {difficulty} کثیر انتخابی سوالات بنائیں۔`,
            contextGuidance: getContextGuidance('ur', contextAnalysis),
            rules: [
                "ہر سوال مکمل طور پر خود کفیل ہونا چاہیے",
                "'متن'، 'حوالہ'، یا 'مضمون' کا حوالہ نہ دیں",
                "سوال میں تمام ضروری سیاق و سباق شامل کریں",
                "مواد کی بنیاد پر سوالات بنائیں، دستاویز کی ساخت پر نہیں"
            ],
            structure: {
                question: "مکمل سوال جس میں سیاق و سباق شامل ہو",
                options: "4 منفرد، قابل یقین اختیارات",
                correctAnswer: "صحیح آپشن کا انڈیکس (0-3)",
                explanation: "مختصر وضاحت",
                context: "براہ راست حوالہ یا تفصیل (زیادہ سے زیادہ 150 حروف)"
            }
        },
        ar: {
            instruction: `أنشئ {numQuestions} أسئلة اختيار من متعدد {difficulty} من المحتوى المقدم.`,
            contextGuidance: getContextGuidance('ar', contextAnalysis),
            rules: [
                "يجب أن يكون كل سؤال مكتفياً بذاته تماماً",
                "لا تشر إلى 'النص' أو 'المقطع' أو 'المقال'",
                "ضمّن جميع السياق اللازم داخل السؤال نفسه",
                "اجعل الأسئلة مبنية على المحتوى وليس على هيكل الوثيقة"
            ],
            structure: {
                question: "سؤال مكتفي بذاته مع السياق المدمج",
                options: "4 خيارات فريدة ومعقولة",
                correctAnswer: "فهرس الإجابة الصحيحة (0-3)",
                explanation: "شرح مختصر لسبب صحة الإجابة",
                context: "اقتباس مباشر أو تفصيل محدد (150 حرف كحد أقصى)"
            }
        },
        hi: {
            instruction: `प्रदान की गई सामग्री से {numQuestions} {difficulty} बहुविकल्पीय प्रश्न बनाएं।`,
            contextGuidance: getContextGuidance('hi', contextAnalysis),
            rules: [
                "प्रत्येक प्रश्न पूर्णतः स्वतंत्र होना चाहिए",
                "'पाठ'، 'लेख'، या 'अनुच्छेद' का संदर्भ न दें",
                "प्रश्न में सभी आवश्यक संदर्भ शामिल करें",
                "सामग्री के आधार पर प्रश्न बनाएं, दस्तावेज़ की संरचना पर नहीं"
            ],
            structure: baseTemplate.structure
        }
    };
    
    // Get appropriate template
    const template = languageTemplates[language] || languageTemplates.en;
    
    // Build final prompt
    let prompt = template.instruction
        .replace(/{numQuestions}/g, numQuestions)
        .replace(/{difficulty}/g, difficulty);
    
    prompt += '\n\n' + template.contextGuidance;
    
    prompt += '\n\nCRITICAL RULES:\n';
    template.rules.forEach((rule, index) => {
        prompt += `${index + 1}. ${rule}\n`;
    });
    
    prompt += '\nEach question must have:\n';
    for (const [key, description] of Object.entries(template.structure)) {
        prompt += `- "${key}": ${description}\n`;
    }
    
    return prompt;
}

// Context-specific guidance generator
function getContextGuidance(language, contextAnalysis) {
    const guidance = {
        en: {
            visual: `The content contains ${contextAnalysis.description}. Questions should reference specific data points, values, or visual elements directly (e.g., "According to the bar chart showing sales data..." instead of "What does the chart show...").`,
            dialogue: `The content is a conversation. Questions should reference specific speakers or statements directly (e.g., "When John mentioned the budget concerns..." instead of "What did the speaker say...").`,
            narrative: `The content is a story or narrative. Questions should reference characters, events, or settings by name (e.g., "When Sarah discovered the hidden door..." instead of "What did the protagonist find...").`,
            academic: `The content is academic/research material. Questions should reference specific studies, findings, or conclusions directly (e.g., "The 2023 study on climate change found that..." instead of "According to the research...").`,
            text: `Questions should embed necessary context directly within the question stem rather than assuming the reader has access to the source material.`
        },
        ur: {
            visual: `مواد میں ${contextAnalysis.description} شامل ہے۔ سوالات میں مخصوص ڈیٹا، اقدار، یا بصری عناصر کا براہ راست حوالہ دینا چاہیے۔`,
            dialogue: `یہ مواد ایک گفتگو ہے۔ سوالات میں مخصوص بولنے والوں یا بیانات کا براہ راست حوالہ دینا چاہیے۔`,
            narrative: `یہ مواد ایک کہانی یا بیانیہ ہے۔ سوالات میں کرداروں، واقعات، یا ماحول کا نام لے کر حوالہ دینا چاہیے۔`,
            academic: `یہ تعلیمی/تحقیقی مواد ہے۔ سوالات میں مخصوص مطالعات، نتائج، یا نتیجوں کا براہ راست حوالہ دینا چاہیے۔`,
            text: `سوالات میں ضروری سیاق و سباق براہ راست شامل کرنا چاہیے۔`
        },
        ar: {
            visual: `يحتوي المحتوى على ${contextAnalysis.description}. يجب أن تشير الأسئلة إلى نقاط بيانات أو قيم أو عناصر بصرية محددة مباشرة.`,
            dialogue: `المحتوى عبارة عن محادثة. يجب أن تشير الأسئلة إلى متحدثين أو تصريحات محددة مباشرة.`,
            narrative: `المحتوى قصة أو سرد. يجب أن تشير الأسئلة إلى الشخصيات أو الأحداث أو الأماكن بالاسم.`,
            academic: `المحتوى مادة أكاديمية/بحثية. يجب أن تشير الأسئلة إلى دراسات أو نتائج أو استنتاجات محددة مباشرة.`,
            text: `يجب أن تتضمن الأسئلة السياق الضروري مباشرة داخل صيغة السؤال.`
        }
    };
    
    const langGuidance = guidance[language] || guidance.en;
    return langGuidance[contextAnalysis.type] || langGuidance.text;
}

// BACKWARD COMPATIBILITY: Keep original function for existing code
export function getLanguagePrompt(lang, numQuestions, difficulty) {
    // Use the new smart system but maintain the same interface
    const mockContextAnalysis = {
        type: 'text',
        description: 'General text content',
        hasVisualElements: false,
        suggestedInstructions: 'Questions should include necessary context and avoid referencing "the text" or "the passage"'
    };
    
    return generateSmartPrompt(lang, numQuestions, difficulty, mockContextAnalysis);
}

// Enhanced utility function for question validation
export function validateQuestionQuality(questions, originalContent) {
    const issues = [];
    
    questions.forEach((q, index) => {
        // Check for problematic references
        const problematicPhrases = [
            /\bthe (passage|text|article|document|material|content|excerpt|paragraph|section)\b/gi,
            /\baccording to (it|this|above|the following)\b/gi,
            /\bas (mentioned|stated|shown|described|written) (above|earlier|in the text)\b/gi,
            /\bwhat does (the|this) (passage|text|article|document) (say|mention|describe|state)\b/gi,
            /\bin the (above|given|provided) (text|passage|content|material)\b/gi
        ];
        
        const questionText = q.question.toLowerCase();
        problematicPhrases.forEach(phrase => {
            if (phrase.test(questionText)) {
                issues.push({
                    questionIndex: index,
                    type: 'document_reference',
                    issue: `Question references document structure instead of content: "${q.question.substring(0, 100)}..."`
                });
            }
        });
        
        // Check if question is self-contained
        if (q.question.length < 50) {
            issues.push({
                questionIndex: index,
                type: 'insufficient_context',
                issue: `Question may lack sufficient context: "${q.question}"`
            });
        }
    });
    
    return {
        isValid: issues.length === 0,
        issues: issues,
        score: Math.max(0, 100 - (issues.length * 20)) // Quality score out of 100
    };
}