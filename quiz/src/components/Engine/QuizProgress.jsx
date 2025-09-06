import React from "react";
import { Stack, Typography, LinearProgress } from "@mui/material";
import { ProgressContainer } from "./QuizStyles";

const QuizProgress = ({ progressPercentage }) => (
  <ProgressContainer>
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ mb: 2 }}
    >
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        Progress
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {Math.round(progressPercentage)}% Complete
      </Typography>
    </Stack>
    <LinearProgress
      variant="determinate"
      value={progressPercentage}
      sx={{
        height: 8,
        borderRadius: 4,
        "& .MuiLinearProgress-bar": {
          background: "linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)",
        },
      }}
    />
  </ProgressContainer>
);

export default QuizProgress;
