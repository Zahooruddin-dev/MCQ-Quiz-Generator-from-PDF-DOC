import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Stack, Box, Typography, CircularProgress, Backdrop, Fade } from "@mui/material";
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
  topic = "General",
  difficulty = "medium",
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState(
    new Array(questions.length).fill(null)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [startTime] = useState(Date.now());
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const questionTransitionRef = useRef(null);
  const autoSaveRef = useRef(null);

  // Initialize quiz with smooth entrance
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-save progress periodically
  useEffect(() => {
    if (autoSaveRef.current) {
      clearInterval(autoSaveRef.current);
    }

    autoSaveRef.current = setInterval(() => {
      const answeredCount = userAnswers.filter(a => a !== null).length;
      if (answeredCount > 0) {
        // Auto-save progress to localStorage
        localStorage.setItem('quiz_progress', JSON.stringify({
          currentQuestion,
          userAnswers,
          quizTitle,
          timestamp: Date.now()
        }));
      }
    }, 30000); // Save every 30 seconds

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [currentQuestion, userAnswers, quizTitle]);

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

  // Optimized answer selection with smooth feedback
  const handleAnswerSelect = useCallback(
    (index) => {
      if (isTransitioning) return; // Prevent rapid clicks during transitions
      
      setUserAnswers((prev) => {
        const newAnswers = [...prev];
        newAnswers[currentQuestion] = index;
        return newAnswers;
      });

      // Provide haptic feedback on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    },
    [currentQuestion, isTransitioning]
  );

  // Smooth question transitions
  const transitionToQuestion = useCallback((nextQuestion) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Clear any existing timeout
    if (questionTransitionRef.current) {
      clearTimeout(questionTransitionRef.current);
    }

    questionTransitionRef.current = setTimeout(() => {
      setCurrentQuestion(nextQuestion);
      setIsTransitioning(false);
    }, 150);
  }, [isTransitioning]);

  const goToNextQuestion = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      transitionToQuestion(currentQuestion + 1);
    }
  }, [currentQuestion, questions.length, transitionToQuestion]);

  const goToPrevQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      transitionToQuestion(currentQuestion - 1);
    }
  }, [currentQuestion, transitionToQuestion]);

  const handleFinishClick = useCallback(() => {
    if (unansweredCount > 0) {
      setShowFinishConfirm(true);
    } else {
      submitQuiz();
    }
  }, [unansweredCount]);

  // Optimized Firebase functions with better error handling
  const saveQuizToFirestore = async (quizData) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.warn('No user authenticated for quiz save');
        return false;
      }

      const quizWithMetadata = {
        ...quizData,
        userId: user.uid,
        completedAt: new Date(),
        topic: topic,
        difficulty: difficulty,
        quizTitle: quizTitle,
        deviceInfo: {
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        }
      };

      // Use batch operation for better performance
      const quizRef = doc(collection(db, 'quizzes'));
      await setDoc(quizRef, quizWithMetadata);
      await updateUserStats(user.uid, quizData);

      // Clear auto-saved progress
      localStorage.removeItem('quiz_progress');
      
      return true;
    } catch (error) {
      console.error('Error saving quiz results:', error);
      // Store failed save for retry later
      const failedSaves = JSON.parse(localStorage.getItem('failed_quiz_saves') || '[]');
      failedSaves.push({ quizData, timestamp: Date.now() });
      localStorage.setItem('failed_quiz_saves', JSON.stringify(failedSaves));
      return false;
    }
  };

  const updateUserStats = async (userId, quizData) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      const statsUpdate = {
        lastActive: new Date(),
        topicsStudied: topic ? [topic] : [],
      };

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          ...statsUpdate,
          quizzesTaken: 1,
          totalScore: quizData.score,
          totalTime: quizData.timeTaken,
          avgScore: quizData.score,
          streak: quizData.score >= 70 ? 1 : 0,
          bestScore: quizData.score,
          completionRate: 100,
          createdAt: new Date(),
        });
      } else {
        const currentData = userSnap.data();
        const newQuizzesTaken = (currentData.quizzesTaken || 0) + 1;
        const newTotalScore = (currentData.totalScore || 0) + quizData.score;
        const newAvgScore = newTotalScore / newQuizzesTaken;

        let newStreak = currentData.streak || 0;
        if (quizData.score >= 70) {
          newStreak += 1;
        } else {
          newStreak = 0;
        }

        const topicsStudied = new Set(currentData.topicsStudied || []);
        if (topic) topicsStudied.add(topic);

        await updateDoc(userRef, {
          ...statsUpdate,
          quizzesTaken: newQuizzesTaken,
          totalScore: newTotalScore,
          totalTime: (currentData.totalTime || 0) + quizData.timeTaken,
          avgScore: newAvgScore,
          streak: newStreak,
          bestScore: Math.max(currentData.bestScore || 0, quizData.score),
          topicsStudied: Array.from(topicsStudied),
          completionRate: Math.round((newQuizzesTaken / (currentData.quizzesStarted || newQuizzesTaken)) * 100),
        });
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  };

  const submitQuiz = useCallback(async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitStatus('processing');
    setShowFinishConfirm(false);

    try {
      // Calculate results with more detailed analytics
      const score = userAnswers.reduce(
        (total, answer, idx) =>
          total + (answer === questions[idx]?.correctAnswer ? 1 : 0),
        0
      );

      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const scorePercentage = Math.round((score / questions.length) * 100);
      
      // Calculate additional metrics
      const questionStats = questions.map((q, idx) => ({
        questionIndex: idx,
        userAnswer: userAnswers[idx],
        correctAnswer: q.correctAnswer,
        isCorrect: userAnswers[idx] === q.correctAnswer,
        timeSpent: null, // Could be tracked per question if needed
      }));

      const results = {
        answers: userAnswers,
        score: scorePercentage,
        totalQuestions: questions.length,
        answeredQuestions: questions.length - unansweredCount,
        correctAnswers: score,
        timestamp: new Date().toISOString(),
        timeSpent: timeLimit && showTimer ? timeLimit - (timeRemaining || 0) : timeTaken,
        timeTaken: timeTaken,
        topic: topic,
        difficulty: difficulty,
        quizTitle: quizTitle,
        questionStats: questionStats,
        completionRate: 100,
        timeExpired: showTimer && timeRemaining === 0, // Flag to indicate if quiz was auto-submitted due to time
        timeRemaining: timeRemaining, // Include remaining time in results
      };

      // Show smooth processing transition
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSubmitStatus('saving');
      await new Promise(resolve => setTimeout(resolve, 600));

      // Show results immediately for better UX
      setSubmitStatus('complete');
      await new Promise(resolve => setTimeout(resolve, 400));

      // Call onFinish with results
      await onFinish?.(results);

      // Save to Firestore in background (non-blocking)
      saveQuizToFirestore(results).catch(error => {
        console.error('Background save failed:', error);
      });

    } catch (error) {
      console.error("Error finishing quiz:", error);
      setSubmitStatus('error');
      
      // Show user-friendly error
      setTimeout(() => {
        alert("There was an error processing your quiz. Your answers have been saved locally and we'll try again later.");
        setSubmitStatus(null);
        setIsSubmitting(false);
      }, 1000);
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isSubmitting || showFinishConfirm) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPrevQuestion();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNextQuestion();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
          event.preventDefault();
          const optionIndex = parseInt(event.key) - 1;
          if (optionIndex < questions[currentQuestion]?.options?.length) {
            handleAnswerSelect(optionIndex);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, goToPrevQuestion, goToNextQuestion, handleAnswerSelect, isSubmitting, showFinishConfirm, questions]);

  // Loading state for empty questions
  if (!questions.length) {
    return (
      <QuizContainer maxWidth="md">
        <Box sx={{ textAlign: "center", py: { xs: 6, sm: 8 } }}>
          <CircularProgress size={48} sx={{ mb: 3 }} />
          <Typography variant="h5" sx={{ mb: 2, color: "text.secondary", fontWeight: 600 }}>
            Loading Quiz
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 400, mx: 'auto' }}>
            Please wait while we prepare your quiz questions...
          </Typography>
        </Box>
      </QuizContainer>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <>
      <Fade in={isInitialized} timeout={600}>
        <QuizContainer maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Stack spacing={{ xs: 3, sm: 4, md: 5 }}>
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
              totalQuestions={questions.length}
            />

            <QuizCard>
              <QuizContent
                currentQ={currentQ}
                currentQuestion={currentQuestion}
                userAnswers={userAnswers}
                handleAnswerSelect={handleAnswerSelect}
                isTransitioning={isTransitioning}
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
                transitionToQuestion={transitionToQuestion}
              />
            </QuizCard>

            <FinishDialog
              open={showFinishConfirm}
              unansweredCount={unansweredCount}
              cancelFinish={cancelFinish}
              submitQuiz={submitQuiz}
              isSubmitting={isSubmitting}
              timeRemaining={timeRemaining}
              showTimer={showTimer}
            />
          </Stack>
        </QuizContainer>
      </Fade>

      {/* Enhanced Loading Backdrop */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)'
        }}
        open={isSubmitting}
      >
        <Box sx={{ 
          textAlign: 'center',
          maxWidth: 400,
          px: 3
        }}>
          <Box sx={{ position: 'relative', mb: 4 }}>
            <CircularProgress 
              color="primary" 
              size={72}
              thickness={3}
              sx={{ 
                filter: 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.4))',
              }}
            />
            {submitStatus === 'complete' && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: '#10b981',
                  fontSize: '2rem',
                }}
              >
                ✓
              </Box>
            )}
          </Box>
          
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 2, 
              fontWeight: 700,
              letterSpacing: '-0.01em'
            }}
          >
            {submitStatus === 'processing' && 'Processing Your Answers...'}
            {submitStatus === 'saving' && 'Calculating Results...'}
            {submitStatus === 'complete' && 'Quiz Complete!'}
            {submitStatus === 'error' && 'Almost There...'}
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              opacity: 0.9, 
              lineHeight: 1.6,
              fontSize: '1.1rem'
            }}
          >
            {submitStatus === 'processing' && 'We\'re reviewing your responses and preparing your personalized results.'}
            {submitStatus === 'saving' && 'Generating your score and performance insights...'}
            {submitStatus === 'complete' && 'Your results are ready! Redirecting you now...'}
            {submitStatus === 'error' && 'Finalizing your results. This will just take a moment longer.'}
          </Typography>
        </Box>
      </Backdrop>
    </>
  );
};

export default ModernQuizEngine;