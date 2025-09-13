import React from 'react';
import {
	Button,
	Stack,
	IconButton,
	Typography,
	Box,
	useMediaQuery,
	useTheme,
} from '@mui/material';
import { ArrowLeft, ArrowRight, Flag } from 'lucide-react';

const QuizNavigation = ({
	currentQuestion,
	totalQuestions,
	userAnswers,
	setCurrentQuestion,
	goToPrevQuestion,
	goToNextQuestion,
	handleFinishClick,
	isSubmitting,
}) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	const isLastQuestion = currentQuestion === totalQuestions - 1;

	// MOBILE: Simple bottom navigation
	if (isMobile) {
		return (
			<Box
				sx={{
					position: 'fixed',
					bottom: 0,
					left: 0,
					right: 0,
					zIndex: 1000,
					bgcolor: 'white',
					borderTop: '1px solid #e0e0e0',
					p: 2,
					boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
				}}
			>
				<Stack
					direction='row'
					justifyContent='space-between'
					alignItems='center'
				>
					{/* Previous Button */}
					<IconButton
						onClick={goToPrevQuestion}
						disabled={currentQuestion === 0 || isSubmitting}
						sx={{
							width: 48,
							height: 48,
							bgcolor: currentQuestion === 0 ? 'grey.100' : 'primary.main',
							color: currentQuestion === 0 ? 'grey.400' : 'white',
							'&:hover': {
								bgcolor: currentQuestion === 0 ? 'grey.100' : 'primary.dark',
							},
							'&:disabled': {
								bgcolor: 'grey.100',
								color: 'grey.400',
							},
						}}
					>
						<ArrowLeft size={20} />
					</IconButton>

					{/* Progress */}
					<Box sx={{ textAlign: 'center' }}>
						<Typography variant='h6' sx={{ fontWeight: 600, mb: 0.5 }}>
							{currentQuestion + 1} / {totalQuestions}
						</Typography>
						<Box
							sx={{
								width: 120,
								height: 4,
								bgcolor: 'grey.200',
								borderRadius: 2,
								overflow: 'hidden',
							}}
						>
							<Box
								sx={{
									width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
									height: '100%',
									bgcolor: 'primary.main',
									borderRadius: 2,
									transition: 'width 0.3s ease',
								}}
							/>
						</Box>
					</Box>

					{/* Next/Finish Button */}
					{isLastQuestion ? (
						<Button
							variant='contained'
							onClick={handleFinishClick}
							disabled={isSubmitting}
							startIcon={<Flag size={16} />}
							sx={{
								bgcolor: 'success.main',
								color: 'white',
								minWidth: 80,
								height: 48,
								borderRadius: 3,
								fontWeight: 600,
								'&:hover': { bgcolor: 'success.dark' },
							}}
						>
							Finish
						</Button>
					) : (
						<IconButton
							onClick={goToNextQuestion}
							disabled={isSubmitting}
							sx={{
								width: 48,
								height: 48,
								bgcolor: 'primary.main',
								color: 'white',
								'&:hover': { bgcolor: 'primary.dark' },
								'&:disabled': {
									bgcolor: 'grey.100',
									color: 'grey.400',
								},
							}}
						>
							<ArrowRight size={20} />
						</IconButton>
					)}
				</Stack>
			</Box>
		);
	}

	// DESKTOP: Full navigation with question indicators
	return (
		<Box
			sx={{
				borderTop: '1px solid #e5e7eb',
				pt: 4,
				mt: 4,
			}}
		>
			{/* Question Number Indicators */}
			<Stack direction='row' justifyContent='center' sx={{ mb: 4 }}>
				<Stack
					direction='row'
					spacing={1}
					flexWrap='wrap'
					justifyContent='center'
				>
					{userAnswers.map((_, index) => (
						<IconButton
							key={index}
							onClick={() => setCurrentQuestion(index)}
							disabled={isSubmitting}
							sx={{
								width: 32,
								height: 32,
								borderRadius: 1,
								background:
									index === currentQuestion
										? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
										: userAnswers[index] !== null
										? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
										: 'transparent',
								color:
									index === currentQuestion || userAnswers[index] !== null
										? 'white'
										: 'text.secondary',
								border: '1px solid',
								borderColor:
									index === currentQuestion
										? 'primary.main'
										: userAnswers[index] !== null
										? 'success.main'
										: 'grey.300',
								fontSize: '0.75rem',
								fontWeight: 600,
								transition: 'all 0.2s ease',
								'&:hover:not(:disabled)': {
									transform: 'translateY(-1px)',
									boxShadow: 1,
								},
							}}
						>
							{index + 1}
						</IconButton>
					))}
				</Stack>
			</Stack>

			{/* Navigation Buttons */}
			<Stack direction='row' justifyContent='space-between' alignItems='center'>
				<Button
					variant='outlined'
					startIcon={<ArrowLeft size={18} />}
					onClick={goToPrevQuestion}
					disabled={currentQuestion === 0 || isSubmitting}
					size='large'
					sx={{
						borderRadius: 2,
						px: 3,
						py: 1.5,
						fontWeight: 600,
						textTransform: 'none',
						minWidth: 120,
						margin: 5,
					}}
				>
					Previous
				</Button>

				{isLastQuestion ? (
					<Button
						variant='contained'
						endIcon={<Flag size={18} />}
						onClick={handleFinishClick}
						disabled={isSubmitting}
						size='large'
						sx={{
							background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
							borderRadius: 2,
							px: 3,
							py: 1.5,
							fontWeight: 600,
							textTransform: 'none',
							minWidth: 120,
							margin: 5,
						}}
					>
						{isSubmitting ? 'Submitting...' : 'Finish Quiz'}
					</Button>
				) : (
					<Button
						variant='contained'
						endIcon={<ArrowRight size={18} />}
						onClick={goToNextQuestion}
						disabled={isSubmitting}
						size='large'
						sx={{
							borderRadius: 2,
							px: 3,
							py: 1.5,
							fontWeight: 600,
							textTransform: 'none',
							minWidth: 120,
						}}
					>
						Next
					</Button>
				)}
			</Stack>
		</Box>
	);
};

export default QuizNavigation;
