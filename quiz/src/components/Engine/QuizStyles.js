// src/components/Quiz/QuizStyles.js
import { styled, keyframes } from '@mui/material/styles';
import { Container, Card, Box, Paper, Chip } from '@mui/material';

// Animations
export const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`;

// Styled Components
export const QuizContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

export const QuizCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow:
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  border: '1px solid',
  borderColor: theme.palette.grey[200],
  overflow: 'visible',
}));

export const ProgressContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  border: '1px solid',
  borderColor: theme.palette.primary.light + '20',
}));

export const QuestionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  marginBottom: theme.spacing(3),
  border: '1px solid',
  borderColor: theme.palette.grey[200],
  animation: `${slideIn} 0.5s ease-out`,
}));

export const OptionCard = styled(Paper, {
  shouldForwardProp: (prop) =>
    prop !== 'isSelected' && prop !== 'isCorrect' && prop !== 'showResult',
})(({ theme, isSelected, isCorrect, showResult }) => ({
  padding: theme.spacing(2, 3),
  marginBottom: theme.spacing(2),
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '2px solid',
  borderColor: isSelected ? theme.palette.primary.main : theme.palette.grey[200],
  borderRadius: theme.shape.borderRadius * 1.5,
  background: isSelected
    ? `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`
    : 'white',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    transform: 'translateX(4px)',
    boxShadow: theme.shadows[2],
  },
  ...(showResult &&
    isCorrect && {
      borderColor: theme.palette.success.main,
      background: `linear-gradient(135deg, ${theme.palette.success.main}08 0%, ${theme.palette.success.light}08 100%)`,
    }),
  ...(showResult &&
    isSelected &&
    !isCorrect && {
      borderColor: theme.palette.error.main,
      background: `linear-gradient(135deg, ${theme.palette.error.main}08 0%, ${theme.palette.error.light}08 100%)`,
    }),
}));

export const NavigationContainer = styled(Box)(({ theme }) => ({
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

export const StatsChip = styled(Chip)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
  border: '1px solid',
  borderColor: theme.palette.primary.light + '30',
  fontWeight: 600,
  '& .MuiChip-icon': {
    color: theme.palette.primary.main,
  },
}));
