import { Card } from "@mui/material";
import { styled } from "@mui/material/styles";

export const WelcomeCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: "white",
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

export const ActionCard = styled(Card)(({ theme }) => ({
  height: "100%",
  cursor: "pointer",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  border: "1px solid",
  borderColor: theme.palette.grey[200],
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
    borderColor: theme.palette.primary.main,
    "& .action-icon": {
      transform: "scale(1.1)",
      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
      color: "white",
    },
  },
}));

export const RecentActivityCard = styled(Card)(({ theme }) => ({
  transition: "all 0.2s ease",
  "&:hover": {
    boxShadow: theme.shadows[4],
  },
}));
