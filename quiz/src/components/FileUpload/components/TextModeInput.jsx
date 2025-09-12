// TextModeInput.jsx
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
} from '@mui/material';
import { Brain, Sparkles, X, Type } from 'lucide-react';
import { LLMService } from '../../../utils/llmService';
import { useAuth } from '../../../context/AuthContext';
import { pulse } from '../ModernFileUpload.styles';

const TextModeInput = ({ apiKey, baseUrl, aiOptions, onQuizGenerated, children }) => {
  const { useCredit, refundCredit, credits, isPremium, isAdmin } = useAuth();
  const [text, setText] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showTextMode, setShowTextMode] = useState(false);

  const textAreaRef = useRef(null);

  useEffect(() => {
    if (showTextMode && textAreaRef.current) {
      textAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    // Check credits first
    if (!isPremium && !isAdmin && credits <= 0) {
      setError('You have no credits remaining. Please upgrade to Premium or wait 24 hours for daily credit reset.');
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

    let creditDeducted = false; // Track if we deducted a credit

    try {
      // Deduct credit before AI generation
      const canUseCredit = await useCredit();
      if (!canUseCredit) {
        throw new Error('Insufficient credits. You need at least 1 credit to generate a quiz.');
      }
      creditDeducted = true; // Credit was successfully deducted

      const llmService = new LLMService(effectiveApiKey, baseUrl);
      const questions = await llmService.generateQuizQuestions(text, aiOptions);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        onQuizGenerated(questions, aiOptions);
        setIsLoading(false);
        setText('');
        setShowTextMode(false);
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      console.error('Error generating quiz:', err);
      
      // If credit was deducted and API call failed, refund the credit
      if (creditDeducted) {
        try {
          await refundCredit();
          console.log('💰 Credit refunded due to API failure');
        } catch (refundError) {
          console.error('❌ Failed to refund credit:', refundError);
        }
      }
      
      // Enhanced error messages
      let errorMessage = err?.message || 'Failed to generate quiz.';
      if (
        errorMessage.includes('503') ||
        errorMessage.includes('overloaded') ||
        errorMessage.includes('Service Unavailable') ||
        errorMessage.includes('API failed') ||
        errorMessage.includes('500') ||
        errorMessage.includes('502') ||
        errorMessage.includes('504')
      ) {
        errorMessage += ' The AI service is temporarily unavailable. Your credit has been refunded. Please try again later.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [text, apiKey, baseUrl, aiOptions, onQuizGenerated]);

  const ActiveInput = showTextMode ? (
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
        disabled={isLoading || (!isPremium && !isAdmin && credits <= 0)}
        sx={{ borderRadius: 2 }}
      >
        {!isPremium && !isAdmin && credits <= 0 ? 'No Credits Available' : 'Generate Quiz from Text'}
      </Button>
    </Stack>
  ) : (
    children
  );

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

      {/* Toggle button */}
      <Stack alignItems="center" sx={{ my: 2 }}>
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

      {/* Input container */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: 2,
        }}
      >
        {/* Dim background when loading */}
        <Box
          sx={{
            filter: isLoading ? 'blur(2px) brightness(0.7)' : 'none',
            pointerEvents: isLoading ? 'none' : 'auto',
            transition: 'filter 0.3s ease',
          }}
        >
          {ActiveInput}
        </Box>

        {/* Loading overlay */}
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 20,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto',
              px: 2,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                mb: 3,
                animation: `${pulse} 1.5s infinite`,
              }}
            >
              <Sparkles size={28} />
            </Box>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              Processing Your Content
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, textAlign: 'center' }}>
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
              <Typography
                variant="caption"
                sx={{ mt: 1, display: 'block', textAlign: 'center' }}
              >
                {Math.round(uploadProgress)}%
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TextModeInput;
