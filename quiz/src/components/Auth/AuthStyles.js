import { styled, keyframes } from "@mui/material/styles";
import { Box, Card, Chip, TextField, Button } from "@mui/material";

// Animations
export const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

export const slideInUp = keyframes`
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
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

// Styled Components
export const AuthContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2),
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)",
    pointerEvents: "none",
  },
}));

export const FloatingElement = styled(Box)(({ delay = 0 }) => ({
  position: "absolute",
  animation: `${float} 6s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  opacity: 0.1,
  pointerEvents: "none",
}));

export const AuthCard = styled(Card)(({ theme }) => ({
  maxWidth: 480,
  width: "100%",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  animation: `${slideInUp} 0.6s ease-out`,
}));

export const BrandSection = styled(Box)(({ theme }) => ({
  textAlign: "center",
  marginBottom: theme.spacing(4),
}));

export const LogoIcon = styled(Box)(({ theme }) => ({
  width: 64,
  height: 64,
  borderRadius: theme.shape.borderRadius * 2,
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  margin: "0 auto",
  marginBottom: theme.spacing(2),
  animation: `${pulse} 2s infinite`,
}));

export const FeatureChip = styled(Chip)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
  border: "1px solid",
  borderColor: theme.palette.primary.light + "30",
  fontWeight: 500,
  "& .MuiChip-icon": {
    color: theme.palette.primary.main,
  },
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.shape.borderRadius * 1.5,
    transition: "all 0.3s ease",
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderWidth: "2px",
      borderColor: theme.palette.primary.main,
    },
  },
}));

export const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  borderRadius: theme.shape.borderRadius * 1.5,
  padding: theme.spacing(1.5, 3),
  fontWeight: 600,
  fontSize: "1rem",
  textTransform: "none",
  boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
    transform: "translateY(-2px)",
    boxShadow: "0 8px 25px rgba(99, 102, 241, 0.4)",
  },
  "&:active": {
    transform: "translateY(0)",
  },
}));

export const GoogleButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  padding: theme.spacing(1.5, 3),
  fontWeight: 600,
  fontSize: "1rem",
  textTransform: "none",
  border: "2px solid",
  borderColor: theme.palette.grey[300],
  color: theme.palette.text.primary,
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    background: `${theme.palette.primary.main}08`,
    transform: "translateY(-1px)",
  },
}));
