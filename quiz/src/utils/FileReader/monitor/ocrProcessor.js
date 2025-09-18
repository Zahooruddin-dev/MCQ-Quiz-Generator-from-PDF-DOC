// ocrProcessor.js - OCR functionality using Tesseract.js (FIXED)
import { createWorker } from 'tesseract.js';

// Languages supported (you can extend this list)
const SUPPORTED_LANGUAGES = {
  english: 'eng',
  spanish: 'spa',
  french: 'fra',
  german: 'deu',
  // Add more languages as needed
};

// OCR processing class
export class OCRProcessor {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
  }

  // Initialize the Tesseract worker
  async initialize(language = 'eng', progressCallback = null) {
    if (this.isInitialized && this.worker) {
      return;
    }

    try {
      console.log('Initializing OCR worker...');
      
      // Create worker without passing logger in options
      this.worker = await createWorker(language, 1, {
        // Remove logger from here - it causes DataCloneError
      });

      // Set parameters after worker creation
      await this.worker.setParameters({
        tesseditOcrEngineMode: 1, // Use LSTM OCR Engine Mode
        tesseditPageSegMode: 1,   // Automatic page segmentation with OSD
      });

      this.isInitialized = true;
      console.log('OCR worker initialized successfully');
      
      if (progressCallback) {
        progressCallback({
          stage: 'ocr-init',
          progress: 100,
          message: 'OCR worker initialized successfully',
          details: null
        });
      }
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error);
      throw new Error(`OCR initialization failed: ${error.message}`);
    }
  }

  // Process image file or canvas for text extraction
  async extractTextFromImage(imageSource, progressCallback = null) {
    if (!this.isInitialized || !this.worker) {
      throw new Error('OCR worker not initialized. Call initialize() first.');
    }

    try {
      console.log('Starting OCR text extraction...');
      
      // Handle progress tracking manually since we can't pass logger to worker
      let lastProgress = 0;
      const progressInterval = setInterval(() => {
        if (progressCallback && lastProgress < 90) {
          lastProgress += 10;
          progressCallback({
            stage: 'ocr-process',
            progress: lastProgress,
            message: `Recognizing text: ${lastProgress}%`,
            details: null
          });
        }
      }, 500);

      const result = await this.worker.recognize(imageSource);
      
      // Clear the interval and send final progress
      clearInterval(progressInterval);
      if (progressCallback) {
        progressCallback({
          stage: 'ocr-process',
          progress: 100,
          message: 'Text recognition completed',
          details: null
        });
      }

      console.log('OCR extraction completed');
      return {
        text: result.data.text,
        confidence: result.data.confidence,
        words: result.data.words,
        lines: result.data.lines,
        paragraphs: result.data.paragraphs
      };
    } catch (error) {
      console.error('OCR text extraction failed:', error);
      throw new Error(`Text extraction failed: ${error.message}`);
    }
  }

  // Process PDF page (convert to image first, then OCR)
  async extractTextFromPDFPage(page, progressCallback = null) {
    try {
      // Render PDF page to canvas
      const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      if (progressCallback) {
        progressCallback({
          stage: 'pdf-render',
          progress: 0,
          message: 'Rendering PDF page for OCR...'
        });
      }

      await page.render(renderContext).promise;

      if (progressCallback) {
        progressCallback({
          stage: 'pdf-render',
          progress: 50,
          message: 'PDF page rendered, starting OCR...'
        });
      }

      // Extract text using OCR
      const ocrResult = await this.extractTextFromImage(canvas, progressCallback);
      
      return ocrResult.text;
    } catch (error) {
      console.error('Failed to extract text from PDF page:', error);
      throw new Error(`PDF page OCR failed: ${error.message}`);
    }
  }

  // Process image file directly
  async processImageFile(file, progressCallback = null) {
    if (!file || !file.type.startsWith('image/')) {
      throw new Error('Invalid image file provided');
    }

    try {
      // Convert file to image element for processing
      const imageUrl = URL.createObjectURL(file);
      
      const result = await this.extractTextFromImage(imageUrl, progressCallback);
      
      // Clean up object URL
      URL.revokeObjectURL(imageUrl);
      
      return result.text;
    } catch (error) {
      console.error('Failed to process image file:', error);
      throw new Error(`Image processing failed: ${error.message}`);
    }
  }

  // Clean up resources
  async terminate() {
    if (this.worker) {
      try {
        await this.worker.terminate();
        console.log('OCR worker terminated');
      } catch (error) {
        console.error('Error terminating OCR worker:', error);
      } finally {
        this.worker = null;
        this.isInitialized = false;
      }
    }
  }

  // Check if OCR is ready
  isReady() {
    return this.isInitialized && this.worker !== null;
  }
}

// Utility functions for better integration

// Create a singleton OCR processor instance
let ocrInstance = null;

export async function getOCRProcessor(language = 'eng') {
  if (!ocrInstance) {
    ocrInstance = new OCRProcessor();
  }
  
  if (!ocrInstance.isReady()) {
    await ocrInstance.initialize(language);
  }
  
  return ocrInstance;
}

// Convenience function for quick OCR processing
export async function extractTextWithOCR(imageSource, progressCallback = null, language = 'eng') {
  try {
    const processor = await getOCRProcessor(language);
    return await processor.extractTextFromImage(imageSource, progressCallback);
  } catch (error) {
    throw new Error(`OCR processing failed: ${error.message}`);
  }
}

// Clean up global OCR instance
export async function cleanupOCR() {
  if (ocrInstance) {
    await ocrInstance.terminate();
    ocrInstance = null;
  }
}

// Export supported languages
export { SUPPORTED_LANGUAGES };

// Helper function to check if OCR is supported in current environment
export function isOCRSupported() {
  try {
    // Check if we can create workers and if required APIs are available
    return typeof Worker !== 'undefined' && 
           typeof createWorker !== 'undefined' &&
           typeof URL !== 'undefined' &&
           typeof URL.createObjectURL !== 'undefined';
  } catch (error) {
    return false;
  }
}