import { useState } from 'react';
import { ResultsContainer } from './Styled';
import { Stack, Box, Typography, Button } from '@mui/material';
import HeroSection from './HeroSection';
import QuestionItem from './QuestionItem';
import ActionsBar from './ActionsBar';

const ModernResultPage = ({ questions, userAnswers, onNewQuiz, fileName }) => {
  const [expandedQuestions, setExpandedQuestions] = useState([]);

  if (!questions || !userAnswers) {
    return (
      <ResultsContainer maxWidth="md">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h4" sx={{ mb: 2, color: 'text.secondary' }}>No Results Available</Typography>
          <Button variant="contained" onClick={onNewQuiz} size="large">Start New Quiz</Button>
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
    return { correct, wrong, unattempted, score: Math.round((correct / questions.length) * 100), accuracy: questions.length > 0 ? Math.round((correct / (questions.length - unattempted)) * 100) : 0 };
  };

  const results = calculateResults();

  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  return (
    <ResultsContainer maxWidth="lg">
      <Stack spacing={4}>
        <HeroSection results={results} fileName={fileName} questions={questions}/>
        <Box>
          {questions.map((q, i) => (
            <QuestionItem key={i} question={q} index={i} userAnswer={userAnswers[i]} expanded={expandedQuestions.includes(i)} toggle={() => toggleQuestion(i)} />
          ))}
        </Box>
        <ActionsBar onNewQuiz={onNewQuiz}/>
      </Stack>
    </ResultsContainer>
  );
};

export default ModernResultPage;
