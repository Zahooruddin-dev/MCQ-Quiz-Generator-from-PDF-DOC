import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
  Divider,
  Alert,
  Slide,
  Paper,
} from "@mui/material";
import { Flag, RotateCcw, AlertTriangle, CheckCircle, Clock } from "lucide-react";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FinishDialog = ({
  open,
  unansweredCount,
  cancelFinish,
  submitQuiz,
  isSubmitting,
  timeRemaining = null,
  showTimer = false,
}) => {
  const hasUnanswered = unansweredCount > 0;
  const isTimeExpiring = showTimer && timeRemaining !== null && timeRemaining < 30;

  return (
    <Dialog
      open={open}
      onClose={!isSubmitting && !isTimeExpiring ? cancelFinish : undefined}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: { xs: 2, sm: 3 },
          boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          maxWidth: { xs: '90vw', sm: '500px' },
          m: { xs: 2, sm: 3 },
        }
      }}
      BackdropProps={{
        sx: {
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ pb: 0 }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                borderRadius: "50%",
                background: isTimeExpiring
                  ? "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)"
                  : hasUnanswered 
                  ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                  : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                boxShadow: isTimeExpiring
                  ? '0 4px 12px rgba(220, 38, 38, 0.4)'
                  : hasUnanswered 
                  ? '0 4px 12px rgba(245, 158, 11, 0.4)'
                  : '0 4px 12px rgba(16, 185, 129, 0.4)',
                animation: isTimeExpiring ? 'pulse 1s infinite' : 'none',
              }}
            >
              {isTimeExpiring
                ? <Clock size={20} />
                : hasUnanswered
                  ? <AlertTriangle size={20} />
                  : <CheckCircle size={20} />
              }
            </Box>

            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#111827',
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  lineHeight: 1.2,
                }}
              >
                {isTimeExpiring
                  ? 'Time Almost Up!'
                  : hasUnanswered
                    ? 'Finish Quiz?'
                    : 'Complete Quiz?'}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                  mt: 0.5,
                }}
              >
                {isTimeExpiring
                  ? 'Quiz will auto-submit very soon'
                  : hasUnanswered
                    ? 'Some questions remain unanswered'
                    : 'All questions have been answered'}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ py: 3 }}>
        <Stack spacing={3}>
          {isTimeExpiring && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              <Typography>Time is almost up! Quiz will submit automatically.</Typography>
            </Alert>
          )}

          {hasUnanswered ? (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                You have <strong>{unansweredCount}</strong> unanswered question{unansweredCount !== 1 ? "s" : ""}.
              </Typography>
              <Typography variant="body2">
                Unanswered questions will be marked as incorrect and may affect your final score.
              </Typography>
            </Alert>
          ) : (
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                Great job! You've answered all questions.
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
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
              Quiz Summary
            </Typography>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Questions Answered
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#10b981' }}>
                  {hasUnanswered ? `${Math.max(0, (unansweredCount - unansweredCount))}` : 'All'}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Questions Skipped
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: hasUnanswered ? '#f59e0b' : '#6b7280' }}>
                  {hasUnanswered ? unansweredCount : '0'}
                </Typography>
              </Stack>

              <Divider sx={{ my: 1 }} />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827' }}>
                  Completion Status
                </Typography>
                <Box
                  sx={{
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    background: hasUnanswered ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
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

          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', fontSize: { xs: '0.8rem', sm: '0.85rem' }, fontStyle: 'italic' }}>
            {hasUnanswered
              ? "You can go back to answer remaining questions or submit now to see your results."
              : "Your quiz responses have been recorded and are ready for evaluation."}
          </Typography>
        </Stack>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ p: 3, pt: 0, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 1 } }}>
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
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
            '&:hover': {
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.5)',
              transform: 'translateY(-1px)',
            },
            '&:active': { transform: 'translateY(0)' },
            '&:disabled': { background: '#d1d5db', boxShadow: 'none', transform: 'none' },
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
          ) : (
            hasUnanswered ? 'Submit Anyway' : 'Submit Quiz'
          )}
        </Button>
      </DialogActions>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Dialog>
  );
};

export default FinishDialog;
