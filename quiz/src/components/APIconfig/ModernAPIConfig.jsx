import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Stack,
  Alert,
  IconButton,
  InputAdornment,
  Chip,
  LinearProgress,
  Fade,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  Settings,
  Key,
  Link,
  Eye,
  EyeOff,
  X,
  CheckCircle,
  AlertTriangle,
  Zap,
  Shield,
  Brain,
} from 'lucide-react';
import { db } from '../../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Animations
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

// Styled Components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.shape.borderRadius * 3,
    maxWidth: 600,
    width: '100%',
    margin: theme.spacing(2),
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
}));

const ConfigHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  padding: theme.spacing(4),
  borderRadius: `${theme.shape.borderRadius * 3}px ${theme.shape.borderRadius * 3}px 0 0`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '40%',
    height: '100%',
    background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
}));

const FeatureCard = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`,
  border: '1px solid',
  borderColor: theme.palette.primary.light + '20',
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
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
  borderRadius: theme.shape.borderRadius * 3,
  zIndex: 10,
}));

const ModernAPIConfig = ({ onConfigSave, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
  );
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [validationStatus, setValidationStatus] = useState(null);

  const features = [
    { icon: <Brain size={20} />, title: 'AI-Powered Generation', description: 'Advanced question generation' },
    { icon: <Zap size={20} />, title: 'Lightning Fast', description: 'Instant quiz creation' },
    { icon: <Shield size={20} />, title: 'Secure & Private', description: 'Your data stays protected' },
  ];

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'apiKey'));
        if (docSnap.exists()) {
          setApiKey(docSnap.data().value || '');
          setValidationStatus('valid');
        }
      } catch (err) {
        console.error('Failed to fetch API key:', err);
        setValidationStatus('error');
      } finally {
        setLoading(false);
      }
    };
    fetchApiKey();
  }, []);

  const validateApiKey = (key) => {
    if (!key.trim()) {
      setValidationStatus(null);
      return;
    }
    
    if (key.length < 20) {
      setValidationStatus('invalid');
      return;
    }
    
    if (key.startsWith('AIza') || key.includes('google')) {
      setValidationStatus('valid');
    } else {
      setValidationStatus('warning');
    }
  };

  const handleApiKeyChange = (e) => {
    const value = e.target.value;
    setApiKey(value);
    validateApiKey(value);
  };

  const simulateProgress = () => {
    setSaveProgress(0);
    const interval = setInterval(() => {
      setSaveProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 20;
      });
    }, 100);
    return interval;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setSaving(true);
    const progressInterval = simulateProgress();

    try {
      // Save to Firestore
      await setDoc(doc(db, 'settings', 'apiKey'), { value: apiKey.trim() });

      // Update progress to 100%
      setSaveProgress(100);
      
      // Wait a moment to show completion
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update app state
      onConfigSave?.(apiKey.trim(), baseUrl);

      // Save to localStorage as fallback
      localStorage.setItem('geminiApiKey', apiKey.trim());

      // Close modal after successful save
      setTimeout(() => {
        onClose?.();
      }, 1000);
    } catch (err) {
      console.error('Failed to save API key:', err);
      setValidationStatus('error');
    } finally {
      clearInterval(progressInterval);
      setSaving(false);
      setSaveProgress(0);
    }
  };

  const getValidationIcon = () => {
    switch (validationStatus) {
      case 'valid':
        return <CheckCircle size={20} color="#10B981" />;
      case 'invalid':
        return <X size={20} color="#EF4444" />;
      case 'warning':
        return <AlertTriangle size={20} color="#F59E0B" />;
      case 'error':
        return <X size={20} color="#EF4444" />;
      default:
        return null;
    }
  };

  const getValidationMessage = () => {
    switch (validationStatus) {
      case 'valid':
        return 'API key looks valid!';
      case 'invalid':
        return 'API key appears to be too short';
      case 'warning':
        return 'API key format is unusual but may work';
      case 'error':
        return 'Failed to validate API key';
      default:
        return '';
    }
  };

  const getValidationColor = () => {
    switch (validationStatus) {
      case 'valid':
        return 'success';
      case 'invalid':
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <StyledDialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      {saving && (
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
            <Settings size={24} />
          </Box>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            Saving Configuration
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Securing your AI settings...
          </Typography>
          <Box sx={{ width: '100%', maxWidth: 300 }}>
            <LinearProgress
              variant="determinate"
              value={saveProgress}
              sx={{
                height: 8,
                borderRadius: 4,
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)',
                },
              }}
            />
            <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
              {Math.round(saveProgress)}% Complete
            </Typography>
          </Box>
        </LoadingOverlay>
      )}

      <ConfigHeader>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack direction="row" spacing={3} alignItems="center">
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <Settings size={28} />
            </Box>
            
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                AI Configuration
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Configure your AI service settings for quiz generation
              </Typography>
            </Box>
          </Stack>
          
          <IconButton
            onClick={onClose}
            sx={{
              color: 'white',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            <X size={20} />
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          {features.map((feature, index) => (
            <Chip
              key={index}
              icon={feature.icon}
              label={feature.title}
              size="small"
              sx={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 500,
                '& .MuiChip-icon': {
                  color: 'white',
                },
              }}
            />
          ))}
        </Stack>
      </ConfigHeader>

      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Loading current configuration...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 4 }}>
            <Stack spacing={4}>
              {/* Features Overview */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  What You'll Get
                </Typography>
                <Stack direction="row" spacing={2}>
                  {features.map((feature, index) => (
                    <FeatureCard key={index} sx={{ flex: 1, textAlign: 'center' }}>
                      <Box sx={{ color: 'primary.main', mb: 1 }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {feature.description}
                      </Typography>
                    </FeatureCard>
                  ))}
                </Stack>
              </Box>

              {/* Configuration Form */}
              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="API Key"
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={handleApiKeyChange}
                    placeholder="Enter your Gemini API key"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Key size={20} color="#6366F1" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Stack direction="row" spacing={1} alignItems="center">
                            {getValidationIcon()}
                            <IconButton
                              onClick={() => setShowApiKey(!showApiKey)}
                              edge="end"
                              size="small"
                            >
                              {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                            </IconButton>
                          </Stack>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />

                  {validationStatus && (
                    <Fade in={!!validationStatus}>
                      <Alert severity={getValidationColor()} sx={{ borderRadius: 2 }}>
                        {getValidationMessage()}
                      </Alert>
                    </Fade>
                  )}

                  <TextField
                    fullWidth
                    label="Base URL"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="Enter API Base URL"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Link size={20} color="#6366F1" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />

                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    <Typography variant="body2">
                      <strong>Need an API key?</strong> Get your free Gemini API key from{' '}
                      <a
                        href="https://makersuite.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#6366F1', textDecoration: 'none' }}
                      >
                        Google AI Studio
                      </a>
                    </Typography>
                  </Alert>
                </Stack>
              </Box>
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 4, pt: 0 }}>
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={saving}
            sx={{ flex: 1 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving || !apiKey.trim() || validationStatus === 'invalid'}
            sx={{
              flex: 1,
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              },
            }}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </Stack>
      </DialogActions>
    </StyledDialog>
  );
};

export default ModernAPIConfig;