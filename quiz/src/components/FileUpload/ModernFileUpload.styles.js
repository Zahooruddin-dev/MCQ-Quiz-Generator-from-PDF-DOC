import { Box, Card, Container } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// Enhanced animations with better performance
export const pulse = keyframes`
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.12);
  }
  50% { 
    transform: scale(1.02);
    box-shadow: 0 12px 32px rgba(59, 130, 246, 0.18);
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

export const gentleBounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-3px);
  }
  60% {
    transform: translateY(-2px);
  }
`;

export const UploadContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(6),
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',

  [theme.breakpoints.down('md')]: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(4),
  },

  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(3),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
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
    background: 'linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6)',
    borderRadius: `${theme.spacing(3)} ${theme.spacing(3)} 0 0`,
  },

  [theme.breakpoints.down('md')]: {
    borderRadius: theme.spacing(2.5),
    boxShadow: '0 15px 45px -10px rgba(0, 0, 0, 0.06), 0 6px 18px -6px rgba(0, 0, 0, 0.03)',

    '&::before': {
      borderRadius: `${theme.spacing(2.5)} ${theme.spacing(2.5)} 0 0`,
    },
  },

  [theme.breakpoints.down('sm')]: {
    borderRadius: theme.spacing(2),
    boxShadow: '0 10px 30px -8px rgba(0, 0, 0, 0.06), 0 4px 12px -4px rgba(0, 0, 0, 0.03)',
    margin: theme.spacing(0, 0.5),

    '&::before': {
      height: '3px',
      borderRadius: `${theme.spacing(2)} ${theme.spacing(2)} 0 0`,
    },
  },
}));
// Replace the DropZone styled component transitions with these gentler ones:

export const DropZone = styled(Box, {
  shouldForwardProp: (prop) => 
    prop !== 'isDragActive' && 
    prop !== 'hasFile' && 
    prop !== 'isLoading'
})(({ theme, isDragActive, hasFile, isLoading }) => ({
  border: '2px dashed',
  borderColor: isDragActive
    ? '#3b82f6'
    : hasFile
    ? '#059669'
    : '#cbd5e1',
  borderRadius: theme.spacing(2.5),
  padding: theme.spacing(6),
  textAlign: 'center',
  cursor: isLoading ? 'not-allowed' : 'pointer',
  
  // 🔧 GENTLER TRANSITION - Change this line:
  transition: 'all 0.2s ease-out', // Was: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
  
  // 🔧 SOFTER BACKGROUNDS - Change these:
  background: isDragActive
    ? 'rgba(59, 130, 246, 0.02)' // Was: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)'
    : hasFile
    ? 'rgba(5, 150, 105, 0.02)' // Was: 'linear-gradient(135deg, rgba(5, 150, 105, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)'
    : 'transparent',
    
  position: 'relative',
  overflow: 'hidden',
  minHeight: '240px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  
  // Enhanced focus styles for accessibility
  '&:focus-visible': {
    outline: '3px solid #3b82f6',
    outlineOffset: '2px',
    borderColor: '#3b82f6',
  },

  // 🔧 GENTLER HOVER EFFECT - Change this:
  '&:not([aria-disabled="true"]):hover': {
    borderColor: '#60a5fa', // Was: '#3b82f6' (softer blue)
    background: 'rgba(59, 130, 246, 0.01)', // Was: 'linear-gradient(135deg, rgba(59, 130, 246, 0.04) 0%, rgba(99, 102, 241, 0.04) 100%)'
    transform: 'translateY(-1px)', // Was: 'translateY(-2px)' (less movement)
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.06)', // Was: '0 8px 24px rgba(59, 130, 246, 0.12)' (softer shadow)
  },

  // Mobile optimizations with gentler effects
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(4),
    minHeight: '200px',
    borderRadius: theme.spacing(2),
    
    '&:hover': {
      transform: 'none', // No movement on mobile
      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.04)', // Even softer on mobile
    },
  },

  // 🔧 GENTLER TOUCH INTERACTION - Change this:
  '@media (hover: none)': {
    '&:hover': {
      transform: 'none',
      boxShadow: 'none',
    },
    
    '&:active': {
      transform: 'scale(0.99)', // Was: 'scale(0.98)' (less scaling)
      borderColor: '#60a5fa', // Softer blue
      background: 'rgba(59, 130, 246, 0.015)', // Very subtle
    },
  },

  // Disabled state
  '&[aria-disabled="true"]': {
    opacity: 0.6,
    cursor: 'not-allowed',
    backgroundColor: '#f8fafc',
    
    '&:hover': {
      transform: 'none',
      borderColor: '#cbd5e1',
      background: '#f8fafc',
      boxShadow: 'none',
    },
  },
}));
export const FileIcon = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: theme.spacing(2),
  background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
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
    border: '2px solid rgba(59, 130, 246, 0.3)',
    borderRadius: theme.spacing(2.5),
    transform: 'translate(-50%, -50%)',
    animation: `${pulse} 3s ease-in-out infinite`,
    animationDelay: '0.5s',
  },

  [theme.breakpoints.down('md')]: {
    width: 72,
    height: 72,
    marginBottom: theme.spacing(2.5),
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
  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(99, 102, 241, 0.03) 100%)',
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

  '&:hover': {
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
    transform: 'translateY(-1px)',
  },

  [theme.breakpoints.down('md')]: {
    borderRadius: theme.spacing(1.5),
    marginBottom: theme.spacing(2.5),
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

  [theme.breakpoints.down('md')]: {
    borderRadius: theme.spacing(2.5),
    backdropFilter: 'blur(10px)',
  },

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

  [theme.breakpoints.down('md')]: {
    marginTop: theme.spacing(2.5),
    borderRadius: theme.spacing(1.5),
  },

  [theme.breakpoints.down('sm')]: {
    marginTop: theme.spacing(2),
    borderRadius: theme.spacing(1.5),
    
    '&:hover': {
      transform: 'none',
    },
  },
}));

// Enhanced Progress bar component with better mobile support
export const ProgressBar = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '8px',
  backgroundColor: '#f1f5f9',
  borderRadius: '4px',
  overflow: 'hidden',
  position: 'relative',

  '& .progress-fill': {
    height: '100%',
    background: 'linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6)',
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

  [theme.breakpoints.down('md')]: {
    height: '7px',
  },

  [theme.breakpoints.down('sm')]: {
    height: '6px',
  },
}));

// Enhanced Error state styles with better accessibility
export const ErrorContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#fef2f2',
  border: '1px solid #f87171',
  borderRadius: theme.spacing(1.5),
  marginTop: theme.spacing(2),
  animation: `${fadeInUp} 0.3s cubic-bezier(0.4, 0, 0.2, 1)`,
  color: '#dc2626',

  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2.5),
    borderRadius: theme.spacing(1.25),
  },

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    fontSize: '0.875rem',
  },
}));

// Enhanced Success state styles with better accessibility
export const SuccessContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#f0fdf4',
  border: '1px solid #22c55e',
  borderRadius: theme.spacing(1.5),
  marginTop: theme.spacing(2),
  animation: `${fadeInUp} 0.3s cubic-bezier(0.4, 0, 0.2, 1)`,
  color: '#059669',

  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2.5),
    borderRadius: theme.spacing(1.25),
  },

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    fontSize: '0.875rem',
  },
}));

// New: Mobile-specific utility styles
export const MobileOptimized = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    '& .MuiButton-root': {
      minHeight: '44px', // Better touch targets
      fontSize: '0.875rem',
    },
    
    '& .MuiTextField-root': {
      '& .MuiInputBase-input': {
        fontSize: '16px', // Prevent zoom on iOS
      },
    },
    
    '& .MuiIconButton-root': {
      minWidth: '44px',
      minHeight: '44px',
    },
  },
}));

// New: Responsive typography helper
export const ResponsiveText = styled(Box)(({ theme }) => ({
  fontSize: '1rem',
  lineHeight: 1.6,
  
  [theme.breakpoints.down('md')]: {
    fontSize: '0.95rem',
    lineHeight: 1.55,
  },
  
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
}));