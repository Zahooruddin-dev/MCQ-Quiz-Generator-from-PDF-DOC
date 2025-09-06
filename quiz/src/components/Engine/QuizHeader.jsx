import React from "react";
import { Stack, Typography } from "@mui/material";
import { Target, CheckCircle, Clock } from "lucide-react";
import { StatsChip } from "./QuizStyles";

const QuizHeader = ({
  quizTitle,
  currentQuestion,
  totalQuestions,
  answeredCount,
  showTimer,
  timeRemaining,
}) => {
  const formatTime = (seconds) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div style={{ textAlign: "center" }}>
      <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
        {quizTitle}
      </Typography>
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        flexWrap="wrap"
        useFlexGap
      >
        <StatsChip
          icon={<Target size={16} />}
          label={`Question ${currentQuestion + 1} of ${totalQuestions}`}
        />
        <StatsChip
          icon={<CheckCircle size={16} />}
          label={`${answeredCount} answered`}
        />
        {showTimer && timeRemaining && (
          <StatsChip
            icon={<Clock size={16} />}
            label={formatTime(timeRemaining)}
            color={timeRemaining < 300 ? "error" : "default"}
          />
        )}
      </Stack>
    </div>
  );
};

export default QuizHeader;
