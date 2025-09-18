// imageProcessor.js - Image processing with OCR using working OCR processor
import { 
  FILE_ERROR_TYPES, 
  MIN_TEXT_LENGTH 
} from '../types/types.js';
import { FileProcessingError } from '../types/errors.js';
import { getOCRProcessor, isOCRSupported } from './ocrProcessor.js';

export async function processImage(file, progress) {
  if (!isOCRSupported()) {
    throw new FileProcessingError(
      FILE_ERROR_TYPES.OCR_FAILED,
      'OCR is not supported in this environment. Please ensure Tesseract.js is installed.'
    );
  }

  progress.update('image', 0, 'Preparing image for OCR...');

  // Validate image size (50MB limit)
  const MAX_IMAGE_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_IMAGE_SIZE) {
    throw new FileProcessingError(
      FILE_ERROR_TYPES.FILE_TOO_LARGE,
      `Image too large for OCR processing. Maximum size: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`
    );
  }

  try {
    progress.update('image', 25, 'Initializing OCR engine...');
    
    const ocrProcessor = await getOCRProcessor('eng');
    
    progress.update('image', 35, 'Starting text extraction...');
    
    // Use your working OCR processor
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
    return cleanupOCRText(extractedText.trim());
    
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

function cleanupOCRText(text) {
  if (!text) return '';
  
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove common OCR artifacts (keep more characters for better results)
    .replace(/[^\w\s.,!?;:\-()'"\/\\@#$%^&*+=<>|`~\[\]{}]/g, '')
    // Fix common OCR mistakes
    .replace(/\b([A-Z])\s+([a-z])/g, '$1$2') // Fix split words
    .replace(/\s+([.,!?;:])/g, '$1') // Fix punctuation spacing
    .trim();
}