import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  LinearProgress,
  Chip,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Fade,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Target,
  Brain,
  Flag,
  X,
  RotateCcw,
} from 'lucide-react';

// Animations
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`;

// Styled Components
const QuizContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const QuizCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  border: '1px solid',
  borderColor: theme.palette.grey[200],
  overflow: 'visible',
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  border: '1px solid',
  borderColor: theme.palette.primary.light + '20',
}));

const QuestionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  marginBottom: theme.spacing(3),
  border: '1px solid',
  borderColor: theme.palette.grey[200],
  animation: `${slideIn} 0.5s ease-out`,
}));

const OptionCard = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isSelected' && prop !== 'isCorrect' && prop !== 'showResult',
})(({ theme, isSelected, isCorrect, showResult }) => ({
  padding: theme.spacing(2, 3),
  marginBottom: theme.spacing(2),
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '2px solid',
  borderColor: isSelected 
    ? theme.palette.primary.main 
    : theme.palette.grey[200],
  borderRadius: theme.shape.borderRadius * 1.5,
  background: isSelected
    ? `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`
    : 'white',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    transform: 'translateX(4px)',
    boxShadow: theme.shadows[2],
  },
  ...(showResult && isCorrect && {
    borderColor: theme.palette.success.main,
    background: `linear-gradient(135deg, ${theme.palette.success.main}08 0%, ${theme.palette.success.light}08 100%)`,
  }),
  ...(showResult && isSelected && !isCorrect && {
    borderColor: theme.palette.error.main,
    background: `linear-gradient(135deg, ${theme.palette.error.main}08 0%, ${theme.palette.error.light}08 100%)`,
  }),
}));

const NavigationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(4),
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(3),
  },
}));

const StatsChip = styled(Chip)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
  border: '1px solid',
  borderColor: theme.palette.primary.light + '30',
  fontWeight: 600,
  '& .MuiChip-icon': {
    color: theme.palette.primary.main,
  },
}));

const ModernQuizEngine = ({ 
  questions = [], 
  onFinish, 
  quizTitle = "Interactive Quiz",
  showTimer = false,
  timeLimit = null 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState(new Array(questions.length).fill(null));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);

  // Memoize derived values
  const answeredCount = useMemo(() => 
    userAnswers.filter(a => a !== null).length, 
    [userAnswers]
  );

  const progressPercentage = useMemo(() => 
    (answeredCount / questions.length) * 100, 
    [answeredCount, questions.length]
  );

  const unansweredCount = useMemo(() => 
    userAnswers.filter(a => a === null).length,
    [userAnswers]
  );

  if (!questions.length) {
    return (
      <QuizContainer maxWidth="md">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h4" sx={{ mb: 2, color: 'text.secondary' }}>
            No questions available
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Please try uploading your content again.
          </Typography>
        </Box>
      </QuizContainer>
    );
  }

  const currentQ = questions[currentQuestion];

  const handleAnswerSelect = useCallback((index) => {
    setUserAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestion] = index;
      return newAnswers;
    });
  }, [currentQuestion]);

  const goToNextQuestion = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  }, [currentQuestion, questions.length]);

  const goToPrevQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  }, [currentQuestion]);

  const handleFinishClick = useCallback(() => {
    if (unansweredCount > 0) {
      setShowFinishConfirm(true);
    } else {
      submitQuiz();
    }
  }, [unansweredCount]);

  const submitQuiz = useCallback(async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setShowFinishConfirm(false);

    try {
      const score = userAnswers.reduce((total, answer, idx) => {
        return total + (answer === questions[idx]?.correctAnswer ? 1 : 0);
      }, 0);
      
      const results = {
        answers: userAnswers,
        score: (score / questions.length) * 100,
        totalQuestions: questions.length,
        answeredQuestions: questions.length - unansweredCount,
        correctAnswers: score,
        timestamp: new Date().toISOString(),
        timeSpent: timeLimit ? timeLimit - timeRemaining : null,
      };

      await onFinish?.(results);
    } catch (error) {
      console.error("Error finishing quiz:", error);
      alert("There was an error submitting your quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [userAnswers, questions, onFinish, isSubmitting, unansweredCount, timeLimit, timeRemaining]);

  const cancelFinish = useCallback(() => {
    setShowFinishConfirm(false);
  }, []);

  const formatTime = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <QuizContainer maxWidth="md">
      <Stack spacing={4}>
        {/* Header */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
            {quizTitle}
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap>
            <StatsChip 
              icon={<Target size={16} />} 
              label={`Question ${currentQuestion + 1} of ${questions.length}`} 
            />
            <StatsChip 
              icon={<CheckCircle size={16} />} 
              label={`${answeredCount} answered`} 
            />
            {showTimer && timeRemaining && (
              <StatsChip 
                icon={<Clock size={16} />} 
                label={formatTime(timeRemaining)}
                color={timeRemaining < 300 ? 'error' : 'default'}
              />
            )}
          </Stack>
        </Box>

        {/* Progress */}
        <ProgressContainer>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Progress
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {Math.round(progressPercentage)}% Complete
            </Typography>
          </Stack>
          <LinearProgress 
            variant="determinate" 
            value={progressPercentage} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)',
              },
            }} 
          />
        </ProgressContainer>

        {/* Quiz Content */}
        <QuizCard>
          <CardContent sx={{ p: 4 }}>
            {/* Context */}
            {currentQ?.context && (
              <Fade in={true}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    mb: 3, 
                    background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderLeft: '4px solid',
                    borderLeftColor: 'primary.main',
                  }}
                >
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {currentQ.context}
                  </Typography>
                </Paper>
              </Fade>
            )}

            {/* Question */}
            <QuestionCard elevation={0}>
              <Stack spacing={3}>
                <Box>
                  <Chip 
                    label={`Question ${currentQuestion + 1}`}
                    size="small"
                    sx={{ mb: 2 }}
                    color="primary"
                  />
                  <Typography variant="h5" sx={{ fontWeight: 600, lineHeight: 1.4 }}>
                    {currentQ?.question || 'Question data missing.'}
                  </Typography>
                </Box>

                {/* Options */}
                <FormControl component="fieldset">
                  <RadioGroup
                    value={userAnswers[currentQuestion] ?? ''}
                    onChange={(e) => handleAnswerSelect(parseInt(e.target.value))}
                  >
                    <Stack spacing={2}>
                      {currentQ?.options?.map((option, index) => (
                        <OptionCard
                          key={index}
                          isSelected={userAnswers[currentQuestion] === index}
                          onClick={() => handleAnswerSelect(index)}
                        >
                          <FormControlLabel
                            value={index}
                            control={<Radio sx={{ display: 'none' }} />}
                            label={
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {option}
                              </Typography>
                            }
                            sx={{ 
                              margin: 0, 
                              width: '100%',
                              '& .MuiFormControlLabel-label': {
                                width: '100%',
                              },
                            }}
                          />
                        </OptionCard>
                      )) || (
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                          No options available for this question.
                        </Typography>
                      )}
                    </Stack>
                  </RadioGroup>
                </FormControl>
              </Stack>
            </QuestionCard>

            {/* Navigation */}
            <NavigationContainer>
              <Button
                variant="outlined"
                startIcon={<ArrowLeft size={16} />}
                onClick={goToPrevQuestion}
                disabled={currentQuestion === 0 || isSubmitting}
                size="large"
              >
                Previous
              </Button>

              <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', sm: 'flex' } }}>
                {questions.map((_, index) => (
                  <IconButton
                    key={index}
                    size="small"
                    onClick={() => setCurrentQuestion(index)}
                    disabled={isSubmitting}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      background: index === currentQuestion 
                        ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
                        : userAnswers[index] !== null
                          ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                          : 'transparent',
                      color: index === currentQuestion || userAnswers[index] !== null ? 'white' : 'text.secondary',
                      border: '1px solid',
                      borderColor: index === currentQuestion 
                        ? 'primary.main'
                        : userAnswers[index] !== null
                          ? 'success.main'
                          : 'grey.300',
                      '&:hover': {
                        background: index === currentQuestion 
                          ? 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)'
                          : userAnswers[index] !== null
                            ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                            : 'grey.100',
                      },
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {index + 1}
                    </Typography>
                  </IconButton>
                ))}
              </Stack>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  variant="contained"
                  endIcon={<Flag size={16} />}
                  onClick={handleFinishClick}
                  disabled={isSubmitting}
                  size="large"
                  sx={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
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
                  size="large"
                >
                  Next
                </Button>
              )}
            </NavigationContainer>
          </CardContent>
        </QuizCard>

        {/* Finish Confirmation Dialog */}
        <Dialog
          open={showFinishConfirm}
          onClose={cancelFinish}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <Flag size={20} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Finish Quiz?
              </Typography>
            </Stack>
          </DialogTitle>
          
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              You have <strong>{unansweredCount}</strong> unanswered question{unansweredCount !== 1 ? 's' : ''}. 
              Are you sure you want to finish the quiz?
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Unanswered questions will be marked as incorrect.
            </Typography>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button
              variant="outlined"
              onClick={cancelFinish}
              startIcon={<RotateCcw size={16} />}
            >
              Continue Quiz
            </Button>
            <Button
              variant="contained"
              onClick={submitQuiz}
              disabled={isSubmitting}
              endIcon={<Flag size={16} />}
              sx={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                },
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Finish Quiz'}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </QuizContainer>
  );
};

export default ModernQuizEngine;