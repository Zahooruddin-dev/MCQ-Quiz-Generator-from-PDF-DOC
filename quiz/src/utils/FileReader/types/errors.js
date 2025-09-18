// errors.js - Error handling and user-friendly messages
import { FILE_ERROR_TYPES } from './types.js';

export class FileProcessingError extends Error {
  constructor(type, message, technicalDetails = null, context = {}) {
    super(message);
    this.type = type;
    this.technicalDetails = technicalDetails;
    this.context = context;
    this.name = 'FileProcessingError';
    this.timestamp = new Date().toISOString();
  }

  getUserMessage() {
    const baseMessages = {
      [FILE_ERROR_TYPES.UNSUPPORTED_TYPE]: 'This file type is not supported. Please upload a PDF, DOCX, TXT, HTML, or image file.',
      [FILE_ERROR_TYPES.FILE_TOO_LARGE]: 'File is too large. Please upload a file smaller than 50MB.',
      [FILE_ERROR_TYPES.CORRUPTED_FILE]: 'This file appears to be corrupted or damaged. Please try uploading a different file.',
      [FILE_ERROR_TYPES.OCR_FAILED]: 'Failed to extract text from the image. The image quality might be too poor or the text unreadable.',
      [FILE_ERROR_TYPES.NETWORK_ERROR]: 'Network error occurred while processing the file. Please check your connection and try again.',
      [FILE_ERROR_TYPES.PROCESSING_FAILED]: 'Failed to process this file. It may be corrupted or in an unexpected format.',
      [FILE_ERROR_TYPES.EMPTY_CONTENT]: 'No readable text was found in this file. Please ensure the document contains text content.',
      [FILE_ERROR_TYPES.PASSWORD_PROTECTED]: 'This document is password protected. Please provide an unprotected version.',
      [FILE_ERROR_TYPES.TIMEOUT_ERROR]: 'File processing timed out. Please try with a smaller file or better quality image.',
    };

    return baseMessages[this.type] || 'An unexpected error occurred while processing the file.';
  }

  toJSON() {
    return {
      type: this.type,
      message: this.message,
      userMessage: this.getUserMessage(),
      technicalDetails: this.technicalDetails,
      context: this.context,
      timestamp: this.timestamp,
    };
  }
}

export function getErrorMessage(error) {
  if (error instanceof FileProcessingError) {
    return error.getUserMessage();
  }
  return 'An unexpected error occurred while processing the file.';
}

export function createTimeoutError(operation, timeoutMs) {
  return new FileProcessingError(
    FILE_ERROR_TYPES.TIMEOUT_ERROR,
    `${operation} operation timed out after ${timeoutMs}ms`
  );
}