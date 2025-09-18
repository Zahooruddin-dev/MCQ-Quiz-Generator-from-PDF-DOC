import React, { memo, useMemo } from "react";
import { Stack, Typography, Box } from "@mui/material";
import { Target, CheckCircle, Clock, Brain } from "lucide-react";
import { StatsChip, QuizHeader as StyledHeader } from "./QuizStyles";

// Memoized timer component for better performance
const FixedTimer = memo(({ timeRemaining, isVisible }) => {
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isTimerUrgent = timeRemaining && timeRemaining < 300; // Less than 5 minutes
  const isTimerCritical = timeRemaining && timeRemaining < 60; // Less than 1 minute

  if (!isVisible || timeRemaining === null) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: { xs: 60, sm: 70 }, // Moved down to avoid profile header
        right: { xs: 16, sm: 20 },
        zIndex: 1200, // Above most content
        background: isTimerCritical
          ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
          : isTimerUrgent
          ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
          : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        border: isTimerCritical
          ? '2px solid #fca5a5'
          : isTimerUrgent
          ? '2px solid #fcd34d'
          : '2px solid #7dd3fc',
        borderRadius: 3,
        p: { xs: 1, sm: 1.5 },
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(10px)',
        animation: isTimerCritical 
          ? 'timerPulse 1s infinite' 
          : isTimerUrgent 
          ? 'timerPulse 2s infinite' 
          : 'none',
        transition: 'all 0.3s ease-in-out',
        minWidth: { xs: 80, sm: 100 },
        '@keyframes timerPulse': {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: 1,
          },
          '50%': {
            transform: 'scale(1.05)',
            opacity: 0.9,
          },
        },
        '&:hover': {
          transform: 'scale(1.05)',
        },
      }}
    >
      <Clock 
        size={16} 
        color={isTimerCritical 
          ? '#dc2626' 
          : isTimerUrgent 
          ? '#f59e0b' 
          : '#0284c7'
        } 
      />
      <Typography
        variant="body2"
        sx={{
          color: isTimerCritical 
            ? '#991b1b' 
            : isTimerUrgent 
            ? '#92400e' 
            : '#0c4a6e',
          fontWeight: 700,
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
          fontFamily: 'monospace',
          letterSpacing: '0.5px',
        }}
      >
        {formatTime(timeRemaining)}
      </Typography>
    </Box>
  );
});

FixedTimer.displayName = 'FixedTimer';

// Memoized stats chip for performance
const MemoizedStatsChip = memo(({ icon, label, sx, ...props }) => (
  <StatsChip
    icon={icon}
    label={label}
    sx={sx}
    {...props}
  />
));

MemoizedStatsChip.displayName = 'MemoizedStatsChip';

const QuizHeader = memo(({
  quizTitle,
  currentQuestion,
  totalQuestions,
  answeredCount,
  showTimer,
  timeRemaining,
}) => {
  // Memoized calculations for performance
  const timerStates = useMemo(() => ({
    isTimerUrgent: timeRemaining && timeRemaining < 300,
    isTimerCritical: timeRemaining && timeRemaining < 60,
  }), [timeRemaining]);

  const progressData = useMemo(() => ({
    progressPercentage: Math.round((answeredCount / totalQuestions) * 100),
    remainingQuestions: totalQuestions - answeredCount,
    isComplete: answeredCount === totalQuestions,
  }), [answeredCount, totalQuestions]);

  const formatTime = useMemo(() => {
    return (seconds) => {
      if (!seconds && seconds !== 0) return "";
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };
  }, []);

  // Security: Sanitize quiz title to prevent XSS
  const sanitizedTitle = useMemo(() => {
    if (typeof quizTitle !== 'string') return 'Quiz';
    return quizTitle.replace(/<[^>]*>/g, '').trim() || 'Quiz';
  }, [quizTitle]);

  return (
    <>
      {/* Fixed Timer Component */}
      <FixedTimer 
        timeRemaining={timeRemaining} 
        isVisible={showTimer} 
      />

      <StyledHeader>
        {/* Main Title */}
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Stack 
            direction="row" 
            alignItems="center" 
            justifyContent="center" 
            spacing={2} 
            sx={{ mb: 2 }}
          >
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
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
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
                // Add some padding to avoid overlap with fixed timer
                pr: { xs: '100px', sm: '120px' },
              }}
            >
              {sanitizedTitle}
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
          <MemoizedStatsChip
            icon={<Target size={16} />}
            label={`Question ${currentQuestion + 1} of ${totalQuestions}`}
            sx={{
              background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
              border: '1px solid #c7d2fe',
              color: '#1e40af',
              fontWeight: 600,
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              height: { xs: 32, sm: 36 },
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
              },
              '& .MuiChip-icon': {
                color: '#3b82f6',
              },
            }}
          />

          {/* Answered Count */}
          <MemoizedStatsChip
            icon={<CheckCircle size={16} />}
            label={`${answeredCount} answered`}
            sx={{
              background: progressData.isComplete
                ? 'linear-gradient(135deg, #d1fae5 0%, #dcfce7 100%)'
                : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              border: progressData.isComplete
                ? '1px solid #a7f3d0'
                : '1px solid #fcd34d',
              color: progressData.isComplete ? '#065f46' : '#92400e',
              fontWeight: 600,
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              height: { xs: 32, sm: 36 },
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
              },
              '& .MuiChip-icon': {
                color: progressData.isComplete ? '#10b981' : '#f59e0b',
              },
            }}
          />

          {/* Progress Percentage - Mobile Only */}
          <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
            <MemoizedStatsChip
              label={`${progressData.progressPercentage}% complete`}
              sx={{
                background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                border: '1px solid #d1d5db',
                color: '#374151',
                fontWeight: 600,
                fontSize: '0.8rem',
                height: 32,
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                },
              }}
            />
          </Box>
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
            {progressData.progressPercentage}% complete • {progressData.remainingQuestions} questions remaining
          </Typography>
        </Box>

        {/* Timer Critical Warning */}
        {timerStates.isTimerCritical && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
              border: '1px solid #fecaca',
              borderRadius: 2,
              textAlign: 'center',
              animation: 'warningPulse 2s infinite',
              '@keyframes warningPulse': {
                '0%, 100%': {
                  opacity: 1,
                  transform: 'scale(1)',
                },
                '50%': {
                  opacity: 0.9,
                  transform: 'scale(1.02)',
                },
              },
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
              ⚠️ Less than 1 minute remaining! Quiz will auto-submit soon.
            </Typography>
          </Box>
        )}

        {/* Timer Warning (5 minutes) */}
        {timerStates.isTimerUrgent && !timerStates.isTimerCritical && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
              border: '1px solid #fcd34d',
              borderRadius: 2,
              textAlign: 'center',
              animation: 'warningPulse 3s infinite',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: '#92400e',
                fontWeight: 600,
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
              }}
            >
              ⏰ Less than 5 minutes remaining!
            </Typography>
          </Box>
        )}
      </StyledHeader>
    </>
  );
});

QuizHeader.displayName = 'QuizHeader';

export default QuizHeader;