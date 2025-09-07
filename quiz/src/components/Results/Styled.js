import { styled, keyframes } from '@mui/material/styles';
import { Container, Card, Box } from '@mui/material';

// Animations
export const scaleIn = keyframes`
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

export const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Styled components
export const ResultsContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

export const HeroCard = styled(Card)(({ theme }) => ({
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

export const ScoreCircle = styled(Box)(({ theme }) => ({
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
