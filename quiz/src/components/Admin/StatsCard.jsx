import React from "react";
import { CardContent, Box, Typography } from "@mui/material";
import { StatsCard as StyledStatsCard } from "./styles";

const StatsCard = ({ icon, value, label, color }) => (
  <StyledStatsCard sx={{ flex: 1 }}>
    <CardContent sx={{ p: 3, textAlign: "center" }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: `linear-gradient(135deg, var(--mui-palette-${color}-main) 0%, var(--mui-palette-${color}-dark) 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          mx: "auto",
          mb: 2,
        }}
      >
        {icon}
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 800, color: `${color}.main`, mb: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
        {label}
      </Typography>
    </CardContent>
  </StyledStatsCard>
);

export default StatsCard;
