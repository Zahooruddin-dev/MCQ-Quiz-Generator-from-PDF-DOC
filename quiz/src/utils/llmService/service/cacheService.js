// cacheService.js

/**
 * Service for managing a simple in-memory response cache and generating cache keys.
 */
export class CacheService {
    static responseCache = new Map();

    /**
     * Generates a unique cache key based on content and options.
     * @param {string} content The source text content.
     * @param {object} options The quiz generation options.
     * @returns {string} A unique cache key.
     */
    static generateCacheKey(content, options) {
        try {
            const shortContent = content.slice(0, 200);
            const optionsStr = JSON.stringify(options || {});
            let hash = 0;
            const combined = shortContent + optionsStr;
            for (let i = 0; i < Math.min(combined.length, 1000); i++) {
                hash = ((hash << 5) - hash + combined.charCodeAt(i)) | 0;
            }
            return `quiz_${Math.abs(hash).toString(36)}_${Date.now().toString(36).slice(-6)}`;
        } catch (err) {
            console.error('❌ Cache key generation failed', err);
            return `quiz_fallback_${Date.now().toString(36)}`;
        }
    }

    /**
     * Retrieves a value from the cache.
     * @param {string} key The cache key.
     * @returns {*} The cached value, or undefined.
     */
    static get(key) {
        return this.responseCache.get(key);
    }

    /**
     * Sets a value in the cache.
     * @param {string} key The cache key.
     * @param {*} value The value to cache.
     */
    static set(key, value) {
        this.responseCache.set(key, value);
    }
}