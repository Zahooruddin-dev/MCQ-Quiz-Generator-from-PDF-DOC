import { useState, useRef } from "react";
import { LLMService } from "../../utils/llmService";
import ErrorMessage from "./ErrorMessage";
import AIConfigPanel from "./AIConfigPanel";
import Dropzone from "./Dropzone";
import TextModeInput from "./TextModeInput";
import { MAX_FILE_SIZE, SUPPORTED } from "./utils";

const FileUpload = ({ onFileUpload, hasAI, loading: loadingFromParent = false, onReconfigure }) => {
  const [error, setError] = useState(null);
  const [useAI, setUseAI] = useState(hasAI);
  const [aiOptions, setAiOptions] = useState({ numQuestions: 10, difficulty: "medium" });

  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(null);
  const [fileType, setFileType] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const [showTextMode, setShowTextMode] = useState(false);
  const [pastedText, setPastedText] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const busyRef = useRef(false);

  const effectiveLoading = isLoading || loadingFromParent;

  const SAMPLE_TEXT = `Sample MCQ source text:
1) The capital of France is Paris.
2) Water boils at 100 degrees Celsius at sea level.`;

  // ✅ FIX: Add this
  const handleReconfigure = (e) => {
    e?.preventDefault?.();
    if (typeof onReconfigure === "function") {
      onReconfigure();
    }
  };

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

      <input id="file-input" type="file" onChange={(e) => handleFileSelect(e.target.files[0])} />

      {showTextMode && (
        <TextModeInput
          pastedText={pastedText}
          setPastedText={setPastedText}
          onSubmit={handleTextSubmit}
          onCancel={() => { setShowTextMode(false); setPastedText(""); }}
          effectiveLoading={effectiveLoading}
        />
      )}
    </div>
  );
};

export default FileUpload;
