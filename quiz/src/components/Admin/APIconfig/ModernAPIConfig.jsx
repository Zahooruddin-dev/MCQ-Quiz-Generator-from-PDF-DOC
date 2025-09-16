// src/components/ModernAPIConfig.jsx
import React, { useState, useEffect } from 'react';
import {
  DialogContent,
  DialogActions,
  Button,
  Box,
  Stack,
  Typography,
  LinearProgress,
} from '@mui/material';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../../firebaseConfig';
import { StyledDialog } from './styles';

import ConfigHeader from './ConfigHeader';
import ConfigForm from './ConfigForm';
import LoadingOverlay from './LoadingOverlay';

const ModernAPIConfig = ({ onConfigSave, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
  );
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [validationStatus, setValidationStatus] = useState(null);

  const features = [
    { icon: 'brain', title: 'AI-Powered Generation', description: 'Advanced question generation' },
    { icon: 'zap', title: 'Lightning Fast', description: 'Instant quiz creation' },
    { icon: 'shield', title: 'Secure & Private', description: 'Your data stays protected' },
  ];

  // Load both apiKey and baseUrl from Firestore
useEffect(() => {
  const fetchApiConfig = async () => {
    try {
      const snap = await getDoc(doc(db, 'settings', 'apiConfig'));
      if (snap.exists()) {
        const data = snap.data();
        setApiKey(data.apiKey || localStorage.getItem('geminiApiKey') || '');
        setBaseUrl(data.baseUrl || localStorage.getItem('geminiBaseUrl') || baseUrl);
        setValidationStatus('valid');
      } else {
        // If nothing saved yet, fallback to localStorage if available
        setApiKey(localStorage.getItem('geminiApiKey') || '');
        setBaseUrl(localStorage.getItem('geminiBaseUrl') || baseUrl);
        setValidationStatus('valid');
      }
    } catch (err) {
      console.error('Failed to fetch API config:', err);
      setValidationStatus('error');
    } finally {
      setLoading(false);
    }
  };
  fetchApiConfig();
}, []);


  const handleSave = async () => {
    if (!apiKey.trim()) return;

    setSaving(true);
    setSaveProgress(0);

    const progressInterval = setInterval(() => {
      setSaveProgress((p) => {
        if (p >= 90) {
          clearInterval(progressInterval);
          return p;
        }
        return p + Math.random() * 20;
      });
    }, 100);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      // Save both apiKey + baseUrl
      await setDoc(doc(db, 'settings', 'apiConfig'), {
        apiKey: apiKey.trim(),
        baseUrl: baseUrl.trim(),
        updatedBy: user ? user.uid : 'unknown',
        updatedAt: serverTimestamp(),
      });

      setSaveProgress(100);
      await new Promise((r) => setTimeout(r, 500));
      onConfigSave?.(apiKey.trim(), baseUrl.trim());

      // Backward compatibility (optional)
      localStorage.setItem('geminiApiKey', apiKey.trim());
      localStorage.setItem('geminiBaseUrl', baseUrl.trim());

      setTimeout(() => onClose?.(), 1000);
    } catch (err) {
      console.error('Failed to save API config:', err);
      setValidationStatus('error');
    } finally {
      clearInterval(progressInterval);
      setSaving(false);
      setSaveProgress(0);
    }
  };

  return (
    <StyledDialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      {saving && <LoadingOverlay saveProgress={saveProgress} />}

      <ConfigHeader features={features} onClose={onClose} />

      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Loading current configuration...
            </Typography>
          </Box>
        ) : (
          <ConfigForm
            apiKey={apiKey}
            setApiKey={setApiKey}
            baseUrl={baseUrl}
            setBaseUrl={setBaseUrl}
            showApiKey={showApiKey}
            setShowApiKey={setShowApiKey}
            validationStatus={validationStatus}
            setValidationStatus={setValidationStatus}
          />
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
            onClick={handleSave}
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
