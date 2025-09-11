import { useCallback, useRef, useState } from "react";
import { LLMService } from "../../../utils/llmService";
import { MAX_FILE_SIZE, SUPPORTED, formatBytes } from "../utils";

export function useFileProcessor({ apiKey, baseUrl, aiOptions, onFileUpload }) {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const busyRef = useRef(false);

  const startLoading = useCallback(() => {
    setError(null);
    setIsLoading(true);
    busyRef.current = true;
    setUploadProgress(0);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    busyRef.current = false;
    setUploadProgress(0);
  }, []);

  const simulateProgress = useCallback(() => {
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
    return interval;
  }, []);

  const processFile = useCallback(
    async (file, useAI) => {
      if (busyRef.current) return;
      setError(null);

      try {
        if (!file) return;

        if (!useAI) {
          onFileUpload(file, false, null);
          return;
        }

        const effectiveApiKey = apiKey || localStorage.getItem("geminiApiKey");
        if (!effectiveApiKey || effectiveApiKey.trim().length < 8) {
          setError(
            "Please configure your API key first. Click the settings button to get started."
          );
          return;
        }

        startLoading();
        const progressInterval = simulateProgress();

        try {
          const llmService = new LLMService(effectiveApiKey, baseUrl);
          const questions = await llmService.generateQuizQuestions(
            file,
            aiOptions
          );

          setUploadProgress(100);
          setTimeout(() => {
            onFileUpload(questions, true, aiOptions);
            stopLoading();
          }, 500);
        } catch (err) {
          clearInterval(progressInterval);
          throw err;
        }
      } catch (err) {
        console.error("Error processing file:", err);
        setError(err?.message || "Failed to process file. Please try again.");
        stopLoading();
      }
    },
    [apiKey, baseUrl, aiOptions, onFileUpload, simulateProgress, startLoading, stopLoading]
  );

  return {
    error,
    setError,
    isLoading,
    uploadProgress,
    selectedFile,
    setSelectedFile,
    processFile,
  };
}
