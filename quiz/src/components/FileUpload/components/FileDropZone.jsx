// src/components/FileDropZone.jsx
import React from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  LinearProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { Upload, FileText, Brain, X, File, FileType, Type, Sparkles } from "lucide-react";
import { DropZone, FileIcon, LoadingOverlay, pulse } from "../ModernFileUpload.styles";
import { formatBytes, MAX_FILE_SIZE } from "../utils";

const FileDropZone = ({
  dragOver,
  fileName,
  fileSize,
  fileType,
  useAI,
  effectiveLoading,
  uploadProgress,
  fileInputRef,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileSelect,
  onClear,
  onGenerateQuiz,
  error,
  setError,
}) => {
  const getFileIcon = (type) => {
    if (type.includes("pdf")) return <FileType size={40} />;
    if (type.includes("word") || type.includes("document")) return <FileText size={40} />;
    if (type.includes("text")) return <Type size={40} />;
    return <File size={40} />;
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <DropZone
      isDragActive={dragOver}
      hasFile={!!fileName}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => {
        if (!fileName) fileInputRef.current?.click();
      }}
      sx={{ position: "relative" }}
    >
      {effectiveLoading && (
        <LoadingOverlay>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              mb: 2,
              animation: `${pulse} 1.5s infinite`,
            }}
          >
            <Sparkles size={24} />
          </Box>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            Processing Your Content
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
            AI is analyzing and generating questions...
          </Typography>
          <Box sx={{ width: "100%", maxWidth: 300 }}>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{
                height: 8,
                borderRadius: 4,
                "& .MuiLinearProgress-bar": {
                  background: "linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)",
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{ mt: 1, display: "block", textAlign: "center" }}
            >
              {Math.round(uploadProgress)}%
            </Typography>
          </Box>
        </LoadingOverlay>
      )}

      {!fileName ? (
        <Box>
          <FileIcon>
            <Upload size={36} />
          </FileIcon>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            Drag & drop your study material here
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
            Supports PDF, DOCX, TXT, HTML (Max {formatBytes(MAX_FILE_SIZE)})
          </Typography>
          <Button variant="contained" startIcon={<Upload />} sx={{ borderRadius: 2 }}>
            Browse Files
          </Button>
        </Box>
      ) : (
        <Box>
          <FileIcon>{getFileIcon(fileType)}</FileIcon>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {fileName}
          </Typography>
          {fileSize && (
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              {formatBytes(fileSize)}
            </Typography>
          )}
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
            {useAI && (
              <Button
                variant="contained"
                startIcon={<Brain />}
                onClick={onGenerateQuiz}
                disabled={effectiveLoading}
                sx={{ borderRadius: 2 }}
              >
                Generate Quiz
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<X />}
              onClick={onClear}
              disabled={effectiveLoading}
              sx={{ borderRadius: 2 }}
            >
              Remove
            </Button>
          </Stack>
        </Box>
      )}

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
        accept=".pdf,.doc,.docx,.txt,.html"
      />

      {/* Error Popup */}
      <Snackbar
        open={!!error}
        autoHideDuration={7000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </DropZone>
  );
};

export default FileDropZone;
