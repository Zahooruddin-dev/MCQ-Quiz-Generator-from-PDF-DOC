import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { Settings } from "lucide-react";
import { pulse, LoadingOverlayStyled } from "./styles";

const LoadingOverlay = ({ saveProgress }) => (
  <LoadingOverlayStyled>
    <Box
      sx={{
        width: 60,
        height: 60,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        mb: 2,
        animation: `${pulse} 1.5s infinite`,
      }}
    >
      <Settings size={24} />
    </Box>
    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
      Saving Configuration
    </Typography>
    <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
      Securing your AI settings...
    </Typography>
    <Box sx={{ width: "100%", maxWidth: 300 }}>
      <LinearProgress
        variant="determinate"
        value={saveProgress}
        sx={{
          height: 8,
          borderRadius: 4,
          "& .MuiLinearProgress-bar": {
            background: "linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)",
          },
        }}
      />
      <Typography variant="caption" sx={{ mt: 1, display: "block", textAlign: "center" }}>
        {Math.round(saveProgress)}% Complete
      </Typography>
    </Box>
  </LoadingOverlayStyled>
);

export default LoadingOverlay;
