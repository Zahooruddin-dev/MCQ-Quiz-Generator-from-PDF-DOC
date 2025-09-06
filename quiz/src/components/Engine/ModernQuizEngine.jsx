import React, { useState, useMemo, useCallback } from "react";
import { Stack, Box, Typography, CircularProgress, Backdrop } from "@mui/material";
import {
  QuizContainer,
  QuizCard,
} from "./QuizStyles";

import QuizHeader from "./QuizHeader";
import QuizProgress from "./QuizProgress";
import QuizContent from "./QuizContent";
import QuizNavigation from "./QuizNavigation";
import FinishDialog from "./FinishDialog";

// Import Firebase functions directly
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();

const ModernQuizEngine = ({
  questions = [],
  onFinish,
  quizTitle = "Interactive Quiz",
  showTimer = false,
  timeLimit = null,
  topic = "General", // Add topic prop
  difficulty = "medium", // Add difficulty prop
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState(
    new Array(questions.length).fill(null)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [startTime] = useState(Date.now()); // Track when quiz started
  const [submitStatus, setSubmitStatus] = useState(null); // 'processing', 'saving', 'complete'

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

  // Firebase save functions - now async background operations
  const saveQuizToFirestore = async (quizData) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error('No user authenticated');
        return false;
      }

      console.log('Saving quiz data to Firestore in background...');

      // Add metadata to quiz data
      const quizWithMetadata = {
        ...quizData,
        userId: user.uid,
        completedAt: new Date(),
        topic: topic,
        difficulty: difficulty,
        quizTitle: quizTitle,
      };

      // Add to quizzes collection
      const quizRef = doc(collection(db, 'quizzes'));
      await setDoc(quizRef, quizWithMetadata);

      // Update user stats
      await updateUserStats(user.uid, quizData);

      console.log('✅ Quiz results saved successfully in background');
      return true;
    } catch (error) {
      console.error('❌ Error saving quiz results in background:', error);
      return false;
    }
  };

  const updateUserStats = async (userId, quizData) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create new user stats document
        console.log('Creating new user stats document in background');
        await setDoc(userRef, {
          quizzesTaken: 1,
          totalScore: quizData.score,
          totalTime: quizData.timeTaken,
          avgScore: quizData.score,
          streak: quizData.score >= 70 ? 1 : 0,
          bestScore: quizData.score,
          lastActive: new Date(),
          topicsStudied: topic ? [topic] : [],
          completionRate: 100, // Since they completed 1 out of 1 quiz
        });
      } else {
        // Update existing user stats
        console.log('Updating existing user stats in background');
        const currentData = userSnap.data();
        const newQuizzesTaken = (currentData.quizzesTaken || 0) + 1;
        const newTotalScore = (currentData.totalScore || 0) + quizData.score;
        const newTotalTime = (currentData.totalTime || 0) + quizData.timeTaken;
        const newAvgScore = newTotalScore / newQuizzesTaken;

        // Update streak
        let newStreak = currentData.streak || 0;
        if (quizData.score >= 70) {
          newStreak += 1;
        } else {
          newStreak = 0;
        }

        // Update best score
        const newBestScore = Math.max(
          currentData.bestScore || 0,
          quizData.score
        );

        // Update topics studied
        const topicsStudied = new Set(currentData.topicsStudied || []);
        if (topic) {
          topicsStudied.add(topic);
        }

        await updateDoc(userRef, {
          quizzesTaken: newQuizzesTaken,
          totalScore: newTotalScore,
          totalTime: newTotalTime,
          avgScore: newAvgScore,
          streak: newStreak,
          bestScore: newBestScore,
          lastActive: new Date(),
          topicsStudied: Array.from(topicsStudied),
          completionRate: 100, // Simplified for now
        });
      }

      console.log('✅ User stats updated successfully in background');
    } catch (error) {
      console.error('❌ Error updating user stats in background:', error);
    }
  };

  const submitQuiz = useCallback(async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitStatus('processing');
    setShowFinishConfirm(false);

    try {
      // Calculate results immediately
      const score = userAnswers.reduce(
        (total, answer, idx) =>
          total + (answer === questions[idx]?.correctAnswer ? 1 : 0),
        0
      );

      const timeTaken = Math.floor((Date.now() - startTime) / 1000); // Time in seconds
      const scorePercentage = (score / questions.length) * 100;

      const results = {
        answers: userAnswers,
        score: scorePercentage,
        totalQuestions: questions.length,
        answeredQuestions: questions.length - unansweredCount,
        correctAnswers: score,
        timestamp: new Date().toISOString(),
        timeSpent: timeLimit ? timeLimit - timeRemaining : null,
        timeTaken: timeTaken,
        topic: topic,
        difficulty: difficulty,
        quizTitle: quizTitle,
      };

      // Show brief processing animation
      await new Promise(resolve => setTimeout(resolve, 500));

      // Show the results immediately to the user
      setSubmitStatus('saving');
      await onFinish?.(results);

      // Save to Firestore in the background (non-blocking)
      saveQuizToFirestore(results).then(success => {
        setSubmitStatus('complete');
        if (success) {
          console.log('Background save completed successfully');
        } else {
          console.warn('Background save failed, but user already saw results');
        }
      }).catch(error => {
        console.error('Background save error:', error);
        setSubmitStatus('complete');
      });

    } catch (error) {
      console.error("Error finishing quiz:", error);
      alert("There was an error processing your quiz. Please try again.");
      setSubmitStatus(null);
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
    startTime,
    topic,
    difficulty,
    quizTitle,
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
    <>
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

      {/* Loading Backdrop */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}
        open={isSubmitting}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            color="primary" 
            size={60}
            thickness={4}
            sx={{ mb: 3 }}
          />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
            {submitStatus === 'processing' && 'Processing your answers...'}
            {submitStatus === 'saving' && 'Calculating results...'}
            {submitStatus === 'complete' && 'Complete!'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, maxWidth: 300 }}>
            {submitStatus === 'processing' && 'Please wait while we review your responses'}
            {submitStatus === 'saving' && 'Almost done, preparing your score...'}
            {submitStatus === 'complete' && 'Your results are ready!'}
          </Typography>
        </Box>
      </Backdrop>
    </>
  );
};

export default ModernQuizEngine;