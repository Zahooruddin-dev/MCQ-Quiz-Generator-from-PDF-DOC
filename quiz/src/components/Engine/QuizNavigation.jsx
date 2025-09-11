import React from "react";
import { 
  Button, 
  Stack, 
  IconButton, 
  Typography, 
  Box, 
  Tooltip,
  Divider 
} from "@mui/material";
import { ArrowLeft, ArrowRight, Flag, Check } from "lucide-react";
import { NavigationContainer } from "./QuizStyles";

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
  const isLastQuestion = currentQuestion === totalQuestions - 1;
  const answeredCount = userAnswers.filter(answer => answer !== null).length;
  
  return (
    <Box sx={{ 
      borderTop: '1px solid #e5e7eb', 
      pt: { xs: 3, sm: 4 }, 
      mt: { xs: 3, sm: 4 } 
    }}>
      {/* Mobile Question Indicators */}
      <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 3 }}>
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
          {userAnswers.slice(0, 8).map((_, index) => (
            <Box
              key={index}
              onClick={() => transitionToQuestion(index)}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: index === currentQuestion
                  ? '#3b82f6'
                  : userAnswers[index] !== null
                  ? '#10b981'
                  : '#e5e7eb',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:active': {
                  transform: 'scale(0.8)',
                },
              }}
            />
          ))}
          {totalQuestions > 8 && (
            <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
              +{totalQuestions - 8} more
            </Typography>
          )}
        </Stack>
        <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
          {answeredCount} of {totalQuestions} answered
        </Typography>
      </Box>

      <NavigationContainer>
        {/* Previous Button */}
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={16} />}
          onClick={goToPrevQuestion}
          disabled={currentQuestion === 0 || isSubmitting}
          size="large"
          sx={{
            borderRadius: 2,
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 1.5 },
            fontWeight: 600,
            textTransform: 'none',
            minWidth: { xs: 'auto', sm: '120px' },
            borderColor: '#d1d5db',
            color: '#374151',
            '&:hover': {
              borderColor: '#9ca3af',
              background: '#f9fafb',
            },
            '&:disabled': {
              opacity: 0.5,
            },
          }}
        >
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Previous</Box>
          <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Prev</Box>
        </Button>

        {/* Desktop Question Indicators */}
        <Stack 
          direction="row" 
          spacing={1} 
          sx={{ 
            display: { xs: "none", sm: "flex" },
            maxWidth: '400px',
            overflow: 'hidden',
          }}
        >
          {userAnswers.map((_, index) => (
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
                  width: { sm: 32, md: 36 },
                  height: { sm: 32, md: 36 },
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
                  '&:hover:not(:disabled)': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
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
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: { sm: '0.7rem', md: '0.75rem' },
                  }}
                >
                  {index + 1}
                </Typography>
              </IconButton>
            </Tooltip>
          ))}
        </Stack>

        {/* Next/Finish Button */}
        {isLastQuestion ? (
          <Button
            variant="contained"
            endIcon={<Flag size={16} />}
            onClick={handleFinishClick}
            disabled={isSubmitting}
            size="large"
            sx={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              borderRadius: 2,
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 1.5 },
              fontWeight: 700,
              textTransform: 'none',
              minWidth: { xs: 'auto', sm: '120px' },
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
            {isSubmitting ? (
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Submitting...</Box>
            ) : (
              <>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Finish Quiz</Box>
                <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Finish</Box>
              </>
            )}
          </Button>
        ) : (
          <Button
            variant="contained"
            endIcon={<ArrowRight size={16} />}
            onClick={goToNextQuestion}
            disabled={isSubmitting}
            size="large"
            sx={{
              background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
              borderRadius: 2,
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 1.5 },
              fontWeight: 600,
              textTransform: 'none',
              minWidth: { xs: 'auto', sm: '120px' },
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
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Next</Box>
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Next</Box>
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