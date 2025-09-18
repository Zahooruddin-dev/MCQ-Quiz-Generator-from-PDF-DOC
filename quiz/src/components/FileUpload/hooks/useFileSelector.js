import { useCallback } from "react";
import { MAX_FILE_SIZE, SUPPORTED, formatBytes } from "../utils";

/**
 * useFileSelector - Debug Version
 * Encapsulates file validation + selection logic
 * Now with auto-read functionality for AI files
 */
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
  startLoading, // NEW: Start loading state
  stopLoading, // NEW: Stop loading state
  updateLoadingStage, // NEW: Update loading progress
}) => {
  const handleFileSelect = useCallback(
    async (file) => {
      console.log("🚀 handleFileSelect called with:", file?.name, file?.size);
      
      setError(null);

      try {
        if (!file) {
          console.log("❌ No file provided");
          return;
        }

        console.log("✅ Setting basic file info");
        setFileName(file.name || "uploaded-file");
        setFileSize(file.size || null);
        setFileType(file.type || "");
        setSelectedFile(file);

        // File size validation
        if (file.size && file.size > MAX_FILE_SIZE) {
          const errorMsg = `File is too large (${formatBytes(
            file.size
          )}). Maximum allowed size is ${formatBytes(MAX_FILE_SIZE)}.`;
          console.log("❌ File too large:", errorMsg);
          setError(errorMsg);
          clearSelectedFile();
          return;
        }

        // File type validation
        const mime = (file.type || "").toLowerCase();
        const isSupported =
          SUPPORTED.some((s) => mime.includes(s)) ||
          /\.(pdf|docx?|txt|html)$/i.test(file.name || "");

        if (!isSupported) {
          const errorMsg = "Unsupported file type. Please upload PDF, DOCX, TXT, or HTML files.";
          console.log("❌ Unsupported file type:", errorMsg);
          setError(errorMsg);
          clearSelectedFile();
          return;
        }

        console.log("✅ File validation passed");

        // Handle non-AI files (original behavior)
        if (!useAI) {
          console.log("📁 Non-AI file, processing immediately");
          if (setFileReadStatus) setFileReadStatus('ready');
          await processFile(file, false);
          return;
        }

        // Handle AI files with auto-read
        console.log("🤖 AI file detected, starting auto-read");
        
        // Set status to reading if the setter exists
        if (setFileReadStatus) {
          console.log("📊 Setting file status to 'reading'");
          setFileReadStatus('reading');
        }

        // Check if we have the loading functions
        if (!startLoading || !stopLoading || !updateLoadingStage) {
          console.warn("⚠️ Loading functions not provided, skipping auto-read");
          if (setFileReadStatus) setFileReadStatus('ready');
          return;
        }

        try {
          console.log("🔄 Starting file reading process");
          startLoading('reading', `Reading ${file.name}...`);
          
          // Dynamic import of LLMService to avoid import issues
          const { LLMService } = await import('../../../utils/llmService/llmService');
          console.log("✅ LLMService imported successfully");
          
          const llmService = new LLMService();
          
          // Read file content with progress tracking
          console.log("📖 Starting file content extraction");
          const extractedText = await llmService.readFileContent(file, (progressInfo) => {
            console.log("📊 Progress update:", progressInfo);
            
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
          
          console.log("✅ File content extracted:", extractedText?.length, "characters");
          
          // Store the extracted text
          if (setExtractedText) {
            setExtractedText(extractedText);
            console.log("💾 Extracted text stored");
          }
          
          if (setFileReadStatus) {
            setFileReadStatus('ready');
            console.log("✅ File status set to 'ready'");
          }
          
          updateLoadingStage(
            'complete',
            `File read successfully! ${extractedText.length} characters extracted.`,
            100,
            { textExtracted: extractedText.length }
          );
          
          // Stop loading after a brief delay to show completion
          setTimeout(() => {
            stopLoading();
            console.log("🏁 Loading stopped");
          }, 1000);
          
        } catch (readError) {
          console.error('❌ Error reading file:', readError);
          let userMessage = readError?.message || 'Failed to read file. Please try again.';
          
          // Enhanced error messages based on file type
          if (userMessage.includes('OCR')) {
            userMessage += ' Try using a higher quality image or a different file format.';
          } else if (userMessage.includes('PDF')) {
            userMessage += ' The PDF may be password-protected or corrupted.';
          } else if (userMessage.includes('DOCX')) {
            userMessage += ' The Word document may be corrupted.';
          }
          
          setError(userMessage);
          if (setFileReadStatus) setFileReadStatus('error');
          if (setExtractedText) setExtractedText('');
          stopLoading();
        }

      } catch (err) {
        console.error("❌ Error in handleFileSelect:", err);
        setError(err?.message || "Failed to select file. Please try again.");
        if (useAI) {
          if (setFileReadStatus) setFileReadStatus('error');
          if (setExtractedText) setExtractedText('');
        }
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
      clearSelectedFile,
      processFile,
      useAI,
      startLoading,
      stopLoading,
      updateLoadingStage,
    ]
  );

  
  return { handleFileSelect };
};