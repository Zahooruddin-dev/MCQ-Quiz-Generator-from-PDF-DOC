import { styled, keyframes } from "@mui/material/styles";
import { Dialog, Box, Card } from "@mui/material";

// Animations
export const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

export const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

// Styled Components
export const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: theme.shape.borderRadius * 3,
    maxWidth: 500,
    width: "100%",
    margin: theme.spacing(2),
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },
}));

export const ProfileHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: "white",
  padding: theme.spacing(4),
  borderRadius: `${theme.shape.borderRadius * 3}px ${theme.shape.borderRadius * 3}px 0 0`,
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    right: 0,
    width: "40%",
    height: "100%",
    background:
      "radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)",
    pointerEvents: "none",
  },
}));

export const StatsCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`,
  border: "1px solid",
  borderColor: theme.palette.primary.light + "20",
  borderRadius: theme.shape.borderRadius * 2,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[4],
  },
}));

export const PremiumBadge = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
  color: "#1E293B",
  padding: theme.spacing(0.5, 1.5),
  borderRadius: theme.shape.borderRadius * 2,
  fontWeight: 700,
  fontSize: "0.75rem",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  animation: `${pulse} 2s infinite`,
}));

export const CreditsMeter = styled(Box)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.1)",
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  backdropFilter: "blur(10px)",
}));
