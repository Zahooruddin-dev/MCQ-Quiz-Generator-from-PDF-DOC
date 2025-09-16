// ProfileStats.jsx
import React from "react";
import { Box, Typography, Stack, CardContent } from "@mui/material";
import { StatsCard } from "./ProfileStyles";

const ProfileStats = ({ userStats }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Your Statistics
      </Typography>

      <Stack direction="row" spacing={2}>
        <StatsCard sx={{ flex: 1 }}>
          <CardContent sx={{ p: 2, textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, color: "primary.main" }}
            >
              {userStats.quizzesCompleted}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Quizzes Completed
            </Typography>
          </CardContent>
        </StatsCard>

        <StatsCard sx={{ flex: 1 }}>
          <CardContent sx={{ p: 2, textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, color: "success.main" }}
            >
              {Number(userStats.averageScore || 0).toFixed(1)}%
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Average Score
            </Typography>
          </CardContent>
        </StatsCard>
      </Stack>
    </Box>
  );
};

export default ProfileStats;
