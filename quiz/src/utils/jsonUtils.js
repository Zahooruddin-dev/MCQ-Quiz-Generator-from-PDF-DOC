// utils.js
import { MAX_CHARS, MAX_RETRIES, RETRY_DELAY_MS } from "./constants.js";

export function trimForPrompt(text) {
  if (!text) return "";
  if (text.length <= MAX_CHARS) return text;
  return text.slice(0, MAX_CHARS) + "\n\n[CONTENT TRUNCATED]";
}

export function extractJson(text) {
  try {
    const match = text.match(/```json\s*([\s\S]*?)```/);
    const jsonStr = match ? match[1] : text;
    return JSON.parse(jsonStr);
  } catch {
    throw new Error("Invalid JSON from model");
  }
}

export async function withRetry(fn, max = MAX_RETRIES, delay = RETRY_DELAY_MS) {
  let error;
  for (let i = 0; i < max; i++) {
    try { return await fn(); }
    catch (err) {
      error = err;
      await new Promise(r => setTimeout(r, delay * (i+1)));
    }
  }
  throw error;
}

export function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
