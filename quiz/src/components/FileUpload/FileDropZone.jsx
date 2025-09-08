import {
  Box,
  Stack,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Divider,
} from "@mui/material";
import { Upload, X, Play, Sparkles } from "lucide-react";
import { DropZone, FileIcon, LoadingOverlay } from "./styles";
import { formatBytes, MAX_FILE_SIZE } from "./utils";

const FileDropZone = ({
  dragOver,
  fileName,
  fileSize,
  fileType,
  clearSelectedFile,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  handleGenerateQuiz,
  effectiveLoading,
  uploadProgress,
  selectedFile,
  fileInputRef,
  handleFileSelect,
  getFileIcon,
}) => (
  <DropZone
    isDragActive={dragOver}
    hasFile={!!fileName}
    onDrop={handleDrop}
    onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
    onClick={() => fileInputRef.current?.click()}
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
            }}
          />
          <Typography variant="caption" sx={{ mt: 1, display: "block", textAlign: "center" }}>
            {Math.round(uploadProgress)}% Complete
          </Typography>
        </Box>
      </LoadingOverlay>
    )}

    {fileName ? (
      <Stack spacing={2} alignItems="center">
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: 2,
            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          {getFileIcon(fileType)}
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            {fileName}
          </Typography>
          {fileSize && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {formatBytes(fileSize)}
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<X size={16} />}
            onClick={(e) => {
              e.stopPropagation();
              clearSelectedFile();
            }}
            size="small"
            disabled={effectiveLoading}
          >
            Remove
          </Button>
          <Button
            variant="contained"
            startIcon={<Play size={16} />}
            onClick={(e) => {
              e.stopPropagation();
              handleGenerateQuiz();
            }}
            size="small"
            disabled={effectiveLoading || !selectedFile}
          >
            Generate Quiz
          </Button>
        </Stack>
      </Stack>
    ) : (
      <Stack spacing={3} alignItems="center">
        <FileIcon>
          <Upload size={40} />
        </FileIcon>

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            {dragOver ? "Drop your file here" : "Upload your document"}
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", mb: 2 }}>
            Drag and drop your file here, or click to browse
          </Typography>

          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
            <Chip label="PDF" size="small" variant="outlined" />
            <Chip label="DOCX" size="small" variant="outlined" />
            <Chip label="TXT" size="small" variant="outlined" />
            <Chip label="HTML" size="small" variant="outlined" />
          </Stack>
        </Box>

        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Maximum file size: {formatBytes(MAX_FILE_SIZE)}
        </Typography>
      </Stack>
    )}

    {/* Hidden Input */}
    <input
      ref={fileInputRef}
      type="file"
      accept=".pdf,.doc,.docx,.txt,.html"
      onChange={(e) => handleFileSelect(e.target.files[0])}
      style={{ display: "none" }}
      disabled={effectiveLoading}
    />
  </DropZone>
);

export default FileDropZone;
