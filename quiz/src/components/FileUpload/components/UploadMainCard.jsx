// src/components/UploadMainCard.jsx
import React from "react";
import {
  CardContent,
  Alert,
  IconButton,
  Divider,
  Fade,
} from "@mui/material";
import { X } from "lucide-react";

import ConfigPanel from "./ConfigPanel";
import FileDropZone from "./FileDropZone";
import TextModeInput from "./TextModeInput";

const UploadMainCard = ({
  error,
  setError,
  hasAI,
  apiKey,
  effectiveLoading,
  aiOptions,
  setAiOptions,
  handleReconfigure,
  dragOver,
  fileName,
  fileSize,
  fileType,
  useAI,
  uploadProgress,
  fileInputRef,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  handleFileSelect,
  clearSelectedFile,
  handleGenerateQuiz,
  baseUrl,
  onFileUpload,
}) => {
  return (
    <CardContent sx={{ p: 4, position: "relative" }}>
      {/* ❌ Error Alert */}
      {error && (
        <Fade in={!!error}>
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
              <IconButton size="small" onClick={() => setError(null)}>
                <X size={16} />
              </IconButton>
            }
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* ⚙️ AI Config Panel */}
      {hasAI && (
        <ConfigPanel
          hasAI={hasAI}
          apiKey={apiKey}
          loading={effectiveLoading}
          initialOptions={aiOptions}
          onOptionsChange={(opts) => setAiOptions(opts)}
          onReconfigure={handleReconfigure}
        />
      )}

      {/* 📂 File Upload */}
      <FileDropZone
        dragOver={dragOver}
        fileName={fileName}
        fileSize={fileSize}
        fileType={fileType}
        useAI={useAI}
        effectiveLoading={effectiveLoading}
        uploadProgress={uploadProgress}
        fileInputRef={fileInputRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onFileSelect={handleFileSelect}
        onClear={clearSelectedFile}
        onGenerateQuiz={handleGenerateQuiz}
      />

      <Divider sx={{ my: 4 }}>or</Divider>

      {/* 📝 Text Input Mode */}
      <TextModeInput
        apiKey={apiKey}
        baseUrl={baseUrl}
        aiOptions={aiOptions}
        onQuizGenerated={(questions, options) =>
          onFileUpload(questions, true, options)
        }
      />
    </CardContent>
  );
};

export default UploadMainCard;
