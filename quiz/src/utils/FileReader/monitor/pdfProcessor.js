// pdfProcessor.js - Optimized PDF processing with smart OCR fallback
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { 
  MAX_PDF_PAGES, 
  MAX_OCR_PAGES, 
  MEANINGFUL_TEXT_LENGTH, 
  MIN_TEXT_LENGTH,
  FILE_ERROR_TYPES,
  OCR_CONFIG 
} from '../types/types.js';
import { FileProcessingError } from '../types/errors.js';
import { withTimeout } from '../types/progress.js';
import { getOCRProcessor, isOCRSupported } from './ocrProcessor.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export async function processPDF(arrayBuffer, filename, progress) {
  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    throw new FileProcessingError(
      FILE_ERROR_TYPES.CORRUPTED_FILE,
      'PDF file is empty or corrupted'
    );
  }

  console.log(`Processing PDF: ${filename} (${arrayBuffer.byteLength} bytes)`);
  progress.update('pdf', 0, 'Loading PDF document...');

  // Load PDF with timeout
  const pdf = await withTimeout(
    loadPDF(arrayBuffer),
    10000,
    'PDF loading timed out'
  ).catch(error => {
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
  });

  const totalPages = Math.min(pdf.numPages, MAX_PDF_PAGES);
  progress.update('pdf', 10, `Processing PDF with ${totalPages} pages...`);

  // Fast text extraction with early termination
  const textResult = await extractTextFromPDF(pdf, totalPages, progress);
  
  // If we have good text content, return immediately
  if (textResult.hasGoodContent) {
    progress.update('pdf', 100, 'Successfully extracted text from PDF');
    return textResult.text;
  }

  // Smart OCR fallback only for promising pages
  if (textResult.candidatePages.length > 0 && isOCRSupported()) {
    const ocrText = await performSmartOCR(pdf, textResult.candidatePages, progress);
    const finalText = (textResult.text + '\n\n' + ocrText).trim();
    
    if (finalText.length > MEANINGFUL_TEXT_LENGTH) {
      progress.update('pdf', 100, 'Successfully extracted text using OCR');
      return finalText;
    }
  }

  // Final fallback - return whatever we have or fail
  if (textResult.text.trim().length > MIN_TEXT_LENGTH) {
    progress.update('pdf', 100, 'Extracted limited text from PDF');
    return textResult.text.trim();
  }

  throw new FileProcessingError(
    FILE_ERROR_TYPES.EMPTY_CONTENT,
    'This PDF contains no readable text content.'
  );
}

async function loadPDF(arrayBuffer) {
  return await pdfjsLib.getDocument({
    data: arrayBuffer,
    verbosity: 0,
    enableXfa: false, // Disable XFA for performance
    stopAtErrors: false,
  }).promise;
}

async function extractTextFromPDF(pdf, totalPages, progress) {
  let extractedText = '';
  let hasGoodContent = false;
  const candidatePages = [];
  const pagePromises = [];

  // Process pages in parallel with batching
  const batchSize = 5;
  for (let start = 1; start <= totalPages; start += batchSize) {
    const end = Math.min(start + batchSize - 1, totalPages);
    const batch = [];
    
    for (let pageNum = start; pageNum <= end; pageNum++) {
      batch.push(processPage(pdf, pageNum));
    }
    
    const batchResults = await Promise.allSettled(batch);
    
    batchResults.forEach((result, index) => {
      const pageNum = start + index;
      
      if (result.status === 'fulfilled') {
        const pageData = result.value;
        
        if (pageData.text.length > MEANINGFUL_TEXT_LENGTH) {
          extractedText += pageData.text + '\n\n';
          hasGoodContent = true;
        } else if (pageData.hasImages && pageData.text.length < MIN_TEXT_LENGTH) {
          candidatePages.push(pageNum);
        }
      } else {
        console.warn(`Failed to process page ${pageNum}:`, result.reason?.message);
      }
      
      const progressPercent = 10 + (pageNum / totalPages) * 50;
      progress.update('pdf', progressPercent, `Processing page ${pageNum} of ${totalPages}...`);
    });

    // Early termination if we have enough good content
    if (hasGoodContent && extractedText.length > 1000) {
      break;
    }
  }

  return {
    text: extractedText.trim(),
    hasGoodContent,
    candidatePages: candidatePages.slice(0, MAX_OCR_PAGES) // Limit OCR pages
  };
}

async function processPage(pdf, pageNum) {
  const page = await pdf.getPage(pageNum);
  const [textContent, operatorList] = await Promise.all([
    page.getTextContent(),
    page.getOperatorList()
  ]);

  let pageText = '';
  let lastY = null;

  if (textContent.items && textContent.items.length > 0) {
    textContent.items.forEach((item) => {
      if (lastY !== null && lastY - item.transform[5] > 5) {
        pageText += '\n';
      }
      pageText += item.str + ' ';
      lastY = item.transform[5];
    });
  }

  // Detect if page has images (potential OCR candidate)
  const hasImages = operatorList.fnArray.some(fn => 
    fn === pdfjsLib.OPS.paintImageXObject || 
    fn === pdfjsLib.OPS.paintJpegXObject
  );

  return {
    text: pageText.trim(),
    hasImages,
    pageNum
  };
}

async function performSmartOCR(pdf, candidatePages, progress) {
  if (!isOCRSupported() || candidatePages.length === 0) {
    return '';
  }

  progress.update('pdf', 70, 'Starting OCR on selected pages...');
  
  try {
    const ocrProcessor = await withTimeout(
      getOCRProcessor(OCR_CONFIG.DEFAULT_LANGUAGE),
      5000,
      'OCR processor initialization timed out'
    );
    
    let ocrText = '';
    const pagesToProcess = Math.min(candidatePages.length, MAX_OCR_PAGES);
    
    // Process OCR pages with individual timeouts
    for (let i = 0; i < pagesToProcess; i++) {
      const pageNum = candidatePages[i];
      
      try {
        const page = await pdf.getPage(pageNum);
        const subProgress = progress.createSubProgress(20 / pagesToProcess, 70 + (i * 20 / pagesToProcess));
        
        const pageOCRText = await withTimeout(
          ocrProcessor.extractTextFromPDFPage(page, (ocrProgress) => {
            subProgress.update(ocrProgress.progress, `OCR page ${pageNum}: ${ocrProgress.message}`);
          }),
          OCR_CONFIG.TIMEOUT_MS,
          `OCR timeout for page ${pageNum}`
        );
        
        if (pageOCRText && pageOCRText.trim().length > MIN_TEXT_LENGTH) {
          ocrText += `\n--- Page ${pageNum} (OCR) ---\n${pageOCRText}\n`;
        }
        
      } catch (ocrError) {
        console.warn(`OCR failed for page ${pageNum}:`, ocrError.message);
        // Continue with other pages
      }
    }
    
    return ocrText.trim();
    
  } catch (error) {
    console.error('OCR processing failed:', error);
    return '';
  }
}