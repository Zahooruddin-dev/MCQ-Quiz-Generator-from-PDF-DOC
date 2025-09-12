// Enhanced LLMService.js - Professional Quiz Generation System
import { REQUEST_TIMEOUT_MS } from './constants.js';
import {
  detectLanguage,
  getLanguagePrompt,
  analyzeContext,
  validateQuestionQuality
} from './languageUtils.js';
import { trimForPrompt, extractJson } from './textUtils.js';
import { readFileContent } from './fileReader.js';
import {
  saveQuizResults,
  getDashboardData,
  saveChatMessage,
  getGlobalApiKey,
  getGlobalApiConfig,
} from './firebaseService.js';
import { withRetry } from './retryUtils.js';
import { shuffleArray, validateQuestions } from './quizValidator.js';

export class LLMService {
  static instance = null;
  static responseCache = new Map();

  constructor() {
    // Preload from sessionStorage for faster startup
    this.baseUrl = sessionStorage.getItem('llm_baseUrl') || null;
    this.apiKey = sessionStorage.getItem('llm_apiKey') || null;
    this.language = 'en';
    this.controller = null;
    this.lastRequestTime = 0;
    this.minRequestInterval = 1000; // Minimum 1 second between requests
    
    console.log('✅ Enhanced LLMService initialized with professional quiz generation');
  }

  static async preloadApiConfig() {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    await LLMService.instance.ensureApiKey();
    await LLMService.instance.ensureEndpoint();
    console.log('🚀 LLMService preloaded with enhanced capabilities');
  }

  async ensureApiKey() {
    if (!this.apiKey) {
      this.apiKey = sessionStorage.getItem('llm_apiKey') || (await getGlobalApiKey());
      if (!this.apiKey) throw new Error('No global API key configured in Firestore.');
      sessionStorage.setItem('llm_apiKey', this.apiKey);
      console.log('✅ API key loaded successfully');
    }
    return this.apiKey;
  }

  async ensureEndpoint() {
    if (!this.baseUrl) {
      const config = await getGlobalApiConfig();
      if (!config?.baseUrl) throw new Error('No API endpoint (baseUrl) configured in Firestore.');
      this.baseUrl = config.baseUrl;
      sessionStorage.setItem('llm_baseUrl', this.baseUrl);
      console.log(`✅ Dynamic endpoint loaded: ${this.baseUrl}`);
    }
    return this.baseUrl;
  }

  async refreshApiKey() {
    this.apiKey = null;
    sessionStorage.removeItem('llm_apiKey');
    const newKey = await this.ensureApiKey();
    console.log('🔄 API key refreshed');
    return newKey;
  }

  // Rate limiting to prevent overwhelming the API
  async rateLimitedRequest(requestFn) {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
    return await requestFn();
  }

  // Enhanced quiz generation with quality validation and retry logic
  async generateQuizQuestions(fileOrText, options = {}) {
    const { numQuestions = 10, difficulty = 'medium', retryCount = 0 } = options;
    const maxRetries = 2;

    await this.ensureApiKey();
    await this.ensureEndpoint();

    console.log(`🚀 Starting enhanced quiz generation (attempt ${retryCount + 1}/${maxRetries + 1})`);

    return withRetry(async () => {
      if (this.controller) this.controller.abort();
      this.controller = new AbortController();

      try {
        // Step 1: Extract and validate content
        const sourceText = typeof fileOrText === 'string' 
          ? fileOrText 
          : await this.readFileContent(fileOrText);

        if (!sourceText?.trim() || sourceText.trim().length < 100) {
          throw new Error('Content is too short for meaningful quiz generation. Please provide at least 100 characters.');
        }

        // Step 2: Check cache for identical requests
        const cacheKey = LLMService.generateCacheKey(sourceText, options);
        if (LLMService.responseCache.has(cacheKey)) {
          console.log('📋 Using cached high-quality quiz questions');
          return LLMService.responseCache.get(cacheKey);
        }

        // Step 3: Advanced content analysis
        this.language = detectLanguage(sourceText);
        const contextAnalysis = analyzeContext(sourceText);
        
        console.log(`🔍 Content Analysis:`, {
          language: this.language,
          type: contextAnalysis.type,
          complexity: contextAnalysis.complexity,
          topics: contextAnalysis.topics,
          structure: contextAnalysis.structure
        });

        // Step 4: Prepare optimized content for AI
        const optimizedText = this.preprocessContent(sourceText, contextAnalysis);
        const enhancedPrompt = this.buildEnhancedPrompt(
          this.language, 
          numQuestions, 
          difficulty, 
          contextAnalysis, 
          optimizedText
        );

        // Step 5: Make API request with rate limiting
        const questions = await this.rateLimitedRequest(() => 
          this._makeApiRequest(enhancedPrompt, this.controller.signal)
        );

        // Step 6: Validate and process questions
        const processedQuestions = this._processQuestions(questions, numQuestions);
        const qualityValidation = validateQuestionQuality(processedQuestions);

        console.log(`📊 Quality Score: ${qualityValidation.score}/100`, qualityValidation.summary);

        // Step 7: Retry if quality is too low (only on first attempts)
        if (qualityValidation.score < 70 && retryCount < maxRetries) {
          console.log(`🔄 Quality too low (${qualityValidation.score}), retrying with enhanced prompts...`);
          return this.generateQuizQuestions(fileOrText, { 
            ...options, 
            retryCount: retryCount + 1,
            qualityIssues: qualityValidation.issues 
          });
        }

        // Step 8: Cache and return results
        if (qualityValidation.score >= 70) {
          LLMService.responseCache.set(cacheKey, processedQuestions);
          console.log('✅ High-quality quiz questions generated and cached');
        } else {
          console.warn(`⚠️ Generated questions with low quality score: ${qualityValidation.score}`);
        }

        return {
          questions: processedQuestions,
          metadata: {
            qualityScore: qualityValidation.score,
            contentAnalysis: contextAnalysis,
            language: this.language,
            issues: qualityValidation.issues.length > 0 ? qualityValidation.issues : undefined
          }
        };

      } catch (error) {
        if (error?.name === 'AbortError') {
          throw new Error('Request cancelled by user.');
        }

        // Handle API key issues
        if (error.message?.includes('API key') || 
            error.message?.includes('401') || 
            error.message?.includes('403')) {
          try {
            await this.refreshApiKey();
            console.log('🔄 API key refreshed, retrying...');
            if (retryCount < maxRetries) {
              return this.generateQuizQuestions(fileOrText, { ...options, retryCount: retryCount + 1 });
            }
          } catch (keyError) {
            console.error('❌ Failed to refresh API key:', keyError);
          }
        }

        console.error('❌ Quiz generation error:', error);
        throw new Error(`Quiz generation failed: ${error.message}`);
      }
    });
  }

  // Preprocess content for better AI understanding
  preprocessContent(content, contextAnalysis) {
    // Remove excessive whitespace and normalize
    let processed = content.replace(/\s+/g, ' ').trim();
    
    // For very long content, use intelligent truncation
    const maxLength = 4000; // Optimal length for context window
    if (processed.length > maxLength) {
      // Try to truncate at sentence boundaries
      const sentences = processed.split(/[.!?]+/);
      let truncated = '';
      
      for (const sentence of sentences) {
        if ((truncated + sentence).length > maxLength) break;
        truncated += sentence + '. ';
      }
      
      processed = truncated || processed.substring(0, maxLength);
      console.log(`📝 Content intelligently truncated from ${content.length} to ${processed.length} characters`);
    }
    
    return processed;
  }

  // Build enhanced prompt with quality improvements
  buildEnhancedPrompt(language, numQuestions, difficulty, contextAnalysis, content) {
    const basePrompt = getLanguagePrompt(language, numQuestions, difficulty, contextAnalysis);
    
    // Add quality enhancement instructions
    const qualityEnhancements = `
QUALITY ENHANCEMENT INSTRUCTIONS:
- Every question must be a complete, standalone assessment
- Include specific names, dates, numbers, and concrete details from the content
- Test understanding of relationships, causes, and effects, not just isolated facts
- Make incorrect options represent logical but wrong thinking patterns
- Ensure questions test different cognitive levels: recall, comprehension, application, analysis

CONTENT-SPECIFIC GUIDANCE:
${this.generateContentSpecificGuidance(contextAnalysis)}

VALIDATION CHECKLIST (verify each question):
✓ Can be answered without seeing the original document?
✓ Contains specific, concrete details?
✓ Tests meaningful understanding?
✓ Has four clearly distinct options?
✓ Includes educational explanation?

REMEMBER: Teachers need questions they can use confidently in their classrooms. Make each question professional-grade.`;

    return `${basePrompt}\n${qualityEnhancements}\n\nSOURCE CONTENT:\n${content}`;
  }

  generateContentSpecificGuidance(contextAnalysis) {
    const guidance = [];
    
    if (contextAnalysis.topics.includes('academic')) {
      guidance.push("Focus on research methodologies, findings, and theoretical implications");
    }
    if (contextAnalysis.topics.includes('scientific')) {
      guidance.push("Test understanding of processes, cause-effect relationships, and scientific principles");
    }
    if (contextAnalysis.topics.includes('historical')) {
      guidance.push("Emphasize chronology, causation, and historical significance");
    }
    if (contextAnalysis.topics.includes('mathematical')) {
      guidance.push("Test conceptual understanding and problem-solving approaches");
    }
    if (contextAnalysis.topics.includes('literary')) {
      guidance.push("Focus on theme analysis, character development, and literary techniques");
    }
    
    if (contextAnalysis.complexity === 'high') {
      guidance.push("Create sophisticated questions that require synthesis and evaluation");
    } else if (contextAnalysis.complexity === 'low') {
      guidance.push("Focus on comprehension and basic application");
    }
    
    return guidance.length > 0 ? guidance.join('\n- ') : "Create well-structured questions appropriate for the content level";
  }

  async _makeApiRequest(prompt, signal) {
    const apiKey = await this.ensureApiKey();
    await this.ensureEndpoint();

    const timeout = setTimeout(() => this.controller?.abort(), REQUEST_TIMEOUT_MS);

    try {
      console.log(`🔧 Making enhanced API request to: ${this.baseUrl}`);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4, // Slightly higher for creativity in distractors
            maxOutputTokens: 8192,
            topP: 0.85, // Better balance for educational content
            topK: 30, // More focused responses
            candidateCount: 1
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401 || response.status === 403) {
          this.apiKey = null;
          sessionStorage.removeItem('llm_apiKey');
        }

        throw new Error(
          `API request failed: ${response.status} - ${
            errorData.error?.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!rawText) {
        throw new Error('Empty response from AI model. Please try again.');
      }

      console.log(`📥 Received ${rawText.length} characters from AI model`);
      
      const extractedData = extractJson(rawText);
      const questions = extractedData?.questions || [];
      
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('AI model did not return valid questions. Please try again.');
      }

      return questions;
    } finally {
      clearTimeout(timeout);
    }
  }

  _processQuestions(questions, numQuestions) {
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('No valid questions received from AI model.');
    }

    console.log(`🔧 Processing ${questions.length} questions (requested: ${numQuestions})`);
    
    return questions
      .slice(0, numQuestions)
      .map((q, index) => this._processQuestion(q, index))
      .filter(q => q !== null); // Remove any invalid questions
  }

  _processQuestion(q, index) {
    try {
      // Validate required fields
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
        console.warn(`⚠️ Skipping invalid question ${index + 1}: missing required fields`);
        return null;
      }

      // Clean and validate options
      const cleanOptions = this._cleanAndValidateOptions(q.options, index);
      if (!cleanOptions) return null;

      // Validate correct answer index
      const correctIndex = parseInt(q.correctAnswer);
      if (isNaN(correctIndex) || correctIndex < 0 || correctIndex >= 4) {
        console.warn(`⚠️ Invalid correct answer index for question ${index + 1}: ${q.correctAnswer}`);
        return null;
      }

      const correctOption = cleanOptions[correctIndex];
      const shuffledOptions = this.shuffleArray([...cleanOptions]);
      const newCorrectIndex = shuffledOptions.indexOf(correctOption);

      return {
        question: this._cleanQuestion(q.question),
        options: shuffledOptions,
        correctAnswer: newCorrectIndex,
        explanation: this._cleanExplanation(q.explanation),
        context: this._cleanContext(q.context),
        language: this.language,
        cognitive_level: q.cognitive_level || 'medium',
        question_type: q.question_type || 'conceptual',
        metadata: {
          originalIndex: index,
          processingTime: new Date().toISOString()
        }
      };
    } catch (error) {
      console.warn(`⚠️ Error processing question ${index + 1}:`, error);
      return null;
    }
  }

  _cleanQuestion(question) {
    return question
      .toString()
      .trim()
      .replace(/\s+/g, ' ')
      // Remove any remaining references to source
      .replace(/\b(according to|as per|as mentioned in) (the|this) (text|passage|document|article)\b/gi, '')
      .replace(/\b(the above|aforementioned|previously mentioned)\b/gi, '')
      .trim();
  }

  _cleanAndValidateOptions(options, index) {
    try {
      const cleanOptions = options.map(opt => 
        opt.toString().trim().replace(/\s+/g, ' ')
      ).filter(opt => opt.length > 0);

      if (cleanOptions.length !== 4) {
        console.warn(`⚠️ Question ${index + 1} does not have exactly 4 valid options`);
        return null;
      }

      // Check for duplicates
      const uniqueOptions = [...new Set(cleanOptions.map(opt => opt.toLowerCase()))];
      if (uniqueOptions.length !== 4) {
        console.warn(`⚠️ Question ${index + 1} has duplicate or very similar options`);
        return null;
      }

      return cleanOptions;
    } catch (error) {
      console.warn(`⚠️ Error cleaning options for question ${index + 1}:`, error);
      return null;
    }
  }

  _cleanExplanation(explanation) {
    if (!explanation) return 'No explanation provided.';
    
    return explanation
      .toString()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\b(the passage states|according to the text|the document mentions)\b/gi, '');
  }

  _cleanContext(context) {
    if (!context) return 'Supporting information available in source material.';
    
    return context
      .toString()
      .trim()
      .substring(0, 150) // Ensure it stays within limit
      .replace(/\s+/g, ' ');
  }

  static generateCacheKey(content, options) {
    try {
      const contentHash = content.slice(0, 200) + content.slice(-100); // First 200 + last 100 chars
      const combined = contentHash + JSON.stringify(options);
      
      // Use TextEncoder to handle Unicode characters safely
      const encoder = new TextEncoder();
      const data = encoder.encode(combined);
      
      // Create a simple hash from the encoded data
      let hash = 0;
      for (let i = 0; i < Math.min(data.length, 1000); i++) {
        hash = ((hash << 5) - hash + data[i]) & 0xffffffff;
      }
      
      // Convert to positive number and base36 for compact representation
      const hashStr = Math.abs(hash).toString(36);
      return `quiz_${hashStr}_${Date.now().toString(36).slice(-4)}`;
      
    } catch (error) {
      console.warn('⚠️ Cache key generation fallback used:', error);
      // Fallback: use content length and timestamp
      return `quiz_fallback_${content.length}_${Date.now().toString(36)}`;
    }
  }

  // Utility methods (maintained for compatibility)
  async saveQuizResults(quizData) {
    return saveQuizResults(quizData);
  }

  async getDashboardData() {
    return getDashboardData();
  }

  async saveChatMessage(message, isUserMessage = true) {
    return saveChatMessage(message, isUserMessage);
  }

  async readFileContent(file) {
    return withRetry(async () => readFileContent(file));
  }

  shuffleArray(array) {
    return shuffleArray(array);
  }

  validateQuestions(questions) {
    return validateQuestions(questions);
  }

  // Quick generation method for faster results
  async generateQuizQuestionsFast(fileOrText, options = {}) {
    console.log('⚡ Using fast generation mode for quicker results');
    return this.generateQuizQuestions(fileOrText, { ...options, fastMode: true });
  }

  // Method to get service statistics
  getServiceStats() {
    return {
      cacheSize: LLMService.responseCache.size,
      lastRequestTime: this.lastRequestTime,
      hasApiKey: !!this.apiKey,
      hasEndpoint: !!this.baseUrl,
      currentLanguage: this.language
    };
  }

  // Clear cache (useful for testing or memory management)
  clearCache() {
    LLMService.responseCache.clear();
    console.log('🧹 Response cache cleared');
  }
}