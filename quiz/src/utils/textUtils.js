// textUtils.js - Enhanced with intelligent text processing and robust JSON extraction
import { MAX_CHARS } from './constants.js';
import { measurePerformance, memoize } from './performanceUtils.js';

// Custom text processing error class
export class TextProcessingError extends Error {
  constructor(message, code, originalText = null) {
    super(message);
    this.name = 'TextProcessingError';
    this.code = code;
    this.originalText = originalText?.slice(0, 200) + '...'; // Keep sample for debugging
  }
}

// Memoized text statistics for intelligent trimming
const calculateTextStats = memoize((text) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  
  return {
    length: text.length,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    words: words.length,
    avgSentenceLength: sentences.length > 0 ? words.length / sentences.length : 0,
    avgParagraphLength: paragraphs.length > 0 ? sentences.length / paragraphs.length : 0
  };
}, { maxSize: 100, ttl: 60000 });

// Intelligent text importance scoring
function scoreTextImportance(text, position, totalLength) {
  let score = 0;
  
  // Position scoring (beginning and end are more important)
  const relativePosition = position / totalLength;
  if (relativePosition < 0.3) score += 3; // Beginning bonus
  else if (relativePosition > 0.7) score += 2; // End bonus
  else score += 1; // Middle baseline
  
  // Content scoring
  const lowerText = text.toLowerCase();
  
  // Headers and titles
  if (/^#{1,6}\s/.test(text) || /^[A-Z][^.]*$/.test(text.trim())) score += 4;
  
  // Key phrases
  const keyPhrases = [
    'important', 'key', 'main', 'primary', 'essential', 'crucial',
    'summary', 'conclusion', 'result', 'finding', 'discovery'
  ];
  keyPhrases.forEach(phrase => {
    if (lowerText.includes(phrase)) score += 2;
  });
  
  // Lists and structured content
  if (/^\s*[-*•]\s/.test(text) || /^\s*\d+\.\s/.test(text)) score += 1;
  
  // Dense information (numbers, technical terms)
  const numberCount = (text.match(/\b\d+\.?\d*\b/g) || []).length;
  const capitalCount = (text.match(/\b[A-Z]{2,}\b/g) || []).length;
  score += Math.min(numberCount * 0.5 + capitalCount * 0.5, 3);
  
  return score;
}

// Enhanced text trimming with intelligent content preservation
export function trimForPrompt(text, maxChars = MAX_CHARS) {
  const endMeasure = measurePerformance('Text Trimming', { logToConsole: false });
  
  try {
    if (!text || typeof text !== 'string') {
      throw new TextProcessingError('Input must be a non-empty string', 'INVALID_INPUT');
    }

    const originalLength = text.length;
    
    if (originalLength <= maxChars) {
      endMeasure({ originalLength, finalLength: originalLength, method: 'no_trim' });
      return text;
    }

    const stats = calculateTextStats(text);
    
    // Strategy 1: Try intelligent paragraph selection
    if (stats.paragraphs > 3) {
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      const scoredParagraphs = paragraphs.map((para, index) => ({
        text: para,
        score: scoreTextImportance(para, index, paragraphs.length),
        length: para.length,
        index
      }));
      
      // Sort by importance score
      scoredParagraphs.sort((a, b) => b.score - a.score);
      
      let selectedText = '';
      let usedIndices = [];
      
      for (const para of scoredParagraphs) {
        if (selectedText.length + para.length + 2 <= maxChars * 0.9) {
          selectedText += para.text + '\n\n';
          usedIndices.push(para.index);
        }
      }
      
      if (selectedText.length > maxChars * 0.5) {
        // Sort selected paragraphs back to original order
        usedIndices.sort((a, b) => a - b);
        const orderedText = usedIndices
          .map(i => paragraphs[i])
          .join('\n\n') + '\n\n[CONTENT TRIMMED - SHOWING KEY SECTIONS]';
        
        endMeasure({ 
          originalLength, 
          finalLength: orderedText.length, 
          method: 'intelligent_paragraphs',
          paragraphsSelected: usedIndices.length,
          totalParagraphs: paragraphs.length
        });
        
        return orderedText;
      }
    }

    // Strategy 2: Try sentence-based trimming
    if (stats.sentences > 10) {
      const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
      const scoredSentences = sentences.map((sentence, index) => ({
        text: sentence,
        score: scoreTextImportance(sentence, index, sentences.length),
        length: sentence.length
      }));
      
      scoredSentences.sort((a, b) => b.score - a.score);
      
      let selectedText = '';
      for (const sentence of scoredSentences) {
        if (selectedText.length + sentence.length + 1 <= maxChars * 0.9) {
          selectedText += sentence.text + ' ';
        }
      }
      
      if (selectedText.length > maxChars * 0.4) {
        const finalText = selectedText.trim() + '\n\n[CONTENT TRIMMED - SHOWING KEY SENTENCES]';
        endMeasure({ 
          originalLength, 
          finalLength: finalText.length, 
          method: 'intelligent_sentences'
        });
        return finalText;
      }
    }

    // Strategy 3: Preserve beginning and end with middle truncation
    const beginningChars = Math.floor(maxChars * 0.6);
    const endingChars = Math.floor(maxChars * 0.2);
    const remainingChars = maxChars - beginningChars - endingChars - 50; // Buffer for markers
    
    if (remainingChars > 0) {
      const beginning = text.slice(0, beginningChars);
      const ending = text.slice(-endingChars);
      const finalText = beginning + '\n\n[MIDDLE CONTENT TRUNCATED]\n\n' + ending;
      
      endMeasure({ 
        originalLength, 
        finalLength: finalText.length, 
        method: 'beginning_end_preservation'
      });
      
      return finalText;
    }

    // Strategy 4: Simple beginning truncation (fallback)
    const simpleText = text.slice(0, maxChars - 30) + '\n\n[CONTENT TRUNCATED]';
    
    endMeasure({ 
      originalLength, 
      finalLength: simpleText.length, 
      method: 'simple_truncation'
    });
    
    return simpleText;

  } catch (error) {
    endMeasure({ success: false, error: error.message });
    
    if (error instanceof TextProcessingError) throw error;
    
    console.error('Text trimming error:', error);
    throw new TextProcessingError('Failed to process text', 'PROCESSING_ERROR', text);
  }
}

// Enhanced JSON extraction with multiple strategies and error recovery
export function extractJson(text, options = {}) {
  const { 
    strictMode = false, 
    allowPartial = true,
    maxAttempts = 5 
  } = options;
  
  const endMeasure = measurePerformance('JSON Extraction', { logToConsole: false });
  
  try {
    if (!text || typeof text !== 'string') {
      throw new TextProcessingError('Input must be a non-empty string', 'INVALID_INPUT');
    }

    const originalLength = text.length;
    let attempts = 0;
    let lastError = null;

    // Strategy 1: Multiple JSON pattern matching
    const jsonPatterns = [
      // Code blocks
      /```json\s*([\s\S]*?)\s*```/gi,
      /```\s*([\s\S]*?)\s*```/gi,
      
      // Object patterns (greedy and non-greedy)
      /\{[\s\S]*?\}(?=\s*$|\s*\n\s*$|\s*[^}])/g,
      /\{[\s\S]*\}/g,
      
      // Array patterns
      /\[[\s\S]*?\]/g,
      
      // Quoted JSON strings
      /"(\{[\s\S]*?\})"/g,
      /'(\{[\s\S]*?\})'/g
    ];

    for (const pattern of jsonPatterns) {
      attempts++;
      if (attempts > maxAttempts) break;
      
      pattern.lastIndex = 0; // Reset regex
      let match;
      
      while ((match = pattern.exec(text)) !== null) {
        let jsonStr = match[1] || match[0];
        
        // Clean the JSON string
        jsonStr = jsonStr
          .replace(/^\s*["'`]|["'`]\s*$/g, '') // Remove surrounding quotes
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\"/g, '"')
          .trim();

        if (!jsonStr) continue;

        try {
          const parsed = JSON.parse(jsonStr);
          const result = processJsonResult(parsed, allowPartial);
          
          if (result) {
            endMeasure({ 
              originalLength, 
              jsonLength: jsonStr.length, 
              method: `pattern_${jsonPatterns.indexOf(pattern)}`,
              attempts,
              success: true 
            });
            return result;
          }
        } catch (parseError) {
          lastError = parseError;
          
          // Strategy 2: Try to fix common JSON issues
          if (allowPartial) {
            const fixedJson = attemptJsonRepair(jsonStr);
            if (fixedJson) {
              try {
                const parsed = JSON.parse(fixedJson);
                const result = processJsonResult(parsed, allowPartial);
                if (result) {
                  endMeasure({ 
                    originalLength, 
                    jsonLength: fixedJson.length, 
                    method: 'repaired_json',
                    attempts,
                    success: true 
                  });
                  return result;
                }
              } catch (repairError) {
                lastError = repairError;
              }
            }
          }
        }
      }
    }

    // Strategy 3: Try parsing the entire text as JSON
    if (attempts < maxAttempts) {
      attempts++;
      try {
        const parsed = JSON.parse(text);
        const result = processJsonResult(parsed, allowPartial);
        if (result) {
          endMeasure({ 
            originalLength, 
            method: 'full_text_parse',
            attempts,
            success: true 
          });
          return result;
        }
      } catch (parseError) {
        lastError = parseError;
      }
    }

    // Strategy 4: Extract potential JSON segments and try parsing
    if (allowPartial && attempts < maxAttempts) {
      const segments = extractPotentialJsonSegments(text);
      
      for (const segment of segments) {
        attempts++;
        if (attempts > maxAttempts) break;
        
        try {
          const parsed = JSON.parse(segment);
          const result = processJsonResult(parsed, allowPartial);
          if (result) {
            endMeasure({ 
              originalLength, 
              jsonLength: segment.length, 
              method: 'segment_extraction',
              attempts,
              success: true 
            });
            return result;
          }
        } catch (segmentError) {
          lastError = segmentError;
        }
      }
    }

    // No valid JSON found
    endMeasure({ 
      originalLength, 
      attempts, 
      success: false, 
      error: lastError?.message 
    });

    const errorMessage = strictMode 
      ? 'No valid JSON found in response'
      : 'Could not extract valid questions from response';
    
    throw new TextProcessingError(
      errorMessage, 
      'JSON_EXTRACTION_FAILED', 
      text
    );

  } catch (error) {
    endMeasure({ success: false, error: error.message });
    
    if (error instanceof TextProcessingError) throw error;
    
    console.error('JSON extraction error:', error);
    throw new TextProcessingError(
      'Failed to extract JSON from text', 
      'EXTRACTION_ERROR', 
      text
    );
  }
}

// Process parsed JSON result and normalize it
function processJsonResult(parsed, allowPartial = true) {
  try {
    // Direct array of questions
    if (Array.isArray(parsed)) {
      if (parsed.length > 0 && isValidQuestionArray(parsed)) {
        return { questions: parsed };
      }
    }
    
    // Object with questions property
    if (parsed && typeof parsed === 'object') {
      // Look for questions in various property names
      const questionKeys = ['questions', 'items', 'data', 'quiz', 'q'];
      
      for (const key of questionKeys) {
        if (Array.isArray(parsed[key]) && parsed[key].length > 0) {
          if (isValidQuestionArray(parsed[key])) {
            return { questions: parsed[key] };
          }
        }
      }
      
      // Look for any array property that might contain questions
      for (const key in parsed) {
        if (Array.isArray(parsed[key]) && parsed[key].length > 0) {
          if (isValidQuestionArray(parsed[key])) {
            return { questions: parsed[key] };
          }
        }
      }
      
      // Single question object
      if (isValidQuestion(parsed)) {
        return { questions: [parsed] };
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Error processing JSON result:', error);
    return null;
  }
}

// Validate if an array contains valid questions
function isValidQuestionArray(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  
  // Check first few items to see if they look like questions
  const samplesToCheck = Math.min(3, arr.length);
  let validCount = 0;
  
  for (let i = 0; i < samplesToCheck; i++) {
    if (isValidQuestion(arr[i])) {
      validCount++;
    }
  }
  
  return validCount >= samplesToCheck * 0.5; // At least 50% should be valid
}

// Validate if an object looks like a question
function isValidQuestion(obj) {
  if (!obj || typeof obj !== 'object') return false;
  
  const hasQuestion = obj.question && typeof obj.question === 'string';
  const hasOptions = Array.isArray(obj.options) && obj.options.length >= 2;
  const hasCorrectAnswer = typeof obj.correctAnswer === 'number';
  
  return hasQuestion && hasOptions && hasCorrectAnswer;
}

// Attempt to repair common JSON issues
function attemptJsonRepair(jsonStr) {
  try {
    let repaired = jsonStr;
    
    // Fix common issues
    repaired = repaired
      // Fix trailing commas
      .replace(/,(\s*[}\]])/g, '$1')
      // Fix missing quotes around property names
      .replace(/(\w+):/g, '"$1":')
      // Fix single quotes to double quotes
      .replace(/'/g, '"')
      // Fix escaped quotes issues
      .replace(/\\"/g, '"')
      .replace(/""/g, '"')
      // Remove potential trailing content after JSON
      .replace(/}\s*[^}]*$/, '}')
      .replace(/]\s*[^\]]*$/, ']');
    
    // Try to balance braces and brackets
    const openBraces = (repaired.match(/\{/g) || []).length;
    const closeBraces = (repaired.match(/\}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/\]/g) || []).length;
    
    // Add missing closing braces/brackets
    if (openBraces > closeBraces) {
      repaired += '}';
    }
    if (openBrackets > closeBrackets) {
      repaired += ']';
    }
    
    // Test if the repair worked
    JSON.parse(repaired);
    return repaired;
    
  } catch (error) {
    return null;
  }
}

// Extract potential JSON segments from text
function extractPotentialJsonSegments(text) {
  const segments = [];
  
  // Look for object-like patterns
  const objectPattern = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
  let match;
  
  while ((match = objectPattern.exec(text)) !== null) {
    segments.push(match[0]);
  }
  
  // Look for array-like patterns
  const arrayPattern = /\[[^\[\]]*(?:\[[^\[\]]*\][^\[\]]*)*\]/g;
  arrayPattern.lastIndex = 0;
  
  while ((match = arrayPattern.exec(text)) !== null) {
    segments.push(match[0]);
  }
  
  return segments;
}

// Utility function to clean and normalize text
export function normalizeText(text, options = {}) {
  const {
    removeExtraWhitespace = true,
    normalizeLineBreaks = true,
    removeEmptyLines = false,
    trimLines = true
  } = options;
  
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  let normalized = text;
  
  if (normalizeLineBreaks) {
    normalized = normalized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }
  
  if (removeExtraWhitespace) {
    normalized = normalized.replace(/[ \t]+/g, ' ');
  }
  
  if (trimLines) {
    normalized = normalized
      .split('\n')
      .map(line => line.trim())
      .join('\n');
  }
  
  if (removeEmptyLines) {
    normalized = normalized
      .split('\n')
      .filter(line => line.length > 0)
      .join('\n');
  }
  
  return normalized.trim();
}

// Utility function to estimate reading time
export function estimateReadingTime(text) {
  if (!text || typeof text !== 'string') return 0;
  
  const wordsPerMinute = 200; // Average reading speed
  const words = text.split(/\s+/).filter(word => word.length > 0).length;
  
  return Math.ceil(words / wordsPerMinute);
}

// Utility function to extract key phrases from text
export const extractKeyPhrases = memoize((text, maxPhrases = 10) => {
  if (!text || typeof text !== 'string') return [];
  
  // Simple keyword extraction based on frequency and position
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !commonWords.includes(word));
  
  const wordFreq = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  
  return Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, maxPhrases)
    .map(([word]) => word);
}, { maxSize: 50, ttl: 300000 });

// Common words to filter out
const commonWords = [
  'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
  'after', 'above', 'below', 'between', 'among', 'this', 'that', 'these',
  'those', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have',
  'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'
];

export { TextProcessingError };