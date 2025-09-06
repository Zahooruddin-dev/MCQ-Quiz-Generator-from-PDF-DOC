import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Chip,
  Alert,
  LinearProgress,
  IconButton,
  Paper,
  Divider,
  Switch,
  FormControlLabel,
  TextField,
  MenuItem,
  Fade,
  Collapse,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  Upload,
  FileText,
  Brain,
  Zap,
  Settings,
  X,
  File,
  Image,
  FileType,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Type,
  Play,
} from 'lucide-react';
import { LLMService } from '../../utils/llmService';
import { MAX_FILE_SIZE, SUPPORTED, formatBytes } from './utils';

// Animations
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
  40%, 43% { transform: translate3d(0, -8px, 0); }
  70% { transform: translate3d(0, -4px, 0); }
  90% { transform: translate3d(0, -2px, 0); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

// Styled Components
const UploadContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const MainCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  border: '1px solid',
  borderColor: theme.palette.grey[200],
  overflow: 'visible',
}));

const DropZone = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isDragActive' && prop !== 'hasFile',
})(({ theme, isDragActive, hasFile }) => ({
  border: '2px dashed',
  borderColor: isDragActive 
    ? theme.palette.primary.main 
    : hasFile 
      ? theme.palette.success.main 
      : theme.palette.grey[300],
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(6),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: isDragActive 
    ? `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`
    : hasFile
      ? `linear-gradient(135deg, ${theme.palette.success.main}08 0%, ${theme.palette.success.light}08 100%)`
      : 'transparent',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    background: `linear-gradient(135deg, ${theme.palette.primary.main}05 0%, ${theme.palette.secondary.main}05 100%)`,
    transform: 'translateY(-2px)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
    transition: 'left 0.5s',
  },
  '&:hover::before': {
    left: '100%',
  },
}));

const FileIcon = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: theme.shape.borderRadius * 2,
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  margin: '0 auto',
  marginBottom: theme.spacing(2),
  animation: `${pulse} 2s infinite`,
}));

const ConfigPanel = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}03 0%, ${theme.palette.secondary.main}03 100%)`,
  border: '1px solid',
  borderColor: theme.palette.primary.light + '20',
}));

const FeatureChip = styled(Chip)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
  border: '1px solid',
  borderColor: theme.palette.primary.light + '30',
  fontWeight: 500,
  '& .MuiChip-icon': {
    color: theme.palette.primary.main,
  },
}));

const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.shape.borderRadius * 2,
  zIndex: 10,
}));

const TextModeCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  border: '1px solid',
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
    difficulty: 'medium',
    questionType: 'mixed' 
  });
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(null);
  const [fileType, setFileType] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [showTextMode, setShowTextMode] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  // Store the actual file object for processing
  const [selectedFile, setSelectedFile] = useState(null);
  const busyRef = useRef(false);
  const fileInputRef = useRef(null);
  
  const effectiveLoading = isLoading || loadingFromParent;

  const SAMPLE_TEXT = `Sample content for quiz generation:

1. JavaScript is a high-level, interpreted programming language that conforms to the ECMAScript specification.

2. React is a JavaScript library for building user interfaces, particularly web applications.

3. The Document Object Model (DOM) is a programming interface for HTML and XML documents.

4. Asynchronous programming in JavaScript can be handled using callbacks, promises, and async/await syntax.

5. CSS Grid and Flexbox are powerful layout systems for creating responsive web designs.`;

  const startLoading = () => {
    setError(null);
    setIsLoading(true);
    busyRef.current = true;
    setUploadProgress(0);
  };

  const stopLoading = () => {
    setIsLoading(false);
    busyRef.current = false;
    setUploadProgress(0);
  };

  const clearSelectedFile = () => {
    setFileName('');
    setFileSize(null);
    setFileType('');
    setSelectedFile(null); // Clear the file object
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReconfigure = (e) => {
    e?.preventDefault?.();
    if (typeof onReconfigure === 'function') onReconfigure();
  };

  const simulateProgress = () => {
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
    return interval;
  };

  const processFile = async (file) => {
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
        setError('Please configure your API key first. Click the settings button to get started.');
        return;
      }

      startLoading();
      const progressInterval = simulateProgress();
      
      try {
        const llmService = new LLMService(effectiveApiKey, baseUrl);
        const questions = await llmService.generateQuizQuestions(file, aiOptions);
        
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
      console.error('Error processing file:', err);
      setError(err?.message || 'Failed to process file. Please try again.');
      stopLoading();
    }
  };

  const handleFileSelect = async (file) => {
    if (busyRef.current) return;
    setError(null);
    
    try {
      if (!file) return;
      
      // Store file info for display
      setFileName(file.name || 'uploaded-file');
      setFileSize(file.size || null);
      setFileType(file.type || '');
      setSelectedFile(file); // Store the actual file object
      
      if (file.size && file.size > MAX_FILE_SIZE) {
        setError(`File is too large (${formatBytes(file.size)}). Maximum allowed size is ${formatBytes(MAX_FILE_SIZE)}.`);
        clearSelectedFile();
        return;
      }
      
      const mime = (file.type || '').toLowerCase();
      const isSupported = SUPPORTED.some(s => mime.includes(s)) || /\.(pdf|docx?|txt|html)$/i.test(file.name || '');
      
      if (!isSupported) {
        setError('Unsupported file type. Please upload PDF, DOCX, TXT, or HTML files.');
        clearSelectedFile();
        return;
      }

      // If AI is disabled, process immediately
      if (!useAI) {
        await processFile(file);
      }
      // Otherwise, just store the file and let user click "Generate Quiz"

    } catch (err) {
      console.error('Error selecting file:', err);
      setError(err?.message || 'Failed to select file. Please try again.');
    }
  };

  // Function to handle the "Generate Quiz" button click
const handleGenerateQuiz = async () => {
  console.log('Starting quiz generation...');
  console.log('Selected file:', selectedFile);
  console.log('API Key exists:', !!apiKey);
  console.log('Base URL:', baseUrl);
  
  if (!selectedFile) {
    setError('No file selected. Please upload a file first.');
    return;
  }
  
  try {
    await processFile(selectedFile);
  } catch (error) {
    console.error('Quiz generation failed:', error);
    setError(error.message);
  }
};
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
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
      if (!textContent?.trim()) {
        setError('Please paste some content first.');
        return;
      }
      
      const wordCount = textContent.trim().split(/\s+/).length;
      if (wordCount < 10) {
        setError('Please enter at least 10 words of text to generate questions.');
        return;
      }

      const effectiveApiKey = apiKey || localStorage.getItem("geminiApiKey");
      if (!effectiveApiKey || effectiveApiKey.trim().length < 8) {
        setError('Please configure your API key first. Click the settings button to get started.');
        return;
      }

      startLoading();
      const progressInterval = simulateProgress();
      
      try {
        const llmService = new LLMService(effectiveApiKey, baseUrl);
        const questions = await llmService.generateQuizQuestions(textContent, aiOptions);
        
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
      console.error('Error processing text:', err);
      setError(err?.message || 'Failed to process text. Please try again.');
      stopLoading();
    } finally {
      setPastedText('');
      setShowTextMode(false);
    }
  };

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return <FileType size={40} />;
    if (type.includes('word') || type.includes('document')) return <FileText size={40} />;
    if (type.includes('text')) return <Type size={40} />;
    return <File size={40} />;
  };

  return (
    <UploadContainer maxWidth="md">
      <Stack spacing={4}>
        {/* Header */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
            Upload Your Content
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400, maxWidth: 600, mx: 'auto' }}>
            Upload documents or paste text to generate AI-powered quiz questions instantly
          </Typography>
        </Box>

        {/* Features */}
        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap>
          <FeatureChip icon={<Brain size={16} />} label="AI-Powered Generation" />
          <FeatureChip icon={<Zap size={16} />} label="Lightning Fast" />
          <FeatureChip icon={<FileText size={16} />} label="Multiple Formats" />
        </Stack>

        <MainCard>
          <CardContent sx={{ p: 4, position: 'relative' }}>
            {/* Error Message */}
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

            {/* AI Configuration Panel */}
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
                          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
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
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                          <TextField
                            label="Number of Questions"
                            type="number"
                            value={aiOptions.numQuestions}
                            onChange={(e) =>
                              setAiOptions(prev => ({
                                ...prev,
                                numQuestions: Math.max(5, Math.min(50, Number(e.target.value || 10))),
                              }))
                            }
                            inputProps={{ min: 5, max: 50 }}
                            disabled={effectiveLoading}
                            sx={{ flex: 1 }}
                          />
                          
                          <TextField
                            select
                            label="Difficulty Level"
                            value={aiOptions.difficulty}
                            onChange={(e) =>
                              setAiOptions(prev => ({ ...prev, difficulty: e.target.value }))
                            }
                            disabled={effectiveLoading}
                            sx={{ flex: 1 }}
                          >
                            <MenuItem value="easy">Easy</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="hard">Hard</MenuItem>
                          </TextField>
                        </Stack>

                        {!apiKey && (
                          <Alert severity="warning" sx={{ mt: 2 }}>
                            API key not configured. 
                            <Button size="small" onClick={handleReconfigure} sx={{ ml: 1 }}>
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

            {/* File Upload Area */}
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
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      mb: 2,
                      animation: `${pulse} 1.5s infinite`,
                    }}
                  >
                    <Sparkles size={24} />
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Processing Your Content
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                    AI is analyzing and generating questions...
                  </Typography>
                  <Box sx={{ width: '100%', maxWidth: 300 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={uploadProgress} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)',
                        },
                      }} 
                    />
                    <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
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
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                  >
                    {getFileIcon(fileType)}
                  </Box>
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {fileName}
                    </Typography>
                    {fileSize && (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
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
                        handleGenerateQuiz(); // Now this actually calls the function
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
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      {dragOver ? 'Drop your file here' : 'Upload your document'}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                      Drag and drop your file here, or click to browse
                    </Typography>
                    
                    <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
                      <Chip label="PDF" size="small" variant="outlined" />
                      <Chip label="DOCX" size="small" variant="outlined" />
                      <Chip label="TXT" size="small" variant="outlined" />
                      <Chip label="HTML" size="small" variant="outlined" />
                    </Stack>
                  </Box>
                  
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Maximum file size: {formatBytes(MAX_FILE_SIZE)}
                  </Typography>
                </Stack>
              )}
            </DropZone>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.html"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              style={{ display: 'none' }}
              disabled={effectiveLoading}
            />

            {/* Text Mode Toggle */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Divider sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', px: 2 }}>
                  OR
                </Typography>
              </Divider>
              
              <Button
                variant="outlined"
                startIcon={<Type size={16} />}
                onClick={() => setShowTextMode(!showTextMode)}
                disabled={effectiveLoading}
              >
                {showTextMode ? 'Hide Text Input' : 'Paste Text Instead'}
              </Button>
            </Box>

            {/* Text Mode */}
            <Collapse in={showTextMode}>
              <TextModeCard sx={{ mt: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={3}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Paste Your Text Content
                    </Typography>
                    
                    <TextField
                      multiline
                      rows={8}
                      placeholder="Paste your text content here... (minimum 10 words)"
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      disabled={effectiveLoading}
                      fullWidth
                    />
                    
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        onClick={() => setPastedText(SAMPLE_TEXT)}
                        disabled={effectiveLoading}
                        size="small"
                      >
                        Use Sample Text
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Brain size={16} />}
                        onClick={() => handleTextSubmit(pastedText)}
                        disabled={effectiveLoading || !pastedText.trim()}
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