import React from "react";
import { Box, Typography, Stack, IconButton, Chip } from "@mui/material";
import { Settings, X, Brain, Zap, Shield } from "lucide-react";
import { ConfigHeaderStyled } from "./styles";

const iconMap = { brain: <Brain size={20} />, zap: <Zap size={20} />, shield: <Shield size={20} /> };

const ConfigHeader = ({ features, onClose }) => (
  <ConfigHeaderStyled>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Stack direction="row" spacing={3} alignItems="center">
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: 2,
            background: "rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          <Settings size={28} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            AI Configuration
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Configure your AI service settings for quiz generation
          </Typography>
        </Box>
      </Stack>
      <IconButton
        onClick={onClose}
        sx={{
          color: "white",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          "&:hover": { background: "rgba(255, 255, 255, 0.2)" },
        }}
      >
        <X size={20} />
      </IconButton>
    </Stack>
    <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
      {features.map((f, i) => (
        <Chip
          key={i}
          icon={iconMap[f.icon]}
          label={f.title}
          size="small"
          sx={{
            background: "rgba(255, 255, 255, 0.2)",
            color: "white",
            fontWeight: 500,
            "& .MuiChip-icon": { color: "white" },
          }}
        />
      ))}
    </Stack>
  </ConfigHeaderStyled>
);

export default ConfigHeader;
