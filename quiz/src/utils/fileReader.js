// Enhanced Production-Grade fileReader.js
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
  PASSWORD_PROTECTED: 'PASSWORD_PROTECTED'
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

// Enhanced OCR with better user feedback
async function performAdvancedOCR(arrayBuffer, filename, progress) {
  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    throw new FileProcessingError(
      FILE_ERROR_TYPES.CORRUPTED_FILE,
      'No file data available for OCR processing'
    );
  }

  progress.update('ocr', 5, 'Preparing image for text extraction...');
  console.log(`Starting OCR with ${arrayBuffer.byteLength} bytes for ${filename}`);

  const ocrStrategies = [
    { name: 'Standard OCR', language: 'eng', overlay: false, description: 'Using standard text recognition' },
    { name: 'Enhanced OCR', language: 'eng', overlay: true, description: 'Using enhanced recognition with overlay detection' },
    { name: 'Auto-detect OCR', language: 'auto', overlay: false, description: 'Using automatic language detection' }
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
        progress.update('ocr', 100, 
          `Successfully extracted ${wordCount} words from ${filename}`, {
            confidence: 85
          }
        );
        return result;
      }
    } catch (error) {
      console.warn(`OCR strategy ${i + 1} failed:`, error.message);
      if (i === ocrStrategies.length - 1) {
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

// OCR strategy with proper blob creation and validation
async function attemptOCRWithStrategy(arrayBuffer, filename, strategy, progressCallback = null) {
  try {
    // CRITICAL FIX: Validate arrayBuffer before creating blob
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error('Empty or invalid file data provided to OCR');
    }

    console.log(`OCR attempt: ${filename} (${arrayBuffer.byteLength} bytes)`);
    if (progressCallback) progressCallback(10);

    // FIXED: Determine proper MIME type based on file extension
    let mimeType = 'application/octet-stream';
    const ext = filename.toLowerCase().split('.').pop();
    
    if (ext === 'pdf') {
      mimeType = 'application/pdf';
    } else if (['jpg', 'jpeg'].includes(ext)) {
      mimeType = 'image/jpeg';
    } else if (ext === 'png') {
      mimeType = 'image/png';
    } else if (['tif', 'tiff'].includes(ext)) {
      mimeType = 'image/tiff';
    } else if (ext === 'bmp') {
      mimeType = 'image/bmp';
    } else if (ext === 'gif') {
      mimeType = 'image/gif';
    } else if (ext === 'webp') {
      mimeType = 'image/webp';
    }

    const formData = new FormData();
    
    // CRITICAL FIX: Create blob with proper validation
    const blob = new Blob([arrayBuffer], { type: mimeType });
    
    // FIXED: Verify blob was created successfully
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
    formData.append('OCREngine', '2'); // Use newer engine
    
    if (progressCallback) progressCallback(40);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    try {
      if (progressCallback) progressCallback(50);
      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: { 
          apikey: 'K81988334688957' // Your API key preserved
        },
        body: formData,
        signal: controller.signal
      });
      
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

// Advanced text cleaning and validation
function cleanAndValidateText(text) {
  if (!text || typeof text !== 'string') {
    throw new FileProcessingError(
      FILE_ERROR_TYPES.EMPTY_CONTENT,
      'No text content was extracted'
    );
  }

  // Remove common OCR artifacts
  let cleaned = text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Remove obvious OCR noise (repeated single characters)
    .replace(/\b[il1|O0]{3,}\b/gi, '')
    // Remove garbled text patterns
    .replace(/[^\w\s\.,;:!?'"()\-\[\]{}@#$%&*+=<>/\\|`~]/g, ' ')
    // Fix common OCR character mistakes
    .replace(/\bl\b/g, 'I') // lowercase L often mistaken for I
    .replace(/\b0\b/g, 'O') // zero often mistaken for O in words
    // Remove URLs and emails that are often garbled
    .replace(/https?:\/\/[^\s]+/gi, '')
    .replace(/www\.[^\s]+/gi, '')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-Z.-]+\.[a-zA-Z]{2,}/gi, '')
    .trim();

  // Validate text quality
  const stats = analyzeTextQuality(cleaned);
  
  if (cleaned.length < 10) {
    throw new FileProcessingError(
      FILE_ERROR_TYPES.EMPTY_CONTENT,
      'Extracted text is too short to be meaningful'
    );
  }

  if (stats.readableWordRatio < 0.3) {
    console.warn('Low quality OCR detected - many unreadable characters');
  }

  if (stats.hasHighNoise) {
    console.warn('High noise level in extracted text - results may be inaccurate');
  }

  return cleaned;
}

// Analyze text quality metrics
function analyzeTextQuality(text) {
  const words = text.split(/\s+/);
  const totalWords = words.length;
  
  // Count readable words (contain at least 2 consecutive letters)
  const readableWords = words.filter(word => /[a-zA-Z]{2,}/.test(word)).length;
  
  // Check for excessive special characters or numbers
  const specialCharCount = (text.match(/[^\w\s]/g) || []).length;
  const numberCount = (text.match(/\d/g) || []).length;
  
  return {
    readableWordRatio: totalWords > 0 ? readableWords / totalWords : 0,
    hasHighNoise: specialCharCount > text.length * 0.2 || numberCount > text.length * 0.3,
    averageWordLength: readableWords > 0 ? 
      words.filter(w => /[a-zA-Z]{2,}/.test(w))
           .reduce((sum, w) => sum + w.length, 0) / readableWords : 0
  };
}

// Enhanced language detection
function detectDocumentLanguage(text, filename = '') {
  if (!text || text.length < 100) return 'eng';

  // Check filename for language hints
  const filenameLower = filename.toLowerCase();
  if (filenameLower.includes('spanish') || filenameLower.includes('espanol')) return 'spa';
  if (filenameLower.includes('french') || filenameLower.includes('francais')) return 'fre';
  if (filenameLower.includes('german') || filenameLower.includes('deutsch')) return 'ger';

  const languagePatterns = {
    // Script-based detection (more reliable)
    'ara': { pattern: /[\u0600-\u06FF]/g, threshold: 0.1 },
    'hin': { pattern: /[\u0900-\u097F]/g, threshold: 0.1 },
    'chi_sim': { pattern: /[\u4E00-\u9FFF]/g, threshold: 0.05 },
    'jpn': { pattern: /[\u3040-\u309F\u30A0-\u30FF]/g, threshold: 0.05 },
    'kor': { pattern: /[\uAC00-\uD7AF]/g, threshold: 0.05 },
    
    // Character-based detection (less reliable but useful)
    'spa': { pattern: /[ñáéíóúü¡¿]/gi, threshold: 0.02 },
    'fre': { pattern: /[àâäçéèêëîïôûùüÿ]/gi, threshold: 0.02 },
    'ger': { pattern: /[äöüß]/gi, threshold: 0.015 },
    'ita': { pattern: /[àèéìíîòóùú]/gi, threshold: 0.02 },
    'por': { pattern: /[áàâãçéêíóôõú]/gi, threshold: 0.02 }
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

// FIXED: Enhanced PDF processing with proper arrayBuffer preservation
async function processPDF(arrayBuffer, filename, progress) {
  // CRITICAL FIX: Validate input first
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
      verbosity: 0 // Reduce console noise
    }).promise;
  } catch (error) {
    if (error.message.includes('password')) {
      throw new FileProcessingError(
        FILE_ERROR_TYPES.PASSWORD_PROTECTED,
        'PDF is password protected'
      );
    }
    throw new FileProcessingError(
      FILE_ERROR_TYPES.CORRUPTED_FILE,
      'PDF file is corrupted or invalid',
      error.message
    );
  }

  progress.update('pdf', 10, `Processing PDF with ${pdf.numPages} pages...`);

  let extractedText = '';
  let hasTextContent = false;
  let processedPages = 0;
  const maxPages = Math.min(pdf.numPages, 50); // Reduced for performance

  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    try {
      progress.update('pdf', 10 + (pageNum / maxPages) * 60, 
        `Extracting text from page ${pageNum}/${maxPages}...`);
      
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      if (textContent.items && textContent.items.length > 0) {
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ')
          .trim();
        
        if (pageText.length > 0) {
          extractedText += pageText + '\n\n';
          hasTextContent = true;
        }
      }
      
      processedPages = pageNum;
      
      // Stop if we've extracted enough content
      if (extractedText.length > MAX_CHARS * 1.5) {
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

  // FIXED: More lenient text detection - many scanned PDFs have very few words per page
  if (hasTextContent && finalText.length > 50 && avgWordsPerPage > 3) {
    progress.update('pdf', 100, `Successfully extracted ${wordCount} words from PDF`);
    return finalText;
  }

  // CRITICAL FIX: Ensure arrayBuffer is preserved for OCR fallback
  console.log(`PDF has insufficient text (${wordCount} words, ${avgWordsPerPage.toFixed(1)} avg/page), attempting OCR with ${arrayBuffer.byteLength} bytes...`);
  progress.update('pdf', 85, 'PDF appears to be image-based, attempting OCR...');
  
  // Verify arrayBuffer is still valid before OCR
  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    throw new FileProcessingError(
      FILE_ERROR_TYPES.CORRUPTED_FILE,
      'Cannot perform OCR - file data was lost during processing'
    );
  }
  
  const detectedLanguage = detectDocumentLanguage(finalText, filename);
  return await performAdvancedOCR(arrayBuffer, filename, progress);
}

// Enhanced DOCX processing
async function processDOCX(file, progress) {
  progress.update('docx', 0, 'Loading DOCX document...');
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    progress.update('docx', 30, 'Extracting text from DOCX...');
    
    const mammoth = await import('mammoth/mammoth.browser.js');
    const { value, messages } = await mammoth.extractRawText({ arrayBuffer });
    
    if (messages && messages.length > 0) {
      console.warn('DOCX processing warnings:', messages);
    }
    
    progress.update('docx', 100, 'DOCX processing completed');
    
    if (!value || value.trim().length < 10) {
      throw new FileProcessingError(
        FILE_ERROR_TYPES.EMPTY_CONTENT,
        'DOCX file contains no readable text'
      );
    }
    
    return value.trim();
    
  } catch (error) {
    if (error instanceof FileProcessingError) {
      throw error;
    }
    throw new FileProcessingError(
      FILE_ERROR_TYPES.PROCESSING_FAILED,
      'Failed to process DOCX file',
      error.message
    );
  }
}

// Enhanced image processing
async function processImage(file, progress) {
  progress.update('image', 0, 'Preparing image for OCR...');
  
  const arrayBuffer = await file.arrayBuffer();
  
  // Validate arrayBuffer for images
  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    throw new FileProcessingError(
      FILE_ERROR_TYPES.CORRUPTED_FILE,
      'Image file contains no data or is corrupted'
    );
  }
  
  const detectedLanguage = detectDocumentLanguage('', file.name);
  
  progress.update('image', 20, 'Performing OCR on image...');
  return await performAdvancedOCR(arrayBuffer, file.name, progress);
}

// File type validation with comprehensive checks
function validateFileType(file) {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/html',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'image/webp'
  ];

  const allowedExtensions = [
    '.pdf', '.docx', '.txt', '.html', '.htm',
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.webp'
  ];

  const fileExtension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
  
  const hasValidType = allowedTypes.includes(file.type);
  const hasValidExtension = fileExtension && allowedExtensions.includes(fileExtension);
  
  if (!hasValidType && !hasValidExtension) {
    throw new FileProcessingError(
      FILE_ERROR_TYPES.UNSUPPORTED_TYPE,
      `File type not supported: ${file.type || 'unknown'} (${fileExtension || 'no extension'})`
    );
  }

  // Check file size (50MB limit)
  const MAX_FILE_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    throw new FileProcessingError(
      FILE_ERROR_TYPES.FILE_TOO_LARGE,
      `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds limit of 50MB`
    );
  }
}

// MAIN EXPORT - Production-grade file reader with comprehensive fixes
export async function readFileContent(file, progressCallback = null) {
  const progress = new ProcessingProgress(progressCallback);
  
  try {
    // Validate file object first
    if (!file || !file.size) {
      throw new FileProcessingError(
        FILE_ERROR_TYPES.EMPTY_CONTENT,
        'Invalid or empty file provided'
      );
    }

    console.log(`Starting file processing: ${file.name} (${file.size} bytes, ${file.type})`);

    // Validate file
    progress.update('validation', 0, 'Validating file...');
    validateFileType(file);
    progress.update('validation', 100, 'File validation passed');
    
    let content = '';
    
    // Process based on file type
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      const arrayBuffer = await file.arrayBuffer();
      
      // Validate arrayBuffer before processing
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        throw new FileProcessingError(
          FILE_ERROR_TYPES.CORRUPTED_FILE,
          'PDF file contains no data or is corrupted'
        );
      }
      
      content = await processPDF(arrayBuffer, file.name, progress);
      
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               file.name.toLowerCase().endsWith('.docx')) {
      content = await processDOCX(file, progress);
      
    } else if (file.type.startsWith('text/') || 
               file.name.toLowerCase().endsWith('.txt') || 
               file.name.toLowerCase().endsWith('.html') ||
               file.name.toLowerCase().endsWith('.htm')) {
      progress.update('text', 0, 'Reading text file...');
      content = await file.text();
      
      if (!content || content.trim().length === 0) {
        throw new FileProcessingError(
          FILE_ERROR_TYPES.EMPTY_CONTENT,
          'Text file is empty or contains no readable content'
        );
      }
      
      progress.update('text', 100, 'Text file read successfully');
      
    } else if (file.type.startsWith('image/')) {
      content = await processImage(file, progress);
      
    } else {
      throw new FileProcessingError(
        FILE_ERROR_TYPES.UNSUPPORTED_TYPE,
        'File type is not supported'
      );
    }
    
    // Final validation and truncation
    if (!content || content.trim().length === 0) {
      throw new FileProcessingError(
        FILE_ERROR_TYPES.EMPTY_CONTENT,
        'No readable content was found in the file'
      );
    }
    
    const finalContent = content.slice(0, MAX_CHARS);
    progress.update('complete', 100, `File processing completed successfully. Extracted ${finalContent.length} characters.`);
    
    console.log(`File processing completed: ${finalContent.length} characters extracted from ${file.name}`);
    return finalContent;
    
  } catch (error) {
    // Enhanced error logging
    console.error('File processing error:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      error: error.message,
      stack: error.stack
    });
    
    // Ensure all errors are FileProcessingError instances
    if (error instanceof FileProcessingError) {
      throw error;
    }
    
    // Wrap unexpected errors with more context
    throw new FileProcessingError(
      FILE_ERROR_TYPES.PROCESSING_FAILED,
      `File processing failed: ${error.message}`,
      `File: ${file?.name || 'unknown'}\nSize: ${file?.size || 0} bytes\nType: ${file?.type || 'unknown'}\nError: ${error.message}`
    );
  }
}

// Utility function for UI components to get user-friendly error messages
export function getErrorMessage(error) {
  if (error instanceof FileProcessingError) {
    return error.getUserMessage();
  }
  return 'An unexpected error occurred while processing the file.';
}

// Export error types for external use
export { FileProcessingError };