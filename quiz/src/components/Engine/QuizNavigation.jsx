import React from "react";
import { Button, Stack, IconButton, Typography } from "@mui/material";
import { ArrowLeft, ArrowRight, Flag } from "lucide-react";
import { NavigationContainer } from "./QuizStyles";

const QuizNavigation = ({
  currentQuestion,
  totalQuestions,
  userAnswers,
  setCurrentQuestion,
  goToPrevQuestion,
  goToNextQuestion,
  handleFinishClick,
  isSubmitting,
}) => (
  <NavigationContainer>
    <Button
      variant="outlined"
      startIcon={<ArrowLeft size={16} />}
      onClick={goToPrevQuestion}
      disabled={currentQuestion === 0 || isSubmitting}
      size="large"
    >
      Previous
    </Button>

    <Stack direction="row" spacing={1} sx={{ display: { xs: "none", sm: "flex" } }}>
      {userAnswers.map((_, index) => (
        <IconButton
          key={index}
          size="small"
          onClick={() => setCurrentQuestion(index)}
          disabled={isSubmitting}
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            background:
              index === currentQuestion
                ? "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)"
                : userAnswers[index] !== null
                ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                : "transparent",
            color:
              index === currentQuestion || userAnswers[index] !== null
                ? "white"
                : "text.secondary",
            border: "1px solid",
            borderColor:
              index === currentQuestion
                ? "primary.main"
                : userAnswers[index] !== null
                ? "success.main"
                : "grey.300",
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {index + 1}
          </Typography>
        </IconButton>
      ))}
    </Stack>

    {currentQuestion === totalQuestions - 1 ? (
      <Button
        variant="contained"
        endIcon={<Flag size={16} />}
        onClick={handleFinishClick}
        disabled={isSubmitting}
        size="large"
        sx={{
          background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
        }}
      >
        {isSubmitting ? "Submitting..." : "Finish Quiz"}
      </Button>
    ) : (
      <Button
        variant="contained"
        endIcon={<ArrowRight size={16} />}
        onClick={goToNextQuestion}
        disabled={isSubmitting}
        size="large"
      >
        Next
      </Button>
    )}
  </NavigationContainer>
);

export default QuizNavigation;
