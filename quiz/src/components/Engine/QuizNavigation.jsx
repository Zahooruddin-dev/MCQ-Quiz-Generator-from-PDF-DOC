import React from "react";
import { 
  Button, 
  Stack, 
  IconButton, 
  Typography, 
  Box, 
  Tooltip,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { ArrowLeft, ArrowRight, Flag } from "lucide-react";

const NavigationContainer = ({ children }) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    sx={{
      width: '100%',
      gap: { xs: 1, sm: 2 },
      flexWrap: 'nowrap',
    }}
  >
    {children}
  </Stack>
);

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
    if (isMobile) return 0; // Hide on mobile
    if (isTablet) return Math.min(8, totalQuestions);
    return Math.min(12, totalQuestions);
  };
  
  const maxIndicators = getMaxIndicators();
  const showAllIndicators = totalQuestions <= maxIndicators;
  
  // Calculate which indicators to show when we can't show all
  const getVisibleIndicators = () => {
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
  
  return (
    <Box sx={{ 
      borderTop: '1px solid #e5e7eb', 
      pt: { xs: 2, sm: 4 }, 
      mt: { xs: 2, sm: 4 } 
    }}>
      {/* Mobile Question Progress */}
      <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 3 }}>
        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Question {currentQuestion + 1} of {totalQuestions}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {Math.round((answeredCount / totalQuestions) * 100)}% complete
            </Typography>
          </Stack>
          
          <Box
            sx={{
              width: '100%',
              height: 6,
              backgroundColor: '#e5e7eb',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: `${(answeredCount / totalQuestions) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                transition: 'width 0.3s ease',
              }}
            />
          </Box>
        </Box>
        
        {/* Mini Question Dots */}
        <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ mb: 2 }}>
          {userAnswers.slice(0, Math.min(10, totalQuestions)).map((_, index) => (
            <Box
              key={index}
              onClick={() => transitionToQuestion(index)}
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: index === currentQuestion
                  ? '#3b82f6'
                  : userAnswers[index] !== null
                  ? '#10b981'
                  : '#d1d5db',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:active': {
                  transform: 'scale(1.2)',
                },
              }}
            />
          ))}
          {totalQuestions > 10 && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary', 
                ml: 1, 
                fontSize: '0.7rem',
                alignSelf: 'center'
              }}
            >
              +{totalQuestions - 10}
            </Typography>
          )}
        </Stack>
      </Box>

      <NavigationContainer>
        {/* Previous Button */}
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={isMobile ? 14 : 16} />}
          onClick={goToPrevQuestion}
          disabled={currentQuestion === 0 || isSubmitting}
          size={isMobile ? "medium" : "large"}
          sx={{
            borderRadius: 2,
            px: { xs: 1.5, sm: 3 },
            py: { xs: 0.75, sm: 1.5 },
            fontWeight: 600,
            textTransform: 'none',
            minWidth: { xs: 'auto', sm: '120px' },
            borderColor: '#d1d5db',
            color: '#374151',
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
            '&:hover': {
              borderColor: '#9ca3af',
              background: '#f9fafb',
            },
            '&:disabled': {
              opacity: 0.5,
            },
          }}
        >
          {isMobile ? 'Prev' : 'Previous'}
        </Button>

        {/* Desktop Question Indicators */}
        <Stack 
          direction="row" 
          spacing={0.5}
          sx={{ 
            display: { xs: "none", sm: "flex" },
            alignItems: 'center',
            maxWidth: '100%',
            overflow: 'hidden',
            px: 1,
          }}
        >
          {!showAllIndicators && visibleIndicators[0] > 0 && (
            <>
              <IconButton
                size="small"
                onClick={() => transitionToQuestion(0)}
                disabled={isSubmitting}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  background: userAnswers[0] !== null
                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    : "transparent",
                  color: userAnswers[0] !== null ? "white" : "#6b7280",
                  border: "1px solid",
                  borderColor: userAnswers[0] !== null ? "#10b981" : "#d1d5db",
                  fontSize: '0.7rem',
                }}
              >
                1
              </IconButton>
              {visibleIndicators[0] > 1 && (
                <Typography variant="caption" sx={{ color: 'text.secondary', px: 0.5 }}>
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
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
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
                  border: "1px solid",
                  borderColor:
                    index === currentQuestion
                      ? "#3b82f6"
                      : userAnswers[index] !== null
                      ? "#10b981"
                      : "#d1d5db",
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  '&:hover:not(:disabled)': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    borderColor: index === currentQuestion
                      ? "#2563eb"
                      : userAnswers[index] !== null
                      ? "#047857"
                      : "#9ca3af",
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
                <Typography variant="caption" sx={{ color: 'text.secondary', px: 0.5 }}>
                  ...
                </Typography>
              )}
              <IconButton
                size="small"
                onClick={() => transitionToQuestion(totalQuestions - 1)}
                disabled={isSubmitting}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  background: totalQuestions - 1 === currentQuestion
                    ? "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)"
                    : userAnswers[totalQuestions - 1] !== null
                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    : "transparent",
                  color: totalQuestions - 1 === currentQuestion || userAnswers[totalQuestions - 1] !== null
                    ? "white" 
                    : "#6b7280",
                  border: "1px solid",
                  borderColor: totalQuestions - 1 === currentQuestion
                    ? "#3b82f6"
                    : userAnswers[totalQuestions - 1] !== null
                    ? "#10b981"
                    : "#d1d5db",
                  fontSize: '0.7rem',
                }}
              >
                {totalQuestions}
              </IconButton>
            </>
          )}
        </Stack>

        {/* Next/Finish Button */}
        {isLastQuestion ? (
          <Button
            variant="contained"
            endIcon={<Flag size={isMobile ? 14 : 16} />}
            onClick={handleFinishClick}
            disabled={isSubmitting}
            size={isMobile ? "medium" : "large"}
            sx={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              borderRadius: 2,
              px: { xs: 1.5, sm: 3 },
              py: { xs: 0.75, sm: 1.5 },
              fontWeight: 700,
              textTransform: 'none',
              minWidth: { xs: 'auto', sm: '120px' },
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              '&:hover': {
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.5)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              '&:disabled': {
                background: '#d1d5db',
                boxShadow: 'none',
              },
            }}
          >
            {isSubmitting ? 'Submitting...' : (isMobile ? 'Finish' : 'Finish Quiz')}
          </Button>
        ) : (
          <Button
            variant="contained"
            endIcon={<ArrowRight size={isMobile ? 14 : 16} />}
            onClick={goToNextQuestion}
            disabled={isSubmitting}
            size={isMobile ? "medium" : "large"}
            sx={{
              background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
              borderRadius: 2,
              px: { xs: 1.5, sm: 3 },
              py: { xs: 0.75, sm: 1.5 },
              fontWeight: 600,
              textTransform: 'none',
              minWidth: { xs: 'auto', sm: '120px' },
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
              '&:hover': {
                background: "linear-gradient(135deg, #2563eb 0%, #5b21b6 100%)",
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)',
              },
              '&:active': {
                transform: 'translateY(0)',
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
      </NavigationContainer>

      {/* Progress Summary - Desktop Only */}
      <Box sx={{ 
        display: { xs: 'none', sm: 'block' }, 
        textAlign: 'center', 
        mt: 3,
        pt: 2,
        borderTop: '1px solid #f3f4f6'
      }}>
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
    </Box>
  );
};

export default QuizNavigation;