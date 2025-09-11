import { Box, Card, Container } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// Enhanced animations
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

export const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const UploadContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(6),
  minHeight: '100vh',
  background: 'linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 100%)',

  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

export const MainCard = styled(Card)(({ theme }) => ({
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
    margin: theme.spacing(0, 1),

    '&::before': {
      borderRadius: `${theme.spacing(2)} ${theme.spacing(2)} 0 0`,
    },
  },
}));

export const DropZone = styled(Box, {
  shouldForwardProp: (prop) => 
    prop !== 'isDragActive' && 
    prop !== 'hasFile' && 
    prop !== 'isLoading'
})(({ theme, isDragActive, hasFile, isLoading }) => ({
  border: '2px dashed',
  borderColor: isDragActive
    ? theme.palette.primary.main
    : hasFile
    ? theme.palette.success.main
    : '#cbd5e1',
  borderRadius: theme.spacing(2.5),
  padding: theme.spacing(6),
  textAlign: 'center',
  cursor: isLoading ? 'not-allowed' : 'pointer',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  background: isDragActive
    ? `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`
    : hasFile
    ? `linear-gradient(135deg, ${theme.palette.success.main}08 0%, ${theme.palette.success.light}08 100%)`
    : 'transparent',
  position: 'relative',
  overflow: 'hidden',
  minHeight: '240px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  
  // Focus styles for accessibility
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
    borderColor: theme.palette.primary.main,
  },

  '&:not([aria-disabled="true"]):hover': {
    borderColor: theme.palette.primary.main,
    background: `linear-gradient(135deg, ${theme.palette.primary.main}06 0%, ${theme.palette.secondary.main}06 100%)`,
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.12)',
  },

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
    transition: 'left 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  '&:not([aria-disabled="true"]):hover::before': {
    left: '100%',
  },

  // Mobile optimizations
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(4),
    minHeight: '200px',
    borderRadius: theme.spacing(2),
    
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.08)',
    },
  },

  // Touch device optimizations
  '@media (hover: none)': {
    '&:hover': {
      transform: 'none',
      boxShadow: 'none',
    },
    
    '&:active': {
      transform: 'scale(0.98)',
      borderColor: theme.palette.primary.main,
    },
  },

  // Disabled state
  '&[aria-disabled="true"]': {
    opacity: 0.6,
    cursor: 'not-allowed',
    
    '&:hover': {
      transform: 'none',
      borderColor: '#cbd5e1',
      background: 'transparent',
      boxShadow: 'none',
    },
  },
}));

export const FileIcon = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  margin: '0 auto',
  marginBottom: theme.spacing(3),
  animation: `${pulse} 3s ease-in-out infinite`,
  boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15)',
  position: 'relative',

  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '120%',
    height: '120%',
    border: `2px solid ${theme.palette.primary.main}30`,
    borderRadius: theme.spacing(2.5),
    transform: 'translate(-50%, -50%)',
    animation: `${pulse} 3s ease-in-out infinite`,
    animationDelay: '0.5s',
  },

  [theme.breakpoints.down('sm')]: {
    width: 64,
    height: 64,
    marginBottom: theme.spacing(2),
  },
}));

export const ConfigPanel = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.primary.main}04 0%, ${theme.palette.secondary.main}04 100%)`,
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

  '&:hover': {
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
    transform: 'translateY(-1px)',
  },

  [theme.breakpoints.down('sm')]: {
    borderRadius: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
    
    '&:hover': {
      transform: 'none',
    },
  },
}));

export const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(255, 255, 255, 0.97)',
  backdropFilter: 'blur(12px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.spacing(2.5),
  zIndex: 10,
  animation: `${fadeInUp} 0.3s cubic-bezier(0.4, 0, 0.2, 1)`,

  [theme.breakpoints.down('sm')]: {
    borderRadius: theme.spacing(2),
    backdropFilter: 'blur(8px)',
  },
}));

export const TextModeCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(3),
  borderRadius: theme.spacing(2),
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
  background: '#ffffff',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

  '&:hover': {
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
    transform: 'translateY(-1px)',
  },

  [theme.breakpoints.down('sm')]: {
    marginTop: theme.spacing(2),
    borderRadius: theme.spacing(1.5),
    
    '&:hover': {
      transform: 'none',
    },
  },
}));

// Progress bar component
export const ProgressBar = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '8px',
  backgroundColor: '#f1f5f9',
  borderRadius: '4px',
  overflow: 'hidden',
  position: 'relative',

  '& .progress-fill': {
    height: '100%',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: '4px',
    transition: 'width 0.3s ease',
    position: 'relative',

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
        rgba(255, 255, 255, 0.6),
        transparent
      )`,
      backgroundSize: '200px 100%',
      animation: `${shimmer} 2s infinite`,
    },
  },

  [theme.breakpoints.down('sm')]: {
    height: '6px',
  },
}));

// Error state styles
export const ErrorContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: theme.spacing(1.5),
  marginTop: theme.spacing(2),
  animation: `${fadeInUp} 0.3s cubic-bezier(0.4, 0, 0.2, 1)`,

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
  },
}));

// Success state styles
export const SuccessContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: theme.spacing(1.5),
  marginTop: theme.spacing(2),
  animation: `${fadeInUp} 0.3s cubic-bezier(0.4, 0, 0.2, 1)`,

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
  },
}));