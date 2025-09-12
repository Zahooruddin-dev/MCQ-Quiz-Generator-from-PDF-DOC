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
import { Upload, FileText, Brain, X, File, FileType, Type, Sparkles, Eye, Settings, RefreshCw } from "lucide-react";
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
  loadingStage,
  stageMessage,
  processingDetails,
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
    const t = (type || '').toLowerCase();
    if (t.includes("pdf")) return <FileType size={40} />;
    if (t.includes("word") || t.includes("document") || t.includes("msword")) return <FileText size={40} />;
    if (t.includes("text") || t.includes("plain")) return <Type size={40} />;
    return <File size={40} />;
  };

  const handleCloseError = () => {
    setError(null);
  };

  // Get stage-specific icon and color
  const getStageIcon = (stage) => {
    switch (stage) {
      case 'reading': return FileText;
      case 'processing': return Settings;
      case 'ocr': return Eye;
      case 'analyzing': return RefreshCw;
      case 'generating': return Brain;
      case 'finalizing': return Sparkles;
      case 'complete': return Sparkles;
      default: return FileText;
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'reading': return '#3b82f6';
      case 'processing': return '#f59e0b';
      case 'ocr': return '#8b5cf6';
      case 'analyzing': return '#10b981';
      case 'generating': return '#6366f1';
      case 'finalizing': return '#06b6d4';
      case 'complete': return '#10b981';
      default: return '#6366f1';
    }
  };

  const StageIcon = getStageIcon(loadingStage);
  const stageColor = getStageColor(loadingStage);
  const safeDetails = processingDetails || { textExtracted: 0, ocrConfidence: null, questionsGenerated: 0 };

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
      role="button"
      tabIndex={0}
      aria-label={!fileName ? "Upload file by clicking or dragging" : `File selected: ${fileName}`}
      onKeyDown={(e) => {
        if (!fileName && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          fileInputRef.current?.click();
        }
      }}
      sx={{ position: "relative" }}
    >
      {effectiveLoading && (
        <LoadingOverlay>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${stageColor} 0%, #6366F1 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              mb: 3,
              animation: `${pulse} 1.5s infinite`,
            }}
          >
            <StageIcon size={32} />
          </Box>
          
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, textAlign: 'center' }}>
            {loadingStage === 'reading' && 'Reading Document'}
            {loadingStage === 'processing' && 'Processing Content'}
            {loadingStage === 'ocr' && 'Extracting Text'}
            {loadingStage === 'analyzing' && 'Analyzing Content'}
            {loadingStage === 'generating' && 'Generating Questions'}
            {loadingStage === 'finalizing' && 'Finalizing Quiz'}
            {loadingStage === 'complete' && 'Complete!'}
            {!loadingStage && 'Processing Your Content'}
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: "text.secondary", 
              mb: 3, 
              textAlign: 'center',
              minHeight: '2.5em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {stageMessage || 'Please wait while we process your file...'}
          </Typography>
          
          {/* Processing details */}
          {(safeDetails.textExtracted > 0 || safeDetails.ocrConfidence || safeDetails.questionsGenerated > 0) && (
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
                {safeDetails.textExtracted > 0 && (
                  <Typography variant="caption" sx={{ 
                    bgcolor: 'rgba(255,255,255,0.1)', 
                    px: 1, 
                    py: 0.5, 
                    borderRadius: 1,
                    color: 'white'
                  }}>
                    📄 {safeDetails.textExtracted} chars extracted
                  </Typography>
                )}
                {typeof safeDetails.ocrConfidence === 'number' && (
                  <Typography variant="caption" sx={{ 
                    bgcolor: 'rgba(255,255,255,0.1)', 
                    px: 1, 
                    py: 0.5, 
                    borderRadius: 1,
                    color: 'white'
                  }}>
                    👁️ {Math.round(safeDetails.ocrConfidence)}% confidence
                  </Typography>
                )}
                {safeDetails.questionsGenerated > 0 && (
                  <Typography variant="caption" sx={{ 
                    bgcolor: 'rgba(255,255,255,0.1)', 
                    px: 1, 
                    py: 0.5, 
                    borderRadius: 1,
                    color: 'white'
                  }}>
                    🧠 {safeDetails.questionsGenerated} questions created
                  </Typography>
                )}
              </Stack>
            </Box>
          )}
          
          <Box sx={{ width: "100%", maxWidth: 400 }}>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{
                height: 8,
                borderRadius: 4,
                "& .MuiLinearProgress-bar": {
                  background: `linear-gradient(90deg, ${stageColor} 0%, #6366F1 100%)`,
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{ mt: 1, display: "block", textAlign: "center", color: 'white', fontWeight: 500 }}
            >
              {Math.round(uploadProgress)}% Complete
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
          <Button
            variant="contained"
            startIcon={<Upload />}
            sx={{ borderRadius: 2 }}
            aria-label="Browse files to upload"
            onClick={() => fileInputRef.current?.click()}
          >
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
        aria-hidden="true"
        tabIndex={-1}
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


export default React.memo(FileDropZone);
