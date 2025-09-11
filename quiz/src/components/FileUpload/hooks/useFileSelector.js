import { useCallback } from "react";
import { MAX_FILE_SIZE, SUPPORTED, formatBytes } from "../utils";

/**
 * useFileSelector
 * Encapsulates file validation + selection logic
 *
 * @param {Object} params
 * @param {Function} params.setError
 * @param {Function} params.setFileName
 * @param {Function} params.setFileSize
 * @param {Function} params.setFileType
 * @param {Function} params.setSelectedFile
 * @param {Function} params.clearSelectedFile
 * @param {Function} params.processFile
 * @param {boolean} params.useAI
 *
 * @returns {Object} { handleFileSelect }
 */
export const useFileSelector = ({
  setError,
  setFileName,
  setFileSize,
  setFileType,
  setSelectedFile,
  clearSelectedFile,
  processFile,
  useAI,
}) => {
  const handleFileSelect = useCallback(
    async (file) => {
      setError(null);

      try {
        if (!file) return;

        setFileName(file.name || "uploaded-file");
        setFileSize(file.size || null);
        setFileType(file.type || "");
        setSelectedFile(file);

        if (file.size && file.size > MAX_FILE_SIZE) {
          setError(
            `File is too large (${formatBytes(
              file.size
            )}). Maximum allowed size is ${formatBytes(MAX_FILE_SIZE)}.`
          );
          clearSelectedFile();
          return;
        }

        const mime = (file.type || "").toLowerCase();
        const isSupported =
          SUPPORTED.some((s) => mime.includes(s)) ||
          /\.(pdf|docx?|txt|html)$/i.test(file.name || "");

        if (!isSupported) {
          setError(
            "Unsupported file type. Please upload PDF, DOCX, TXT, or HTML files."
          );
          clearSelectedFile();
          return;
        }

        if (!useAI) {
          await processFile(file, false);
        }
      } catch (err) {
        console.error("Error selecting file:", err);
        setError(err?.message || "Failed to select file. Please try again.");
      }
    },
    [
      setError,
      setFileName,
      setFileSize,
      setFileType,
      setSelectedFile,
      clearSelectedFile,
      processFile,
      useAI,
    ]
  );

  return { handleFileSelect };
};
