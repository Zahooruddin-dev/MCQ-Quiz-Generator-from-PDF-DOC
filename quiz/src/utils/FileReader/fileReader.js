// fileReader.js - Main optimized file reader with modular architecture
import { MAX_CHARS, PROCESSING_STAGES } from './types/types.js';
import {
	FileProcessingError,
	getErrorMessage,
} from './types/errors.js';
import { ProcessingProgress } from './types/progress.js';
import { validateFile } from './tracking/validator.js';
import { processPDF } from './monitor/pdfProcessor.js';
import { processImage } from './monitor/imageProcessor.js';
import {
	processTextFile,
	processDOCX,
} from './monitor/textProcessor.js';
import {
	PerformanceMonitor,
	MemoryMonitor,
	ResourceManager,
} from './tracking/performanceMonitor.js';
import { cleanupOCR } from './monitor/ocrProcessor.js';

// Global instances for monitoring (optional)
const performanceMonitor = new PerformanceMonitor(
	process.env.NODE_ENV === 'development'
);
const memoryMonitor = new MemoryMonitor();
const resourceManager = new ResourceManager();

/**
 * Enhanced file reader with performance optimizations and modular architecture
 * @param {File} file - The file to process
 * @param {Function} progressCallback - Progress callback function
 * @param {Object} options - Processing options
 * @returns {Promise<string>} - Extracted text content
 */
export async function readFileContent(
	file,
	progressCallback = null,
	options = {}
) {
	const startTime = Date.now();
	const progress = new ProcessingProgress(progressCallback, {
		enablePerformanceTracking: options.enableTracking ?? false,
		logProgress: options.logProgress ?? false,
	});

	// Start performance monitoring
	performanceMonitor.start('total_processing');
	memoryMonitor.snapshot('start');

	try {
		progress.update(PROCESSING_STAGES.VALIDATION, 0, 'Validating file...');

		// Validate file
		performanceMonitor.start('validation');
		const fileInfo = validateFile(file);
		performanceMonitor.end('validation', { fileType: fileInfo.processingType });

		progress.update(PROCESSING_STAGES.LOADING, 5, 'File validation completed');

		// Process based on file type with optimizations
		let content = '';
		performanceMonitor.start('content_extraction');

		switch (fileInfo.processingType) {
			case 'pdf':
				const arrayBuffer = await file.arrayBuffer();
				content = await processPDF(arrayBuffer, file.name, progress);
				break;

			case 'docx':
				content = await processDOCX(file, progress);
				break;

			case 'text':
				content = await processTextFile(file, progress);
				break;

			case 'image':
				content = await processImage(file, progress);
				break;

			default:
				throw new FileProcessingError(
					'UNSUPPORTED_TYPE',
					'File type is not supported'
				);
		}

		performanceMonitor.end('content_extraction', {
			contentLength: content.length,
			fileType: fileInfo.processingType,
		});

		// Final validation and truncation
		progress.update(PROCESSING_STAGES.CLEANUP, 95, 'Finalizing content...');

		if (!content || content.trim().length === 0) {
			throw new FileProcessingError(
				'EMPTY_CONTENT',
				'No readable content was found in the file'
			);
		}

		// Truncate if necessary
		const finalContent =
			content.length > MAX_CHARS
				? content.slice(0, MAX_CHARS) + '\n\n[Content truncated...]'
				: content;

		// Complete processing
		const totalTime = performanceMonitor.end('total_processing', {
			finalContentLength: finalContent.length,
			truncated: content.length > MAX_CHARS,
		});

		memoryMonitor.snapshot('end');
		progress.complete(
			`File processed successfully in ${totalTime?.toFixed(2)}ms`
		);

		// Optional: Log performance metrics
		if (options.enableTracking) {
			logPerformanceMetrics(fileInfo, totalTime);
		}

		return finalContent;
	} catch (error) {
		performanceMonitor.end('total_processing');

		// Enhanced error handling
		if (error instanceof FileProcessingError) {
			progress.update('error', 100, `Error: ${error.getUserMessage()}`);
			throw error;
		}

		const wrappedError = new FileProcessingError(
			'PROCESSING_FAILED',
			`File processing failed: ${error.message}`,
			error.stack
		);

		progress.update('error', 100, `Error: ${wrappedError.getUserMessage()}`);
		throw wrappedError;
	} finally {
		// Cleanup resources
		await performCleanup();
	}
}

/**
 * Batch process multiple files with concurrency control
 */
export async function readMultipleFiles(
	files,
	progressCallback = null,
	options = {}
) {
	const { maxConcurrency = 2, stopOnError = false } = options;
	const results = [];
	const errors = [];

	const semaphore = { count: 0, max: maxConcurrency, queue: [] };

	const processFile = async (file, index) => {
		await acquireSemaphore(semaphore);

		try {
			const content = await readFileContent(
				file,
				(progress) => {
					if (progressCallback) {
						progressCallback({
							fileIndex: index,
							fileName: file.name,
							totalFiles: files.length,
							...progress,
						});
					}
				},
				options
			);

			return { file: file.name, content, success: true };
		} catch (error) {
			const result = {
				file: file.name,
				error: getErrorMessage(error),
				success: false,
			};
			if (stopOnError) throw error;
			return result;
		} finally {
			releaseSemaphore(semaphore);
		}
	};

	const promises = files.map((file, index) => processFile(file, index));
	const settled = await Promise.allSettled(promises);

	settled.forEach((result, index) => {
		if (result.status === 'fulfilled') {
			results.push(result.value);
		} else {
			errors.push({ file: files[index].name, error: result.reason.message });
		}
	});

	return { results, errors };
}

// Semaphore helpers
async function acquireSemaphore(semaphore) {
	if (semaphore.count < semaphore.max) {
		semaphore.count++;
		return;
	}

	return new Promise((resolve) => {
		semaphore.queue.push(resolve);
	});
}

function releaseSemaphore(semaphore) {
	semaphore.count--;
	if (semaphore.queue.length > 0) {
		const next = semaphore.queue.shift();
		semaphore.count++;
		next();
	}
}

// Performance logging
function logPerformanceMetrics(fileInfo, totalTime) {
	console.group(`📊 File Processing Performance - ${fileInfo.name}`);
	console.log(`File Type: ${fileInfo.processingType}`);
	console.log(`File Size: ${(fileInfo.size / 1024 / 1024).toFixed(2)} MB`);
	console.log(`Processing Time: ${totalTime?.toFixed(2)}ms`);
	console.log(`Complexity: ${fileInfo.estimatedComplexity}`);

	const memoryDelta = memoryMonitor.getMemoryDelta('start', 'end');
	if (memoryDelta) {
		console.log(
			`Memory Used: ${(memoryDelta.used / 1024 / 1024).toFixed(2)} MB`
		);
	}

	performanceMonitor.report();
	console.groupEnd();
}

// Cleanup resources
async function performCleanup() {
	try {
		// Cleanup OCR resources
		await cleanupOCR();

		// Cleanup managed resources
		await resourceManager.cleanup();

		// Clear monitoring data (optional)
		if (process.env.NODE_ENV !== 'development') {
			performanceMonitor.clear();
			memoryMonitor.clear();
		}
	} catch (error) {
		console.warn('Cleanup failed:', error);
	}
}

// Utility exports
export { getErrorMessage, FileProcessingError };
export {
	PerformanceMonitor,
	MemoryMonitor,
} from './tracking/performanceMonitor.js';

// Pre-warming function for better first-load performance
export async function preWarmFileReader() {
	try {
		// Pre-load heavy dependencies
		const loadPromises = [
			import('pdfjs-dist'),
			import('mammoth/mammoth.browser.js').catch(() => null),
		];

		await Promise.allSettled(loadPromises);
		console.log('📚 FileReader pre-warming completed');
	} catch (error) {
		console.warn('FileReader pre-warming failed:', error);
	}
}

// Auto pre-warm on import (optional)
if (typeof window !== 'undefined' && !window.fileReaderPreWarmed) {
	window.fileReaderPreWarmed = true;
	preWarmFileReader();
}
