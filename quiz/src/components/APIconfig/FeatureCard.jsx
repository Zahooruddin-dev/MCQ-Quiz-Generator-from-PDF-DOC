import React from "react";
import { Box, Typography } from "@mui/material";
import { Brain, Zap, Shield } from "lucide-react";
import { FeatureCardStyled } from "./styles";

const iconMap = { brain: <Brain size={20} />, zap: <Zap size={20} />, shield: <Shield size={20} /> };

const FeatureCard = ({ feature }) => (
  <FeatureCardStyled sx={{ flex: 1, textAlign: "center" }}>
    <Box sx={{ color: "primary.main", mb: 1 }}>{iconMap[feature.icon]}</Box>
    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
      {feature.title}
    </Typography>
    <Typography variant="caption" sx={{ color: "text.secondary" }}>
      {feature.description}
    </Typography>
  </FeatureCardStyled>
);

export default FeatureCard;
