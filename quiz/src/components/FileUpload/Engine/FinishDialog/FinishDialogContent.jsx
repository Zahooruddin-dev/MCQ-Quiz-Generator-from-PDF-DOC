import React from 'react';
import {
  DialogContent,
  Stack,
  Alert,
  Typography,
  Paper,
  Divider,
  Box,
} from '@mui/material';

const FinishDialogContent = ({
  isTimeExpiring,
  hasUnanswered,
  unansweredCount,
}) => {
  return (
    <DialogContent sx={{ py: 3 }}>
      <Stack spacing={3}>
        {/* Time Expiry Warning */}
        {isTimeExpiring && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            <Typography>Time is almost up! Quiz will submit automatically.</Typography>
          </Alert>
        )}

        {/* Answer Status */}
        {hasUnanswered ? (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
              You have <strong>{unansweredCount}</strong> unanswered question
              {unansweredCount !== 1 ? 's' : ''}.
            </Typography>
            <Typography variant="body2">
              Unanswered questions will be marked as incorrect and may affect your final score.
            </Typography>
          </Alert>
        ) : (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
              Great job! You&apos;ve answered all questions.
            </Typography>
            <Typography variant="body2">
              Ready to see your results and performance analysis?
            </Typography>
          </Alert>
        )}

        {/* Quiz Summary */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: '1px solid #e2e8f0',
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mb: 2, color: '#374151' }}
          >
            Quiz Summary
          </Typography>

          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Questions Answered
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, color: '#10b981' }}
              >
                {hasUnanswered ? `${Math.max(0, unansweredCount - unansweredCount)}` : 'All'}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Questions Skipped
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: hasUnanswered ? '#f59e0b' : '#6b7280',
                }}
              >
                {hasUnanswered ? unansweredCount : '0'}
              </Typography>
            </Stack>

            <Divider sx={{ my: 1 }} />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, color: '#111827' }}
              >
                Completion Status
              </Typography>
              <Box
                sx={{
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  background: hasUnanswered
                    ? 'rgba(245, 158, 11, 0.1)'
                    : 'rgba(16, 185, 129, 0.1)',
                  color: hasUnanswered ? '#d97706' : '#059669',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}
              >
                {hasUnanswered ? 'Incomplete' : 'Complete'}
              </Box>
            </Stack>
          </Stack>
        </Paper>

        {/* Footer Note */}
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            textAlign: 'center',
            fontSize: { xs: '0.8rem', sm: '0.85rem' },
            fontStyle: 'italic',
          }}
        >
          {hasUnanswered
            ? 'You can go back to answer remaining questions or submit now to see your results.'
            : 'Your quiz responses have been recorded and are ready for evaluation.'}
        </Typography>
      </Stack>
    </DialogContent>
  );
};

export default React.memo(FinishDialogContent);
