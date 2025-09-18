// textProcessor.js - Fast text and document processing
import { FILE_ERROR_TYPES, MIN_TEXT_LENGTH } from '../types/types.js';
import { FileProcessingError } from '../types/errors.js';
import { withTimeout } from '../types/progress.js';

export async function processTextFile(file, progress) {
  progress.update('text', 0, 'Reading text file...');
  
  try {
    const content = await withTimeout(
      file.text(),
      10000,
      'Text file reading timed out'
    );
    
    progress.update('text', 100, 'Text file processed');
    
    if (!content || content.trim().length < MIN_TEXT_LENGTH) {
      throw new FileProcessingError(
        FILE_ERROR_TYPES.EMPTY_CONTENT,
        'Text file contains no readable content'
      );
    }
    
    return cleanupText(content);
  } catch (error) {
    if (error instanceof FileProcessingError) {
      throw error;
    }
    
    throw new FileProcessingError(
      FILE_ERROR_TYPES.PROCESSING_FAILED,
      'Failed to read text file',
      error.message
    );
  }
}

export async function processDOCX(file, progress) {
  progress.update('docx', 0, 'Loading DOCX document...');

  try {
    const arrayBuffer = await withTimeout(
      file.arrayBuffer(),
      15000,
      'DOCX file reading timed out'
    );
    
    progress.update('docx', 30, 'Parsing DOCX content...');
    
    // Dynamic import for better performance
    const mammoth = await import('mammoth/mammoth.browser.js');
    
    progress.update('docx', 50, 'Extracting text from DOCX...');
    
    const result = await withTimeout(
      mammoth.extractRawText({ arrayBuffer }),
      20000,
      'DOCX text extraction timed out'
    );
    
    progress.update('docx', 100, 'DOCX processing completed');

    if (!result.value || result.value.trim().length < MIN_TEXT_LENGTH) {
      throw new FileProcessingError(
        FILE_ERROR_TYPES.EMPTY_CONTENT,
        'DOCX file contains no readable text'
      );
    }

    // Log any warnings from mammoth
    if (result.messages && result.messages.length > 0) {
      console.warn('DOCX processing warnings:', result.messages);
    }

    return cleanupText(result.value);
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

function cleanupText(text) {
  if (!text) return '';
  
  return text
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove excessive blank lines
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Remove trailing whitespace on lines
    .replace(/[ \t]+$/gm, '')
    // Normalize multiple spaces
    .replace(/[ \t]+/g, ' ')
    .trim();
}