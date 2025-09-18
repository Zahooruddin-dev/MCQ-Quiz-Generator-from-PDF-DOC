// validator.js - File validation and type detection
import { 
  SUPPORTED_FILE_TYPES, 
  SUPPORTED_EXTENSIONS, 
  MAX_FILE_SIZE,
  FILE_ERROR_TYPES 
} from '../types/types.js';
import { FileProcessingError } from '../types/errors.js';

export function validateFile(file) {
  if (!file || !file.size) {
    throw new FileProcessingError(
      FILE_ERROR_TYPES.EMPTY_CONTENT,
      'Invalid or empty file provided'
    );
  }

  validateFileSize(file);
  validateFileType(file);
  
  return getFileProcessingInfo(file);
}

function validateFileSize(file) {
  if (file.size > MAX_FILE_SIZE) {
    throw new FileProcessingError(
      FILE_ERROR_TYPES.FILE_TOO_LARGE,
      `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`
    );
  }

  if (file.size === 0) {
    throw new FileProcessingError(
      FILE_ERROR_TYPES.EMPTY_CONTENT,
      'File is empty'
    );
  }
}

function validateFileType(file) {
  const allowedTypes = Object.values(SUPPORTED_FILE_TYPES);
  const fileExtension = getFileExtension(file.name);

  const hasValidType = allowedTypes.includes(file.type);
  const hasValidExtension = fileExtension && SUPPORTED_EXTENSIONS.includes(fileExtension);

  if (!hasValidType && !hasValidExtension) {
    throw new FileProcessingError(
      FILE_ERROR_TYPES.UNSUPPORTED_TYPE,
      `File type not supported: ${file.type || 'unknown'} (${fileExtension || 'no extension'})`,
      null,
      { fileName: file.name, fileType: file.type, fileSize: file.size }
    );
  }
}

function getFileExtension(filename) {
  const match = filename.toLowerCase().match(/\.[^.]+$/);
  return match ? match[0] : null;
}

export function getFileProcessingInfo(file) {
  const extension = getFileExtension(file.name);
  const processingType = determineProcessingType(file, extension);
  
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    extension,
    processingType,
    requiresOCR: processingType === 'image' || (processingType === 'pdf' && isPotentiallyImageBased(file)),
    estimatedComplexity: estimateProcessingComplexity(file, processingType),
  };
}

function determineProcessingType(file, extension) {
  // PDF files
  if (file.type === SUPPORTED_FILE_TYPES.PDF || extension === '.pdf') {
    return 'pdf';
  }
  
  // DOCX files
  if (file.type === SUPPORTED_FILE_TYPES.DOCX || extension === '.docx') {
    return 'docx';
  }
  
  // Text files
  if (file.type.startsWith('text/') || ['.txt', '.html', '.htm'].includes(extension)) {
    return 'text';
  }
  
  // Image files
  if (file.type.startsWith('image/')) {
    return 'image';
  }
  
  return 'unknown';
}

function isPotentiallyImageBased(file) {
  // Heuristic: smaller PDF files are more likely to be text-based
  // Larger files might be image-based scans
  const sizeMB = file.size / (1024 * 1024);
  return sizeMB > 5; // Files over 5MB might be image-based
}

function estimateProcessingComplexity(file, processingType) {
  const sizeMB = file.size / (1024 * 1024);
  
  let complexity = 'low';
  
  switch (processingType) {
    case 'text':
      complexity = 'low';
      break;
    case 'docx':
      complexity = sizeMB > 2 ? 'medium' : 'low';
      break;
    case 'pdf':
      if (sizeMB > 10) complexity = 'high';
      else if (sizeMB > 3) complexity = 'medium';
      else complexity = 'low';
      break;
    case 'image':
      if (sizeMB > 5) complexity = 'high';
      else if (sizeMB > 1) complexity = 'medium';
      else complexity = 'low';
      break;
    default:
      complexity = 'medium';
  }
  
  return complexity;
}