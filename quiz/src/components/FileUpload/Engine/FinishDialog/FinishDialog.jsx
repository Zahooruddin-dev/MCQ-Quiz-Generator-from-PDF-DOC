import React from 'react';
import {
  DialogActions,
  Button,
  Stack,
  Box,
  Typography,
} from '@mui/material';
import { RotateCcw, Flag } from 'lucide-react';

const FinishDialogActions = ({
  cancelFinish,
  submitQuiz,
  isSubmitting,
  hasUnanswered,
}) => {
  return (
    <DialogActions
      sx={{
        p: 3,
        pt: 0,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 1 },
      }}
    >
      {/* Cancel / Review Button */}
      <Button
        variant="outlined"
        onClick={cancelFinish}
        startIcon={<RotateCcw size={16} />}
        disabled={isSubmitting}
        fullWidth
        sx={{
          order: { xs: 2, sm: 1 },
          borderRadius: 2,
          py: { xs: 1.5, sm: 1 },
          fontWeight: 600,
          textTransform: 'none',
          borderColor: '#d1d5db',
          color: '#374151',
          '&:hover': { borderColor: '#9ca3af', background: '#f9fafb' },
        }}
      >
        {hasUnanswered ? 'Continue Quiz' : 'Review Answers'}
      </Button>

      {/* Submit Button */}
      <Button
        variant="contained"
        onClick={submitQuiz}
        disabled={isSubmitting}
        endIcon={isSubmitting ? null : <Flag size={16} />}
        fullWidth
        sx={{
          order: { xs: 1, sm: 2 },
          borderRadius: 2,
          py: { xs: 1.5, sm: 1 },
          fontWeight: 700,
          textTransform: 'none',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.5)',
            transform: 'translateY(-1px)',
          },
          '&:active': { transform: 'translateY(0)' },
          '&:disabled': {
            background: '#d1d5db',
            boxShadow: 'none',
            transform: 'none',
          },
        }}
      >
        {isSubmitting ? (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 16,
                height: 16,
                border: '2px solid transparent',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <Typography>Submitting...</Typography>
          </Stack>
        ) : hasUnanswered ? (
          'Submit Anyway'
        ) : (
          'Submit Quiz'
        )}
      </Button>
    </DialogActions>
  );
};

export default React.memo(FinishDialogActions);
