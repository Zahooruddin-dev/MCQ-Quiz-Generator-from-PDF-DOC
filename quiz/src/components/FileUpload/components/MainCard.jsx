import React from "react";
import {
  CardContent,
  Alert,
  IconButton,
  Divider,
  Fade,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { X, Smartphone, Upload, FileText } from "lucide-react";

import ConfigPanel from "./ConfigPanel";
import FileDropZone from "./FileDropZone/FileDropZone";
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
  loadingStage,
  stageMessage,
  processingDetails,
  fileInputRef,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  handleFileSelect,
  clearSelectedFile,
  handleGenerateQuiz,
  baseUrl,
  onFileUpload,
  fileReadStatus,
  extractedText,
  // Props to pass through to FileDropZone
  selectedFile,
  // NEW: Loading control functions
  startLoading,
  stopLoading,
  updateLoadingStage,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Enhanced responsive padding
  const responsivePadding = {
    xs: 2,  // 16px on mobile
    sm: 3,  // 24px on tablet
    md: 4,  // 32px on desktop
  };

  return (
    <CardContent 
      sx={{ 
        p: responsivePadding,
        position: "relative",
        // Ensure proper spacing on mobile
        '&:last-child': {
          paddingBottom: responsivePadding
        }
      }}
    >
      {/* Enhanced Error Alert with better mobile styling */}
      {error && (
        <Fade in={!!error}>
          <Alert
            severity="error"
            sx={{
              mb: { xs: 2, sm: 3 },
              borderRadius: { xs: 1, sm: 1.5 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              // Better contrast and readability
              backgroundColor: '#fef2f2',
              borderColor: '#f87171',
              color: '#dc2626',
              '& .MuiAlert-icon': {
                color: '#dc2626',
                fontSize: { xs: '1.2rem', sm: '1.5rem' }
              },
              // Enhanced mobile touch targets
              '& .MuiAlert-action': {
                marginRight: { xs: -0.5, sm: -1 },
                marginTop: { xs: -0.5, sm: -1 },
              }
            }}
            action={
              <IconButton 
                size={isMobile ? "small" : "medium"}
                onClick={() => setError(null)}
                sx={{
                  color: '#dc2626',
                  // Larger touch target on mobile
                  minWidth: { xs: 44, sm: 'auto' },
                  minHeight: { xs: 44, sm: 'auto' },
                  '&:hover': {
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                  }
                }}
                aria-label="Dismiss error"
              >
                <X size={isMobile ? 18 : 16} />
              </IconButton>
            }
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* AI Config Panel with mobile optimizations */}
      {hasAI && (
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <ConfigPanel
            hasAI={hasAI}
            apiKey={apiKey}
            loading={effectiveLoading}
            initialOptions={aiOptions}
            onOptionsChange={(opts) => setAiOptions(opts)}
            onReconfigure={handleReconfigure}
          />
        </Box>
      )}

      {/* File Upload Section with mobile-first design */}
      <Box
        sx={{
          mb: { xs: 3, sm: 4 },
          // Add subtle background on mobile for better definition
          ...(isMobile && {
            backgroundColor: '#f8fafc',
            borderRadius: 2,
            p: 2,
            border: '1px solid #e2e8f0',
          })
        }}
      >
        {/* Mobile-friendly section header */}
        {isMobile && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              color: '#475569'
            }}
          >
            <Upload size={20} style={{ marginRight: 8 }} />
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: '#475569',
                fontSize: '0.875rem'
              }}
            >
              Upload File
            </Typography>
          </Box>
        )}

        <FileDropZone
          dragOver={dragOver}
          fileName={fileName}
          fileSize={fileSize}
          fileType={fileType}
          useAI={useAI}
          effectiveLoading={effectiveLoading}
          uploadProgress={uploadProgress}
          loadingStage={loadingStage}
          stageMessage={stageMessage}
          processingDetails={processingDetails}
          fileInputRef={fileInputRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onFileSelect={handleFileSelect}
          onClear={clearSelectedFile}
          onGenerateQuiz={handleGenerateQuiz}
          error={error}
          setError={setError}
          fileReadStatus={fileReadStatus}
          extractedText={extractedText}
          // Props needed for dialog functionality
          selectedFile={selectedFile}
          apiKey={apiKey}
          aiOptions={aiOptions}
          onFileUpload={onFileUpload}
          // NEW: Loading control functions
          startLoading={startLoading}
          stopLoading={stopLoading}
          updateLoadingStage={updateLoadingStage}
        />
      </Box>

      {/* Enhanced Divider with better mobile styling */}
      <Box
        sx={{
          position: 'relative',
          my: { xs: 3, sm: 4 },
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Divider 
          sx={{ 
            flexGrow: 1,
            borderColor: '#e2e8f0'
          }} 
        />
        <Typography
          variant="body2"
          sx={{
            mx: 2,
            color: '#64748b',
            fontWeight: 500,
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            backgroundColor: 'none',
            px: 1,
          }}
        >
          or
        </Typography>
        <Divider 
          sx={{ 
            flexGrow: 1,
            borderColor: '#e2e8f0'
          }} 
        />
      </Box>

      {/* Text Input Mode with mobile optimization */}
      <Box
        sx={{
          // Add subtle background on mobile for better definition
          ...(isMobile && {
            backgroundColor: '#f8fafc',
            borderRadius: 2,
            p: 2,
            border: '1px solid #e2e8f0',
          })
        }}
      >
        {/* Mobile-friendly section header */}
        {isMobile && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              color: '#475569'
            }}
          >
            <FileText size={20} style={{ marginRight: 8 }} />
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: '#475569',
                fontSize: '0.875rem'
              }}
            >
              Type or Paste Text
            </Typography>
          </Box>
        )}

        <TextModeInput
          apiKey={apiKey}
          baseUrl={baseUrl}
          aiOptions={aiOptions}
          onQuizGenerated={(questions, options) =>
            onFileUpload(questions, true, options)
          }
        />
      </Box>

      {/* Mobile-specific helper text */}
      {isMobile && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: '#f1f5f9',
            borderRadius: 2,
            border: '1px solid #e2e8f0',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              color: '#64748b'
            }}
          >
            <Smartphone 
              size={16} 
              style={{ 
                marginRight: 8, 
                marginTop: 2,
                flexShrink: 0 
              }} 
            />
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.75rem',
                lineHeight: 1.4,
                color: '#64748b'
              }}
            >
              <strong>Mobile tip:</strong> For best results, use landscape mode when uploading large documents or working with generated quizzes.
            </Typography>
          </Box>
        </Box>
      )}
    </CardContent>
  );
};

export default UploadMainCard;