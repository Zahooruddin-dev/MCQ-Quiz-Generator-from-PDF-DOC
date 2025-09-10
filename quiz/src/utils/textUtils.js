// textUtils.js
import { MAX_CHARS } from './constants.js';

export function trimForPrompt(text) {
	if (!text) return '';
	if (text.length <= MAX_CHARS) return text;
	const paragraphs = text.split(/\n\s*\n/);
	let trimmedText = '';
	for (const paragraph of paragraphs) {
		if ((trimmedText + paragraph).length <= MAX_CHARS) {
			trimmedText += paragraph + '\n\n';
		} else break;
	}
	return trimmedText.length > 0
		? trimmedText + '\n\n[CONTENT TRUNCATED]'
		: text.slice(0, MAX_CHARS) + '\n\n[CONTENT TRUNCATED]';
}

export function extractJson(text) {
	if (!text) throw new Error('Empty LLM response');
	const jsonPatterns = [
		/```json\s*([\s\S]*?)\s*```/,
		/```\s*([\s\S]*?)\s*```/,
		/\{[\s\S]*\}/,
		/\[[\s\S]*\]/,
	];
	for (const pattern of jsonPatterns) {
		const match = text.match(pattern);
		if (match) {
			try {
				const jsonStr = match[1] || match[0];
				const parsed = JSON.parse(jsonStr);
				if (Array.isArray(parsed)) return { questions: parsed };
				if (parsed.questions && Array.isArray(parsed.questions)) return parsed;
				for (const key in parsed)
					if (Array.isArray(parsed[key])) return { questions: parsed[key] };
			} catch {
				continue;
			}
		}
	}
	try {
		const parsed = JSON.parse(text);
		if (Array.isArray(parsed)) return { questions: parsed };
		if (parsed.questions && Array.isArray(parsed.questions)) return parsed;
	} catch {
		throw new Error('No valid JSON found in LLM response');
	}
	throw new Error('No valid JSON found in LLM response');
}