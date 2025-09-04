// LLMService.js - Enhanced Version

// --- Imports for PDF handling ---
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const MAX_CHARS = 18000; // keeping prompts manageable
const REQUEST_TIMEOUT_MS = 90_000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// Language detection function
function detectLanguage(text) {
  if (!text || text.length < 50) return 'en'; // Default to English for short texts
  
  // Check for common non-Latin scripts
  const patterns = {
    ar: /[\u0600-\u06FF]/, // Arabic
    ur: /[\u0600-\u06FF]/, // Urdu (uses Arabic script)
    hi: /[\u0900-\u097F]/, // Hindi
    zh: /[\u4E00-\u9FFF]/, // Chinese
    ja: /[\u3040-\u309F\u30A0-\u30FF]/, // Japanese
    ko: /[\uAC00-\uD7AF]/, // Korean
    ru: /[\u0400-\u04FF]/, // Russian
    es: /[áéíóúñ]/i, // Spanish
    fr: /[àâçéèêëîïôûùüÿ]/i, // French
    de: /[äöüß]/i, // German
  };
  
  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) return lang;
  }
  
  return 'en'; // Default to English
}

// Language-specific prompts
const LANGUAGE_PROMPTS = {
  en: {
    instruction: `Create {numQuestions} {difficulty} multiple choice questions from the following text.
Important rules for questions:
1. Each question MUST be completely self-contained - never reference "the passage" or "the text"
2. Include necessary context within the question itself
3. Bad example: "What does the passage say about climate change?"
4. Good example: "According to the 2023 IPCC report, what was identified as the primary driver of climate change?"

Each question must have:
- "question": self-contained question with context (no references to "the passage" or "the text")
- "options": 4 unique options (strings)
- "correctAnswer": index of the correct option (0–3)
- "explanation": 1–2 lines why it's correct
- "context": relevant excerpt from source text that contains the answer (max 200 chars)`
  },
  ur: {
    instruction: `درج ذیل متن سے {numQuestions} {difficulty} کثیر انتخابی سوالات بنائیں۔
سوالات کے لیے اہم قواعد:
1. ہر سوال مکمل طور پر خود مختار ہونا چاہیے - کبھی بھی "متن" یا "پیراگراف" کا حوالہ نہ دیں
2. سوال کے اندر ضروری سیاق و سباق شامل کریں
3. برا مثال: "متن میں موسمیاتی تبدیلی کے بارے میں کیا کہا گیا ہے؟"
4. اچھی مثال: "2023 کی آئی پی سی سی رپورٹ کے مطابق، موسمیاتی تبدیلی کا بنیادی محرک کیا بتایا گیا؟"

ہر سوال میں یہ ہونا ضروری ہے:
- "question": سیاق و سباق کے ساتھ خود مختار سوال ("متن" یا "پیراگراف" کا کوئی حوالہ نہیں)
- "options": 4 منفرد اختیارات (strings)
- "correctAnswer": صحیح اختیار کا انڈیکس (0–3)
- "explanation": 1-2 لائنوں میں وضاحت کہ یہ کیوں صحیح ہے
- "context": ماخذ متن کا متعلقہ اقتباس جس میں جواب موجود ہے (زیادہ سے زیادہ 200 حروف)`
  },
  ar: {
    instruction: `أنشئ {numQuestions} أسئلة اختيار من متعدد {difficulty} من النص التالي.
قواعد مهمة للأسئلة:
1. يجب أن يكون كل سؤال مكتفيًا ذاتيًا تمامًا - لا تُشر مطلقًا إلى "الفقرة" أو "النص"
2. قم بتضمين السياق الضروري داخل السؤال نفسه
3. مثال سيئ: "ماذا تقول الفقرة عن تغير المناخ؟"
4. مثال جيد: "وفقًا لتقرير الهيئة الحكومية الدولية المعنية بتغير المناخ 2023، ما هو المحرك الرئيسي لتغير المناخ؟"

يجب أن يحتوي كل سؤال على:
- "question": سؤال مكتفي ذاتيًا مع السياق (بدون إشارات إلى "الفقرة" أو "النص")
- "options": 4 خيارات فريدة (strings)
- "correctAnswer": فهرس الخيار الصحيح (0–3)
- "explanation": سطر أو سطرين توضح سبب صحته
- "context": مقتطف ذو صلة من النص المصدر الذي يحتوي على الإجابة (200 حرف كحد أقصى)`
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
  
  // Try to trim at a sentence boundary if possible
  const lastPeriod = text.lastIndexOf('.', MAX_CHARS);
  const lastQuestion = text.lastIndexOf('?', MAX_CHARS);
  const lastExclamation = text.lastIndexOf('!', MAX_CHARS);
  
  const lastPunctuation = Math.max(lastPeriod, lastQuestion, lastExclamation);
  if (lastPunctuation > MAX_CHARS * 0.8) {
    return text.slice(0, lastPunctuation + 1) + "\n\n[TRUNCATED]";
  }
  
  return text.slice(0, MAX_CHARS) + "\n\n[TRUNCATED]";
}

function extractJson(text) {
  if (!text) throw new Error('Empty LLM response');

  // Try to find JSON in the response with multiple approaches
  const jsonPatterns = [
    // Pattern 1: Look for code blocks with json
    /```json\s*([\s\S]*?)\s*```/,
    
    // Pattern 2: Look for any code blocks
    /```\s*([\s\S]*?)\s*```/,
    
    // Pattern 3: Look for JSON object
    /\{[\s\S]*\}/,
    
    // Pattern 4: Look for JSON array
    /\[[\s\S]*\]/
  ];

  for (const pattern of jsonPatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        const jsonStr = match[1] || match[0];
        const parsed = JSON.parse(jsonStr);
        
        // Handle both {questions: [...]} and direct array formats
        if (Array.isArray(parsed)) {
          return { questions: parsed };
        } else if (parsed.questions && Array.isArray(parsed.questions)) {
          return parsed;
        } else if (typeof parsed === 'object') {
          // Try to find any array in the object that might be questions
          for (const key in parsed) {
            if (Array.isArray(parsed[key])) {
              return { questions: parsed[key] };
            }
          }
        }
      } catch (e) {
        // Continue to next pattern if parsing fails
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
    // Final fallback
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
          error.message.includes('Unsupported file type')) {
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

export class LLMService {
  constructor(apiKey, baseUrl) {
    if (!apiKey) throw new Error("API key is required");
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.language = 'en'; // Default language
  }

  // Reads text content from common file formats
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

        // DOCX (using mammoth)
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

        // PDF (using pdfjs-dist)
        if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
          const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
          let text = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item) => item.str).join(" ") + "\n";
            
            // Early exit if we're approaching the character limit
            if (text.length > MAX_CHARS * 1.5) break;
          }
          return text.trim();
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

Format:
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
              temperature: 0.3, // Lower temperature for more deterministic outputs
              maxOutputTokens: 8192, // Increased token limit for longer responses
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

        // Shuffle options for variety & validate
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

          return {
            question: (q.question || '').toString().trim().replace(/\s+/g, ' '),
            options: shuffledOptions,
            correctAnswer: newCorrectIndex,
            explanation: (q.explanation || '').toString().trim(),
            context: (q.context || '').toString().trim(),
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