import React, {
	useState,
	useMemo,
	useCallback,
	useEffect,
	useRef,
} from 'react';
import { Stack, Box, Typography, CircularProgress, Fade } from '@mui/material';
import { QuizContainer, QuizCard } from './QuizStyles';
import QuizHeader from './QuizHeader';
import QuizProgress from './QuizProgress';
import QuizContent from './QuizContent';
import QuizNavigation from './QuizNavigation';
import FinishDialog from './FinishDialog/MainFinishDialog';
import {
	getFirestore,
	doc,
	setDoc,
	getDoc,
	updateDoc,
	collection,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import LoadingBackdrop from './LoadingBackdrop';
const db = getFirestore();

const ModernQuizEngine = ({ quizSession, onFinish, showTimer = true }) => {
	const questions = quizSession?.questions || [];
	const quizTitle = quizSession?.title || 'Interactive Quiz';
	const timeLimit = quizSession?.timeLimit;
	const topic = quizSession?.source || 'General';
	const difficulty = 'medium'; // Could be added to QuizSession later
	const [currentQuestion, setCurrentQuestion] = useState(
		quizSession?.currentQuestionIndex || 0
	);
	const [userAnswers, setUserAnswers] = useState(
		quizSession?.answers || new Array(questions.length).fill(null)
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

	// Initialize quiz with smooth entrance and start session
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsInitialized(true);
			// Start the quiz session if not already started
			if (quizSession && quizSession.status === 'not_started') {
				quizSession.start();
			}
		}, 100);
		return () => clearTimeout(timer);
	}, [quizSession]);

	// Auto-save progress periodically (now handled by QuizSession)
	useEffect(() => {
		if (autoSaveRef.current) {
			clearInterval(autoSaveRef.current);
		}

		autoSaveRef.current = setInterval(() => {
			const answeredCount = userAnswers.filter((a) => a !== null).length;
			if (answeredCount > 0 && quizSession) {
				// Quiz session automatically saves itself when updated
				quizSession.save();
			}
		}, 30000); // Save every 30 seconds

		return () => {
			if (autoSaveRef.current) {
				clearInterval(autoSaveRef.current);
			}
		};
	}, [currentQuestion, userAnswers, quizSession]);

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

	// Optimized answer selection with smooth feedback and session persistence
	const handleAnswerSelect = useCallback(
		(index) => {
			if (isTransitioning) return; // Prevent rapid clicks during transitions

			setUserAnswers((prev) => {
				const newAnswers = [...prev];
				newAnswers[currentQuestion] = index;
				return newAnswers;
			});

			// Update quiz session
			if (quizSession) {
				quizSession.answerQuestion(currentQuestion, index);
			}

			// Provide haptic feedback on mobile
			if ('vibrate' in navigator) {
				navigator.vibrate(50);
			}
		},
		[currentQuestion, isTransitioning, quizSession]
	);

	// Smooth question transitions
	const transitionToQuestion = useCallback(
		(nextQuestion) => {
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
		},
		[isTransitioning]
	);

	const goToNextQuestion = useCallback(() => {
		if (currentQuestion < questions.length - 1) {
			transitionToQuestion(currentQuestion + 1);
		}
	}, [currentQuestion, questions.length, transitionToQuestion]);

	// Clamp current question if questions array changes (e.g., regenerate)
	useEffect(() => {
		if (currentQuestion >= questions.length) {
			setCurrentQuestion(Math.max(0, questions.length - 1));
		}
	}, [questions.length]);

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

	const submitQuiz = useCallback(async () => {
		if (isSubmitting) return;

		setIsSubmitting(true);
		setSubmitStatus('processing');
		setShowFinishConfirm(false);

		try {
			// Show smooth processing transition
			await new Promise((resolve) => setTimeout(resolve, 800));

			setSubmitStatus('saving');
			await new Promise((resolve) => setTimeout(resolve, 600));

			// Complete the quiz session and get results
			let results;
			if (quizSession) {
				// Ensure all current answers are saved to the session
				userAnswers.forEach((answer, index) => {
					if (answer !== null) {
						quizSession.answerQuestion(index, answer);
					}
				});

				// Complete the quiz and get comprehensive results
				results = quizSession.complete();

				// Add additional metadata
				results.timeExpired = showTimer && timeRemaining === 0;
				results.timeRemaining = timeRemaining;
			} else {
				// Fallback for backward compatibility
				const score = userAnswers.reduce(
					(total, answer, idx) =>
						total + (answer === questions[idx]?.correctAnswer ? 1 : 0),
					0
				);

				const timeTaken = Math.floor((Date.now() - startTime) / 1000);
				const scorePercentage = Math.round((score / questions.length) * 100);

				results = {
					answers: userAnswers,
					score: scorePercentage,
					totalQuestions: questions.length,
					answeredQuestions: questions.length - unansweredCount,
					correctAnswers: score,
					timeTaken: timeTaken,
					timeExpired: showTimer && timeRemaining === 0,
					timeRemaining: timeRemaining,
				};
			}

			// Show results immediately for better UX
			setSubmitStatus('complete');
			await new Promise((resolve) => setTimeout(resolve, 400));

			// Call onFinish with results
			await onFinish?.(results);

			// Reset submit state after successful finish to avoid stuck backdrop
			setIsSubmitting(false);
			setSubmitStatus(null);
		} catch (error) {
			console.error('Error finishing quiz:', error);
			setSubmitStatus('error');

			// Show user-friendly error
			setTimeout(() => {
				alert(
					"There was an error processing your quiz. Your answers have been saved locally and we'll try again later."
				);
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
		timeRemaining,
		startTime,
		quizSession,
		showTimer,
	]);

	const cancelFinish = useCallback(() => {
		setShowFinishConfirm(false);
	}, []);

	// Timer countdown effect
	useEffect(() => {
		if (!showTimer || !timeLimit) return;
		if (timeRemaining === null) setTimeRemaining(timeLimit);

		const timerId = setInterval(() => {
			setTimeRemaining((prev) => {
				if (prev === null) return null;
				if (prev <= 1) {
					clearInterval(timerId);
					submitQuiz(); // auto-submit when time runs out
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timerId);
	}, [showTimer, timeLimit, submitQuiz]);

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
	}, [
		currentQuestion,
		goToPrevQuestion,
		goToNextQuestion,
		handleAnswerSelect,
		isSubmitting,
		showFinishConfirm,
		questions,
	]);

	// Loading state for empty questions
	if (!questions.length) {
		return (
			<QuizContainer maxWidth='md'>
				<Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
					<CircularProgress size={48} sx={{ mb: 3 }} />
					<Typography
						variant='h5'
						sx={{ mb: 2, color: 'text.secondary', fontWeight: 600 }}
					>
						Loading Quiz
					</Typography>
					<Typography
						variant='body1'
						sx={{ color: 'text.secondary', maxWidth: 400, mx: 'auto' }}
					>
						Please wait while we prepare your quiz questions...
					</Typography>
				</Box>
			</QuizContainer>
		);
	}

	const currentQ = questions[currentQuestion];

	return (
		<>
			{/* ModernQuizEngine main container with entrance animation */}
			<Fade in={isInitialized} timeout={600}>
				<QuizContainer
					maxWidth='lg'
					sx={{
						px: { xs: 2, sm: 3, md: 4 },
						pb: { xs: 4, sm: 6 },
					}}
				>
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

						{/* CRITICAL: Mobile layout fixes for the main card */}
						<QuizCard
							sx={{
								// Existing styles preserved...
								// CRITICAL: Mobile-specific layout fixes
								'@media (max-width: 600px)': {
									// Prevent layout shifts during option selection
									contain: 'layout style',
									// Ensure stable positioning between content and navigation
									'& > *:last-child': {
										marginTop: '2rem !important', // Force consistent spacing for navigation
									},
									// Prevent content reflow during interactions
									'& *': {
										backfaceVisibility: 'hidden',
										transform: 'translateZ(0)',
									},
									// Stable container height
									minHeight: 'fit-content',
								},
							}}
						>
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
			<LoadingBackdrop
				isSubmitting={isSubmitting}
				submitStatus={submitStatus}
			/>
		</>
	);
};

export default ModernQuizEngine;
