// Enhanced Production-Grade fileReader.js (OCR Disabled)
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { MAX_CHARS } from './constants.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

// Error types for better error handling
export const FILE_ERROR_TYPES = {
  UNSUPPORTED_TYPE: 'UNSUPPORTED_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  CORRUPTED_FILE: 'CORRUPTED_FILE',
  OCR_UNAVAILABLE: 'OCR_UNAVAILABLE', // updated to indicate OCR is disabled
  NETWORK_ERROR: 'NETWORK_ERROR',
  PROCESSING_FAILED: 'PROCESSING_FAILED',
  EMPTY_CONTENT: 'EMPTY_CONTENT',
  PASSWORD_PROTECTED: 'PASSWORD_PROTECTED',
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
        return 'This file type is not supported. Please upload a PDF, DOCX, TXT, or HTML file.';
      case FILE_ERROR_TYPES.FILE_TOO_LARGE:
        return 'File is too large. Please upload a file smaller than 50MB.';
      case FILE_ERROR_TYPES.CORRUPTED_FILE:
        return 'This file appears to be corrupted or damaged. Please try uploading a different file.';
      case FILE_ERROR_TYPES.OCR_UNAVAILABLE:
        return 'OCR (image-to-text extraction) is not available right now. Please upload a text-based file instead.';
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

// FIXED: Enhanced PDF processing (no OCR fallback anymore)
async function processPDF(arrayBuffer, filename, progress) {
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
  const maxPages = Math.min(pdf.numPages, 50);

  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    try {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      if (textContent.items && textContent.items.length > 0) {
        let pageText = '';
        let lastY = null;

        textContent.items.forEach((item) => {
          if (lastY !== null && lastY - item.transform[5] > 5) {
            pageText += '\n';
          }
          pageText += item.str + ' ';
          lastY = item.transform[5];
        });

        pageText = pageText.trim();
        if (pageText.length > 0) {
          extractedText += pageText + '\n\n';
          hasTextContent = true;
        }
      }
    } catch (pageError) {
      console.warn(`Failed to process page ${pageNum}:`, pageError.message);
    }
  }

  const finalText = extractedText.trim();
  if (hasTextContent && finalText.length > 50) {
    progress.update('pdf', 100, 'Successfully extracted text from PDF');
    return finalText;
  }

  // OCR Fallback disabled → clearly inform user
  throw new FileProcessingError(
    FILE_ERROR_TYPES.OCR_UNAVAILABLE,
    'This PDF appears to be image-based. OCR (text extraction from images) is not available right now.'
  );
}

// Enhanced DOCX processing
async function processDOCX(file, progress) {
  progress.update('docx', 0, 'Loading DOCX document...');

  try {
    const arrayBuffer = await file.arrayBuffer();
    const mammoth = await import('mammoth/mammoth.browser.js');
    const { value } = await mammoth.extractRawText({ arrayBuffer });

    progress.update('docx', 100, 'DOCX processing completed');

    if (!value || value.trim().length < 10) {
      throw new FileProcessingError(
        FILE_ERROR_TYPES.EMPTY_CONTENT,
        'DOCX file contains no readable text'
      );
    }

    return value.trim();
  } catch (error) {
    throw new FileProcessingError(
      FILE_ERROR_TYPES.PROCESSING_FAILED,
      'Failed to process DOCX file',
      error.message
    );
  }
}

// Image processing → disabled (OCR unavailable)
async function processImage(file, progress) {
  throw new FileProcessingError(
    FILE_ERROR_TYPES.OCR_UNAVAILABLE,
    'OCR for image files is not available right now. Please upload a text-based file.'
  );
}

// File type validation
function validateFileType(file) {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/html',
  ];

  const allowedExtensions = ['.pdf', '.docx', '.txt', '.html', '.htm'];

  const fileExtension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];

  const hasValidType = allowedTypes.includes(file.type);
  const hasValidExtension =
    fileExtension && allowedExtensions.includes(fileExtension);

  if (!hasValidType && !hasValidExtension) {
    throw new FileProcessingError(
      FILE_ERROR_TYPES.UNSUPPORTED_TYPE,
      `File type not supported: ${file.type || 'unknown'} (${fileExtension ||
        'no extension'})`
    );
  }

  const MAX_FILE_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    throw new FileProcessingError(
      FILE_ERROR_TYPES.FILE_TOO_LARGE,
      `File size ${(file.size / 1024 / 1024).toFixed(
        1
      )}MB exceeds limit of 50MB`
    );
  }
}

// MAIN EXPORT
export async function readFileContent(file, progressCallback = null) {
  const progress = new ProcessingProgress(progressCallback);

  try {
    if (!file || !file.size) {
      throw new FileProcessingError(
        FILE_ERROR_TYPES.EMPTY_CONTENT,
        'Invalid or empty file provided'
      );
    }

    validateFileType(file);

    let content = '';

    if (
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf')
    ) {
      const arrayBuffer = await file.arrayBuffer();
      content = await processPDF(arrayBuffer, file.name, progress);
    } else if (
      file.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.toLowerCase().endsWith('.docx')
    ) {
      content = await processDOCX(file, progress);
    } else if (
      file.type.startsWith('text/') ||
      file.name.toLowerCase().endsWith('.txt') ||
      file.name.toLowerCase().endsWith('.html') ||
      file.name.toLowerCase().endsWith('.htm')
    ) {
      content = await file.text();
    } else if (file.type.startsWith('image/')) {
      content = await processImage(file, progress);
    } else {
      throw new FileProcessingError(
        FILE_ERROR_TYPES.UNSUPPORTED_TYPE,
        'File type is not supported'
      );
    }

    if (!content || content.trim().length === 0) {
      throw new FileProcessingError(
        FILE_ERROR_TYPES.EMPTY_CONTENT,
        'No readable content was found in the file'
      );
    }

    return content.slice(0, MAX_CHARS);
  } catch (error) {
    if (error instanceof FileProcessingError) {
      throw error;
    }
    throw new FileProcessingError(
      FILE_ERROR_TYPES.PROCESSING_FAILED,
      `File processing failed: ${error.message}`
    );
  }
}

// Utility for user-friendly messages
export function getErrorMessage(error) {
  if (error instanceof FileProcessingError) {
    return error.getUserMessage();
  }
  return 'An unexpected error occurred while processing the file.';
}

// Export error class/types
export { FileProcessingError };
