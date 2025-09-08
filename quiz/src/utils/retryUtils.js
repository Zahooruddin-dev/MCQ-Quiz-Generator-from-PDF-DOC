// retryUtils.js
import { MAX_RETRIES, RETRY_DELAY_MS } from './constants.js';

export async function withRetry(fn, maxRetries = MAX_RETRIES, delay = RETRY_DELAY_MS) {
	let lastError;
	for (let i = 0; i < maxRetries; i++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;
			if (
				error.message.includes('Empty LLM response') ||
				error.message.includes('Unsupported file type') ||
				error.message.includes('image-based')
			)
				throw error;
			if (i < maxRetries - 1)
				await new Promise((res) => setTimeout(res, delay * Math.pow(2, i)));
		}
	}
	throw lastError;
}