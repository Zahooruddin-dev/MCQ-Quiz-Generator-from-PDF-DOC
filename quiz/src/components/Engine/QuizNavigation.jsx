import React from "react";
import { 
  Button, 
  Stack, 
  IconButton, 
  Typography, 
  Box, 
  Tooltip,
  useMediaQuery,
  useTheme,
  Paper
} from "@mui/material";
import { ArrowLeft, ArrowRight, Flag } from "lucide-react";

const QuizNavigation = ({
  currentQuestion,
  totalQuestions,
  userAnswers,
  setCurrentQuestion,
  goToPrevQuestion,
  goToNextQuestion,
  handleFinishClick,
  isSubmitting,
  transitionToQuestion,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const isLastQuestion = currentQuestion === totalQuestions - 1;
  const answeredCount = userAnswers.filter(answer => answer !== null).length;
  
  // Calculate how many indicators to show based on screen size
  const getMaxIndicators = () => {
    if (isMobile) return 0; // Hide completely on mobile
    if (isTablet) return Math.min(6, totalQuestions);
    return Math.min(10, totalQuestions);
  };
  
  const maxIndicators = getMaxIndicators();
  const showAllIndicators = totalQuestions <= maxIndicators || isMobile;
  
  // Calculate which indicators to show when we can't show all
  const getVisibleIndicators = () => {
    if (isMobile) return []; // No indicators on mobile
    
    if (showAllIndicators) {
      return userAnswers.map((_, index) => index);
    }
    
    const half = Math.floor(maxIndicators / 2);
    let start = Math.max(0, currentQuestion - half);
    let end = Math.min(totalQuestions - 1, start + maxIndicators - 1);
    
    // Adjust start if we're near the end
    if (end - start < maxIndicators - 1) {
      start = Math.max(0, end - maxIndicators + 1);
    }
    
    const indices = [];
    for (let i = start; i <= end; i++) {
      indices.push(i);
    }
    return indices;
  };
  
  const visibleIndicators = getVisibleIndicators();

  // MOBILE: Only render fixed bottom navigation
  if (isMobile) {
    return (
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid #e2e8f0',
          borderRadius: '20px 20px 0 0',
          p: 2.5,
          pb: 3,
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Stack spacing={2}>
          {/* Mobile Progress Indicators */}
          <Stack direction="row" justifyContent="center" spacing={0.5} sx={{ mb: 1 }}>
            {userAnswers.slice(0, 12).map((_, index) => (
              <Box
                key={index}
                onClick={() => transitionToQuestion(index)}
                sx={{
                  width: index === currentQuestion ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backgroundColor: index === currentQuestion
                    ? '#3b82f6'
                    : userAnswers[index] !== null
                    ? '#10b981'
                    : '#e5e7eb',
                  '&:active': {
                    transform: 'scale(0.9)',
                  },
                }}
              />
            ))}
            {totalQuestions > 12 && (
              <Typography variant="caption" sx={{ 
                color: 'text.secondary', 
                ml: 1, 
                alignSelf: 'center',
                fontSize: '0.7rem'
              }}>
                +{totalQuestions - 12}
              </Typography>
            )}
          </Stack>

          {/* Current Question Info */}
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
            <Typography variant="body2" sx={{ 
              color: 'text.primary', 
              fontWeight: 600,
              fontSize: '0.9rem'
            }}>
              Question {currentQuestion + 1} of {totalQuestions}
            </Typography>
            <Box sx={{ 
              width: 2, 
              height: 2, 
              borderRadius: '50%', 
              backgroundColor: 'text.secondary' 
            }} />
            <Typography variant="body2" sx={{ 
              color: 'text.secondary',
              fontSize: '0.9rem'
            }}>
              {answeredCount} answered
            </Typography>
          </Stack>

          {/* Navigation Buttons */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="outlined"
              startIcon={<ArrowLeft size={16} />}
              onClick={goToPrevQuestion}
              disabled={currentQuestion === 0 || isSubmitting}
              sx={{
                flex: 1,
                py: 1.5,
                borderRadius: 2.5,
                fontWeight: 600,
                textTransform: 'none',
                borderColor: '#d1d5db',
                color: '#374151',
                fontSize: '0.9rem',
                '&:hover': {
                  borderColor: '#9ca3af',
                  backgroundColor: '#f9fafb',
                },
                '&:disabled': {
                  opacity: 0.4,
                },
              }}
            >
              Previous
            </Button>

            {isLastQuestion ? (
              <Button
                variant="contained"
                endIcon={<Flag size={16} />}
                onClick={handleFinishClick}
                disabled={isSubmitting}
                sx={{
                  flex: 1,
                  py: 1.5,
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  borderRadius: 2.5,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                  '&:hover': {
                    background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                  },
                  '&:disabled': {
                    background: '#d1d5db',
                    boxShadow: 'none',
                  },
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Finish Quiz'}
              </Button>
            ) : (
              <Button
                variant="contained"
                endIcon={<ArrowRight size={16} />}
                onClick={goToNextQuestion}
                disabled={isSubmitting}
                sx={{
                  flex: 1,
                  py: 1.5,
                  background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                  borderRadius: 2.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                  '&:hover': {
                    background: "linear-gradient(135deg, #2563eb 0%, #5b21b6 100%)",
                  },
                  '&:disabled': {
                    background: '#d1d5db',
                    boxShadow: 'none',
                  },
                }}
              >
                Next
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>
    );
  }

  // DESKTOP: Full navigation with indicators
  return (
    <Box sx={{ 
      borderTop: '1px solid #e5e7eb',
      pt: 4, 
      mt: 4,
    }}>
      {/* Desktop Question Indicators */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Stack 
          direction="row" 
          spacing={0.5}
          justifyContent="center"
          sx={{ 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
            mb: 3,
          }}
        >
          {!showAllIndicators && visibleIndicators[0] > 0 && (
            <>
              <IconButton
                size="small"
                onClick={() => transitionToQuestion(0)}
                disabled={isSubmitting}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: userAnswers[0] !== null
                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    : "transparent",
                  color: userAnswers[0] !== null ? "white" : "#6b7280",
                  border: "2px solid",
                  borderColor: userAnswers[0] !== null ? "#10b981" : "#d1d5db",
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                  '&:hover:not(:disabled)': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                1
              </IconButton>
              {visibleIndicators[0] > 1 && (
                <Typography variant="body2" sx={{ color: 'text.secondary', px: 1 }}>
                  ...
                </Typography>
              )}
            </>
          )}
          
          {visibleIndicators.map((index) => (
            <Tooltip
              key={index}
              title={`Question ${index + 1}${userAnswers[index] !== null ? ' - Answered' : ' - Unanswered'}`}
              arrow
            >
              <IconButton
                size="small"
                onClick={() => transitionToQuestion(index)}
                disabled={isSubmitting}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background:
                    index === currentQuestion
                      ? "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)"
                      : userAnswers[index] !== null
                      ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                      : "transparent",
                  color:
                    index === currentQuestion || userAnswers[index] !== null
                      ? "white"
                      : "#6b7280",
                  border: "2px solid",
                  borderColor:
                    index === currentQuestion
                      ? "#3b82f6"
                      : userAnswers[index] !== null
                      ? "#10b981"
                      : "#d1d5db",
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  '&:hover:not(:disabled)': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '&:disabled': {
                    opacity: 0.6,
                  },
                }}
              >
                {index + 1}
              </IconButton>
            </Tooltip>
          ))}
          
          {!showAllIndicators && visibleIndicators[visibleIndicators.length - 1] < totalQuestions - 1 && (
            <>
              {visibleIndicators[visibleIndicators.length - 1] < totalQuestions - 2 && (
                <Typography variant="body2" sx={{ color: 'text.secondary', px: 1 }}>
                  ...
                </Typography>
              )}
              <IconButton
                size="small"
                onClick={() => transitionToQuestion(totalQuestions - 1)}
                disabled={isSubmitting}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: totalQuestions - 1 === currentQuestion
                    ? "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)"
                    : userAnswers[totalQuestions - 1] !== null
                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    : "transparent",
                  color: totalQuestions - 1 === currentQuestion || userAnswers[totalQuestions - 1] !== null
                    ? "white" 
                    : "#6b7280",
                  border: "2px solid",
                  borderColor: totalQuestions - 1 === currentQuestion
                    ? "#3b82f6"
                    : userAnswers[totalQuestions - 1] !== null
                    ? "#10b981"
                    : "#d1d5db",
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                  '&:hover:not(:disabled)': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                {totalQuestions}
              </IconButton>
            </>
          )}
        </Stack>

        {/* Progress Summary */}
        <Stack direction="row" spacing={3} justifyContent="center" alignItems="center">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              }}
            />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {answeredCount} Answered
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#e5e7eb',
              }}
            />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {totalQuestions - answeredCount} Remaining
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Desktop Navigation Buttons */}
      <Stack 
        direction="row" 
        justifyContent="space-between" 
        alignItems="center"
        sx={{ gap: 3 }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={18} />}
          onClick={goToPrevQuestion}
          disabled={currentQuestion === 0 || isSubmitting}
          size="large"
          sx={{
            borderRadius: 2.5,
            px: 4,
            py: 1.75,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
            minWidth: 140,
            borderColor: '#d1d5db',
            color: '#374151',
            backgroundColor: 'white',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              borderColor: '#9ca3af',
              backgroundColor: '#f9fafb',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '&:disabled': {
              opacity: 0.5,
              transform: 'none',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          Previous
        </Button>

        {isLastQuestion ? (
          <Button
            variant="contained"
            endIcon={<Flag size={18} />}
            onClick={handleFinishClick}
            disabled={isSubmitting}
            size="large"
            sx={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              borderRadius: 2.5,
              px: 4,
              py: 1.75,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '1rem',
              minWidth: 140,
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              '&:hover': {
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.5)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              '&:disabled': {
                background: '#d1d5db',
                boxShadow: 'none',
                transform: 'none',
              },
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Finish Quiz'}
          </Button>
        ) : (
          <Button
            variant="contained"
            endIcon={<ArrowRight size={18} />}
            onClick={goToNextQuestion}
            disabled={isSubmitting}
            size="large"
            sx={{
              background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
              borderRadius: 2.5,
              px: 4,
              py: 1.75,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              minWidth: 140,
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
              '&:hover': {
                background: "linear-gradient(135deg, #2563eb 0%, #5b21b6 100%)",
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              '&:disabled': {
                background: '#d1d5db',
                boxShadow: 'none',
                transform: 'none',
              },
            }}
          >
            Next
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default QuizNavigation;