// hooks/useFileSelector.js - Modified to auto-read files on upload
import { useCallback } from 'react';
import { MAX_FILE_SIZE, SUPPORTED } from '../utils';
import { LLMService } from '../../../utils/llmService';

export const useFileSelector = ({
  setError,
  setFileName,
  setFileSize,
  setFileType,
  setSelectedFile,
  setExtractedText, // NEW: Store extracted text
  setFileReadStatus, // NEW: Track file read status
  clearSelectedFile,
  processFile,
  useAI,
  startLoading,
  stopLoading,
  updateLoadingStage,
}) => {
  const handleFileSelect = useCallback(
    async (file) => {
      if (!file) return;
      
      setError(null);
      
      // Validate file first
      if (file.size > MAX_FILE_SIZE) {
        setError(`File size exceeds ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB limit.`);
        return;
      }
      
      const extension = file.name.toLowerCase().split('.').pop();
      if (!SUPPORTED.includes(`.${extension}`)) {
        setError(`Unsupported file type. Please use: ${SUPPORTED.join(', ')}`);
        return;
      }
      
      // Set file info immediately
      setFileName(file.name);
      setFileSize(file.size);
      setFileType(file.type);
      setSelectedFile(file);
      setFileReadStatus('reading'); // NEW: Set status to reading
      
      // If not using AI, just store the file without reading
      if (!useAI) {
        setFileReadStatus('ready'); // NEW: Set status to ready
        return;
      }
      
      // START READING FILE IMMEDIATELY (the key change!)
      try {
        startLoading('reading', `Reading ${file.name}...`);
        
        const llmService = new LLMService();
        
        // Read file content with progress tracking
        const extractedText = await llmService.readFileContent(file, (progressInfo) => {
          if (progressInfo.stage === 'ocr') {
            updateLoadingStage(
              'ocr',
              progressInfo.message || 'Using OCR to extract text from image...',
              progressInfo.progress,
              { ocrConfidence: progressInfo.confidence }
            );
          } else if (progressInfo.stage === 'pdf') {
            updateLoadingStage(
              'processing',
              progressInfo.message || 'Processing PDF document...',
              progressInfo.progress
            );
          } else {
            updateLoadingStage(
              'reading',
              progressInfo.message || 'Reading document...',
              progressInfo.progress
            );
          }
        });
        
        // Store the extracted text
        setExtractedText(extractedText);
        setFileReadStatus('ready'); // NEW: Mark as ready for AI processing
        
        updateLoadingStage(
          'complete',
          `File read successfully! ${extractedText.length} characters extracted.`,
          100,
          { textExtracted: extractedText.length }
        );
        
        // Stop loading after a brief delay to show completion
        setTimeout(() => {
          stopLoading();
        }, 1000);
        
      } catch (error) {
        console.error('Error reading file:', error);
        let userMessage = error?.message || 'Failed to read file. Please try again.';
        
        // Enhanced error messages
        if (userMessage.includes('OCR')) {
          userMessage += ' Try using a higher quality image or a different file format.';
        } else if (userMessage.includes('PDF')) {
          userMessage += ' The PDF may be password-protected or corrupted.';
        } else if (userMessage.includes('DOCX')) {
          userMessage += ' The Word document may be corrupted.';
        }
        
        setError(userMessage);
        setFileReadStatus('error'); // NEW: Mark as error
        stopLoading();
      }
    },
    [
      setError,
      setFileName,
      setFileSize,
      setFileType,
      setSelectedFile,
      setExtractedText,
      setFileReadStatus,
      useAI,
      startLoading,
      stopLoading,
      updateLoadingStage,
    ]
  );
  
  return { handleFileSelect };
};