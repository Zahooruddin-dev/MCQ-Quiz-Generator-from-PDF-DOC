// LLMService.js

// --- Imports for PDF handling ---
import * as pdfjsLib from "pdfjs-dist";
// Let Vite serve the worker as an asset URL
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const MAX_CHARS = 18000; // keep prompts manageable
const REQUEST_TIMEOUT_MS = 90_000;

function trimForPrompt(text) {
  if (!text) return '';
  if (text.length <= MAX_CHARS) return text;
  return text.slice(0, MAX_CHARS) + "\n\n[TRUNCATED]";
}

function extractJson(text) {
  if (!text) throw new Error('Empty LLM response');

  // strip code fences
  let s = text.replace(/```json|```/gi, '').trim();

  // try object first
  let m = s.match(/\{[\s\S]*\}/);
  if (m) {
    try {
      return JSON.parse(m[0]);
    } catch {}
  }

  // then array
  m = s.match(/\[[\s\S]*\]/);
  if (m) {
    try {
      const arr = JSON.parse(m[0]);
      return { questions: arr };
    } catch {}
  }

  // last resort: whole string (if it already is pure JSON)
  try {
    const parsed = JSON.parse(s);
    if (Array.isArray(parsed)) return { questions: parsed };
    return parsed;
  } catch (e) {
    throw new Error('No valid JSON found in LLM response');
  }
}

export class LLMService {
  constructor(apiKey, baseUrl) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  // Reads text content from common file formats
  async readFileContent(file) {
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
        }
        return text.trim();
      }

      throw new Error("Unsupported file type. Use TXT, HTML, DOCX, or PDF.");
    } catch (error) {
      throw new Error(`File reading failed: ${error.message}`);
    }
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async generateQuizQuestions(fileOrText, options = {}) {
    const { numQuestions = 10, difficulty = "medium" } = options;

    try {
      const sourceText =
        typeof fileOrText === "string" ? fileOrText : await this.readFileContent(fileOrText);

      if (!sourceText || sourceText.trim().length < 20) {
        throw new Error("The document seems empty or too short to generate questions.");
      }

      const text = trimForPrompt(sourceText);

      const prompt = `Create ${numQuestions} ${difficulty} multiple choice questions from the following text.
Each question must have:
- "question": clear question (concise, self-contained)
- "options": 4 unique options (strings)
- "correctAnswer": index of the correct option (0–3)
- "explanation": 1–2 lines why it's correct
Return ONLY valid JSON. Do not add commentary or markdown.

Format:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": 0,
      "explanation": "string"
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
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
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

      // Shuffle options for variety & validate
      questions = questions.map((q) => {
        const options = Array.isArray(q.options) ? [...q.options] : [];
        if (options.length !== 4) throw new Error('Each question must have exactly 4 options.');

        const correctOption = options[q.correctAnswer];
        if (typeof correctOption !== 'string') {
          throw new Error('Invalid correctAnswer index.');
        }

        const shuffledOptions = this.shuffleArray([...options]);
        const newCorrectIndex = shuffledOptions.indexOf(correctOption);

        return {
          question: (q.question || '').toString().trim().replace(/\s+/g, ' ').replace(/^./, c => c.toUpperCase()),
          options: shuffledOptions,
          correctAnswer: newCorrectIndex,
          explanation: (q.explanation || '').toString().trim(),
        };
      });

      return this.validateQuestions(questions);
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new Error('The request timed out. Try reducing the document size or number of questions.');
      }
      console.error("Quiz generation error:", error);
      throw new Error(error?.message || "Failed to generate quiz. Please try again.");
    }
  }

  validateQuestions(questions) {
    return questions.map((q) => {
      const unique = [...new Set(q.options.map((s) => (s || '').toString().trim()))];
      if (unique.length !== 4) {
        throw new Error('All options must be unique for each question.');
      }
      if (q.correctAnswer < 0 || q.correctAnswer > 3) {
        throw new Error('Correct answer index must be between 0 and 3.');
      }
      return {
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      };
    });
  }
}
