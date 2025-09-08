import { styled, keyframes } from "@mui/material/styles";
import { Box, Card, Chip, Container } from "@mui/material";

// Animations
export const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

export const UploadContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

export const MainCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
  border: "1px solid",
  borderColor: theme.palette.grey[200],
  overflow: "visible",
}));

export const DropZone = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isDragActive" && prop !== "hasFile",
})(({ theme, isDragActive, hasFile }) => ({
  border: "2px dashed",
  borderColor: isDragActive
    ? theme.palette.primary.main
    : hasFile
    ? theme.palette.success.main
    : theme.palette.grey[300],
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(6),
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.3s",
}));

export const FileIcon = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: theme.shape.borderRadius * 2,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  margin: "0 auto",
  marginBottom: theme.spacing(2),
  animation: `${pulse} 2s infinite`,
}));

export const ConfigPanel = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
}));

export const FeatureChip = styled(Chip)(({ theme }) => ({
  fontWeight: 500,
  "& .MuiChip-icon": { color: theme.palette.primary.main },
}));

export const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(255,255,255,0.95)",
  backdropFilter: "blur(8px)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: theme.shape.borderRadius * 2,
  zIndex: 10,
}));
