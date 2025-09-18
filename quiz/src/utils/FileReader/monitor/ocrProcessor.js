// ocrProcessor.js - Fixed and optimized OCR (keeping it simple but faster)
import { createWorker } from 'tesseract.js';

// Extended language support including Arabic and Urdu
const SUPPORTED_LANGUAGES = {
  english: 'eng',
  spanish: 'spa',
  french: 'fra',
  german: 'deu',
  arabic: 'ara',
  urdu: 'urd',
  hindi: 'hin'
};

// Performance-optimized OCR processing class
export class OCRProcessor {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
  }

  // Initialize with proper CDN and faster settings
  async initialize(language = 'eng', progressCallback = null) {
    if (this.isInitialized && this.worker) {
      return;
    }

    try {
      console.log('Initializing OCR worker...');
      
      // Create worker with proper options - fix the CDN issue
      this.worker = await createWorker(language, 1, {
        workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
        langPath: 'https://tessdata.projectnaptha.com/4.0.0_best',
        corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core-simd.wasm.js',
      });

      // Optimize for speed - these parameters make OCR much faster
      await this.worker.setParameters({
        tessedit_ocr_engine_mode: 1, // LSTM only (much faster than combined)
        tessedit_pageseg_mode: 1,    // Automatic page segmentation 
        classify_enable_learning: 0,  // Disable learning (faster)
        classify_enable_adaptive_matcher: 0, // Disable adaptive matching (faster)
        textord_really_old_xheight: 1, // Faster text ordering
        textord_equation_detect: 0,    // Skip equation detection (faster)
        segment_penalty_dict_nonword: 1.25,
        language_model_penalty_non_freq_dict_word: 0.1,
        language_model_penalty_non_dict_word: 0.15,
        // Reduce quality slightly for much better speed
        tessedit_create_hocr: 0,
        tessedit_create_tsv: 0,
        tessedit_create_wordstrings: 0
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

  // Preprocess image for much better OCR speed and accuracy
  async preprocessImage(imageSource) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Load image
    const img = new Image();
    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else if (imageSource instanceof File) {
      img.src = URL.createObjectURL(imageSource);
    } else {
      return imageSource; // Already processed
    }
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // Calculate optimal size - this is crucial for speed
    let { width, height } = img;
    const maxDimension = 2000; // Sweet spot for OCR speed vs accuracy
    const minDimension = 600;   // Minimum for decent OCR

    if (width > maxDimension || height > maxDimension) {
      const ratio = Math.min(maxDimension / width, maxDimension / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    } else if (width < minDimension && height < minDimension) {
      const ratio = minDimension / Math.max(width, height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    canvas.width = width;
    canvas.height = height;

    // Draw with high quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    // Apply image processing for better OCR (this really helps speed and accuracy)
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Convert to grayscale and increase contrast - much faster OCR on grayscale
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      
      // Increase contrast for sharper text
      const contrast = 1.3;
      const enhanced = Math.min(255, Math.max(0, contrast * (gray - 128) + 128));
      
      data[i] = enhanced;     // Red
      data[i + 1] = enhanced; // Green
      data[i + 2] = enhanced; // Blue
      // Alpha stays same
    }

    ctx.putImageData(imageData, 0, 0);

    if (typeof imageSource === 'string' && imageSource.startsWith('blob:')) {
      URL.revokeObjectURL(imageSource);
    }

    return canvas;
  }

  // Fast text extraction with preprocessing
  async extractTextFromImage(imageSource, progressCallback = null) {
    if (!this.isInitialized || !this.worker) {
      throw new Error('OCR worker not initialized. Call initialize() first.');
    }

    try {
      console.log('Starting OCR text extraction...');
      
      if (progressCallback) {
        progressCallback({
          stage: 'preprocessing',
          progress: 10,
          message: 'Optimizing image for OCR...'
        });
      }

      // Preprocess for much better performance
      const processedImage = await this.preprocessImage(imageSource);
      
      if (progressCallback) {
        progressCallback({
          stage: 'ocr-process',
          progress: 30,
          message: 'Running OCR extraction...'
        });
      }

      // Simple progress tracking
      let progressValue = 30;
      const progressInterval = setInterval(() => {
        if (progressCallback && progressValue < 90) {
          progressValue += 15;
          progressCallback({
            stage: 'ocr-process',
            progress: progressValue,
            message: `Processing text: ${progressValue}%`
          });
        }
      }, 1000);

      const result = await this.worker.recognize(processedImage);
      
      clearInterval(progressInterval);
      if (progressCallback) {
        progressCallback({
          stage: 'ocr-process',
          progress: 100,
          message: 'Text extraction completed'
        });
      }

      console.log('OCR extraction completed with confidence:', result.data.confidence);
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

  // Process PDF page (your original working method)
  async extractTextFromPDFPage(page, progressCallback = null) {
    try {
      // Render PDF page to canvas with higher scale for better OCR
      const viewport = page.getViewport({ scale: 2.0 }); 
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
          progress: 30,
          message: 'PDF page rendered, extracting text...'
        });
      }

      // Use our optimized OCR
      const ocrResult = await this.extractTextFromImage(canvas, (progress) => {
        if (progressCallback) {
          progressCallback({
            stage: progress.stage,
            progress: 30 + (progress.progress * 0.7), // Scale to 30-100%
            message: progress.message
          });
        }
      });
      
      return ocrResult.text;
    } catch (error) {
      console.error('Failed to extract text from PDF page:', error);
      throw new Error(`PDF page OCR failed: ${error.message}`);
    }
  }

  // Process image file directly (your original working method)
  async processImageFile(file, progressCallback = null) {
    if (!file || !file.type.startsWith('image/')) {
      throw new Error('Invalid image file provided');
    }

    try {
      if (progressCallback) {
        progressCallback({
          stage: 'file-prep',
          progress: 5,
          message: 'Preparing image file...'
        });
      }

      const result = await this.extractTextFromImage(file, (progress) => {
        if (progressCallback) {
          progressCallback({
            stage: progress.stage,
            progress: 5 + (progress.progress * 0.95), // Scale to 5-100%
            message: progress.message
          });
        }
      });
      
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

// Singleton pattern (your original approach that was working)
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

// Convenience function (keeping your original API)
export async function extractTextWithOCR(imageSource, progressCallback = null, language = 'eng') {
  try {
    const processor = await getOCRProcessor(language);
    return await processor.extractTextFromImage(imageSource, progressCallback);
  } catch (error) {
    throw new Error(`OCR processing failed: ${error.message}`);
  }
}

// Clean up (keeping your original API)
export async function cleanupOCR() {
  if (ocrInstance) {
    await ocrInstance.terminate();
    ocrInstance = null;
  }
}

// Export supported languages
export { SUPPORTED_LANGUAGES };

// Helper function (keeping your original API)
export function isOCRSupported() {
  try {
    return typeof Worker !== 'undefined' && 
           typeof createWorker !== 'undefined' &&
           typeof URL !== 'undefined' &&
           typeof URL.createObjectURL !== 'undefined';
  } catch (error) {
    return false;
  }
}