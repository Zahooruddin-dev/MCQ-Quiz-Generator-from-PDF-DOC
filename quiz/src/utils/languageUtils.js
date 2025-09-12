// Enhanced + Professional languageUtils.js

// -------------------
// Language Detection (Improved)
// -------------------
export function detectLanguage(text) {
    if (!text || text.length < 10) return 'en';

    const scriptPatterns = {
        ar: {
            pattern: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g,
            keywords: ['في', 'من', 'إلى', 'على', 'هذا', 'التي', 'اور', 'کے', 'میں', 'کی', 'سے', 'کہ', 'ہے']
        },
        ur: {
            pattern: /[\u0600-\u06FF\u0750-\u077F]/g,
            keywords: ['کی', 'کے', 'میں', 'سے', 'کو', 'اور', 'یہ', 'وہ', 'ہے', 'کہ', 'پر', 'کا']
        },
        hi: {
            pattern: /[\u0900-\u097F]/g,
            keywords: ['है', 'में', 'का', 'के', 'की', 'से', 'को', 'और', 'यह', 'वह', 'पर', 'या']
        },
        bn: { pattern: /[\u0980-\u09FF]/g, keywords: ['এর', 'একটি', 'করে', 'হয়', 'যা', 'তার'] },
        pa: { pattern: /[\u0A00-\u0A7F]/g, keywords: ['ਦੇ', 'ਵਿੱਚ', 'ਨੂੰ', 'ਹੈ', 'ਅਤੇ'] },
        gu: { pattern: /[\u0A80-\u0AFF]/g, keywords: ['છે', 'માં', 'ના', 'એ', 'તે'] },
        ta: { pattern: /[\u0B80-\u0BFF]/g, keywords: ['இல்', 'ஒரு', 'அந்த', 'இது', 'என்று'] },
        te: { pattern: /[\u0C00-\u0C7F]/g, keywords: ['లో', 'ఒక', 'అని', 'ఆ', 'ఇది'] },
        kn: { pattern: /[\u0C80-\u0CFF]/g, keywords: ['ಇದು', 'ಒಂದು', 'ಅದು', 'ಆಗಿ'] },
        ml: { pattern: /[\u0D00-\u0D7F]/g, keywords: ['ഒരു', 'അത്', 'ഇത്', 'എന്ന'] },
        th: { pattern: /[\u0E00-\u0E7F]/g, keywords: ['ที่', 'ใน', 'ของ', 'เป็น', 'และ'] },
        zh: { pattern: /[\u4E00-\u9FFF\u3400-\u4DBF]/g, keywords: ['的', '了', '在', '是', '有', '和'] },
        ja: { pattern: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, keywords: ['です', 'ます', 'この', 'その', 'である'] },
        ko: { pattern: /[\uAC00-\uD7AF\u1100-\u11FF]/g, keywords: ['이', '그', '의', '를', '에'] },
        ru: { pattern: /[\u0400-\u04FF]/g, keywords: ['и', 'в', 'не', 'на', 'что', 'с'] },
        es: { pattern: /[áéíóúñü¿¡]/g, keywords: ['que', 'de', 'el', 'la', 'en', 'y', 'es'] },
        fr: { pattern: /[àâçéèêëîïôûùüÿ]/g, keywords: ['le', 'de', 'et', 'à', 'un', 'est'] },
        de: { pattern: /[äöüß]/g, keywords: ['der', 'die', 'und', 'in', 'den', 'zu'] },
        it: { pattern: /[àèéìíîòóùú]/g, keywords: ['che', 'di', 'il', 'la', 'in', 'e'] },
        pt: { pattern: /[áàâãçéêíóôõú]/g, keywords: ['que', 'de', 'o', 'a', 'em', 'e', 'do'] }
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

    const threshold = ['ar','ur','hi','bn','pa','gu','ta','te','kn','ml','th','zh','ja','ko','ru'].includes(dominantLang) ? 0.05 : 0.1;
    return maxScore > threshold ? dominantLang : 'en';
}

// -------------------
// Advanced Content Analysis
// -------------------
export function analyzeContext(content) {
    if (!content || content.length < 10) {
        return { 
            type: 'none', 
            description: 'No content provided', 
            hasVisualElements: false, 
            suggestedInstructions: 'Ask user to provide content first',
            complexity: 'low',
            topics: [],
            keyTerms: [],
            structure: 'unstructured'
        };
    }

    const patterns = {
        academic: {
            pattern: /\b(research|study|analysis|hypothesis|methodology|conclusion|findings|data|evidence|theory|concept|principle|framework|model|approach|investigation|experiment|survey|observation|correlation|significance|variables|results|implications|literature|review|abstract|introduction|discussion|bibliography|references)\b/gi,
            weight: 2
        },
        scientific: {
            pattern: /\b(formula|equation|chemical|biological|physics|mathematics|laboratory|experiment|hypothesis|control|variable|measurement|observation|analysis|DNA|RNA|molecule|atom|cell|organism|species|evolution|energy|force|mass|velocity|temperature|pressure|volume|reaction|synthesis|catalyst|enzyme|protein|gene|chromosome|mitosis|meiosis|photosynthesis|respiration|ecosystem|biodiversity)\b/gi,
            weight: 2
        },
        historical: {
            pattern: /\b(century|decade|year|period|era|epoch|ancient|medieval|modern|revolution|war|battle|empire|kingdom|dynasty|civilization|culture|society|politics|government|democracy|monarchy|republic|treaty|constitution|independence|colonial|migration|trade|economy|industrial|renaissance|enlightenment|reformation)\b/gi,
            weight: 2
        },
        technical: {
            pattern: /\b(system|process|method|procedure|algorithm|protocol|specification|standard|framework|architecture|design|implementation|configuration|installation|maintenance|optimization|performance|efficiency|reliability|security|network|database|software|hardware|interface|application|program|code|development|testing|deployment)\b/gi,
            weight: 2
        },
        mathematical: {
            pattern: /\b(equation|formula|theorem|proof|calculate|solve|derive|integrate|differentiate|function|variable|constant|coefficient|matrix|vector|graph|plot|coordinate|axis|slope|intercept|probability|statistics|mean|median|mode|standard|deviation|correlation|regression|hypothesis|test|distribution|sample|population)\b/gi,
            weight: 2
        },
        literary: {
            pattern: /\b(character|protagonist|antagonist|plot|theme|setting|narrative|story|novel|poem|poetry|metaphor|symbolism|imagery|allegory|irony|foreshadowing|flashback|climax|resolution|conflict|dialogue|monologue|soliloquy|genre|style|tone|mood|author|writer|literature|criticism|analysis|interpretation)\b/gi,
            weight: 2
        },
        business: {
            pattern: /\b(market|marketing|business|company|organization|management|strategy|planning|finance|budget|revenue|profit|loss|investment|shareholder|stakeholder|customer|client|product|service|brand|competition|analysis|SWOT|ROI|KPI|CEO|CFO|CTO|department|team|project|leadership|innovation|entrepreneurship)\b/gi,
            weight: 2
        }
    };

    const structurePatterns = {
        structured: /\b(chapter|section|subsection|paragraph|point|step|stage|phase|part|introduction|conclusion|summary|overview|outline|table of contents|bibliography|index|appendix|figure|table|diagram|chart|graph)\b/gi,
        dialogue: /\b(said|asked|replied|answered|exclaimed|whispered|shouted|dialogue|conversation|speaker|quote|quotation)\b/gi,
        narrative: /\b(story|tale|narrative|character|plot|setting|beginning|middle|end|once upon|first|then|next|finally|meanwhile|however|therefore|consequently|furthermore|moreover)\b/gi,
        instructional: /\b(step|instruction|direction|guide|how to|tutorial|manual|procedure|process|method|technique|approach|strategy|tip|advice|recommendation|example|illustration|demonstration|practice|exercise)\b/gi
    };

    let primaryType = 'general', maxMatches = 0;
    const topicScores = {};
    
    // Analyze content type
    for (const [type, config] of Object.entries(patterns)) {
        const matches = (content.match(config.pattern) || []).length;
        const score = matches * config.weight;
        topicScores[type] = score;
        if (score > maxMatches) {
            maxMatches = score;
            primaryType = type;
        }
    }

    // Analyze structure
    let structure = 'unstructured';
    let maxStructureScore = 0;
    for (const [structType, pattern] of Object.entries(structurePatterns)) {
        const score = (content.match(pattern) || []).length;
        if (score > maxStructureScore) {
            maxStructureScore = score;
            structure = structType;
        }
    }

    // Extract key terms (important nouns and concepts)
    const keyTerms = extractKeyTerms(content);
    
    // Determine complexity
    const wordCount = content.split(/\s+/).length;
    const avgWordsPerSentence = wordCount / (content.split(/[.!?]+/).length || 1);
    const complexWords = (content.match(/\b\w{10,}\b/g) || []).length;
    
    let complexity = 'medium';
    if (avgWordsPerSentence > 20 || complexWords / wordCount > 0.1) {
        complexity = 'high';
    } else if (avgWordsPerSentence < 12 && complexWords / wordCount < 0.05) {
        complexity = 'low';
    }

    // Get top topics
    const sortedTopics = Object.entries(topicScores)
        .filter(([_, score]) => score > 0)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([topic]) => topic);

    return {
        type: primaryType,
        description: `${primaryType.charAt(0).toUpperCase() + primaryType.slice(1)} content with ${structure} structure`,
        hasVisualElements: /\b(chart|graph|table|figure|diagram|image|illustration)\b/gi.test(content),
        complexity,
        structure,
        topics: sortedTopics,
        keyTerms: keyTerms.slice(0, 10), // Top 10 key terms
        wordCount,
        avgWordsPerSentence: Math.round(avgWordsPerSentence),
        suggestedInstructions: generateContextualInstructions(primaryType, structure, complexity)
    };
}

function extractKeyTerms(content) {
    // Remove common words and extract meaningful terms
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their']);
    
    const words = content.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !commonWords.has(word));
    
    const frequency = {};
    words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
        .filter(([_, freq]) => freq >= 2)
        .sort(([,a], [,b]) => b - a)
        .map(([word]) => word);
}

function generateContextualInstructions(type, structure, complexity) {
    const baseInstructions = [
        "Create questions that test deep understanding, not just recall",
        "Include specific details and examples from the content",
        "Make distractors plausible but clearly incorrect",
        "Focus on key concepts and their relationships"
    ];

    const typeSpecific = {
        academic: "Focus on research findings, methodologies, and theoretical frameworks",
        scientific: "Test understanding of processes, cause-effect relationships, and scientific principles",
        historical: "Emphasize chronology, cause-effect relationships, and historical significance",
        technical: "Test procedural knowledge and system understanding",
        mathematical: "Focus on problem-solving and conceptual understanding",
        literary: "Test analysis of themes, character development, and literary devices",
        business: "Emphasize strategic thinking and real-world applications"
    };

    const complexityAdjustments = {
        high: "Create analytical and synthesis-level questions",
        medium: "Balance factual recall with application questions",
        low: "Focus on comprehension and basic application"
    };

    return [
        ...baseInstructions,
        typeSpecific[type] || "Test core concepts and their practical applications",
        complexityAdjustments[complexity] || "Create appropriately challenging questions"
    ].join('. ') + '.';
}

// -------------------
// Professional Prompt Generator
// -------------------
export function generateSmartPrompt(language, numQuestions, difficulty, contextAnalysis) {
    const BLOOM_TAXONOMY = {
        easy: "Knowledge and Comprehension (recall facts, understand basic concepts)",
        medium: "Application and Analysis (apply concepts, analyze relationships)",
        hard: "Synthesis and Evaluation (create solutions, evaluate arguments, make judgments)"
    };

    const QUALITY_REQUIREMENTS = [
        "Each question MUST be completely self-contained with all necessary context",
        "NEVER reference 'the text', 'the passage', 'the document', or 'according to the above'",
        "Questions must test understanding, not just memory",
        "All options must be plausible to someone with partial knowledge",
        "Correct answers must be definitively correct based on the content",
        "Distractors should represent common misconceptions or partial understanding",
        "Use specific examples, names, dates, and details from the content"
    ];

    const LANGUAGE_PROMPTS = {
        en: {
            instruction: `You are an expert educator creating {numQuestions} high-quality multiple choice questions.`,
            difficulty_note: `Target Level: {difficulty} - {bloom_level}`,
            content_note: `Content Type: {content_description}`
        },
        ur: {
            instruction: `آپ ایک ماہر معلم ہیں جو {numQuestions} اعلیٰ معیار کے کثیر انتخابی سوالات بنا رہے ہیں۔`,
            difficulty_note: `ہدف کی سطح: {difficulty} - {bloom_level}`,
            content_note: `مواد کی قسم: {content_description}`
        },
        ar: {
            instruction: `أنت معلم خبير تقوم بإنشاء {numQuestions} أسئلة اختيار من متعدد عالية الجودة.`,
            difficulty_note: `المستوى المستهدف: {difficulty} - {bloom_level}`,
            content_note: `نوع المحتوى: {content_description}`
        },
        hi: {
            instruction: `आप एक विशेषज्ञ शिक्षक हैं जो {numQuestions} उच्च गुणवत्ता वाले बहुविकल्पीय प्रश्न बना रहे हैं।`,
            difficulty_note: `लक्षित स्तर: {difficulty} - {bloom_level}`,
            content_note: `सामग्री का प्रकार: {content_description}`
        }
    };

    const template = LANGUAGE_PROMPTS[language] || LANGUAGE_PROMPTS.en;
    const bloomLevel = BLOOM_TAXONOMY[difficulty] || BLOOM_TAXONOMY.medium;
    
    let prompt = template.instruction.replace(/{numQuestions}/g, numQuestions) + '\n\n';
    
    prompt += template.difficulty_note
        .replace(/{difficulty}/g, difficulty)
        .replace(/{bloom_level}/g, bloomLevel) + '\n\n';
    
    prompt += template.content_note
        .replace(/{content_description}/g, contextAnalysis.description) + '\n\n';

    // Add specific guidance based on content analysis
    if (contextAnalysis.topics.length > 0) {
        prompt += `Focus Areas: ${contextAnalysis.topics.join(', ')}\n`;
    }
    if (contextAnalysis.keyTerms.length > 0) {
        prompt += `Key Terms to Include: ${contextAnalysis.keyTerms.slice(0, 5).join(', ')}\n`;
    }
    
    prompt += `Content Complexity: ${contextAnalysis.complexity}\n`;
    prompt += `${contextAnalysis.suggestedInstructions}\n\n`;

    prompt += "CRITICAL QUALITY REQUIREMENTS:\n";
    QUALITY_REQUIREMENTS.forEach((req, i) => {
        prompt += `${i + 1}. ${req}\n`;
    });

    prompt += `\nQUESTION DESIGN PRINCIPLES:\n`;
    prompt += `- For FACTUAL questions: Test specific details, definitions, or direct statements\n`;
    prompt += `- For CONCEPTUAL questions: Test understanding of relationships, causes, effects\n`;
    prompt += `- For ANALYTICAL questions: Test ability to break down information and see patterns\n`;
    prompt += `- For APPLICATION questions: Test ability to use knowledge in new situations\n\n`;

    prompt += `DISTRACTOR DESIGN:\n`;
    prompt += `- Make incorrect options believable to someone with incomplete knowledge\n`;
    prompt += `- Use common student misconceptions as distractors\n`;
    prompt += `- Include partially correct information in distractors\n`;
    prompt += `- Ensure all distractors are clearly wrong when content is understood\n\n`;

    prompt += `REQUIRED JSON FORMAT:\n`;
    prompt += `{
  "questions": [
    {
      "question": "Complete, self-contained question with all necessary context",
      "options": ["Correct answer", "Plausible distractor 1", "Plausible distractor 2", "Plausible distractor 3"],
      "correctAnswer": 0,
      "explanation": "Clear explanation of why the correct answer is right and others are wrong",
      "context": "Direct quote or specific fact from the content (max 150 chars)",
      "cognitive_level": "${difficulty}",
      "question_type": "factual|conceptual|analytical|application"
    }
  ]
}\n\n`;

    return prompt;
}

// -------------------
// Enhanced Quality Validator
// -------------------
export function validateQuestionQuality(questions) {
    const issues = [];
    let totalScore = 0;

    questions.forEach((q, i) => {
        let questionScore = 100;
        
        // Check for bad references
        const badRefs = /\b(the passage|the text|the document|the article|according to (it|this|the above)|as mentioned (above|earlier)|in the (above|preceding|following)|from (this|the) (text|passage|document))\b/gi;
        if (badRefs.test(q.question)) {
            issues.push({ 
                questionIndex: i, 
                type: 'bad_reference', 
                severity: 'high',
                issue: 'Question references source document instead of being self-contained',
                suggestion: 'Rewrite question to include all necessary context directly'
            });
            questionScore -= 40;
        }

        // Check question length and completeness
        if (q.question.length < 60) {
            issues.push({ 
                questionIndex: i, 
                type: 'insufficient_detail', 
                severity: 'medium',
                issue: 'Question too brief, may lack necessary context',
                suggestion: 'Add more specific details and context to the question'
            });
            questionScore -= 20;
        }

        // Check for vague language
        const vaguePatterns = /\b(this|that|these|those|it|they|them|which one|what is it)\b/gi;
        if (vaguePatterns.test(q.question)) {
            issues.push({ 
                questionIndex: i, 
                type: 'vague_language', 
                severity: 'medium',
                issue: 'Question contains vague pronouns or references',
                suggestion: 'Replace vague terms with specific nouns and concepts'
            });
            questionScore -= 15;
        }

        // Check option quality
        if (!Array.isArray(q.options) || q.options.length !== 4) {
            issues.push({ 
                questionIndex: i, 
                type: 'invalid_options', 
                severity: 'high',
                issue: 'Question must have exactly 4 options',
                suggestion: 'Provide exactly 4 distinct, plausible options'
            });
            questionScore -= 50;
        } else {
            // Check for duplicate or very similar options
            const uniqueOptions = new Set(q.options.map(opt => opt.toLowerCase().trim()));
            if (uniqueOptions.size !== 4) {
                issues.push({ 
                    questionIndex: i, 
                    type: 'duplicate_options', 
                    severity: 'high',
                    issue: 'Options are duplicated or too similar',
                    suggestion: 'Make each option clearly distinct'
                });
                questionScore -= 30;
            }

            // Check option length variation (good distractors should be reasonably similar in length)
            const lengths = q.options.map(opt => opt.length);
            const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
            const hasOutlier = lengths.some(len => Math.abs(len - avgLength) > avgLength * 0.5);
            if (hasOutlier) {
                issues.push({ 
                    questionIndex: i, 
                    type: 'length_bias', 
                    severity: 'low',
                    issue: 'Option lengths vary dramatically (may reveal correct answer)',
                    suggestion: 'Balance option lengths to avoid obvious patterns'
                });
                questionScore -= 10;
            }
        }

        // Check explanation quality
        if (!q.explanation || q.explanation.length < 20) {
            issues.push({ 
                questionIndex: i, 
                type: 'poor_explanation', 
                severity: 'medium',
                issue: 'Explanation is missing or too brief',
                suggestion: 'Provide clear explanation of correct answer and why others are wrong'
            });
            questionScore -= 15;
        }

        // Check context quality
        if (!q.context || q.context === 'Context not available' || q.context.length < 10) {
            issues.push({ 
                questionIndex: i, 
                type: 'missing_context', 
                severity: 'low',
                issue: 'Context is missing or too brief',
                suggestion: 'Include specific supporting information from source'
            });
            questionScore -= 10;
        }

        totalScore += Math.max(0, questionScore);
    });

    const averageScore = questions.length > 0 ? totalScore / questions.length : 0;
    const highSeverityIssues = issues.filter(issue => issue.severity === 'high').length;
    
    return {
        isValid: highSeverityIssues === 0 && averageScore >= 70,
        score: Math.round(averageScore),
        issues,
        summary: {
            total: issues.length,
            high: issues.filter(i => i.severity === 'high').length,
            medium: issues.filter(i => i.severity === 'medium').length,
            low: issues.filter(i => i.severity === 'low').length
        },
        recommendations: generateQualityRecommendations(issues, averageScore)
    };
}

function generateQualityRecommendations(issues, averageScore) {
    const recommendations = [];
    
    if (averageScore < 50) {
        recommendations.push("Consider regenerating questions with more specific prompts");
    }
    
    const issueTypes = [...new Set(issues.map(i => i.type))];
    
    if (issueTypes.includes('bad_reference')) {
        recommendations.push("Focus on making questions completely self-contained");
    }
    
    if (issueTypes.includes('insufficient_detail')) {
        recommendations.push("Include more specific context and details in questions");
    }
    
    if (issueTypes.includes('duplicate_options')) {
        recommendations.push("Ensure all answer options are clearly distinct");
    }
    
    return recommendations;
}

// -------------------
// Legacy Wrapper (Maintained for compatibility)
// -------------------
export function getLanguagePrompt(language, numQuestions, difficulty, contextAnalysis) {
    return generateSmartPrompt(language, numQuestions, difficulty, contextAnalysis);
}