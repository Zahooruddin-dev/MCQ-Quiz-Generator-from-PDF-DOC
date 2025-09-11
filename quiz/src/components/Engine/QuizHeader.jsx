import React from "react";
import { Stack, Typography, Box } from "@mui/material";
import { Target, CheckCircle, Clock, Brain } from "lucide-react";
import { StatsChip, QuizHeader as StyledHeader } from "./QuizStyles";

const QuizHeader = ({
  quizTitle,
  currentQuestion,
  totalQuestions,
  answeredCount,
  showTimer,
  timeRemaining,
}) => {
  const formatTime = (seconds) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isTimerUrgent = timeRemaining && timeRemaining < 300; // Less than 5 minutes
  const progressPercentage = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <StyledHeader>
      {/* Main Title */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ mb: 2 }}>
          <Box
            sx={{
              width: { xs: 32, sm: 40 },
              height: { xs: 32, sm: 40 },
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            }}
          >
            <Brain size={16} />
          </Box>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
              textAlign: 'center',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            {quizTitle}
          </Typography>
        </Stack>

        {/* Subtitle */}
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            textAlign: 'center',
            fontSize: { xs: '0.9rem', sm: '1rem' },
            maxWidth: 600,
            mx: 'auto',
            mb: 1,
          }}
        >
          Test your knowledge and track your progress
        </Typography>
      </Box>

      {/* Stats Chips */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 1.5, sm: 2 }}
        justifyContent="center"
        alignItems="center"
        sx={{
          flexWrap: 'wrap',
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        {/* Current Question */}
        <StatsChip
          icon={<Target size={16} />}
          label={`Question ${currentQuestion + 1} of ${totalQuestions}`}
          sx={{
            background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
            border: '1px solid #c7d2fe',
            color: '#1e40af',
            fontWeight: 600,
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
            height: { xs: 32, sm: 36 },
            '& .MuiChip-icon': {
              color: '#3b82f6',
            },
          }}
        />

        {/* Answered Count */}
        <StatsChip
          icon={<CheckCircle size={16} />}
          label={`${answeredCount} answered`}
          sx={{
            background: answeredCount === totalQuestions 
              ? 'linear-gradient(135deg, #d1fae5 0%, #dcfce7 100%)'
              : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: answeredCount === totalQuestions 
              ? '1px solid #a7f3d0'
              : '1px solid #fcd34d',
            color: answeredCount === totalQuestions ? '#065f46' : '#92400e',
            fontWeight: 600,
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
            height: { xs: 32, sm: 36 },
            '& .MuiChip-icon': {
              color: answeredCount === totalQuestions ? '#10b981' : '#f59e0b',
            },
          }}
        />

        {/* Progress Percentage - Mobile Only */}
        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
          <StatsChip
            label={`${progressPercentage}% complete`}
            sx={{
              background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
              border: '1px solid #d1d5db',
              color: '#374151',
              fontWeight: 600,
              fontSize: '0.8rem',
              height: 32,
            }}
          />
        </Box>

        {/* Timer */}
        {showTimer && timeRemaining && (
          <StatsChip
            icon={<Clock size={16} />}
            label={formatTime(timeRemaining)}
            sx={{
              background: isTimerUrgent
                ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
                : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              border: isTimerUrgent
                ? '1px solid #fca5a5'
                : '1px solid #7dd3fc',
              color: isTimerUrgent ? '#991b1b' : '#0c4a6e',
              fontWeight: 700,
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              height: { xs: 32, sm: 36 },
              animation: isTimerUrgent ? 'pulse 2s infinite' : 'none',
              fontFamily: 'monospace',
              '& .MuiChip-icon': {
                color: isTimerUrgent ? '#dc2626' : '#0284c7',
              },
              '@keyframes pulse': {
                '0%, 100%': {
                  opacity: 1,
                },
                '50%': {
                  opacity: 0.7,
                },
              },
            }}
          />
        )}
      </Stack>

      {/* Additional Info - Desktop Only */}
      <Box sx={{ 
        display: { xs: 'none', sm: 'block' }, 
        mt: 3, 
        textAlign: 'center' 
      }}>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: '0.85rem',
            opacity: 0.8,
          }}
        >
          {progressPercentage}% complete • {totalQuestions - answeredCount} questions remaining
        </Typography>
      </Box>

      {/* Timer Warning */}
      {isTimerUrgent && (
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            border: '1px solid #fecaca',
            borderRadius: 2,
            textAlign: 'center',
            animation: 'pulse 2s infinite',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: '#991b1b',
              fontWeight: 600,
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
            }}
          >
            ⚠️ Less than 5 minutes remaining!
          </Typography>
        </Box>
      )}
    </StyledHeader>
  );
};

export default QuizHeader;