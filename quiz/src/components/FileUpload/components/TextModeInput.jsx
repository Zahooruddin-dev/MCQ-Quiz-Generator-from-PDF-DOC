// src/components/TextModeInput.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  TextField,
  LinearProgress,
  IconButton,
  Fade,
  Collapse,
} from '@mui/material';
import { Brain, Sparkles, X, Type } from 'lucide-react';
import { LLMService } from '../../../utils/llmService';
import { LoadingOverlay, pulse } from '../ModernFileUpload.styles';

const TextModeInput = ({ apiKey, baseUrl, aiOptions, onQuizGenerated }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showTextMode, setShowTextMode] = useState(false);

  const toggleRef = useRef(null);
  const textAreaRef = useRef(null);

  // 🌀 Auto-scroll when toggled
  useEffect(() => {
    if (showTextMode && textAreaRef.current) {
      textAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (!showTextMode && toggleRef.current) {
      toggleRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showTextMode]);

  const simulateProgress = () => {
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
  };

  const handleGenerateQuiz = useCallback(async () => {
    if (!text.trim()) {
      setError('Please enter some text first.');
      return;
    }

    const effectiveApiKey = apiKey || localStorage.getItem('geminiApiKey');
    if (!effectiveApiKey || effectiveApiKey.trim().length < 8) {
      setError('Please configure your API key first.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setUploadProgress(0);
    const progressInterval = simulateProgress();

    try {
      const llmService = new LLMService(effectiveApiKey, baseUrl);
      const questions = await llmService.generateQuizQuestions(
        text,
        aiOptions
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        onQuizGenerated(questions, aiOptions);
        setIsLoading(false);
        setText('');
        setShowTextMode(false); // auto-close after success
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      console.error('Error generating quiz:', err);
      setError(err?.message || 'Failed to generate quiz.');
      setIsLoading(false);
    }
  }, [text, apiKey, baseUrl, aiOptions, onQuizGenerated]);

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Error message */}
      {error && (
        <Fade in={!!error}>
          <Alert
            severity="error"
            sx={{ mb: 2 }}
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

      {/* Loading overlay */}
      {isLoading && (
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
            Processing Your Text
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', mb: 3 }}
          >
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
                  background:
                    'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)',
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{ mt: 1, display: 'block', textAlign: 'center' }}
            >
              {Math.round(uploadProgress)}%
            </Typography>
          </Box>
        </LoadingOverlay>
      )}

      {/* Toggle button */}
      <Stack alignItems="center" sx={{ my: 2 }} ref={toggleRef}>
        <Button
          variant="outlined"
          startIcon={<Type />}
          onClick={() => {
            setShowTextMode((prev) => !prev);
            setError(null);
          }}
          sx={{ borderRadius: 2 }}
          disabled={isLoading}
        >
          {showTextMode ? 'Cancel Text Mode' : 'Paste Text Instead'}
        </Button>
      </Stack>

      {/* Collapsible text input */}
      <Collapse in={showTextMode} mountOnEnter unmountOnExit>
        <Stack spacing={2} ref={textAreaRef}>
          <TextField
            label="Paste your study text here"
            multiline
            minRows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            variant="outlined"
            fullWidth
            disabled={isLoading}
          />
          <Button
            variant="contained"
            startIcon={<Brain />}
            onClick={handleGenerateQuiz}
            disabled={isLoading}
            sx={{ borderRadius: 2 }}
          >
            Generate Quiz from Text
          </Button>
        </Stack>
      </Collapse>
    </Box>
  );
};

export default TextModeInput;
