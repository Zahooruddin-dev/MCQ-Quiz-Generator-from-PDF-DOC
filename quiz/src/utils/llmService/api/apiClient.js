// apiClient.js
import { REQUEST_TIMEOUT_MS } from '../../constants.js';

export class ApiClient {
    constructor(baseUrl, apiKey) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.controller = null;
    }

    /**
     * Makes a POST request to the LLM API with the given prompt.
     * @param {string} prompt The text prompt for the LLM.
     * @returns {Promise<string>} The raw text response from the API.
     */
    async makeRequest(prompt) {
        if (this.controller) {
            try { this.controller.abort(); } catch (e) { /* ignore */ }
        }
        this.controller = new AbortController();
        const signal = this.controller.signal;
        const timeout = setTimeout(() => this.controller?.abort(), REQUEST_TIMEOUT_MS);

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': this.apiKey,
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.15,
                        maxOutputTokens: 8192,
                        topP: 0.9,
                        topK: 40,
                    },
                }),
                signal,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                // Note: The logic for refreshing the key needs to be handled by the caller (LLMService)
                // because it has access to the ApiConfigService instance.
                throw new Error(`API failed: ${response.status} - ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            if (!rawText) throw new Error('Empty response from LLM');
            return rawText;
        } finally {
            clearTimeout(timeout);
        }
    }
}