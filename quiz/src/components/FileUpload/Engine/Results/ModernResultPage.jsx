import React, { useState, useCallback } from 'react';
import {
	Box,
	Container,
	Typography,
	Button,
	Card,
	CardContent,
	Stack,
	Chip,
	LinearProgress,
	IconButton,
	Paper,
	Collapse,
	Divider,
	Avatar,
	Grid,
	useTheme,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
	Trophy,
	Target,
	CheckCircle,
	XCircle,
	Clock,
	RotateCcw,
	ChevronDown,
	ChevronUp,
	Award,
	TrendingUp,
	FileText,
	Share2,
	Download,
	ArrowRight,
} from 'lucide-react';

import ShareQuizModal from '../../../ShareQuizModal/ShareQuizModal';

// Animations
const scaleIn = keyframes`
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

// Styled Components
const ResultsContainer = styled(Container)(({ theme }) => ({
	paddingTop: theme.spacing(4),
	paddingBottom: theme.spacing(8),
	[theme.breakpoints.up('md')]: {
		paddingTop: theme.spacing(6),
		paddingBottom: theme.spacing(10),
	},
}));

const HeroCard = styled(Card)(({ theme }) => ({
	background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
	color: 'white',
	borderRadius: theme.spacing(3),
	marginBottom: theme.spacing(5),
	position: 'relative',
	overflow: 'hidden',
	boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
	[theme.breakpoints.down('sm')]: {
		borderRadius: theme.spacing(2),
		marginBottom: theme.spacing(4),
	},
	'&::before': {
		content: '""',
		position: 'absolute',
		top: 0,
		right: 0,
		width: '40%',
		height: '100%',
		background:
			'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
		pointerEvents: 'none',
	},
	'&::after': {
		content: '""',
		position: 'absolute',
		bottom: -50,
		left: -50,
		width: 150,
		height: 150,
		borderRadius: '50%',
		background: 'rgba(255, 255, 255, 0.05)',
		pointerEvents: 'none',
	},
}));

const ScoreCircle = styled(Box)(({ theme, score }) => ({
	width: 140,
	height: 140,
	borderRadius: '50%',
	background: 'rgba(255, 255, 255, 0.2)',
	backdropFilter: 'blur(10px)',
	border: '3px solid rgba(255, 255, 255, 0.4)',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	flexShrink: 0,
	animation: `${scaleIn} 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)`,
	position: 'relative',
	overflow: 'hidden',
	boxShadow: '0 4px 20px rgba(0,0,0,0.2)',

	'&::before': {
		content: '""',
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		borderRadius: '50%',
		background: `conic-gradient(${
			score >= 70
				? theme.palette.success.light
				: score >= 50
				? theme.palette.warning.light
				: theme.palette.error.light
		} ${score * 3.6}deg, rgba(255, 255, 255, 0.1) 0deg)`,
		zIndex: -1,
	},
	[theme.breakpoints.down('sm')]: {
		width: 100,
		height: 100,
	},
}));

const StyledCard = styled(Card)(({ theme }) => ({
	borderRadius: theme.spacing(2.5),
	border: `1px solid ${theme.palette.divider}`,
	boxShadow: theme.shadows[1],
	transition: 'all 0.2s ease-in-out',
	'&:hover': {
		boxShadow: theme.shadows[4],
		transform: 'translateY(-2px)',
	},
	[theme.breakpoints.down('sm')]: {
		borderRadius: theme.spacing(1.5),
	},
}));

const QuestionHeader = styled(Stack)(({ theme }) => ({
	cursor: 'pointer',
	padding: theme.spacing(2.5, 3),
	borderRadius: theme.spacing(2),
	transition: 'background-color 0.2s ease',
	'&:hover': {
		backgroundColor: theme.palette.action.hover,
	},
	[theme.breakpoints.down('sm')]: {
		padding: theme.spacing(2),
	},
}));

const OptionItem = styled(Box, {
	shouldForwardProp: (prop) =>
		prop !== 'isCorrect' && prop !== 'isUserAnswer' && prop !== 'isWrong',
})(({ theme, isCorrect, isUserAnswer, isWrong }) => ({
	padding: theme.spacing(1.5, 2),
	borderRadius: theme.spacing(1),
	marginBottom: theme.spacing(1),
	border: '1px solid',
	transition: 'all 0.2s ease-in-out',
	fontWeight: 500,
	position: 'relative',
	overflow: 'hidden',
	borderColor: theme.palette.grey[300],
	background: theme.palette.background.paper,
	color: theme.palette.text.primary,

	...(isCorrect && {
		borderColor: theme.palette.success.main,
		background: theme.palette.success.light + '1A',
		color: theme.palette.success.dark,
		'& .MuiTypography-root': {
			fontWeight: 600,
		},
	}),
	...(isWrong && {
		borderColor: theme.palette.error.main,
		background: theme.palette.error.light + '1A',
		color: theme.palette.error.dark,
		'& .MuiTypography-root': {
			fontWeight: 600,
		},
	}),
	...(isUserAnswer && {
		boxShadow: theme.shadows[2],
	}),
}));

const ExplanationPaper = styled(Paper)(({ theme, type = 'info' }) => ({
	padding: theme.spacing(2),
	borderRadius: theme.spacing(1.5),
	marginBottom: theme.spacing(2),
	fontSize: '0.9rem',
	borderLeft: `5px solid`,
	backgroundColor: theme.palette.grey[50],
	...(type === 'explanation' && {
		borderLeftColor: theme.palette.success.main,
		backgroundColor: theme.palette.success.light + '1A',
		color: theme.palette.success.dark,
	}),
}));

const ModernResultPage = ({ questions, userAnswers, onNewQuiz, onRetakeQuiz, fileName }) => {
	const [expandedQuestions, setExpandedQuestions] = useState([]);
	const [openShare, setOpenShare] = useState(false);
	const theme = useTheme();

	const calculateResults = useCallback(() => {
		if (!questions || questions.length === 0) {
			return { correct: 0, wrong: 0, unattempted: 0, score: 0, accuracy: 0 };
		}

		let correct = 0,
			wrong = 0,
			unattempted = 0;
		questions.forEach((q, i) => {
			const userAnswer = userAnswers[i];
			if (userAnswer === null || userAnswer === undefined) {
				unattempted++;
			} else if (userAnswer === q.correctAnswer) {
				correct++;
			} else {
				wrong++;
			}
		});

		const attemptedQuestions = questions.length - unattempted;
		const score = Math.round((correct / questions.length) * 100);
		const accuracy =
			attemptedQuestions > 0
				? Math.round((correct / attemptedQuestions) * 100)
				: 0;

		return {
			correct,
			wrong,
			unattempted,
			score,
			accuracy,
		};
	}, [questions, userAnswers]);

	const results = calculateResults();

	const toggleQuestion = useCallback((index) => {
		setExpandedQuestions((prev) =>
			prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
		);
	}, []);

	const toggleAllQuestions = useCallback(() => {
		if (expandedQuestions.length === questions.length) {
			setExpandedQuestions([]);
		} else {
			setExpandedQuestions(questions.map((_, i) => i));
		}
	}, [expandedQuestions.length, questions]);

	const getScoreMessage = useCallback((score) => {
		if (score >= 90) return 'Exceptional! A true master of the content!';
		if (score >= 80) return "Fantastic work! You're doing great!";
		if (score >= 70) return 'Well done! Solid understanding.';
		if (score >= 60) return 'Good effort! Keep reviewing the material.';
		return "Room for growth. Let's learn from this and improve!";
	}, []);

	if (!questions || !userAnswers || questions.length === 0) {
		return (
			<ResultsContainer maxWidth='md'>
				<Box sx={{ textAlign: 'center', py: 8 }}>
					<Typography variant='h4' sx={{ mb: 2, color: 'text.secondary' }}>
						No Results Available
					</Typography>
					<Button variant='contained' onClick={onNewQuiz} size='large'>
						Start New Quiz
					</Button>
				</Box>
			</ResultsContainer>
		);
	}

	return (
		<ResultsContainer maxWidth='lg'>
			{/* Hero Section */}
			<HeroCard>
				<CardContent>
					<Stack
						direction={{ xs: 'column', sm: 'row' }}
						alignItems='center'
						justifyContent='space-between'
						spacing={4}
					>
						<ScoreCircle score={results.score}>
							<Typography variant='h4' fontWeight='bold' color='white'>
								{results.score}%
							</Typography>
						</ScoreCircle>
						<Box textAlign={{ xs: 'center', sm: 'left' }}>
							<Typography variant='h4' fontWeight='bold' gutterBottom>
								Your Results
							</Typography>
							<Typography variant='body1' sx={{ maxWidth: 400, opacity: 0.9 }}>
								{getScoreMessage(results.score)}
							</Typography>
							{fileName && (
								<Chip
									icon={<FileText size={16} />}
									label={fileName}
									sx={{
										mt: 2,
										backgroundColor: 'rgba(255,255,255,0.2)',
										color: 'white',
									}}
								/>
							)}
						</Box>
					</Stack>
				</CardContent>
			</HeroCard>

			{/* Stats */}
			<Grid container spacing={3} sx={{ mb: 5 }}>
				{[
					{
						title: 'Correct',
						value: results.correct,
						icon: <CheckCircle color={theme.palette.success.main} />,
					},
					{
						title: 'Wrong',
						value: results.wrong,
						icon: <XCircle color={theme.palette.error.main} />,
					},
					{
						title: 'Unattempted',
						value: results.unattempted,
						icon: <Clock color={theme.palette.warning.main} />,
					},
					{
						title: 'Accuracy',
						value: `${results.accuracy}%`,
						icon: <Target color={theme.palette.info.main} />,
					},
				].map((stat, idx) => (
					<Grid item xs={12} sm={6} md={3} key={idx}>
						<StyledCard>
							<CardContent>
								<Stack direction='row' spacing={2} alignItems='center'>
									<Avatar
										sx={{
											bgcolor: 'transparent',
											border: `2px solid ${theme.palette.divider}`,
										}}
									>
										{stat.icon}
									</Avatar>
									<Box>
										<Typography variant='h6'>{stat.value}</Typography>
										<Typography
											variant='body2'
											color='text.secondary'
											sx={{ textTransform: 'uppercase', fontWeight: 500 }}
										>
											{stat.title}
										</Typography>
									</Box>
								</Stack>
							</CardContent>
						</StyledCard>
					</Grid>
				))}
			</Grid>

			{/* Question Review */}
			<Box sx={{ mb: 5 }}>
				<Stack
					direction='row'
					alignItems='center'
					justifyContent='space-between'
					sx={{ mb: 2 }}
				>
					<Typography variant='h5'>Review Questions</Typography>
					<Button onClick={toggleAllQuestions} size='small'>
						{expandedQuestions.length === questions.length
							? 'Collapse All'
							: 'Expand All'}
					</Button>
				</Stack>

				{questions.map((q, index) => {
					const userAnswer = userAnswers[index];
					const isCorrect = userAnswer === q.correctAnswer;

					return (
						<StyledCard key={index} sx={{ mb: 2 }}>
							<QuestionHeader
								direction='row'
								alignItems='center'
								justifyContent='space-between'
								onClick={() => toggleQuestion(index)}
							>
								<Stack direction='row' spacing={2} alignItems='center'>
									{isCorrect ? (
										<CheckCircle color={theme.palette.success.main} />
									) : userAnswer === null || userAnswer === undefined ? (
										<Clock color={theme.palette.warning.main} />
									) : (
										<XCircle color={theme.palette.error.main} />
									)}
									<Typography variant='subtitle1' fontWeight={600}>
										Question {index + 1}
									</Typography>
								</Stack>
								<IconButton size='small'>
									{expandedQuestions.includes(index) ? (
										<ChevronUp />
									) : (
										<ChevronDown />
									)}
								</IconButton>
							</QuestionHeader>
							<Collapse in={expandedQuestions.includes(index)}>
								<Divider />
								<CardContent>
									<Typography variant='body1' sx={{ mb: 2, fontWeight: 500 }}>
										{q.question}
									</Typography>
									{q.options.map((option, i) => {
										const isUserAnswer = userAnswer === i;
										const isCorrect = q.correctAnswer === i;
										const isWrong = isUserAnswer && !isCorrect;
										return (
											<OptionItem
												key={i}
												isCorrect={isCorrect}
												isWrong={isWrong}
												isUserAnswer={isUserAnswer}
											>
												<Typography variant='body2'>{option}</Typography>
											</OptionItem>
										);
									})}
									
									{q.explanation && (
										<ExplanationPaper type='explanation'>
											<Typography variant='subtitle2' gutterBottom>
												Explanation
											</Typography>
											<Typography variant='body2'>{q.explanation}</Typography>
										</ExplanationPaper>
									)}
								</CardContent>
							</Collapse>
						</StyledCard>
					);
				})}
			</Box>

			{/* Action Buttons */}
			<Stack direction='row' justifyContent='center' spacing={2} sx={{ mt: 4 }}>
				<Button
					variant='contained'
					startIcon={<RotateCcw />}
					onClick={() => {
						if (onRetakeQuiz) {
							onRetakeQuiz();
						} else {
							onNewQuiz();
						}
					}}
				>
					Retake Quiz
				</Button>

				<Button
					variant='outlined'
					startIcon={<ArrowRight />}
					onClick={() => {
						onNewQuiz();
					}}
				>
					New Quiz
				</Button>

				<Button
					variant='outlined'
					startIcon={<Share2 />}
					onClick={() => setOpenShare(true)}
				>
					Share
				</Button>
			</Stack>

			{/* Share Modal */}

			<ShareQuizModal
				open={openShare}
				onClose={() => setOpenShare(false)} // ✅ close handler
				quizData={{ questions, fileName }} // ✅ instead of undefined quizData
				userResults={userAnswers} // ✅ instead of undefined userResults
			/>
		</ResultsContainer>
	);
};

export default React.memo(ModernResultPage);
