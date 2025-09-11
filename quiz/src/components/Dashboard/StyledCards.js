import { Card } from "@mui/material";
import { styled } from "@mui/material/styles";

export const WelcomeCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: "white",
  position: "relative",
  overflow: "hidden",
  borderRadius: theme.spacing(2),
  boxShadow: "0 20px 60px -12px rgba(0, 0, 0, 0.25)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    right: 0,
    width: "50%",
    height: "100%",
    background: "radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 60%)",
    pointerEvents: "none",
  },
  
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "30%",
    height: "60%",
    background: "radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)",
    pointerEvents: "none",
  },

  // Mobile optimizations
  [theme.breakpoints.down('sm')]: {
    borderRadius: theme.spacing(1.5),
    boxShadow: "0 10px 30px -8px rgba(0, 0, 0, 0.2)",
    
    "&::before": {
      width: "60%",
    },
  },
}));

export const ActionCard = styled(Card)(({ theme }) => ({
  height: "100%",
  cursor: "pointer",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  border: "1px solid #e5e7eb",
  borderRadius: theme.spacing(2),
  backgroundColor: "#ffffff",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  position: "relative",
  overflow: "hidden",

  // Hover and focus states
  "&:hover, &:focus-visible": {
    transform: "translateY(-6px)",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.12)",
    borderColor: theme.palette.primary.main,
    
    "& .action-icon": {
      transform: "scale(1.05)",
    },
  },

  "&:active": {
    transform: "translateY(-2px)",
    transition: "all 0.1s cubic-bezier(0.4, 0, 0.2, 1)",
  },

  // Focus styles for accessibility
  "&:focus-visible": {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: "2px",
  },

  // Mobile optimizations
  [theme.breakpoints.down('sm')]: {
    borderRadius: theme.spacing(1.5),
    
    "&:hover": {
      transform: "translateY(-3px)",
      boxShadow: "0 12px 24px rgba(0, 0, 0, 0.1)",
    },
    
    "&:active": {
      transform: "translateY(-1px)",
    },
  },

  // Touch device optimizations
  "@media (hover: none)": {
    "&:hover": {
      transform: "none",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    },
    
    "&:active": {
      transform: "scale(0.98)",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    },
  },
}));

export const RecentActivityCard = styled(Card)(({ theme }) => ({
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  borderRadius: theme.spacing(1.5),
  border: "1px solid #e5e7eb",
  backgroundColor: "#ffffff",
  
  "&:hover": {
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
    transform: "translateY(-2px)",
    borderColor: "#d1d5db",
  },

  // Mobile optimizations
  [theme.breakpoints.down('sm')]: {
    borderRadius: theme.spacing(1),
    
    "&:hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
    },
  },

  // Touch device optimizations
  "@media (hover: none)": {
    "&:hover": {
      transform: "none",
      boxShadow: theme.shadows[1],
    },
    
    "&:active": {
      transform: "scale(0.99)",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    },
  },
}));