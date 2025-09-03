import { useState, useRef } from "react";
import { LLMService } from "../../utils/llmService";
import ErrorMessage from "./ErrorMessage";
import AIConfigPanel from "./AIConfigPanel";
import Dropzone from "./Dropzone";
import TextModeInput from "./TextModeInput";
import { MAX_FILE_SIZE, SUPPORTED } from "./utils";

const FileUpload = ({ onFileUpload, hasAI, loading: loadingFromParent = false, onReconfigure }) => {
  // states & logic (same as before)
  // ...
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
