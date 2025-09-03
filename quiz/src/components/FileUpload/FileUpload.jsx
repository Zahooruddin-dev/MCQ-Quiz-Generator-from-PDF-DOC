import { useState, useRef } from "react";
import { LLMService } from "../../utils/llmService";
import ErrorMessage from "./ErrorMessage";
import AIConfigPanel from "./AIConfigPanel";
import Dropzone from "./Dropzone";
import TextModeInput from "./TextModeInput";
import { MAX_FILE_SIZE, SUPPORTED, formatBytes } from "./utils";

const FileUpload = ({ onFileUpload, hasAI, loading: loadingFromParent = false, onReconfigure }) => {
  const [error, setError] = useState(null);
  const [useAI, setUseAI] = useState(hasAI);
  const [aiOptions, setAiOptions] = useState({ numQuestions: 10, difficulty: "medium" });

  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(null);
  const [fileType, setFileType] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const [showTextMode, setShowTextMode] = useState(true);
  const [pastedText, setPastedText] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const busyRef = useRef(false);

  const effectiveLoading = isLoading || loadingFromParent;

  const SAMPLE_TEXT = `Sample MCQ source text:
1) The capital of France is Paris.
2) Water boils at 100 degrees Celsius at sea level.`;

  // ---- Helpers ----
  const startLoading = () => {
    setError(null);
    setIsLoading(true);
    busyRef.current = true;
  };
  const stopLoading = () => {
    setIsLoading(false);
    busyRef.current = false;
  };

  // ---- Handlers ----
  const handleReconfigure = (e) => {
    e?.preventDefault?.();
    if (typeof onReconfigure === "function") {
      onReconfigure();
    }
  };

  const clearSelectedFile = () => {
    setFileName("");
    setFileSize(null);
    setFileType("");
    setError(null);
  };

  const handleFileSelect = async (file) => {
    if (busyRef.current) return;
    setError(null);

    try {
      if (!file) return;

      setFileName(file.name || "uploaded-file");
      setFileSize(file.size || null);
      setFileType(file.type || "");

      if (file.size && file.size > MAX_FILE_SIZE) {
        setError(`File is too big (${formatBytes(file.size)}). Max allowed is ${formatBytes(MAX_FILE_SIZE)}.`);
        clearSelectedFile();
        return;
      }

      const mime = (file.type || "").toLowerCase();
      const isSupported = SUPPORTED.some((s) => mime.includes(s)) || /\.(pdf|docx?|txt|html)$/i.test(file.name || "");
      if (!isSupported) {
        setError("Unsupported file type. Supported: PDF, DOCX, TXT, HTML.");
        return;
      }

      if (!useAI) {
        onFileUpload(file, false, null);
        return;
      }

      const apiKey = localStorage.getItem("geminiApiKey");
      if (!apiKey || apiKey.trim().length < 8) {
        setError("Please configure your API key first (click Configure API).");
        return;
      }

      startLoading();
      const llmService = new LLMService(apiKey, "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent");
      const questions = await llmService.generateQuizQuestions(file, aiOptions);

      onFileUpload(questions, true, aiOptions);
    } catch (err) {
      console.error("Error processing file:", err);
      setError(err?.message || "Failed to process file.");
    } finally {
      stopLoading();
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) handleFileSelect(files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleTextSubmit = async (textContent) => {
    if (busyRef.current) return;
    setError(null);

    try {
      if (!textContent || !textContent.trim()) {
        setError("Please paste some content first.");
        return;
      }

      const apiKey = localStorage.getItem("geminiApiKey");
      if (!apiKey || apiKey.trim().length < 8) {
        setError("Please configure your API key first (click Configure API).");
        return;
      }

      startLoading();
      const llmService = new LLMService(apiKey, "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent");
      const questions = await llmService.generateQuizQuestions(textContent, aiOptions);

      onFileUpload(questions, true, aiOptions);
    } catch (err) {
      console.error("Error processing text:", err);
      setError(err?.message || "Failed to process text.");
    } finally {
      stopLoading();
      setPastedText("");
      setShowTextMode(false);
    }
  };

  // ---- JSX ----
return (
  <div className="upload-container">
    <ErrorMessage error={error} onDismiss={() => setError(null)} />

    {hasAI && (
      <AIConfigPanel
        useAI={useAI}
        setUseAI={setUseAI}
        aiOptions={aiOptions}
        setAiOptions={setAiOptions}
        effectiveLoading={effectiveLoading}
        onReconfigure={handleReconfigure}
        onSample={() => handleTextSubmit(SAMPLE_TEXT)}
      />
    )}

    <Dropzone
      dragOver={dragOver}
      effectiveLoading={effectiveLoading}
      fileName={fileName}
      fileSize={fileSize}
      fileType={fileType}
      onClear={clearSelectedFile}
      onFileClick={() => document.getElementById("file-input")?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    />

    {/* 🔹 Sample Button Here */}
    <div style={{ marginTop: 12, textAlign: "center" }}>
      <button
        className="btn"
        onClick={() => handleTextSubmit(SAMPLE_TEXT)}
        disabled={effectiveLoading}
      >
        Try Sample Text
      </button>
    </div>

    <input
      id="file-input"
      type="file"
      accept=".txt,.docx,.doc,.html,.pdf"
      onChange={(e) => handleFileSelect(e.target.files[0])}
      disabled={effectiveLoading}
    />

    {showTextMode && (
      <TextModeInput
        pastedText={pastedText}
        setPastedText={setPastedText}
        onSubmit={handleTextSubmit}
        onCancel={() => {
          setShowTextMode(false);
          setPastedText("");
        }}
        effectiveLoading={effectiveLoading}
      />
    )}
  </div>
);

};

export default FileUpload;
