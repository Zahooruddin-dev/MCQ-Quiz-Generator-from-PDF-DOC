import React, { useState, useMemo, useCallback } from "react";
import { Stack, Box, Typography } from "@mui/material";
import {
  QuizContainer,
  QuizCard,
} from "./QuizStyles";

import QuizHeader from "./QuizHeader";
import QuizProgress from "./QuizProgress";
import QuizContent from "./QuizContent";
import QuizNavigation from "./QuizNavigation";
import FinishDialog from "./FinishDialog";

const ModernQuizEngine = ({
  questions = [],
  onFinish,
  quizTitle = "Interactive Quiz",
  showTimer = false,
  timeLimit = null,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState(
    new Array(questions.length).fill(null)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);

  const answeredCount = useMemo(
    () => userAnswers.filter((a) => a !== null).length,
    [userAnswers]
  );
  const progressPercentage = useMemo(
    () => (answeredCount / questions.length) * 100,
    [answeredCount, questions.length]
  );
  const unansweredCount = useMemo(
    () => userAnswers.filter((a) => a === null).length,
    [userAnswers]
  );

  const handleAnswerSelect = useCallback(
    (index) => {
      setUserAnswers((prev) => {
        const newAnswers = [...prev];
        newAnswers[currentQuestion] = index;
        return newAnswers;
      });
    },
    [currentQuestion]
  );

  const goToNextQuestion = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  }, [currentQuestion, questions.length]);

  const goToPrevQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  }, [currentQuestion]);

  const handleFinishClick = useCallback(() => {
    if (unansweredCount > 0) {
      setShowFinishConfirm(true);
    } else {
      submitQuiz();
    }
  }, [unansweredCount]);

  const submitQuiz = useCallback(async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setShowFinishConfirm(false);

    try {
      const score = userAnswers.reduce(
        (total, answer, idx) =>
          total + (answer === questions[idx]?.correctAnswer ? 1 : 0),
        0
      );

      const results = {
        answers: userAnswers,
        score: (score / questions.length) * 100,
        totalQuestions: questions.length,
        answeredQuestions: questions.length - unansweredCount,
        correctAnswers: score,
        timestamp: new Date().toISOString(),
        timeSpent: timeLimit ? timeLimit - timeRemaining : null,
      };

      await onFinish?.(results);
    } catch (error) {
      console.error("Error finishing quiz:", error);
      alert("There was an error submitting your quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    userAnswers,
    questions,
    onFinish,
    isSubmitting,
    unansweredCount,
    timeLimit,
    timeRemaining,
  ]);

  const cancelFinish = useCallback(() => {
    setShowFinishConfirm(false);
  }, []);

  if (!questions.length) {
    return (
      <QuizContainer maxWidth="md">
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h4" sx={{ mb: 2, color: "text.secondary" }}>
            No questions available
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Please try uploading your content again.
          </Typography>
        </Box>
      </QuizContainer>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <QuizContainer maxWidth="md">
      <Stack spacing={4}>
        <QuizHeader
          quizTitle={quizTitle}
          currentQuestion={currentQuestion}
          totalQuestions={questions.length}
          answeredCount={answeredCount}
          showTimer={showTimer}
          timeRemaining={timeRemaining}
        />

        <QuizProgress
          progressPercentage={progressPercentage}
          answeredCount={answeredCount}
        />

        <QuizCard>
          <QuizContent
            currentQ={currentQ}
            currentQuestion={currentQuestion}
            userAnswers={userAnswers}
            handleAnswerSelect={handleAnswerSelect}
          />

          <QuizNavigation
            currentQuestion={currentQuestion}
            totalQuestions={questions.length}
            userAnswers={userAnswers}
            setCurrentQuestion={setCurrentQuestion}
            goToPrevQuestion={goToPrevQuestion}
            goToNextQuestion={goToNextQuestion}
            handleFinishClick={handleFinishClick}
            isSubmitting={isSubmitting}
          />
        </QuizCard>

        <FinishDialog
          open={showFinishConfirm}
          unansweredCount={unansweredCount}
          cancelFinish={cancelFinish}
          submitQuiz={submitQuiz}
          isSubmitting={isSubmitting}
        />
      </Stack>
    </QuizContainer>
  );
};

export default ModernQuizEngine;
