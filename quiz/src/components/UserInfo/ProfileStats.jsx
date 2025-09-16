import React from "react";
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
} from "@mui/material";

const ProfileStats = ({ userStats }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Your Statistics
      </Typography>

      <Stack direction="row" spacing={2}>
        <Card 
          sx={{ 
            flex: 1,
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            border: "1px solid rgba(0,0,0,0.08)"
          }}
        >
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
        </Card>

        <Card 
          sx={{ 
            flex: 1,
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            border: "1px solid rgba(0,0,0,0.08)"
          }}
        >
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
        </Card>
      </Stack>
    </Box>
  );
};

export default ProfileStats;