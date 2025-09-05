import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Chip,
  LinearProgress,
  IconButton,
  Paper,
  Collapse,
  Divider,
  Avatar,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  Trophy,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Award,
  TrendingUp,
  FileText,
  Share2,
  Download,
} from 'lucide-react';

// Animations
const scaleIn = keyframes`
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Styled Components
const ResultsContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const HeroCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  borderRadius: theme.shape.borderRadius * 3,
  marginBottom: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '40%',
    height: '100%',
    background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
}));

const ScoreCircle = styled(Box)(({ theme }) => ({
  width: 120,
  height: 120,
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  border: '3px solid rgba(255, 255, 255, 0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: `${scaleIn} 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)`,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: '50%',
    background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.5), transparent, rgba(255, 255, 255, 0.5))',
    animation: `${rotate} 3s linear infinite`,
    zIndex: -1,
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.shape.borderRadius * 2,
  border: '1px solid',
  borderColor: theme.palette.grey[200],
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const QuestionCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  border: '1px solid',
  borderColor: theme.palette.grey[200],
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const OptionItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isCorrect' && prop !== 'isUserAnswer' && prop !== 'isWrong',
})(({ theme, isCorrect, isUserAnswer, isWrong }) => ({
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  border: '1px solid',
  borderColor: theme.palette.grey[200],
  background: 'white',
  ...(isCorrect && {
    borderColor: theme.palette.success.main,
    background: `linear-gradient(135deg, ${theme.palette.success.main}08 0%, ${theme.palette.success.light}08 100%)`,
  }),
  ...(isWrong && {
    borderColor: theme.palette.error.main,
    background: `linear-gradient(135deg, ${theme.palette.error.main}08 0%, ${theme.palette.error.light}08 100%)`,
  }),
}));

const ModernResultPage = ({ questions, userAnswers, onNewQuiz, fileName }) => {
  const [expandedQuestions, setExpandedQuestions] = useState([]);

  if (!questions || !userAnswers) {
    return (
      <ResultsContainer maxWidth="md">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h4" sx={{ mb: 2, color: 'text.secondary' }}>
            No Results Available
          </Typography>
          <Button variant="contained" onClick={onNewQuiz} size="large">
            Start New Quiz
          </Button>
        </Box>
      </ResultsContainer>
    );
  }

  const calculateResults = () => {
    let correct = 0, wrong = 0, unattempted = 0;
    userAnswers.forEach((answer, i) => {
      if (answer === null || answer === undefined) unattempted++;
      else if (answer === questions[i].correctAnswer) correct++;
      else wrong++;
    });
    return { 
      correct, 
      wrong, 
      unattempted, 
      score: Math.round((correct / questions.length) * 100),
      accuracy: questions.length > 0 ? Math.round((correct / (questions.length - unattempted)) * 100) : 0
    };
  };

  const results = calculateResults();

  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const toggleAllQuestions = () => {
    if (expandedQuestions.length === questions.length) {
      setExpandedQuestions([]);
    } else {
      setExpandedQuestions(questions.map((_, i) => i));
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return 'Excellent! Outstanding performance!';
    if (score >= 80) return 'Great job! Well done!';
    if (score >= 70) return 'Good work! Keep it up!';
    if (score >= 60) return 'Not bad! Room for improvement.';
    return 'Keep practicing! You can do better!';
  };

  const getPerformanceIcon = (score) => {
    if (score >= 90) return <Trophy size={32} />;
    if (score >= 70) return <Award size={32} />;
    return <Target size={32} />;
  };

  return (
    <ResultsContainer maxWidth="lg">
      <Stack spacing={4}>
        {/* Hero Section */}
        <HeroCard>
          <CardContent sx={{ p: 4 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
              <Box sx={{ textAlign: { xs: 'center', md: 'left' }, flex: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
                  Quiz Complete!
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
                  {getScoreMessage(results.score)}
                </Typography>
                <Stack direction="row" spacing={2} justifyContent={{ xs: 'center', md: 'flex-start' }}>
                  <Chip 
                    label={fileName || 'Quiz Results'} 
                    sx={{ 
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      fontWeight: 600,
                    }} 
                  />
                  <Chip 
                    icon={<FileText size={16} />}
                    label={`${questions.length} Questions`} 
                    sx={{ 
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      fontWeight: 600,
                    }} 
                  />
                </Stack>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <ScoreCircle>
                  <Stack alignItems="center" spacing={0.5}>
                    <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>
                      {results.score}%
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 500 }}>
                      SCORE
                    </Typography>
                  </Stack>
                </ScoreCircle>
                <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
                  {results.correct} out of {questions.length} correct
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </HeroCard>

        {/* Stats Grid */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          <StatsCard sx={{ flex: 1 }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <CheckCircle size={24} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main', mb: 0.5 }}>
                {results.correct}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Correct Answers
              </Typography>
            </CardContent>
          </StatsCard>

          <StatsCard sx={{ flex: 1 }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <XCircle size={24} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'error.main', mb: 0.5 }}>
                {results.wrong}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Wrong Answers
              </Typography>
            </CardContent>
          </StatsCard>

          <StatsCard sx={{ flex: 1 }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Clock size={24} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'warning.main', mb: 0.5 }}>
                {results.unattempted}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Unattempted
              </Typography>
            </CardContent>
          </StatsCard>

          <StatsCard sx={{ flex: 1 }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <TrendingUp size={24} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5 }}>
                {results.accuracy}%
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Accuracy Rate
              </Typography>
            </CardContent>
          </StatsCard>
        </Stack>

        {/* Performance Breakdown */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Performance Breakdown
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<Share2 size={16} />}
                  size="small"
                >
                  Share Results
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Download size={16} />}
                  size="small"
                >
                  Export
                </Button>
              </Stack>
            </Stack>

            <Stack spacing={3}>
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Overall Progress
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {results.score}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={results.score}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    '& .MuiLinearProgress-bar': {
                      background: results.score >= 80 
                        ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                        : results.score >= 60
                        ? 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)'
                        : 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)',
                    },
                  }}
                />
              </Box>

              <Stack direction="row" spacing={4}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                    Correct ({results.correct})
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(results.correct / questions.length) * 100}
                    color="success"
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                    Wrong ({results.wrong})
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(results.wrong / questions.length) * 100}
                    color="error"
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                    Unattempted ({results.unattempted})
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(results.unattempted / questions.length) * 100}
                    color="warning"
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Question Review */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Question Review
              </Typography>
              <Button
                variant="outlined"
                onClick={toggleAllQuestions}
                startIcon={expandedQuestions.length === questions.length ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                size="small"
              >
                {expandedQuestions.length === questions.length ? 'Collapse All' : 'Expand All'}
              </Button>
            </Stack>

            <Stack spacing={2}>
              {questions.map((question, index) => {
                const userAnswer = userAnswers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                const isAttempted = userAnswer !== null && userAnswer !== undefined;
                
                return (
                  <QuestionCard key={index}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ cursor: 'pointer' }}
                        onClick={() => toggleQuestion(index)}
                      >
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              background: !isAttempted
                                ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                                : isCorrect
                                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                                : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                            }}
                          >
                            {index + 1}
                          </Avatar>
                          
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                              {question.question}
                            </Typography>
                            <Stack direction="row" spacing={1}>
                              <Chip
                                size="small"
                                label={!isAttempted ? 'Unattempted' : isCorrect ? 'Correct' : 'Wrong'}
                                color={!isAttempted ? 'warning' : isCorrect ? 'success' : 'error'}
                                sx={{ fontWeight: 500 }}
                              />
                            </Stack>
                          </Box>
                        </Stack>
                        
                        <IconButton size="small">
                          {expandedQuestions.includes(index) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </IconButton>
                      </Stack>

                      <Collapse in={expandedQuestions.includes(index)}>
                        <Box sx={{ mt: 3 }}>
                          <Divider sx={{ mb: 3 }} />
                          
                          {question.context && (
                            <Paper sx={{ p: 2, mb: 3, background: 'grey.50' }}>
                              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                Context: {question.context}
                              </Typography>
                            </Paper>
                          )}
                          
                          <Stack spacing={1}>
                            {question.options?.map((option, optionIndex) => {
                              const isCorrectOption = optionIndex === question.correctAnswer;
                              const isUserSelection = optionIndex === userAnswer;
                              const isWrongSelection = isUserSelection && !isCorrectOption;
                              
                              return (
                                <OptionItem
                                  key={optionIndex}
                                  isCorrect={isCorrectOption}
                                  isUserAnswer={isUserSelection}
                                  isWrong={isWrongSelection}
                                >
                                  <Stack direction="row" alignItems="center" spacing={2}>
                                    <Box
                                      sx={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        background: isCorrectOption
                                          ? 'success.main'
                                          : isWrongSelection
                                          ? 'error.main'
                                          : 'grey.300',
                                        color: isCorrectOption || isWrongSelection ? 'white' : 'text.secondary',
                                      }}
                                    >
                                      {String.fromCharCode(65 + optionIndex)}
                                    </Box>
                                    
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: isCorrectOption || isUserSelection ? 600 : 400,
                                        flex: 1,
                                      }}
                                    >
                                      {option}
                                    </Typography>
                                    
                                    {isCorrectOption && (
                                      <CheckCircle size={16} color="#10B981" />
                                    )}
                                    {isWrongSelection && (
                                      <XCircle size={16} color="#EF4444" />
                                    )}
                                  </Stack>
                                </OptionItem>
                              );
                            })}
                          </Stack>
                        </Box>
                      </Collapse>
                    </CardContent>
                  </QuestionCard>
                );
              })}
            </Stack>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            startIcon={<RotateCcw size={20} />}
            onClick={onNewQuiz}
            sx={{
              px: 4,
              py: 1.5,
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              },
            }}
          >
            Start New Quiz
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<Share2 size={20} />}
            sx={{ px: 4, py: 1.5 }}
          >
            Share Results
          </Button>
        </Stack>
      </Stack>
    </ResultsContainer>
  );
};

export default ModernResultPage;