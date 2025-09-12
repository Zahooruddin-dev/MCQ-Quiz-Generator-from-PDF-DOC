// textUtils.js
import { MAX_CHARS } from './constants.js';

export function trimForPrompt(text) {
	if (!text) return '';
	if (text.length <= MAX_CHARS) return text;
	
	// Split into sentences for better context preservation
	const sentences = text.match(/[^.!?]*[.!?]+/g) || [text];
	let trimmedText = '';
	
	for (const sentence of sentences) {
		if ((trimmedText + sentence).length <= MAX_CHARS) {
			trimmedText += sentence + ' ';
		} else break;
	}
	
	return trimmedText.length > 0
		? trimmedText.trim() + '\n\n[CONTENT TRUNCATED FOR LENGTH]'
		: text.slice(0, MAX_CHARS) + '\n\n[CONTENT TRUNCATED FOR LENGTH]';
}

// Extract key facts and concepts from text for better MCQ generation
export function extractKeyFacts(text) {
	if (!text) return [];
	
	// Find sentences with numbers, dates, names, and key concepts
	const sentences = text.match(/[^.!?]*[.!?]+/g) || [];
	const keyFacts = [];
	
	sentences.forEach(sentence => {
		const s = sentence.trim();
		if (s.length < 20) return; // Too short
		
		// Look for sentences with specific information
		if (
			/\b\d{4}\b/.test(s) || // Years
			/\b\d+(\.\d+)?%/.test(s) || // Percentages
			/\$\d+/.test(s) || // Money
			/\b[A-Z][a-z]+ [A-Z][a-z]+\b/.test(s) || // Proper names
			/\b(is|was|are|were)\b.*\b(the|a|an)\b/.test(s) || // Definitions
			/\b(because|since|due to|resulted|caused)\b/.test(s) || // Cause-effect
			/\b(first|second|third|finally|next|then)\b/.test(s) // Sequence
		) {
			keyFacts.push(s);
		}
	});
	
	return keyFacts.slice(0, 10); // Return top 10
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