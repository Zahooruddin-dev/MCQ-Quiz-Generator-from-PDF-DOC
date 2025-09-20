import { Card } from "@mui/material";
import { styled } from "@mui/material/styles";

export const WelcomeCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: "white",
  position: "relative",
  overflow: "hidden",
  borderRadius: theme.spacing(2.5),
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
    borderRadius: theme.spacing(2),
    boxShadow: "0 12px 40px -8px rgba(0, 0, 0, 0.2)",
    
    "&::before": {
      width: "60%",
      background: "radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.12) 0%, transparent 70%)",
    },
    
    "&::after": {
      width: "40%",
      height: "50%",
      background: "radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 60%)",
    },
  },

  // Extra small mobile devices
  [theme.breakpoints.down('xs')]: {
    borderRadius: theme.spacing(1.5),
    boxShadow: "0 8px 24px -6px rgba(0, 0, 0, 0.15)",
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
  
  // Add subtle gradient overlay
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.9) 100%)",
    opacity: 0,
    transition: "opacity 0.3s ease",
    pointerEvents: "none",
    zIndex: 0,
  },

  "& > *": {
    position: "relative",
    zIndex: 1,
  },

  // Hover and focus states - optimized for both desktop and mobile
  "&:hover, &:focus-visible": {
    transform: "translateY(-4px)",
    boxShadow: "0 16px 32px rgba(0, 0, 0, 0.12)",
    borderColor: theme.palette.primary.main,
    
    "&::before": {
      opacity: 1,
    },
    
    "& .action-icon": {
      transform: "scale(1.05)",
    },
  },

  "&:active": {
    transform: "translateY(-1px)",
    transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
  },

  // Focus styles for accessibility
  "&:focus-visible": {
    outline: `3px solid ${theme.palette.primary.main}40`,
    outlineOffset: "2px",
  },

  // Mobile optimizations
  [theme.breakpoints.down('sm')]: {
    borderRadius: theme.spacing(1.5),
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
    },
    
    "&:active": {
      transform: "translateY(0px)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
    },
  },

  // Touch device optimizations - better mobile experience
  "@media (hover: none)": {
    "&:hover": {
      transform: "none",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
      borderColor: "#e5e7eb",
      
      "&::before": {
        opacity: 0,
      },
      
      "& .action-icon": {
        transform: "none",
      },
    },
    
    "&:active": {
      transform: "scale(0.98)",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
      borderColor: theme.palette.primary.light,
      
      "&::before": {
        opacity: 0.5,
      },
      
      "& .action-icon": {
        transform: "scale(1.02)",
      },
    },
  },

  // Reduce motion for users who prefer it
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
    
    "&:hover, &:focus-visible": {
      transform: "none",
      
      "& .action-icon": {
        transform: "none",
      },
    },
    
    "&:active": {
      transform: "none",
    },
  },
}));

export const RecentActivityCard = styled(Card)(({ theme }) => ({
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  borderRadius: theme.spacing(1.5),
  border: "1px solid #e5e7eb",
  backgroundColor: "#ffffff",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  
  "&:hover": {
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
    transform: "translateY(-2px)",
    borderColor: "#d1d5db",
  },

  // Mobile optimizations
  [theme.breakpoints.down('sm')]: {
    borderRadius: theme.spacing(1.25),
    boxShadow: "0 1px 6px rgba(0, 0, 0, 0.03)",
    
    "&:hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
    },
  },

  // Touch device optimizations
  "@media (hover: none)": {
    "&:hover": {
      transform: "none",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
      borderColor: "#e5e7eb",
    },
    
    "&:active": {
      transform: "scale(0.99)",
      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)",
      borderColor: "#d1d5db",
    },
  },

  // Reduce motion for accessibility
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
    
    "&:hover": {
      transform: "none",
    },
    
    "&:active": {
      transform: "none",
    },
  },
}));