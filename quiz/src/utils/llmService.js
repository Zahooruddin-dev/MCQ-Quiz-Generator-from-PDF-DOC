// LLMService.js - Enhanced with better language handling and OCR support

// --- Imports for PDF handling ---
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const MAX_CHARS = 18000;
const REQUEST_TIMEOUT_MS = 120000; // Increased timeout for OCR processing
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// Enhanced language detection with better accuracy
function detectLanguage(text) {
  if (!text || text.length < 50) return 'en';
  
  // Character range patterns for different languages
  const scriptPatterns = {
    ar: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g, // Arabic
    ur: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g, // Urdu (Arabic script)
    hi: /[\u0900-\u097F\uA8E0-\uA8FF]/g, // Hindi (Devanagari)
    bn: /[\u0980-\u09FF]/g, // Bengali
    pa: /[\u0A00-\u0A7F]/g, // Punjabi (Gurmukhi)
    gu: /[\u0A80-\u0AFF]/g, // Gujarati
    ta: /[\u0B80-\u0BFF]/g, // Tamil
    te: /[\u0C00-\u0C7F]/g, // Telugu
    kn: /[\u0C80-\u0CFF]/g, // Kannada
    ml: /[\u0D00-\u0D7F]/g, // Malayalam
    th: /[\u0E00-\u0E7F]/g, // Thai
    zh: /[\u4E00-\u9FFF\u3400-\u4DBF]/g, // Chinese
    ja: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, // Japanese
    ko: /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g, // Korean
    ru: /[\u0400-\u04FF]/g, // Russian
    es: /[áéíóúñüÁÉÍÓÚÑÜ]/g, // Spanish
    fr: /[àâçéèêëîïôûùüÿÀÂÇÉÈÊËÎÏÔÛÙÜŸ]/g, // French
    de: /[äöüßÄÖÜ]/g, // German
    it: /[àèéìíîòóùúÀÈÉÌÍÎÒÓÙÚ]/g, // Italian
    pt: /[áàâãçéêíóôõúÁÀÂÃÇÉÊÍÓÔÕÚ]/g, // Portuguese
  };

  // Count characters for each script
  const scriptCounts = {};
  for (const [lang, pattern] of Object.entries(scriptPatterns)) {
    const matches = text.match(pattern);
    scriptCounts[lang] = matches ? matches.length : 0;
  }

  // Find the dominant script
  let dominantLang = 'en';
  let maxCount = 0;

  for (const [lang, count] of Object.entries(scriptCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantLang = lang;
    }
  }

  // If we have a clear dominant script, return it
  if (maxCount > text.length * 0.1) { // At least 10% of text in this script
    return dominantLang;
  }

  // Fallback to English
  return 'en';
}

// Enhanced language prompts with better instructions
const LANGUAGE_PROMPTS = {
  en: {
    instruction: `Create {numQuestions} {difficulty} multiple choice questions from the following text.

CRITICAL RULES:
1. Each question MUST be completely self-contained - NEVER reference "the passage", "the text", or "the article"
2. Include ALL necessary context within the question itself
3. ALWAYS frame questions based on the CONTENT, not the document structure
4. BAD example: "What does the passage say about climate change?"
5. GOOD example: "According to the data presented, what was identified as the primary driver of climate change in 2023?"

Each question must have:
- "question": self-contained question with ALL necessary context
- "options": 4 unique, plausible options
- "correctAnswer": index of the correct option (0-3)
- "explanation": clear 1-2 line explanation
- "context": direct quote from the source that supports the answer (max 150 chars)`
  },
  ur: {
    instruction: `درج ذیل متن سے {numQuestions} {difficulty} کثیر انتخابی سوالات بنائیں۔

اہم ہدایات:
1. ہر سوال مکمل طور پر خود مختار ہو - کبھی بھی "متن"، "تحریر" یا "مقالے" کا حوالہ نہ دیں
2. سوال کے اندر تمام ضروری سیاق و سباق شامل کریں
3. سوالات کو مواد کی بنیاد پر تشکیل دیں، نہ کہ دستاویز کی ساخت پر
4. بری مثال: "متن میں موسمیاتی تبدیلی کے بارے میں کیا کہا گیا ہے؟"
5. اچھی مثال: "پیش کردہ ڈیٹا کے مطابق، 2023 میں موسمیاتی تبدیلی کا بنیادی محرک کیا بتایا گیا؟"

ہر سوال میں یہ ہونا ضروری ہے:
- "question": تمام ضروری سیاق و سباق کے ساتھ خود مختار سوال
- "options": 4 منفرد، معقول اختیارات
- "correctAnswer": صحیح اختیار کا انڈیکس (0-3)
- "explanation": واضح 1-2 لائنیں وضاحت
- "context": ماخذ سے براہ راست اقتباس جو جواب کی حمایت کرتا ہے (زیادہ سے زیادہ 150 حروف)`
  },
  ar: {
    instruction: `أنشئ {numQuestions} أسئلة اختيار من متعدد {difficulty} من النص التالي.

تعليمات هامة:
1. يجب أن يكون كل سؤال مكتفيًا ذاتيًا تمامًا - لا تُشر مطلقًا إلى "الفقرة" أو "النص" أو "المقال"
2. قم بتضمين جميع السياق الضروري داخل السؤال نفسه
3. صياغة الأسئلة بناءً على المحتوى، وليس هيكل المستند
4. مثال سيئ: "ماذا تقول الفقرة عن تغير المناخ؟"
5. مثال جيد: "وفقًا للبيانات المقدمة، ما هو المحرك الرئيسي لتغير المناخ في عام 2023؟"

يجب أن يحتوي كل سؤال على:
- "question": سؤال مكتفي ذاتيًا بكل السياق الضروري
- "options": 4 خيارات فريدة ومرجحة
- "correctAnswer": فهرس الخيار الصحيح (0-3)
- "explanation": شرح واضح في سطر أو سطرين
- "context": اقتباس مباشر من المصدر يدعم الإجابة (150 حرفًا كحد أقصى)`
  },
  // Add more languages as needed
};

function getLanguagePrompt(lang, numQuestions, difficulty) {
  const prompt = LANGUAGE_PROMPTS[lang] || LANGUAGE_PROMPTS.en;
  return prompt.instruction
    .replace(/{numQuestions}/g, numQuestions)
    .replace(/{difficulty}/g, difficulty);
}

function trimForPrompt(text) {
  if (!text) return '';
  if (text.length <= MAX_CHARS) return text;
  
  // Try to trim at a paragraph boundary if possible
  const paragraphs = text.split(/\n\s*\n/);
  let trimmedText = '';
  
  for (const paragraph of paragraphs) {
    if ((trimmedText + paragraph).length <= MAX_CHARS) {
      trimmedText += paragraph + '\n\n';
    } else {
      break;
    }
  }
  
  if (trimmedText.length > 0) {
    return trimmedText + "\n\n[CONTENT TRUNCATED]";
  }
  
  // Fallback to character-based trimming
  return text.slice(0, MAX_CHARS) + "\n\n[CONTENT TRUNCATED]";
}

function extractJson(text) {
  if (!text) throw new Error('Empty LLM response');

  // Multiple patterns to extract JSON
  const jsonPatterns = [
    /```json\s*([\s\S]*?)\s*```/,
    /```\s*([\s\S]*?)\s*```/,
    /\{[\s\S]*\}/,
    /\[[\s\S]*\]/
  ];

  for (const pattern of jsonPatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        const jsonStr = match[1] || match[0];
        const parsed = JSON.parse(jsonStr);
        
        if (Array.isArray(parsed)) return { questions: parsed };
        if (parsed.questions && Array.isArray(parsed.questions)) return parsed;
        
        // Look for any array in the object
        for (const key in parsed) {
          if (Array.isArray(parsed[key])) {
            return { questions: parsed[key] };
          }
        }
      } catch (e) {
        continue;
      }
    }
  }

  // Last resort: try to parse the entire text
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return { questions: parsed };
    if (parsed.questions && Array.isArray(parsed.questions)) return parsed;
  } catch (e) {
    throw new Error('No valid JSON found in LLM response');
  }

  throw new Error('No valid JSON found in LLM response');
}

// Retry mechanism with exponential backoff
async function withRetry(fn, maxRetries = MAX_RETRIES, delay = RETRY_DELAY_MS) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.message.includes('Empty LLM response') || 
          error.message.includes('Unsupported file type') ||
          error.message.includes('image-based')) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
}

// OCR function for image-based PDFs (using a free OCR API)
async function extractTextFromImagePDF(arrayBuffer) {
  try {
    // FormData approach for sending file to OCR API
    const formData = new FormData();
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    formData.append('file', blob);
    formData.append('language', 'eng'); // Default to English, can be enhanced
    
    // Using a free OCR API (Note: you might need to replace with your own OCR service)
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': 'helloworld', // Free API key (limited requests)
      },
      body: formData,
    });
    
    const data = await response.json();
    
    if (data.IsErroredOnProcessing) {
      throw new Error('OCR processing failed: ' + data.ErrorMessage);
    }
    
    // Extract text from all pages
    let text = '';
    if (data.ParsedResults && data.ParsedResults.length > 0) {
      text = data.ParsedResults.map(result => result.ParsedText).join('\n\n');
    }
    
    return text.trim();
  } catch (error) {
    console.error('OCR extraction failed:', error);
    throw new Error('This PDF appears to be image-based. Please use a text-based PDF or convert images to text first.');
  }
}

export class LLMService {
  constructor(apiKey, baseUrl) {
    if (!apiKey) throw new Error("API key is required");
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.language = 'en';
  }

  // Enhanced file content reading with OCR support
  async readFileContent(file) {
    return withRetry(async () => {
      try {
        // TXT / HTML
        if (
          file.type.includes("text") ||
          file.name.endsWith(".txt") ||
          file.name.endsWith(".html")
        ) {
          return await file.text();
        }

        // DOCX
        if (
          file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          file.name.endsWith(".docx")
        ) {
          const arrayBuffer = await file.arrayBuffer();
          const mammoth = await import("mammoth/mammoth.browser.js");
          const { value } = await mammoth.extractRawText({ arrayBuffer });
          return value;
        }

        // PDF - with OCR support for image-based PDFs
        if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
          const arrayBuffer = await file.arrayBuffer();
          
          try {
            // First try standard text extraction
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let text = "";
            let hasText = false;
            
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              
              if (content.items.length > 0) {
                hasText = true;
                text += content.items.map((item) => item.str).join(" ") + "\n";
              }
              
              // Early exit if we're approaching the character limit
              if (text.length > MAX_CHARS * 1.5) break;
            }
            
            // If we found text, return it
            if (hasText && text.trim().length > 0) {
              return text.trim();
            }
            
            // If no text was found, try OCR
            console.log("No text found in PDF, attempting OCR...");
            return await extractTextFromImagePDF(arrayBuffer);
          } catch (error) {
            console.error("PDF processing failed, attempting OCR:", error);
            return await extractTextFromImagePDF(arrayBuffer);
          }
        }

        throw new Error("Unsupported file type. Use TXT, HTML, DOCX, or PDF.");
      } catch (error) {
        console.error("File reading error:", error);
        throw new Error(`File reading failed: ${error.message}`);
      }
    });
  }

  shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  async generateQuizQuestions(fileOrText, options = {}) {
    const { numQuestions = 10, difficulty = "medium" } = options;
    
    return withRetry(async () => {
      try {
        const sourceText =
          typeof fileOrText === "string" ? fileOrText : await this.readFileContent(fileOrText);

        if (!sourceText || sourceText.trim().length < 50) {
          throw new Error("The document seems empty or too short to generate questions.");
        }

        // Detect language from source text
        this.language = detectLanguage(sourceText);
        console.log(`Detected language: ${this.language}`);

        const text = trimForPrompt(sourceText);
        const languagePrompt = getLanguagePrompt(this.language, numQuestions, difficulty);

        const prompt = `${languagePrompt}

IMPORTANT: For "context", use a direct quote from the source text, NOT a reference to "the passage" or "the text".

Format your response as JSON with this structure:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": 0,
      "explanation": "string",
      "context": "string"
    }
  ]
}

Content:
${text}`;

        // Abort after N seconds
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        const response = await fetch(this.baseUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": this.apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 8192,
              topP: 0.8,
              topK: 40,
            }
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();

        const rawText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ??
          data?.candidates?.[0]?.content?.parts?.[0]?.inline_data?.data ??
          '';

        if (!rawText) {
          throw new Error('Empty response from the model.');
        }

        const parsed = extractJson(rawText);
        let questions = parsed?.questions;

        if (!Array.isArray(questions) || questions.length === 0) {
          throw new Error('Model returned no questions.');
        }

        // Limit to requested number of questions
        if (questions.length > numQuestions) {
          questions = questions.slice(0, numQuestions);
        }

        // Process and validate questions
        const processedQuestions = questions.map((q, index) => {
          const options = Array.isArray(q.options) ? [...q.options] : [];
          if (options.length !== 4) {
            throw new Error(`Question ${index + 1} must have exactly 4 options. Found: ${options.length}`);
          }

          // Clean options
          const cleanOptions = options.map(opt => 
            (opt || '').toString().trim().replace(/\s+/g, ' ')
          );

          // Check for uniqueness
          const uniqueOptions = [...new Set(cleanOptions)];
          if (uniqueOptions.length !== 4) {
            throw new Error(`Question ${index + 1} has duplicate options.`);
          }

          const correctOption = cleanOptions[q.correctAnswer];
          if (typeof correctOption !== 'string' || correctOption.length === 0) {
            throw new Error(`Question ${index + 1} has an invalid correctAnswer index.`);
          }

          const shuffledOptions = this.shuffleArray([...cleanOptions]);
          const newCorrectIndex = shuffledOptions.indexOf(correctOption);

          // Clean context to remove references to "the passage/text"
          let cleanContext = (q.context || '').toString().trim();
          cleanContext = cleanContext
            .replace(/(according to|in|from) (the|this) (passage|text|document|article)/gi, '')
            .replace(/the (passage|text|document|article) (states|says|mentions|indicates)/gi, '')
            .trim();

          return {
            question: (q.question || '').toString().trim().replace(/\s+/g, ' '),
            options: shuffledOptions,
            correctAnswer: newCorrectIndex,
            explanation: (q.explanation || '').toString().trim(),
            context: cleanContext || 'Context not available',
            language: this.language
          };
        });

        return this.validateQuestions(processedQuestions);
      } catch (error) {
        if (error?.name === 'AbortError') {
          throw new Error('The request timed out. Try reducing the document size or number of questions.');
        }
        console.error("Quiz generation error:", error);
        throw new Error(error?.message || "Failed to generate quiz. Please try again.");
      }
    });
  }

  validateQuestions(questions) {
    return questions.map((q, index) => {
      // Validate question text
      if (!q.question || q.question.length < 10) {
        throw new Error(`Question ${index + 1} is too short or missing.`);
      }
      
      // Validate options
      const uniqueOptions = [...new Set(q.options.map(opt => opt.trim()))];
      if (uniqueOptions.length !== 4) {
        throw new Error(`Question ${index + 1} has duplicate options.`);
      }
      
      // Validate correct answer index
      if (q.correctAnswer < 0 || q.correctAnswer > 3) {
        throw new Error(`Question ${index + 1} has an invalid correctAnswer index.`);
      }
      
      // Validate that the correct answer exists in options
      if (!q.options[q.correctAnswer]) {
        throw new Error(`Question ${index + 1} has a correctAnswer index that doesn't match any option.`);
      }

      return {
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        context: q.context,
        language: q.language
      };
    });
  }
}