import { CardContent, Stack, Avatar, Typography, Box, Chip, IconButton, Collapse, Divider, Paper } from '@mui/material';
import { ChevronUp, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import { QuestionCard } from './Styled';
import OptionItem from './OptionItem';

const QuestionItem = ({ question, index, userAnswer, expanded, toggle }) => {
  const isCorrect = userAnswer === question.correctAnswer;
  const isAttempted = userAnswer !== null && userAnswer !== undefined;

  return (
    <QuestionCard>
      <CardContent sx={{ p: 3 }}>
        {/* Question header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ cursor: 'pointer' }} onClick={toggle}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
            <Avatar sx={{ width: 32, height: 32, background: !isAttempted ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' : isCorrect ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', fontSize: '0.875rem', fontWeight: 600 }}>
              {index + 1}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>{question.question}</Typography>
              <Chip size="small" label={!isAttempted ? 'Unattempted' : isCorrect ? 'Correct' : 'Wrong'} color={!isAttempted ? 'warning' : isCorrect ? 'success' : 'error'} sx={{ fontWeight: 500 }}/>
            </Box>
          </Stack>
          <IconButton size="small">{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</IconButton>
        </Stack>

        {/* Expandable section */}
        <Collapse in={expanded}>
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 3 }} />
            {question.context && <Paper sx={{ p: 2, mb: 2, background: 'grey.50' }}><Typography variant="body2" sx={{ fontStyle: 'italic' }}>Context: {question.context}</Typography></Paper>}
            {question.explanation && <Paper sx={{ p: 2, mb: 2, background: 'success.light', opacity: 0.9 }}><Typography variant="body2" sx={{ fontStyle: 'italic', color: 'green' }}>💡 Explanation: {question.explanation}</Typography></Paper>}

            <Stack spacing={1}>
              {question.options?.map((option, optionIndex) => {
                const isCorrectOption = optionIndex === question.correctAnswer;
                const isUserSelection = optionIndex === userAnswer;
                const isWrongSelection = isUserSelection && !isCorrectOption;
                return (
                  <OptionItem key={optionIndex} isCorrect={isCorrectOption} isUserAnswer={isUserSelection} isWrong={isWrongSelection} option={option} optionIndex={optionIndex}/>
                );
              })}
            </Stack>
          </Box>
        </Collapse>
      </CardContent>
    </QuestionCard>
  );
};

export default QuestionItem;
