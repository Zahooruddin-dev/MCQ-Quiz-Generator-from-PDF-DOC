import React, { useState } from 'react';
import {
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
  Fade
} from '@mui/material';
import {
  PictureAsPdfOutlined as PdfIcon,
  ArticleOutlined as DocxIcon,
} from '@mui/icons-material';

import CombinedPDFGenerator from './CombinedPDFGenerator';
import DOCXDownloadComponent from './DOCXDownloadComponent';

const DownloadQuizButton = ({
  quizData,
  questions = [],
  size = 'large',
  fullWidth = false,
}) => {
  const [loadingFormat, setLoadingFormat] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // PDF Download (Combined Quiz + Answer Key)
  const handlePDFDownload = async () => {
    setLoadingFormat('pdf');
    try {
      await CombinedPDFGenerator.generate(quizData, questions);
      showSnackbar('PDF generated! Quiz sheet with answer key ready.');
    } catch (error) {
      console.error('PDF generation failed:', error);
      showSnackbar('Failed to generate PDF file', 'error');
    } finally {
      setLoadingFormat(null);
    }
  };

  // DOCX Download (Separate Quiz + Answer Key)
  const handleDOCXDownload = async () => {
    setLoadingFormat('docx');
    try {
      await DOCXDownloadComponent.generate(quizData, questions, showSnackbar);
    } catch (error) {
      console.error('DOCX generation failed:', error);
      showSnackbar('Failed to generate DOCX files', 'error');
    } finally {
      setLoadingFormat(null);
    }
  };

  const isLoading = (format) => loadingFormat === format;

  return (
    <>
      <Stack direction="row" spacing={2} justifyContent="flex-start">
        {/* PDF Button */}
        <Button
          variant="contained"
          size={size}
          fullWidth={fullWidth}
          startIcon={
            isLoading('pdf') ? <CircularProgress size={20} /> : <PdfIcon />
          }
          onClick={handlePDFDownload}
          disabled={isLoading('pdf') || questions.length === 0}
          sx={{
            px: 3,
            py: 1.2,
            bgcolor: 'error.main',
            color: 'white',
            '&:hover': { bgcolor: 'error.dark' },
          }}
        >
          {isLoading('pdf') ? 'Generating...' : 'Download PDF'}
        </Button>

        {/* DOCX Button */}
        <Button
          variant="contained"
          size={size}
          fullWidth={fullWidth}
          startIcon={
            isLoading('docx') ? <CircularProgress size={20} /> : <DocxIcon />
          }
          onClick={handleDOCXDownload}
          disabled={isLoading('docx') || questions.length === 0}
          sx={{
            px: 3,
            py: 1.2,
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          {isLoading('docx') ? 'Generating...' : 'Download DOCX'}
        </Button>
      </Stack>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DownloadQuizButton;
