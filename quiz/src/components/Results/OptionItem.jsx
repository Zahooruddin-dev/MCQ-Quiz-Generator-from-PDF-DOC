import { Stack, Box, Typography } from '@mui/material';
import { CheckCircle, XCircle } from 'lucide-react';
import { OptionItem as StyledOptionItem } from './Styled';

const OptionItem = ({ option, optionIndex, isCorrect, isUserAnswer, isWrong }) => (
  <StyledOptionItem isCorrect={isCorrect} isUserAnswer={isUserAnswer} isWrong={isWrong}>
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box sx={{ width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, background: isCorrect ? 'success.main' : isWrong ? 'error.main' : 'grey.300', color: isCorrect || isWrong ? 'white' : 'text.secondary' }}>
        {String.fromCharCode(65 + optionIndex)}
      </Box>
      <Typography variant="body2" sx={{ fontWeight: isCorrect || isUserAnswer ? 600 : 400, flex: 1 }}>{option}</Typography>
      {isCorrect && <CheckCircle size={16} color="#10B981" />}
      {isWrong && <XCircle size={16} color="#EF4444" />}
    </Stack>
  </StyledOptionItem>
);

export default OptionItem;
