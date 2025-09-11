import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Alert,
  LinearProgress,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
  TextField,
  Fade,
  Collapse,
  Chip,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import {
  Upload,
  FileText,
  Brain,
  Settings,
  X,
  File,
  FileType,
  Sparkles,
  Type,
  Play,
} from "lucide-react";
import { LLMService } from "../../utils/llmService";
import { MAX_FILE_SIZE, SUPPORTED, formatBytes } from "./utils";
import Header from "./components/Header";
import Features from "./components/Features";

// Animations
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled Components
const UploadContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const MainCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow:
    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  border: "1px solid",
  borderColor: theme.palette.grey[200],
  overflow: "visible",
}));

const DropZone = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isDragActive" && prop !== "hasFile",
})(({ theme, isDragActive, hasFile }) => ({
  border: "2px dashed",
  borderColor: isDragActive
    ? theme.palette.primary.main
    : hasFile
    ? theme.palette.success.main
    : theme.palette.grey[300],
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(6),
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  background: isDragActive
    ? `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`
    : hasFile
    ? `linear-gradient(135deg, ${theme.palette.success.main}08 0%, ${theme.palette.success.light}08 100%)`
    : "transparent",
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    background: `linear-gradient(135deg, ${theme.palette.primary.main}05 0%, ${theme.palette.secondary.main}05 100%)`,
    transform: "translateY(-2px)",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)",
    transition: "left 0.5s",
  },
  "&:hover::before": {
    left: "100%",
  },
}));

const FileIcon = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: theme.shape.borderRadius * 2,
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  margin: "0 auto",
  marginBottom: theme.spacing(2),
  animation: `${pulse} 2s infinite`,
}));

const ConfigPanel = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}03 0%, ${theme.palette.secondary.main}03 100%)`,
  border: "1px solid",
  borderColor: theme.palette.primary.light + "20",
}));

const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(8px)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: theme.shape.borderRadius * 2,
  zIndex: 10,
}));

const TextModeCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  border: "1px solid",
  borderColor: theme.palette.grey[200],
}));

const ModernFileUpload = ({
  onFileUpload,
  hasAI,
  apiKey,
  baseUrl,
  loading: loadingFromParent = false,
  onReconfigure,
}) => {
  const [error, setError] = useState(null);
  const [useAI, setUseAI] = useState(hasAI);
  const [aiOptions, setAiOptions] = useState({
    numQuestions: 10,
    difficulty: "medium",
    questionType: "mixed",
  });
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(null);
  const [fileType, setFileType] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [showTextMode, setShowTextMode] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const busyRef = useRef(false);
  const fileInputRef = useRef(null);

  const effectiveLoading = isLoading || loadingFromParent;

  const SAMPLE_TEXT = useMemo(
    () => `Sample content for quiz generation:

1. JavaScript is a high-level, interpreted programming language that conforms to the ECMAScript specification.

2. React is a JavaScript library for building user interfaces, particularly web applications.

3. The Document Object Model (DOM) is a programming interface for HTML and XML documents.

4. Asynchronous programming in JavaScript can be handled using callbacks, promises, and async/await syntax.

5. CSS Grid and Flexbox are powerful layout systems for creating responsive web designs.`,
    []
  );

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

  const clearSelectedFile = useCallback(() => {
    setFileName("");
    setFileSize(null);
    setFileType("");
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleReconfigure = useCallback(
    (e) => {
      e?.preventDefault?.();
      if (typeof onReconfigure === "function") onReconfigure();
    },
    [onReconfigure]
  );

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
    async (file) => {
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
    [useAI, apiKey, baseUrl, aiOptions, onFileUpload, startLoading, stopLoading, simulateProgress]
  );

  const handleFileSelect = useCallback(
    async (file) => {
      if (busyRef.current) return;
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
          await processFile(file);
        }
      } catch (err) {
        console.error("Error selecting file:", err);
        setError(err?.message || "Failed to select file. Please try again.");
      }
    },
    [useAI, processFile, clearSelectedFile]
  );

  const handleGenerateQuiz = useCallback(async () => {
    if (!selectedFile) {
      setError("No file selected. Please upload a file first.");
      return;
    }
    try {
      await processFile(selectedFile);
    } catch (error) {
      console.error("Quiz generation failed:", error);
      setError(error.message);
    }
  }, [selectedFile, processFile]);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleTextSubmit = useCallback(
    async (textContent) => {
      if (busyRef.current) return;
      setError(null);

      try {
        if (!textContent?.trim()) {
          setError("Please paste some content first.");
          return;
        }

        const wordCount = textContent.trim().split(/\s+/).length;
        if (wordCount < 10) {
          setError("Please enter at least 10 words of text to generate questions.");
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
            textContent,
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
        console.error("Error processing text:", err);
        setError(err?.message || "Failed to process text. Please try again.");
        stopLoading();
      } finally {
        setPastedText("");
        setShowTextMode(false);
      }
    },
    [apiKey, baseUrl, aiOptions, onFileUpload, startLoading, stopLoading, simulateProgress]
  );

  const getFileIcon = useCallback((type) => {
    if (type.includes("pdf")) return <FileType size={40} />;
    if (type.includes("word") || type.includes("document"))
      return <FileText size={40} />;
    if (type.includes("text")) return <Type size={40} />;
    return <File size={40} />;
  }, []);

  return (
    <UploadContainer maxWidth="md">
      <Stack spacing={4}>
        <Header />
        <Features />

        <MainCard>
          <CardContent sx={{ p: 4, position: "relative" }}>
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

            {hasAI && (
              <ConfigPanel>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={3}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          background:
                            "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                        }}
                      >
                        <Settings size={20} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        AI Generation Settings
                      </Typography>
                    </Stack>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={useAI}
                          onChange={(e) => setUseAI(e.target.checked)}
                          disabled={effectiveLoading}
                        />
                      }
                      label="Enable AI-powered question generation"
                    />

                    <Collapse in={useAI}>
                      <Stack spacing={3}>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                          <TextField
                            label="Number of Questions"
                            type="number"
                            value={aiOptions.numQuestions}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAiOptions((prev) => ({
                                ...prev,
                                numQuestions: val === "" ? "" : Number(val),
                              }));
                            }}
                            onBlur={(e) => {
                              let val = Number(e.target.value);
                              if (!val || val < 5) val = 5;
                              if (val > 50) val = 50;
                              setAiOptions((prev) => ({
                                ...prev,
                                numQuestions: val,
                              }));
                            }}
                            inputProps={{ min: 5, max: 50 }}
                            disabled={effectiveLoading}
                            sx={{ flex: 1 }}
                          />
                        </Stack>

                        {!apiKey && (
                          <Alert severity="warning" sx={{ mt: 2 }}>
                            API key not configured.
                            <Button
                              size="small"
                              onClick={handleReconfigure}
                              sx={{ ml: 1 }}
                            >
                              Configure Now
                            </Button>
                          </Alert>
                        )}
                      </Stack>
                    </Collapse>
                  </Stack>
                </CardContent>
              </ConfigPanel>
            )}

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
                      background:
                        "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
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
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mb: 3 }}
                  >
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
                          background:
                            "linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)",
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
                  <Typography
                    variant="body2"
                    sx={{ mb: 3, color: "text.secondary" }}
                  >
                    Supports PDF, DOCX, TXT, HTML (Max {formatBytes(MAX_FILE_SIZE)})
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Upload />}
                    sx={{ borderRadius: 2 }}
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
                    <Typography
                      variant="body2"
                      sx={{ mb: 2, color: "text.secondary" }}
                    >
                      {formatBytes(fileSize)}
                    </Typography>
                  )}
                  <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="center"
                    sx={{ mt: 2 }}
                  >
                    {useAI && (
                      <Button
                        variant="contained"
                        startIcon={<Brain />}
                        onClick={handleGenerateQuiz}
                        disabled={effectiveLoading}
                        sx={{ borderRadius: 2 }}
                      >
                        Generate Quiz
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      startIcon={<X />}
                      onClick={clearSelectedFile}
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
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                accept=".pdf,.doc,.docx,.txt,.html"
              />
            </DropZone>

            <Divider sx={{ my: 4 }}>or</Divider>

            <Box textAlign="center">
              <Button
                variant="outlined"
                startIcon={<Type />}
                onClick={() => setShowTextMode((prev) => !prev)}
                sx={{ borderRadius: 2 }}
              >
                {showTextMode ? "Cancel Text Mode" : "Paste Text Instead"}
              </Button>
            </Box>

            <Collapse in={showTextMode} mountOnEnter unmountOnExit>
              <TextModeCard>
                <CardContent>
                  <Stack spacing={3}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Paste Text Content
                    </Typography>
                    <TextField
                      multiline
                      rows={8}
                      fullWidth
                      placeholder="Paste your study material here..."
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      disabled={effectiveLoading}
                      inputProps={{
                        style: { fontFamily: "monospace", fontSize: "0.9rem" },
                      }}
                    />
                    <Stack
                      direction="row"
                      spacing={2}
                      justifyContent="flex-end"
                    >
                      <Button
                        variant="outlined"
                        onClick={() => setPastedText(SAMPLE_TEXT)}
                        disabled={effectiveLoading}
                        startIcon={<FileText />}
                        sx={{ borderRadius: 2 }}
                      >
                        Use Sample Text
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handleTextSubmit(pastedText)}
                        disabled={effectiveLoading}
                        startIcon={<Play />}
                        sx={{ borderRadius: 2 }}
                      >
                        Generate Quiz
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </TextModeCard>
            </Collapse>
          </CardContent>
        </MainCard>
      </Stack>
    </UploadContainer>
  );
};

export default ModernFileUpload;
