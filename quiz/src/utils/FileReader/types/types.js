// types.js - File processing types and constants
export const MAX_CHARS = 500000; // 500KB limit for text content
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_PDF_PAGES = 50;
export const MAX_OCR_PAGES = 5; // Reduced for performance
export const MIN_TEXT_LENGTH = 20;
export const MEANINGFUL_TEXT_LENGTH = 50;

export const FILE_ERROR_TYPES = {
	UNSUPPORTED_TYPE: 'UNSUPPORTED_TYPE',
	FILE_TOO_LARGE: 'FILE_TOO_LARGE',
	CORRUPTED_FILE: 'CORRUPTED_FILE',
	OCR_FAILED: 'OCR_FAILED',
	NETWORK_ERROR: 'NETWORK_ERROR',
	PROCESSING_FAILED: 'PROCESSING_FAILED',
	EMPTY_CONTENT: 'EMPTY_CONTENT',
	PASSWORD_PROTECTED: 'PASSWORD_PROTECTED',
	TIMEOUT_ERROR: 'TIMEOUT_ERROR',
};

export const SUPPORTED_FILE_TYPES = {
	PDF: 'application/pdf',
	DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	TXT: 'text/plain',
	HTML: 'text/html',
	JPEG: 'image/jpeg',
	PNG: 'image/png',
	WEBP: 'image/webp',
	BMP: 'image/bmp',
	TIFF: 'image/tiff',
};

export const SUPPORTED_EXTENSIONS = [
	'.pdf',
	'.docx',
	'.txt',
	'.html',
	'.htm',
	'.jpg',
	'.jpeg',
	'.png',
	'.webp',
	'.bmp',
	'.tiff',
	'.tif',
];

export const PROCESSING_STAGES = {
	VALIDATION: 'validation',
	LOADING: 'loading',
	TEXT_EXTRACTION: 'text_extraction',
	OCR: 'ocr',
	CLEANUP: 'cleanup',
	COMPLETE: 'complete',
};

export const OCR_CONFIG = {
	DEFAULT_LANGUAGE: 'eng',
	MAX_IMAGE_SIZE: 50 * 1024 * 1024, // 50MB for images
	TIMEOUT_MS: 60000, // 60 seconds timeout - more generous for OCR
};
