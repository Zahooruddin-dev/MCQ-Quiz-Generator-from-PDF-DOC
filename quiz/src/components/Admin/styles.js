import { styled, keyframes } from "@mui/material/styles";
import { Container, Card, Chip } from "@mui/material";

// Animations
export const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const AdminContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(3),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
}));

export const HeaderCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: "white",
  borderRadius: 24,
  animation: `${slideIn} 0.6s ease forwards`,
}));

export const StatsCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  boxShadow: theme.shadows[3],
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[6],
  },
  animation: `${slideIn} 0.6s ease forwards`,
}));

export const RequestCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "none",
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    transform: "translateY(-2px)",
  },
  animation: `${slideIn} 0.6s ease forwards`,
}));

export const StatusChipStyled = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  textTransform: "uppercase",
}));
