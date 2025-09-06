// language.js
import { LANGUAGE_PROMPTS } from "./constants.js";

export function detectLanguage(text) {
  if (!text || text.length < 50) return "en";
  const patterns = {
    ar: /[\u0600-\u06FF]/g,
    ur: /[\u0600-\u06FF]/g,
    hi: /[\u0900-\u097F]/g,
    zh: /[\u4E00-\u9FFF]/g,
    ja: /[\u3040-\u30FF]/g,
    ko: /[\uAC00-\uD7AF]/g,
    ru: /[\u0400-\u04FF]/g,
    es: /[áéíóúñüÁÉÍÓÚÑÜ]/g,
  };

  let dominant = "en", max = 0;
  for (const [lang, regex] of Object.entries(patterns)) {
    const count = (text.match(regex) || []).length;
    if (count > max) { max = count; dominant = lang; }
  }
  return max > text.length * 0.1 ? dominant : "en";
}

export function getLanguagePrompt(lang, num, diff) {
  const prompt = LANGUAGE_PROMPTS[lang] || LANGUAGE_PROMPTS.en;
  return prompt.instruction
    .replace(/{numQuestions}/g, num)
    .replace(/{difficulty}/g, diff);
}
