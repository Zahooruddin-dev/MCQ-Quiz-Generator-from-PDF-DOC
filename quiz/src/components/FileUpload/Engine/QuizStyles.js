import { styled, keyframes } from '@mui/material/styles';
import { Container, Card, Box, Paper, Chip } from '@mui/material';

// Enhanced Animations
export const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const pulse = keyframes`
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
  }
  50% { 
    transform: scale(1.02);
    box-shadow: 0 12px 32px rgba(59, 130, 246, 0.25);
  }
`;

export const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

// Styled Components
export const QuizContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(6),
  minHeight: '100vh',
  background: 'linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 100%)',

  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
}));

export const QuizCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.08), 0 8px 24px -8px rgba(0, 0, 0, 0.04)',
  border: '1px solid #e2e8f0',
  overflow: 'visible',
  background: '#ffffff',
  position: 'relative',
  animation: `${fadeInUp} 0.6s cubic-bezier(0.4, 0, 0.2, 1)`,

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: `${theme.spacing(3)} ${theme.spacing(3)} 0 0`,
  },

  [theme.breakpoints.down('sm')]: {
    borderRadius: theme.spacing(2),
    boxShadow: '0 10px 30px -8px rgba(0, 0, 0, 0.06), 0 4px 12px -4px rgba(0, 0, 0, 0.03)',
    
    '&::before': {
      borderRadius: `${theme.spacing(2)} ${theme.spacing(2)} 0 0`,
    },
  },
}));

export const ProgressContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  borderRadius: theme.spacing(2.5),
  padding: theme.spacing(4),
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
  position: 'relative',
  overflow: 'hidden',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
  },
}));

export const QuestionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: theme.spacing(2.5),
  border: '1px solid #f1f5f9',
  background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
  position: 'relative',

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
  },
}));

export const OptionCard = styled(Paper, {
  shouldForwardProp: (prop) =>
    prop !== 'isSelected' && prop !== 'isCorrect' && prop !== 'showResult',
})(({ theme, isSelected, isCorrect, showResult }) => ({
  padding: theme.spacing(2.5, 3),
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '2px solid',
  borderColor: isSelected ? theme.palette.primary.main : '#e2e8f0',
  borderRadius: theme.spacing(2),
  background: isSelected
    ? 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)'
    : '#ffffff',
  position: 'relative',
  overflow: 'hidden',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent)',
    transition: 'left 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  '&:hover': {
    borderColor: theme.palette.primary.main,
    transform: 'translateX(4px)',
    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15)',
    
    '&::before': {
      left: '100%',
    },
  },

  '&:active': {
    transform: 'translateX(2px) scale(0.98)',
  },

  // Mobile optimizations
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2, 2.5),
    borderRadius: theme.spacing(1.5),
    
    '&:hover': {
      transform: 'translateX(2px)',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)',
    },
  },

  // Touch device optimizations
  '@media (hover: none)': {
    '&:hover': {
      transform: 'none',
      boxShadow: 'none',
      
      '&::before': {
        left: '-100%',
      },
    },
    
    '&:active': {
      transform: 'scale(0.95)',
      borderColor: theme.palette.primary.main,
    },
  },

  // Result states for quiz review
  ...(showResult && isCorrect && {
    borderColor: theme.palette.success.main,
    background: 'linear-gradient(135deg, #d1fae5 0%, #dcfce7 100%)',
    
    '&::after': {
      content: '"✓"',
      position: 'absolute',
      top: theme.spacing(1),
      right: theme.spacing(1.5),
      color: theme.palette.success.main,
      fontWeight: 'bold',
      fontSize: '1.2rem',
    },
  }),

  ...(showResult && isSelected && !isCorrect && {
    borderColor: theme.palette.error.main,
    background: 'linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)',
    
    '&::after': {
      content: '"✗"',
      position: 'absolute',
      top: theme.spacing(1),
      right: theme.spacing(1.5),
      color: theme.palette.error.main,
      fontWeight: 'bold',
      fontSize: '1.2rem',
    },
  }),
}));

export const NavigationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.spacing(3),
  
  [theme.breakpoints.down('md')]: {
    gap: theme.spacing(2),
  },
  
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(3),
    alignItems: 'stretch',
    
    '& > *': {
      width: '100%',
      justifyContent: 'center',
    },
  },
}));

export const StatsChip = styled(Chip)(({ theme }) => ({
  background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
  border: '1px solid #c7d2fe',
  color: '#3730a3',
  fontWeight: 600,
  boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)',
  
  '& .MuiChip-icon': {
    color: theme.palette.primary.main,
  },

  [theme.breakpoints.down('sm')]: {
    fontSize: '0.8rem',
    height: 28,
  },
}));

// Progress Bar Component
export const ProgressBar = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '12px',
  backgroundColor: '#f1f5f9',
  borderRadius: '6px',
  overflow: 'hidden',
  position: 'relative',
  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',

  '& .progress-fill': {
    height: '100%',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: '6px',
    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',

    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      background: `linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.4),
        transparent
      )`,
      backgroundSize: '100px 100%',
      animation: `${shimmer} 2s infinite`,
    },
  },

  [theme.breakpoints.down('sm')]: {
    height: '8px',
    
    '& .progress-fill': {
      borderRadius: '4px',
    },
  },
}));

// Timer Component
export const TimerContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)',
  border: '1px solid #fed7aa',
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1.5, 2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  
  '&.urgent': {
    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    border: '1px solid #fca5a5',
    animation: `${pulse} 1s infinite`,
  },

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1, 1.5),
    borderRadius: theme.spacing(1),
  },
}));

// Loading States
export const LoadingCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  border: '1px solid #e2e8f0',
  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  
  '& .skeleton': {
    background: `linear-gradient(
      90deg,
      #e2e8f0 0%,
      #f1f5f9 50%,
      #e2e8f0 100%
    )`,
    backgroundSize: '200px 100%',
    animation: `${shimmer} 1.5s infinite`,
    borderRadius: theme.spacing(0.5),
  },

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
  },
}));

// Header Styles
export const QuizHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  
  '& h1': {
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 800,
    letterSpacing: '-0.025em',
  },

  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(3),
    
    '& h1': {
      fontSize: '1.75rem',
    },
  },
}));