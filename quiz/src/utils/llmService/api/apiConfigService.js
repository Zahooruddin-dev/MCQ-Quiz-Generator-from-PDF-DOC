// apiConfigService.js

import { getGlobalApiKey, getGlobalApiConfig } from '../../firebaseService.js';

/**
 * Manages the API key and endpoint configuration by fetching from Firestore
 * and caching in sessionStorage.
 */
export class ApiConfigService {
  constructor() {
    this.apiKey = sessionStorage.getItem('llm_apiKey') || null;
    this.baseUrl = sessionStorage.getItem('llm_baseUrl') || null;
    console.log('✅ ApiConfigService initialized');
  }

  /**
   * Ensures an API key is available, fetching it from Firestore if not cached.
   * @returns {Promise<string>} The API key.
   */
  async ensureApiKey() {
    if (!this.apiKey) {
      this.apiKey = sessionStorage.getItem('llm_apiKey') || (await getGlobalApiKey());
      if (!this.apiKey) {
        throw new Error('No global API key configured in Firestore.');
      }
      sessionStorage.setItem('llm_apiKey', this.apiKey);
      console.log('✅ API key loaded');
    }
    return this.apiKey;
  }

  /**
   * Ensures an API endpoint URL is available, fetching it from Firestore if not cached.
   * @returns {Promise<string>} The base URL of the API.
   */
  async ensureEndpoint() {
    const config = await getGlobalApiConfig();
    if (!config?.baseUrl) {
      throw new Error('No API endpoint configured.');
    }
    const cached = sessionStorage.getItem('llm_baseUrl');
    if (config.baseUrl !== this.baseUrl || config.baseUrl !== cached) {
      this.baseUrl = config.baseUrl;
      sessionStorage.setItem('llm_baseUrl', this.baseUrl);
      console.log(`✅ Endpoint set: ${this.baseUrl}`);
    } else if (!this.baseUrl) {
      this.baseUrl = cached;
    }
    return this.baseUrl;
  }

  /**
   * Clears the current API key from memory and session storage to force a refresh.
   */
  async refreshApiKey() {
    this.apiKey = null;
    sessionStorage.removeItem('llm_apiKey');
    return await this.ensureApiKey();
  }
}