// imageProcessor.js - Fixed and optimized image processing 
import {
  FILE_ERROR_TYPES,
  MIN_TEXT_LENGTH
} from '../types/types.js';
import { FileProcessingError } from '../types/errors.js';
import { 
  getOCRProcessor, 
  isOCRSupported,
  SUPPORTED_LANGUAGES 
} from './ocrProcessor.js';

// Language detection patterns for better OCR selection
const LANGUAGE_PATTERNS = {
  arabic: /[\u0600-\u06FF]/,
  urdu: /[\u0600-\u06FF\u0750-\u077F]/,
  english: /[a-zA-Z]/,
  chinese: /[\u4e00-\u9fff]/,
  japanese: /[\u3040-\u309F\u30A0-\u30FF]/,
  korean: /[\uAC00-\uD7AF]/
};

export async function processImage(file, progress, options = {}) {
  const {
    language = 'eng' // Simplified - just use specified language
  } = options;

  if (!isOCRSupported()) {
    throw new FileProcessingError(
      FILE_ERROR_TYPES.OCR_FAILED,
      'OCR is not supported in this environment. Please ensure Tesseract.js is installed.'
    );
  }

  progress.update('image', 0, 'Preparing image for OCR...');

  // Validate image size (50MB limit like your original)
  const MAX_IMAGE_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_IMAGE_SIZE) {
    throw new FileProcessingError(
      FILE_ERROR_TYPES.FILE_TOO_LARGE,
      `Image too large for OCR processing. Maximum size: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`
    );
  }

  try {
    progress.update('image', 25, 'Initializing OCR engine...');
    
    const ocrProcessor = await getOCRProcessor(language);
    
    progress.update('image', 35, 'Starting text extraction...');
    
    // Use your original working approach
    const extractedText = await ocrProcessor.processImageFile(file, (ocrProgress) => {
      const totalProgress = 35 + (ocrProgress.progress / 100) * 60;
      progress.update('image', totalProgress, ocrProgress.message);
    });

    // Validate extracted text
    if (!extractedText || extractedText.trim().length < MIN_TEXT_LENGTH) {
      throw new FileProcessingError(
        FILE_ERROR_TYPES.EMPTY_CONTENT,
        'No readable text was found in the image'
      );
    }

    progress.update('image', 100, 'Image OCR completed successfully');
    return cleanupOCRText(extractedText.trim(), language);
    
  } catch (error) {
    if (error instanceof FileProcessingError) {
      throw error;
    }
    
    throw new FileProcessingError(
      FILE_ERROR_TYPES.OCR_FAILED,
      'Failed to extract text from image',
      error.message
    );
  }
}

// Enhanced text cleanup that handles multiple languages
function cleanupOCRText(text, language) {
  if (!text) return '';

  let cleaned = text;

  // Common cleanup for all languages
  cleaned = cleaned
    .replace(/\s+/g, ' ') // Remove excessive whitespace
    .replace(/\s+([.,!?;:])/g, '$1') // Fix punctuation spacing
    .trim();

  // Language-specific cleanup
  if (language === 'ara' || language === 'urd') {
    // Arabic/Urdu specific cleanup
    cleaned = cleaned
      // Keep Arabic, Urdu, and common punctuation
      .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s.,!?;:()\-'"\/\\0-9]/g, '')
      // Fix common Urdu character issues
      .replace(/ي/g, 'ی') // Normalize Urdu Yeh  
      .replace(/ك/g, 'ک'); // Normalize Urdu Kaf
  } else {
    // Latin script cleanup (your original working version)
    cleaned = cleaned
      .replace(/[^\w\s.,!?;:\-()'"\/\\@#$%^&*+=<>|`~\[\]{}]/g, '')
      .replace(/\b([A-Z])\s+([a-z])/g, '$1$2') // Fix split words
      .replace(/([a-z])\s+([A-Z])/g, '$1$2');
  }

  return cleaned;
}

// Export the main function and supported languages
export {
  SUPPORTED_LANGUAGES
};