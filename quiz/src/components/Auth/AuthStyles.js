import { styled, keyframes } from "@mui/material/styles";
import { Box, Card, Chip, TextField, Button } from "@mui/material";

// Enhanced animations with better performance
export const float = keyframes`
  0%, 100% { 
    transform: translateY(0px) rotate(0deg); 
    opacity: 0.1;
  }
  50% { 
    transform: translateY(-10px) rotate(5deg); 
    opacity: 0.15;
  }
`;

export const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

export const pulse = keyframes`
  0%, 100% { 
    opacity: 1; 
    transform: scale(1);
  }
  50% { 
    opacity: 0.8; 
    transform: scale(1.02);
  }
`;

export const gentleGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.1);
  }
  50% { 
    box-shadow: 0 8px 40px rgba(59, 130, 246, 0.2);
  }
`;

// Enhanced Styled Components
export const AuthContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isMobile'
})(({ theme, isMobile }) => ({
  minHeight: "100vh",
  background: `linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: isMobile ? theme.spacing(2, 1) : theme.spacing(2),
  position: "relative",
  overflow: "hidden",
  
  // Enhanced background patterns
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: isMobile
      ? "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 70%)"
      : "radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)",
    pointerEvents: "none",
  },
  
  // Mobile-specific background
  [theme.breakpoints.down('sm')]: {
    background: `linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)`,
    padding: theme.spacing(1),
  },
}));

export const FloatingElement = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'delay'
})(({ delay = 0 }) => ({
  position: "absolute",
  animation: `${float} 6s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  opacity: 0.1,
  pointerEvents: "none",
  willChange: 'transform, opacity',
  
  // Reduce motion for accessibility
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
    opacity: 0.05,
  },
}));

export const AuthCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'isMobile' && prop !== 'isTablet'
})(({ theme, isMobile, isTablet }) => ({
  maxWidth: isMobile ? '100%' : isTablet ? 440 : 480,
  width: "100%",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)", // Safari support
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: isMobile ? theme.spacing(2) : theme.spacing(3),
  boxShadow: isMobile 
    ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 10px -2px rgba(0, 0, 0, 0.05)"
    : "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
  animation: `${slideInUp} 0.6s cubic-bezier(0.4, 0, 0.2, 1)`,
  position: 'relative',
  
  // Enhanced mobile styling
  [theme.breakpoints.down('sm')]: {
    margin: theme.spacing(1, 0.5),
    borderRadius: theme.spacing(2),
    background: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
  },
  
  // Tablet styling
  [theme.breakpoints.down('md')]: {
    maxWidth: 440,
    borderRadius: theme.spacing(2.5),
  },
  
  // Reduce motion for accessibility
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
}));

export const BrandSection = styled(Box)(({ theme }) => ({
  textAlign: "center",
  marginBottom: theme.spacing(4),
  
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(3),
  },
}));

export const LogoIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isMobile'
})(({ theme, isMobile }) => ({
  width: isMobile ? 56 : 64,
  height: isMobile ? 56 : 64,
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  margin: "0 auto",
  marginBottom: theme.spacing(2),
  animation: `${pulse} 3s infinite, ${gentleGlow} 4s infinite`,
  boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
  
  // Enhanced mobile styling
  [theme.breakpoints.down('sm')]: {
    width: 48,
    height: 48,
    borderRadius: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
  },
  
  // Reduce motion for accessibility
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
}));

export const FeatureChip = styled(Chip)(({ theme }) => ({
  background: `linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)`,
  border: "1px solid rgba(59, 130, 246, 0.2)",
  fontWeight: 500,
  transition: 'all 0.2s ease-in-out',
  
  "& .MuiChip-icon": {
    color: '#3b82f6',
  },
  
  "& .MuiChip-label": {
    color: '#1e293b',
    fontWeight: 600,
  },
  
  "&:hover": {
    background: `linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)`,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    transform: 'translateY(-1px)',
  },
  
  // Mobile optimization
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.7rem',
    height: 24,
    
    "&:hover": {
      transform: 'none',
    },
  },
  
  // Touch device optimization
  '@media (hover: none)': {
    "&:hover": {
      transform: 'none',
      background: `linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)`,
    },
  },
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.spacing(1.5),
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    backgroundColor: "rgba(248, 250, 252, 0.8)",
    
    "& .MuiOutlinedInput-input": {
      padding: theme.spacing(1.75, 1.5),
      // Better mobile input handling
      [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2, 1.5),
        fontSize: '16px', // Prevents zoom on iOS
      },
    },
    
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: '#3b82f6',
      borderWidth: '2px',
    },
    
    "&.Mui-focused": {
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      
      "& .MuiOutlinedInput-notchedOutline": {
        borderWidth: "2px",
        borderColor: '#3b82f6',
      },
    },
    
    "&.Mui-disabled": {
      backgroundColor: "rgba(248, 250, 252, 0.5)",
      opacity: 0.7,
    },
  },
  
  "& .MuiInputLabel-root": {
    color: '#64748b',
    fontWeight: 500,
    
    "&.Mui-focused": {
      color: '#3b82f6',
    },
  },
  
  // Enhanced mobile styling
  [theme.breakpoints.down('sm')]: {
    "& .MuiOutlinedInput-root": {
      borderRadius: theme.spacing(1.25),
    },
  },
}));

export const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)`,
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1.75, 3),
  fontWeight: 600,
  fontSize: "1rem",
  textTransform: "none",
  boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  color: "white",
  border: "none",
  position: "relative",
  overflow: "hidden",
  
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)`,
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 25px rgba(59, 130, 246, 0.4)",
    
    "&::before": {
      opacity: 1,
    },
  },
  
  "&:active": {
    transform: "translateY(0)",
    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
  },
  
  "&:disabled": {
    background: "rgba(148, 163, 184, 0.8)",
    boxShadow: "none",
    transform: "none",
    opacity: 0.7,
    
    "&::before": {
      opacity: 0,
    },
  },
  
  "& .MuiButton-endIcon": {
    transition: "transform 0.2s ease",
  },
  
  "&:hover .MuiButton-endIcon": {
    transform: "translateX(2px)",
  },
  
  // Mobile optimizations
  [theme.breakpoints.down('sm')]: {
    borderRadius: theme.spacing(1.25),
    padding: theme.spacing(2, 3),
    fontSize: "1rem",
    
    "&:hover": {
      transform: "none",
      boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
      
      "& .MuiButton-endIcon": {
        transform: "none",
      },
    },
  },
  
  // Touch device optimization
  '@media (hover: none)': {
    "&:hover": {
      transform: "none",
      boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
      
      "&::before": {
        opacity: 0,
      },
      
      "& .MuiButton-endIcon": {
        transform: "none",
      },
    },
    
    "&:active": {
      transform: "scale(0.98)",
    },
  },
}));

export const GoogleButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1.75, 3),
  fontWeight: 600,
  fontSize: "1rem",
  textTransform: "none",
  border: "2px solid #e2e8f0",
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  color: '#1e293b',
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  
  "&:hover": {
    borderColor: '#3b82f6',
    backgroundColor: "rgba(59, 130, 246, 0.04)",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)",
  },
  
  "&:active": {
    transform: "translateY(0)",
    boxShadow: "0 2px 6px rgba(59, 130, 246, 0.1)",
  },
  
  "&:disabled": {
    backgroundColor: "rgba(248, 250, 252, 0.8)",
    borderColor: '#e2e8f0',
    color: '#94a3b8',
    transform: "none",
    boxShadow: "none",
  },
  
  "& .MuiButton-startIcon": {
    marginRight: theme.spacing(1.5),
  },
  
  // Mobile optimizations
  [theme.breakpoints.down('sm')]: {
    borderRadius: theme.spacing(1.25),
    padding: theme.spacing(2, 3),
    fontSize: "1rem",
    
    "&:hover": {
      transform: "none",
      boxShadow: "none",
    },
  },
  
  // Touch device optimization
  '@media (hover: none)': {
    "&:hover": {
      transform: "none",
      boxShadow: "none",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderColor: '#e2e8f0',
    },
    
    "&:active": {
      transform: "scale(0.98)",
      backgroundColor: "rgba(59, 130, 246, 0.06)",
      borderColor: '#3b82f6',
    },
  },
}));

// New: Enhanced loading state component
export const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "inherit",
  zIndex: 10,
}));

// New: Enhanced form section styling
export const FormSection = styled(Box)(({ theme }) => ({
  '& .MuiFormControl-root': {
    marginBottom: theme.spacing(2),
  },
  
  [theme.breakpoints.down('sm')]: {
    '& .MuiFormControl-root': {
      marginBottom: theme.spacing(1.5),
    },
  },
}));

// New: Enhanced alert styling
export const StyledAlert = styled(Box)(({ theme }) => ({
  '& .MuiAlert-root': {
    borderRadius: theme.spacing(2),
    fontSize: '0.9rem',
    fontWeight: 500,
    
    '& .MuiAlert-icon': {
      fontSize: '1.25rem',
    },
    
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.875rem',
      
      '& .MuiAlert-icon': {
        fontSize: '1.125rem',
      },
    },
  },
}));

// New: Responsive typography helpers
export const ResponsiveTitle = styled(Box)(({ theme }) => ({
  fontSize: '2.125rem',
  fontWeight: 800,
  lineHeight: 1.2,
  
  [theme.breakpoints.down('md')]: {
    fontSize: '2rem',
  },
  
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.75rem',
  },
}));

export const ResponsiveSubtitle = styled(Box)(({ theme }) => ({
  fontSize: '1rem',
  lineHeight: 1.5,
  color: '#64748b',
  
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
    lineHeight: 1.4,
  },
}));