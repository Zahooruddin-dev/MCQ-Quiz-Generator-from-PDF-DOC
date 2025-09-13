import React from "react";
import { CardContent, Box, Typography } from "@mui/material";
import { StatsCard as StyledStatsCard } from "./styles";

const StatsCard = ({ icon, value, label, color }) => (
  <StyledStatsCard sx={{ flex: 1 }}>
    <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 }, textAlign: "center" }}>
      <Box
        sx={{
          width: { xs: 48, sm: 52, md: 56 },
          height: { xs: 48, sm: 52, md: 56 },
          borderRadius: "50%",
          background: `linear-gradient(135deg, var(--mui-palette-${color}-main) 0%, var(--mui-palette-${color}-dark) 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          mx: "auto",
          mb: { xs: 1.25, sm: 1.5, md: 2 },
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          color: `${color}.main`,
          mb: 0.5,
          fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
          lineHeight: 1.2,
        }}
      >
        {value}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", fontWeight: 600, fontSize: { xs: "0.85rem", md: "0.9rem" } }}
      >
        {label}
      </Typography>
    </CardContent>
  </StyledStatsCard>
);

export default StatsCard;
