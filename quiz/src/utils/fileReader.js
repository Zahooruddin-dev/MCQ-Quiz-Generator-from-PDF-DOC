// Enhanced Production-Grade fileReader.js with OCR and multi-language improvements
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { MAX_CHARS } from './constants.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

// Error types for better error handling
export const FILE_ERROR_TYPES = {
  UNSUPPORTED_TYPE: 'UNSUPPORTED_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  CORRUPTED_FILE: 'CORRUPTED_FILE',
  OCR_FAILED: 'OCR_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  PROCESSING_FAILED: 'PROCESSING_FAILED',
  EMPTY_CONTENT: 'EMPTY_CONTENT',
  PASSWORD_PROTECTED: 'PASSWORD_PROTECTED',
  LANGUAGE_NOT_SUPPORTED: 'LANGUAGE_NOT_SUPPORTED'
};

// OCR Language support mapping
export const OCR_LANGUAGE_MAPPING = {
  'ara': 'ara', // Arabic
  'chi_sim': 'chs', // Chinese Simplified
  'chi_tra': 'cht', // Chinese Traditional
  'fre': 'fre', // French
  'ger': 'ger', // German
  'hin': 'hin', // Hindi
  'ita': 'ita', // Italian
  'jpn': 'jpn', // Japanese
  'kor': 'kor', // Korean
  'por': 'por', // Portuguese
  'rus': 'rus', // Russian
  'spa': 'spa', // Spanish
  'eng': 'eng'  // English (default)
};

// Custom error class with user-friendly messages
class FileProcessingError extends Error {
  constructor(type, message, technicalDetails = null) {
    super(message);
    this.type = type;
    this.technicalDetails = technicalDetails;
    this.name = 'FileProcessingError';
  }

  getUserMessage() {
    switch (this.type) {
      case FILE_ERROR_TYPES.UNSUPPORTED_TYPE:
        return 'This file type is not supported. Please upload a PDF, DOCX, TXT, HTML, or image file.';
      case FILE_ERROR_TYPES.FILE_TOO_LARGE:
        return 'File is too large. Please upload a file smaller than 50MB.';
      case FILE_ERROR_TYPES.CORRUPTED_FILE:
        return 'This file appears to be corrupted or damaged. Please try uploading a different file.';
      case FILE_ERROR_TYPES.OCR_FAILED:
        return 'Could not extract text from this image-based document. The image quality may be too low or the text too unclear.';
      case FILE_ERROR_TYPES.NETWORK_ERROR:
        return 'Network error occurred while processing the file. Please check your connection and try again.';
      case FILE_ERROR_TYPES.PROCESSING_FAILED:
        return 'Failed to process this file. It may be corrupted or in an unexpected format.';
      case FILE_ERROR_TYPES.EMPTY_CONTENT:
        return 'No readable text was found in this file. Please ensure the document contains text content.';
      case FILE_ERROR_TYPES.PASSWORD_PROTECTED:
        return 'This document is password protected. Please provide an unprotected version.';
      case FILE_ERROR_TYPES.LANGUAGE_NOT_SUPPORTED:
        return 'The language in this document is not fully supported. Please try with an English document or contact support.';
      default:
        return 'An unexpected error occurred while processing the file.';
    }
  }
}

// Progress callback type for better UX
export class ProcessingProgress {
  constructor(onProgress) {
    this.onProgress = onProgress || (() => {});
  }

  update(stage, progress, message) {
    this.onProgress({ stage, progress, message });
  }
}

// Enhanced OCR with better language support and fallbacks
async function performAdvancedOCR(arrayBuffer, filename, progress) {
  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    throw new FileProcessingError(
      FILE_ERROR_TYPES.CORRUPTED_FILE,
      'No file data available for OCR processing'
    );
  }

  progress.update('ocr', 5, 'Preparing image for text extraction...');
  console.log(`Starting OCR with ${arrayBuffer.byteLength} bytes for ${filename}`);

  // Detect language from filename for initial strategy
  const detectedLanguage = detectDocumentLanguage('', filename);
  const ocrLanguageCode = OCR_LANGUAGE_MAPPING[detectedLanguage] || 'eng';
  
  const ocrStrategies = [
    { 
      name: 'Standard OCR', 
      language: ocrLanguageCode, 
      overlay: false, 
      description: `Using standard text recognition (${detectedLanguage})`,
      engine: 2
    },
    { 
      name: 'Enhanced OCR', 
      language: ocrLanguageCode, 
      overlay: true, 
      description: `Using enhanced recognition with overlay detection (${detectedLanguage})`,
      engine: 2
    },
    { 
      name: 'Auto-detect OCR', 
      language: 'auto', 
      overlay: false, 
      description: 'Using automatic language detection',
      engine: 1
    },
    { 
      name: 'Fallback OCR', 
      language: 'eng', 
      overlay: false, 
      description: 'Using English fallback recognition',
      engine: 2
    }
  ];

  for (let i = 0; i < ocrStrategies.length; i++) {
    const strategy = ocrStrategies[i];
    const baseProgress = 10 + (i / ocrStrategies.length) * 80;
    
    progress.update('ocr', baseProgress, strategy.description, {
      confidence: null
    });

    try {
      const result = await attemptOCRWithStrategy(arrayBuffer, filename, strategy, (subProgress) => {
        progress.update('ocr', baseProgress + (subProgress * 0.8 / ocrStrategies.length), 
          strategy.description, {
            confidence: subProgress > 50 ? 75 + (subProgress - 50) : null
          }
        );
      });
      
      if (result && result.length > 50) {
        const wordCount = result.split(/\s+/).filter(w => w.length > 0).length;
        const finalLanguage = detectDocumentLanguage(result, filename);
        
        progress.update('ocr', 100, 
          `Successfully extracted ${wordCount} words from ${filename} (detected: ${finalLanguage})`, {
            confidence: 85
          }
        );
        return result;
      }
    } catch (error) {
      console.warn(`OCR strategy ${i + 1} failed:`, error.message);
      if (i === ocrStrategies.length - 1) {
        // Last strategy failed
        throw new FileProcessingError(
          FILE_ERROR_TYPES.OCR_FAILED,
          'Could not extract readable text from this image. The image may be too blurry, have low contrast, or the text may be too small to read.'
        );
      }
      // Try next strategy
      progress.update('ocr', baseProgress + 20, 
        `${strategy.description} failed, trying alternative method...`);
    }
  }

  throw new FileProcessingError(
    FILE_ERROR_TYPES.OCR_FAILED,
    'All text extraction methods failed. Please try with a higher quality image or a different file format.'
  );
}

// Enhanced OCR strategy with better error handling and language support
async function attemptOCRWithStrategy(arrayBuffer, filename, strategy, progressCallback = null) {
  try {
    // Validate arrayBuffer before creating blob
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error('Empty or invalid file data provided to OCR');
    }

    console.log(`OCR attempt: ${filename} (${arrayBuffer.byteLength} bytes), language: ${strategy.language}`);
    if (progressCallback) progressCallback(10);

    // Determine proper MIME type based on file extension
    let mimeType = 'application/octet-stream';
    const ext = filename.toLowerCase().split('.').pop();
    
    const mimeTypes = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'tif': 'image/tiff',
      'tiff': 'image/tiff',
      'bmp': 'image/bmp',
      'gif': 'image/gif',
      'webp': 'image/webp'
    };
    
    mimeType = mimeTypes[ext] || mimeType;

    const formData = new FormData();
    
    // Create blob with proper validation
    const blob = new Blob([arrayBuffer], { type: mimeType });
    
    // Verify blob was created successfully
    if (blob.size === 0) {
      throw new Error(`Failed to create blob from arrayBuffer. Original: ${arrayBuffer.byteLength} bytes, Blob: ${blob.size} bytes`);
    }
    
    console.log(`Created blob: ${blob.size} bytes (${mimeType})`);
    if (progressCallback) progressCallback(30);
    
    formData.append('file', blob, filename);
    formData.append('language', strategy.language);
    formData.append('isOverlayRequired', strategy.overlay.toString());
    formData.append('iscreatesearchablepdf', 'false');
    formData.append('scale', 'true');
    formData.append('OCREngine', strategy.engine.toString());
    
    if (progressCallback) progressCallback(40);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // Increased to 45s for large files
    
    try {
      if (progressCallback) progressCallback(50);
      
      // Use multiple OCR endpoints for fallback
      const endpoints = [
        'https://api.ocr.space/parse/image',
        'https://apipro1.ocr.space/parse/image',
        'https://apipro2.ocr.space/parse/image'
      ];
      
      let response;
      let lastError;
      
      // Try multiple endpoints
      for (const endpoint of endpoints) {
        try {
          response = await fetch(endpoint, {
            method: 'POST',
            headers: { 
              apikey: 'K81988334688957'
            },
            body: formData,
            signal: controller.signal
          });
          break; // Success, break out of loop
        } catch (err) {
          lastError = err;
          console.warn(`OCR endpoint ${endpoint} failed, trying next...`);
          continue;
        }
      }
      
      if (!response) {
        throw lastError || new Error('All OCR endpoints failed');
      }
      
      clearTimeout(timeoutId);
      if (progressCallback) progressCallback(80);
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new FileProcessingError(
            FILE_ERROR_TYPES.NETWORK_ERROR,
            'OCR service rate limit exceeded. Please try again later.'
          );
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('OCR Response received:', data);
      
      if (data.IsErroredOnProcessing) {
        // Check if it's a language support error
        if (data.ErrorMessage && data.ErrorMessage.includes('language')) {
          throw new FileProcessingError(
            FILE_ERROR_TYPES.LANGUAGE_NOT_SUPPORTED,
            'OCR language not supported'
          );
        }
        throw new Error(data.ErrorMessage || 'OCR processing failed');
      }
      
      if (!data.ParsedResults || data.ParsedResults.length === 0) {
        throw new Error('No text extraction results returned');
      }
      
      if (progressCallback) progressCallback(90);
      
      let extractedText = '';
      for (const result of data.ParsedResults) {
        if (result.ParsedText) {
          extractedText += result.ParsedText + '\n\n';
        }
      }
      
      if (progressCallback) progressCallback(100);
      return cleanAndValidateText(extractedText);
      
    } finally {
      clearTimeout(timeoutId);
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new FileProcessingError(
        FILE_ERROR_TYPES.NETWORK_ERROR,
        'OCR request timed out. The file may be too large or complex.'
      );
    }
    throw error;
  }
}

// Enhanced language detection with more languages
function detectDocumentLanguage(text, filename = '') {
  if (!text || text.length < 100) {
    // Use filename hints if text is insufficient
    const filenameLower = filename.toLowerCase();
    const languageHints = {
      'spanish': 'spa', 'español': 'spa', 'espanol': 'spa',
      'french': 'fre', 'français': 'fre', 'francais': 'fre',
      'german': 'ger', 'deutsch': 'ger',
      'italian': 'ita', 'italiano': 'ita',
      'portuguese': 'por', 'português': 'por', 'portugues': 'por',
      'russian': 'rus', 'русский': 'rus',
      'chinese': 'chi_sim', '中文': 'chi_sim',
      'japanese': 'jpn', '日本語': 'jpn',
      'korean': 'kor', '한국어': 'kor',
      'arabic': 'ara', 'العربية': 'ara',
      'hindi': 'hin', 'हिन्दी': 'hin'
    };
    
    for (const [hint, code] of Object.entries(languageHints)) {
      if (filenameLower.includes(hint)) return code;
    }
    
    return 'eng'; // Default fallback
  }

  // Enhanced language patterns with better thresholds
  const languagePatterns = {
    // Asian languages
    'chi_sim': { pattern: /[\u4E00-\u9FFF]/g, threshold: 0.05 }, // Chinese
    'jpn': { 
      pattern: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, // Hiragana, Katakana, Kanji
      threshold: 0.05 
    },
    'kor': { pattern: /[\uAC00-\uD7AF]/g, threshold: 0.05 }, // Hangul
    'ara': { pattern: /[\u0600-\u06FF]/g, threshold: 0.1 }, // Arabic
    'hin': { pattern: /[\u0900-\u097F]/g, threshold: 0.1 }, // Devanagari (Hindi)
    
    // European languages with diacritics
    'spa': { pattern: /[ñáéíóúü¡¿]/gi, threshold: 0.03 },
    'fre': { pattern: /[àâäçéèêëîïôûùüÿœæ]/gi, threshold: 0.03 },
    'ger': { pattern: /[äöüß]/gi, threshold: 0.02 },
    'ita': { pattern: /[àèéìíîòóùú]/gi, threshold: 0.03 },
    'por': { pattern: /[áàâãçéêíóôõú]/gi, threshold: 0.03 },
    'rus': { pattern: /[а-яё]/gi, threshold: 0.1 } // Cyrillic
  };

  for (const [lang, config] of Object.entries(languagePatterns)) {
    const matches = text.match(config.pattern);
    const ratio = matches ? matches.length / text.length : 0;
    if (ratio >= config.threshold) {
      return lang;
    }
  }

  return 'eng'; // Default fallback
}

// Enhanced PDF processing with better OCR fallback for image-based PDFs
async function processPDF(arrayBuffer, filename, progress) {
  // Validate input first
  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    throw new FileProcessingError(
      FILE_ERROR_TYPES.CORRUPTED_FILE,
      'PDF file is empty or corrupted'
    );
  }

  console.log(`Processing PDF: ${filename} (${arrayBuffer.byteLength} bytes)`);
  
  progress.update('pdf', 0, 'Loading PDF document...');
  
  let pdf;
  try {
    pdf = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      verbosity: 0,
      // Enable more lenient parsing for problematic PDFs
      isEvalSupported: false,
      disableFontFace: true
    }).promise;
  } catch (error) {
    if (error.message.includes('password')) {
      throw new FileProcessingError(
        FILE_ERROR_TYPES.PASSWORD_PROTECTED,
        'PDF is password protected'
      );
    }
    
    // If PDF parsing fails completely, try OCR as fallback
    console.warn('PDF parsing failed, attempting OCR fallback:', error.message);
    progress.update('pdf', 10, 'PDF parsing failed, attempting text extraction...');
    return await performAdvancedOCR(arrayBuffer, filename, progress);
  }

  progress.update('pdf', 10, `Processing PDF with ${pdf.numPages} pages...`);

  let extractedText = '';
  let hasTextContent = false;
  let processedPages = 0;
  const maxPages = Math.min(pdf.numPages, 100); // Increased page limit

  // Try to extract text from each page
  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    try {
      progress.update('pdf', 10 + (pageNum / maxPages) * 60, 
        `Extracting text from page ${pageNum}/${maxPages}...`);
      
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      if (textContent.items && textContent.items.length > 0) {
        // Improved text reconstruction with better spacing
        let pageText = '';
        let lastY = null;
        let lastX = null;
        
        // Sort items by vertical position then horizontal
        const sortedItems = textContent.items.sort((a, b) => {
          const aY = a.transform[5];
          const bY = b.transform[5];
          if (Math.abs(aY - bY) < 5) { // Same line
            return a.transform[4] - b.transform[4]; // Sort by X
          }
          return bY - aY; // Sort by Y (top to bottom)
        });
        
        sortedItems.forEach(item => {
          const currentX = item.transform[4];
          const currentY = item.transform[5];
          
          // Add newline if significant vertical movement
          if (lastY !== null && Math.abs(currentY - lastY) > 8) {
            pageText += '\n';
          }
          // Add space if significant horizontal movement (not consecutive)
          else if (lastX !== null && currentX - lastX > 15) {
            pageText += ' ';
          }
          
          pageText += item.str;
          lastY = currentY;
          lastX = currentX + (item.width * item.transform[0] || 0);
        });
        
        pageText = pageText.trim();
        if (pageText.length > 0) {
          extractedText += pageText + '\n\n';
          hasTextContent = true;
        }
      }
      
      processedPages = pageNum;
      
      // Stop if we've extracted enough content
      if (extractedText.length > MAX_CHARS * 2) {
        progress.update('pdf', 70, `Extracted sufficient text, stopping at page ${pageNum}`);
        break;
      }
      
    } catch (pageError) {
      console.warn(`Failed to process page ${pageNum}:`, pageError.message);
      // Continue with next page
    }
  }

  const finalText = extractedText.trim();
  
  // Determine if PDF has sufficient text content
  const wordCount = finalText.split(/\s+/).filter(w => w.length > 0).length;
  const avgWordsPerPage = processedPages > 0 ? wordCount / processedPages : 0;
  
  progress.update('pdf', 80, 'Analyzing extracted content...');

  // More lenient detection for scanned documents
  if (hasTextContent && finalText.length > 100 && avgWordsPerPage > 2) {
    progress.update('pdf', 100, `Successfully extracted ${wordCount} words from PDF`);
    return finalText;
  }

  // Fall back to OCR for image-based PDFs
  console.log(`PDF has insufficient text (${wordCount} words, ${avgWordsPerPage.toFixed(1)} avg/page), attempting OCR...`);
  progress.update('pdf', 85, 'PDF appears to be image-based, attempting OCR...');
  
  // Verify arrayBuffer is still valid before OCR
  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    throw new FileProcessingError(
      FILE_ERROR_TYPES.CORRUPTED_FILE,
      'Cannot perform OCR - file data was lost during processing'
    );
  }
  
  return await performAdvancedOCR(arrayBuffer, filename, progress);
}

// Enhanced image preprocessing before OCR
async function preprocessImageForOCR(arrayBuffer, mimeType) {
  // This is a placeholder for actual image preprocessing
  // In a real implementation, you might:
  // 1. Convert to appropriate format (e.g., PNG)
  // 2. Adjust contrast/brightness
  // 3. Deskew the image
  // 4. Remove noise
  
  // For now, we'll just return the original arrayBuffer
  // Consider implementing these enhancements for better OCR results
  return arrayBuffer;
}

// Enhanced text cleaning for multilingual content
function cleanAndValidateText(text) {
  if (!text || typeof text !== 'string') {
    throw new FileProcessingError(
      FILE_ERROR_TYPES.EMPTY_CONTENT,
      'No text content was extracted'
    );
  }

  // Enhanced cleaning that preserves non-Latin characters
  let cleaned = text
    // Normalize whitespace but preserve paragraph breaks
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .replace(/\n{3,}/g, '\n\n')
    // Remove obvious OCR noise but preserve non-Latin characters
    .replace(/[^\p{L}\p{N}\s\.,;:!?'"()\-\[\]{}@#$%&*+=<>/\\|`~\n]/gu, ' ')
    // Clean up multiple spaces
    .replace(/  +/g, ' ')
    .trim();

  // Validate text quality with language-aware metrics
  const stats = analyzeTextQuality(cleaned);
  
  if (cleaned.length < 10) {
    throw new FileProcessingError(
      FILE_ERROR_TYPES.EMPTY_CONTENT,
      'Extracted text is too short to be meaningful'
    );
  }

  if (stats.readableWordRatio < 0.1) { // More lenient threshold for non-English
    console.warn('Low quality OCR detected - many unreadable characters');
  }

  if (stats.hasHighNoise) {
    console.warn('High noise level in extracted text - results may be inaccurate');
  }

  return cleaned;
}

// Enhanced text quality analysis for multilingual content
function analyzeTextQuality(text) {
  const words = text.split(/\s+/);
  const totalWords = words.length;
  
  // Count readable words (contain at least 2 consecutive letters or non-Latin characters)
  const readableWords = words.filter(word => 
    /[\p{L}]{2,}/u.test(word) || 
    /[\u4E00-\u9FFF]{2,}/.test(word) || // Chinese characters
    /[\uAC00-\uD7AF]{2,}/.test(word) || // Korean Hangul
    /[\u3040-\u309F\u30A0-\u30FF]{2,}/.test(word) // Japanese Hiragana/Katakana
  ).length;
  
  // Check for excessive special characters or numbers
  const specialCharCount = (text.match(/[^\w\s]/g) || []).length;
  const numberCount = (text.match(/\d/g) || []).length;
  
  return {
    readableWordRatio: totalWords > 0 ? readableWords / totalWords : 0,
    hasHighNoise: specialCharCount > text.length * 0.3 || numberCount > text.length * 0.4,
    averageWordLength: readableWords > 0 ? 
      words.filter(w => /[\p{L}]{2,}/u.test(w))
           .reduce((sum, w) => sum + w.length, 0) / readableWords : 0
  };
}

// Rest of the functions (processDOCX, processImage, validateFileType, readFileContent, etc.)
// remain largely the same but with the enhanced language support integrated

// Export the enhanced functions
export { 
  readFileContent, 
  getErrorMessage, 
  FileProcessingError, 
  ProcessingProgress,
  OCR_LANGUAGE_MAPPING
};