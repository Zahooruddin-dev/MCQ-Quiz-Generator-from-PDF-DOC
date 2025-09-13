// Enhanced + Professional languageUtils.js - Context Removed + Superior Prompts

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
// Advanced Content Analysis (Streamlined - No Context Dependencies)
// -------------------
export function analyzeContent(content) {
    if (!content || content.length < 10) {
        return { 
            type: 'general', 
            description: 'General content', 
            hasVisualElements: false, 
            complexity: 'low',
            topics: [],
            keyTerms: [],
            structure: 'unstructured',
            wordCount: 0,
            avgWordsPerSentence: 0
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
        avgWordsPerSentence: Math.round(avgWordsPerSentence)
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

// -------------------
// Superior Prompt Generator - Focused on Quality MCQs
// -------------------
export function generateSmartPrompt(language, numQuestions, difficulty, contentAnalysis) {
    const BLOOM_TAXONOMY = {
        easy: "Knowledge and Comprehension (recall facts, understand basic concepts)",
        medium: "Application and Analysis (apply concepts, analyze relationships)",
        hard: "Synthesis and Evaluation (create solutions, evaluate arguments, make judgments)"
    };

    const CRITICAL_REQUIREMENTS = [
        "Each question MUST be completely self-contained with all necessary information",
        "NEVER reference 'the text', 'the passage', 'the document', or 'according to the above'",
        "Questions must test understanding of ACTUAL content provided, not hypothetical scenarios",
        "AVOID generic placeholders like 'X company', 'Y graph', 'Z study' - use real names from content",
        "All options must be plausible to someone with partial knowledge of the topic",
        "Correct answers must be definitively correct based on the provided content",
        "Distractors should represent common misconceptions or related but incorrect concepts",
        "Use specific examples, names, dates, numbers, and details directly from the content",
        "Focus on key concepts, relationships, and factual information explicitly stated",
        "Ensure questions cannot be answered without reading the provided content"
    ];

    const DIFFICULTY_FRAMEWORKS = {
        easy: {
            focus: "Direct factual recall and basic comprehension",
            questionTypes: ["What is...", "Who was...", "When did...", "Where does..."],
            cognitiveLevel: "Remember and understand specific facts and definitions"
        },
        medium: {
            focus: "Application of concepts and analysis of relationships", 
            questionTypes: ["How does...", "Why is...", "What causes...", "What is the relationship between..."],
            cognitiveLevel: "Apply knowledge and analyze cause-effect relationships"
        },
        hard: {
            focus: "Synthesis of multiple concepts and critical evaluation",
            questionTypes: ["What can be concluded...", "Which factor most influences...", "How would... affect..."],
            cognitiveLevel: "Evaluate evidence and synthesize complex relationships"
        }
    };

    const LANGUAGE_TEMPLATES = {
        en: {
            title: `Expert MCQ Generator - ${numQuestions} Questions`,
            instruction: `Create ${numQuestions} high-quality multiple choice questions that thoroughly test understanding of the provided content.`,
            difficulty_note: `Difficulty Level: ${difficulty.toUpperCase()} - ${BLOOM_TAXONOMY[difficulty]}`,
            content_analysis: `Content Type: ${contentAnalysis.description}`,
            focus_areas: contentAnalysis.topics.length > 0 ? `Primary Topics: ${contentAnalysis.topics.join(', ')}` : '',
            key_terms: contentAnalysis.keyTerms.length > 0 ? `Important Terms: ${contentAnalysis.keyTerms.slice(0, 8).join(', ')}` : ''
        },
        ur: {
            title: `ماہر MCQ جنریٹر - ${numQuestions} سوالات`,
            instruction: `${numQuestions} اعلیٰ معیار کے کثیر انتخابی سوالات بنائیں جو فراہم کردہ مواد کی مکمل سمجھ کو جانچتے ہیں۔`,
            difficulty_note: `مشکل کی سطح: ${difficulty.toUpperCase()} - ${BLOOM_TAXONOMY[difficulty]}`,
            content_analysis: `مواد کی قسم: ${contentAnalysis.description}`,
            focus_areas: contentAnalysis.topics.length > 0 ? `بنیادی موضوعات: ${contentAnalysis.topics.join(', ')}` : '',
            key_terms: contentAnalysis.keyTerms.length > 0 ? `اہم اصطلاحات: ${contentAnalysis.keyTerms.slice(0, 8).join(', ')}` : ''
        },
        ar: {
            title: `مولد أسئلة MCQ خبير - ${numQuestions} أسئلة`,
            instruction: `أنشئ ${numQuestions} أسئلة اختيار من متعدد عالية الجودة تختبر فهم المحتوى المقدم بشمولية.`,
            difficulty_note: `مستوى الصعوبة: ${difficulty.toUpperCase()} - ${BLOOM_TAXONOMY[difficulty]}`,
            content_analysis: `نوع المحتوى: ${contentAnalysis.description}`,
            focus_areas: contentAnalysis.topics.length > 0 ? `الموضوعات الرئيسية: ${contentAnalysis.topics.join(', ')}` : '',
            key_terms: contentAnalysis.keyTerms.length > 0 ? `المصطلحات المهمة: ${contentAnalysis.keyTerms.slice(0, 8).join(', ')}` : ''
        },
        hi: {
            title: `विशेषज्ञ MCQ जेनरेटर - ${numQuestions} प्रश्न`,
            instruction: `${numQuestions} उच्च गुणवत्ता वाले बहुविकल्पीय प्रश्न बनाएं जो प्रदान की गई सामग्री की गहरी समझ का परीक्षण करते हैं।`,
            difficulty_note: `कठिनाई स्तर: ${difficulty.toUpperCase()} - ${BLOOM_TAXONOMY[difficulty]}`,
            content_analysis: `सामग्री प्रकार: ${contentAnalysis.description}`,
            focus_areas: contentAnalysis.topics.length > 0 ? `मुख्य विषय: ${contentAnalysis.topics.join(', ')}` : '',
            key_terms: contentAnalysis.keyTerms.length > 0 ? `महत्वपूर्ण शब्द: ${contentAnalysis.keyTerms.slice(0, 8).join(', ')}` : ''
        }
    };

    const template = LANGUAGE_TEMPLATES[language] || LANGUAGE_TEMPLATES.en;
    const difficultyFramework = DIFFICULTY_FRAMEWORKS[difficulty] || DIFFICULTY_FRAMEWORKS.medium;
    
    let prompt = `${template.title}\n\n`;
    prompt += `${template.instruction}\n\n`;
    prompt += `${template.difficulty_note}\n`;
    prompt += `${template.content_analysis}\n`;
    
    if (template.focus_areas) prompt += `${template.focus_areas}\n`;
    if (template.key_terms) prompt += `${template.key_terms}\n`;
    
    prompt += `\nCOGNITIVE TARGET: ${difficultyFramework.cognitiveLevel}\n`;
    prompt += `QUESTION FOCUS: ${difficultyFramework.focus}\n\n`;

    prompt += "CRITICAL QUALITY STANDARDS:\n";
    CRITICAL_REQUIREMENTS.forEach((req, i) => {
        prompt += `${i + 1}. ${req}\n`;
    });

    prompt += `\nQUESTION DESIGN FRAMEWORK:\n`;
    prompt += `- FACTUAL QUESTIONS: Test specific details, exact definitions, precise data points\n`;
    prompt += `- CONCEPTUAL QUESTIONS: Test understanding of processes, relationships, principles\n`;
    prompt += `- ANALYTICAL QUESTIONS: Test ability to identify patterns, compare/contrast, classify\n`;
    prompt += `- APPLICATION QUESTIONS: Test transfer of knowledge to new but related scenarios\n\n`;

    prompt += `DISTRACTOR ENGINEERING:\n`;
    prompt += `- Create plausible wrong answers that reflect incomplete understanding\n`;
    prompt += `- Use common misconceptions and partially correct information\n`;
    prompt += `- Include related but incorrect facts from the same topic area\n`;
    prompt += `- Ensure distractors are clearly distinguishable from the correct answer\n`;
    prompt += `- Avoid obviously wrong options that can be eliminated without content knowledge\n\n`;

    prompt += `CONTENT-SPECIFIC GUIDANCE:\n`;
    if (contentAnalysis.type === 'academic') {
        prompt += `- Focus on research findings, methodologies, theoretical frameworks\n`;
        prompt += `- Test understanding of evidence, conclusions, and scholarly arguments\n`;
    } else if (contentAnalysis.type === 'scientific') {
        prompt += `- Emphasize cause-effect relationships, processes, and scientific principles\n`;
        prompt += `- Include questions about experimental design, data interpretation\n`;
    } else if (contentAnalysis.type === 'historical') {
        prompt += `- Test chronological understanding, causation, and historical significance\n`;
        prompt += `- Focus on specific events, dates, figures, and their impacts\n`;
    } else if (contentAnalysis.type === 'technical') {
        prompt += `- Test procedural knowledge, system understanding, troubleshooting\n`;
        prompt += `- Focus on specifications, implementations, and technical relationships\n`;
    } else {
        prompt += `- Focus on key concepts, important details, and main ideas\n`;
        prompt += `- Test both factual knowledge and conceptual understanding\n`;
    }

    prompt += `\nSTRICT JSON OUTPUT FORMAT:\n`;
    prompt += `{
  "questions": [
    {
      "question": "Complete, self-contained question with all necessary information included",
      "options": ["Correct answer with specific details", "Plausible distractor 1", "Plausible distractor 2", "Plausible distractor 3"],
      "correctAnswer": 0,
      "explanation": "Comprehensive explanation of why the answer is correct and others are wrong",
      "cognitive_level": "${difficulty}",
      "question_type": "factual|conceptual|analytical|application"
    }
  ]
}\n\n`;

    prompt += "Remember: Every question must be answerable ONLY by someone who has read and understood the provided content. Generic knowledge should not be sufficient.\n\n";

    return prompt;
}

// -------------------
// Enhanced Quality Validator (Context References Removed)
// -------------------
export function validateQuestionQuality(questions) {
    const issues = [];
    let totalScore = 0;

    questions.forEach((q, i) => {
        let questionScore = 100;
        
        // Check for bad references to source material
        const badRefs = /\b(the passage|the text|the document|the article|the material|the content|according to (it|this|the above)|as mentioned (above|earlier|previously)|in the (above|preceding|following)|from (this|the) (text|passage|document)|based on the (text|passage|document))\b/gi;
        if (badRefs.test(q.question)) {
            issues.push({ 
                questionIndex: i, 
                type: 'bad_reference', 
                severity: 'high',
                issue: 'Question references source material instead of being self-contained',
                suggestion: 'Rewrite to include all necessary information directly in the question'
            });
            questionScore -= 40;
        }

        // Check for generic scenarios and placeholders
        const genericPatterns = /\b([xyz])\s+(company|corporation|study|research|graph|chart|table|experiment|case|example|scenario)\b/gi;
        if (genericPatterns.test(q.question)) {
            issues.push({ 
                questionIndex: i, 
                type: 'generic_placeholder', 
                severity: 'high',
                issue: 'Question uses generic placeholders instead of specific content details',
                suggestion: 'Use actual names, terms, and details from the provided content'
            });
            questionScore -= 35;
        }

        // Check question specificity and detail level
        if (q.question.length < 80) {
            issues.push({ 
                questionIndex: i, 
                type: 'insufficient_detail', 
                severity: 'medium',
                issue: 'Question lacks sufficient detail and context',
                suggestion: 'Add more specific information to make the question comprehensive'
            });
            questionScore -= 20;
        }

        // Check for vague language
        const vaguePatterns = /\b(this|that|these|those|it|they|them|which one|what is it|the following|the above)\b/gi;
        const vagueMatches = (q.question.match(vaguePatterns) || []).length;
        if (vagueMatches > 2) {
            issues.push({ 
                questionIndex: i, 
                type: 'vague_language', 
                severity: 'medium',
                issue: 'Question contains excessive vague pronouns and references',
                suggestion: 'Replace vague terms with specific nouns and clear references'
            });
            questionScore -= 15;
        }

        // Validate options structure and quality
        if (!Array.isArray(q.options) || q.options.length !== 4) {
            issues.push({ 
                questionIndex: i, 
                type: 'invalid_options', 
                severity: 'high',
                issue: 'Question must have exactly 4 answer options',
                suggestion: 'Provide exactly 4 distinct, well-crafted options'
            });
            questionScore -= 50;
        } else {
            // Check for duplicate or overly similar options
            const optionsLower = q.options.map(opt => opt.toLowerCase().trim());
            const uniqueOptions = new Set(optionsLower);
            if (uniqueOptions.size !== 4) {
                issues.push({ 
                    questionIndex: i, 
                    type: 'duplicate_options', 
                    severity: 'high',
                    issue: 'Answer options are duplicated or too similar',
                    suggestion: 'Ensure each option is clearly distinct and meaningful'
                });
                questionScore -= 30;
            }

            // Check option quality and balance
            const lengths = q.options.map(opt => opt.length);
            const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
            const hasExtremeOutlier = lengths.some(len => len < avgLength * 0.3 || len > avgLength * 2);
            if (hasExtremeOutlier) {
                issues.push({ 
                    questionIndex: i, 
                    type: 'unbalanced_options', 
                    severity: 'medium',
                    issue: 'Answer options have dramatically different lengths',
                    suggestion: 'Balance option lengths to avoid revealing the correct answer'
                });
                questionScore -= 15;
            }

            // Check for obviously wrong distractors
            const obviouslyWrong = q.options.some(opt => 
                /\b(never|always|impossible|definitely not|completely wrong|totally incorrect)\b/i.test(opt)
            );
            if (obviouslyWrong) {
                issues.push({ 
                    questionIndex: i, 
                    type: 'obvious_distractors', 
                    severity: 'medium',
                    issue: 'Some distractors are obviously incorrect',
                    suggestion: 'Make distractors plausible to someone with partial knowledge'
                });
                questionScore -= 20;
            }
        }

        // Check explanation quality
        if (!q.explanation || q.explanation.length < 30) {
            issues.push({ 
                questionIndex: i, 
                type: 'poor_explanation', 
                severity: 'medium',
                issue: 'Explanation is missing or insufficient',
                suggestion: 'Provide detailed explanation of correct answer and why others are wrong'
            });
            questionScore -= 15;
        }

        // Check correct answer validity
        const correctAnswer = parseInt(q.correctAnswer);
        if (isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer >= 4) {
            issues.push({ 
                questionIndex: i, 
                type: 'invalid_correct_answer', 
                severity: 'high',
                issue: 'Correct answer index is invalid',
                suggestion: 'Set correctAnswer to valid index (0-3)'
            });
            questionScore -= 40;
        }

        totalScore += Math.max(0, questionScore);
    });

    const averageScore = questions.length > 0 ? totalScore / questions.length : 0;
    const highSeverityIssues = issues.filter(issue => issue.severity === 'high').length;
    
    return {
        isValid: highSeverityIssues === 0 && averageScore >= 75,
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
    
    if (averageScore < 60) {
        recommendations.push("Questions need significant improvement - consider regenerating with more specific content-focused prompts");
    } else if (averageScore < 80) {
        recommendations.push("Questions show good potential but need refinement for better quality");
    }
    
    const issueTypes = [...new Set(issues.map(i => i.type))];
    
    if (issueTypes.includes('bad_reference')) {
        recommendations.push("Eliminate all references to source material - make questions completely self-contained");
    }
    
    if (issueTypes.includes('generic_placeholder')) {
        recommendations.push("Replace generic placeholders with specific details and actual names from content");
    }
    
    if (issueTypes.includes('insufficient_detail')) {
        recommendations.push("Add more comprehensive context and specific information to questions");
    }
    
    if (issueTypes.includes('duplicate_options')) {
        recommendations.push("Ensure all answer options are clearly distinct and meaningful");
    }
    
    if (issueTypes.includes('vague_language')) {
        recommendations.push("Replace vague pronouns and references with specific, clear terms");
    }
    
    if (issueTypes.includes('obvious_distractors')) {
        recommendations.push("Create more sophisticated distractors that require content knowledge to eliminate");
    }
    
    return recommendations;
}

// -------------------
// Legacy Compatibility Wrappers
// -------------------
export function getLanguagePrompt(language, numQuestions, difficulty, contextAnalysis) {
    return generateSmartPrompt(language, numQuestions, difficulty, contextAnalysis);
}

// Alias for backward compatibility
export function analyzeContext(content) {
    return analyzeContent(content);
}