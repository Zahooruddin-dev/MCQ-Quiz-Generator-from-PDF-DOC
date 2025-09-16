import React from "react";
import { Stack, Typography, Box, Grow } from "@mui/material";
import { ProgressContainer, ProgressBar } from "./QuizStyles";
import { TrendingUp, Target } from "lucide-react";

const QuizProgress = ({ 
  progressPercentage, 
  answeredCount, 
  totalQuestions 
}) => {
  const remainingQuestions = totalQuestions - answeredCount;
  const isComplete = progressPercentage === 100;
  
  return (
    <ProgressContainer>
      <Stack spacing={3}>
        {/* Header Section */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <TrendingUp size={14} />
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                color: '#111827',
                fontSize: { xs: '1rem', sm: '1.125rem' },
              }}
            >
              Progress
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: isComplete ? '#059669' : '#3b82f6',
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                fontFamily: 'monospace',
              }}
            >
              {Math.round(progressPercentage)}%
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
              }}
            >
              Complete
            </Typography>
          </Stack>
        </Stack>

        {/* Progress Bar */}
        <Box sx={{ position: 'relative' }}>
          <ProgressBar>
            <Grow in timeout={800}>
              <Box
                className="progress-fill"
                sx={{
                  width: `${progressPercentage}%`,
                  background: isComplete
                    ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)',
                }}
              />
            </Grow>
          </ProgressBar>

          {/* Progress Labels */}
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{
              mt: 1,
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              color: 'text.secondary',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              0%
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              50%
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              100%
            </Typography>
          </Stack>
        </Box>

        {/* Stats Section */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 2, sm: 4 }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          {/* Answered Questions */}
          <Box sx={{ 
            flex: 1,
            textAlign: { xs: 'center', sm: 'left' }
          }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ 
              justifyContent: { xs: 'center', sm: 'flex-start' }
            }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  color: '#111827',
                  fontSize: { xs: '0.95rem', sm: '1rem' },
                }}
              >
                {answeredCount}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                }}
              >
                answered
              </Typography>
            </Stack>
          </Box>

          {/* Remaining Questions */}
          <Box sx={{ 
            flex: 1,
            textAlign: 'center'
          }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ 
              justifyContent: 'center'
            }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: remainingQuestions === 0 ? '#d1d5db' : '#f59e0b',
                  boxShadow: remainingQuestions === 0 ? 'none' : '0 2px 4px rgba(245, 158, 11, 0.3)',
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  color: remainingQuestions === 0 ? '#6b7280' : '#111827',
                  fontSize: { xs: '0.95rem', sm: '1rem' },
                }}
              >
                {remainingQuestions}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                }}
              >
                remaining
              </Typography>
            </Stack>
          </Box>

          {/* Total Questions */}
          <Box sx={{ 
            flex: 1,
            textAlign: { xs: 'center', sm: 'right' }
          }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ 
              justifyContent: { xs: 'center', sm: 'flex-end' }
            }}>
              <Target size={12} color="#6b7280" />
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  color: '#111827',
                  fontSize: { xs: '0.95rem', sm: '1rem' },
                }}
              >
                {totalQuestions}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                }}
              >
                total
              </Typography>
            </Stack>
          </Box>
        </Stack>

        {/* Completion Message */}
        {isComplete && (
          <Grow in timeout={600}>
            <Box
              sx={{
                p: 2,
                background: 'linear-gradient(135deg, #d1fae5 0%, #dcfce7 100%)',
                border: '1px solid #a7f3d0',
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: '#065f46',
                  fontWeight: 600,
                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                }}
              >
                🎉 All questions answered! Ready to finish your quiz.
              </Typography>
            </Box>
          </Grow>
        )}

        {/* Encouragement Message for Partial Progress */}
        {!isComplete && progressPercentage > 0 && progressPercentage < 100 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                fontStyle: 'italic',
              }}
            >
              {progressPercentage >= 75
                ? "Almost there! Just a few more questions to go."
                : progressPercentage >= 50
                ? "You're halfway through! Keep up the great work."
                : progressPercentage >= 25
                ? "Great start! You're making good progress."
                : "You've begun your quiz journey. Keep going!"
              }
            </Typography>
          </Box>
        )}
      </Stack>
    </ProgressContainer>
  );
};

export default QuizProgress;