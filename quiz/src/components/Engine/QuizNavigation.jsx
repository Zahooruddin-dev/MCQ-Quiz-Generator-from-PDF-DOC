import React from 'react';
import {
	Button,
	Stack,
	IconButton,
	Typography,
	Box,
	Tooltip,
	useMediaQuery,
	useTheme,
	Paper,
	Fab,
} from '@mui/material';
import { ArrowLeft, ArrowRight, Flag, Grid3X3 } from 'lucide-react';

const QuizNavigation = ({
	currentQuestion,
	totalQuestions,
	userAnswers,
	setCurrentQuestion,
	goToPrevQuestion,
	goToNextQuestion,
	handleFinishClick,
	isSubmitting,
	transitionToQuestion,
}) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const isTablet = useMediaQuery(theme.breakpoints.down('md'));

	const isLastQuestion = currentQuestion === totalQuestions - 1;
	const answeredCount = userAnswers.filter((answer) => answer !== null).length;

	// State for mobile question grid visibility
	const [showMobileGrid, setShowMobileGrid] = React.useState(false);

	// MOBILE: In-flow navigation that doesn't overlap content
	if (isMobile) {
		return (
			<>
				{/* Mobile Question Grid Overlay */}
				{showMobileGrid && (
					<Box
						sx={{
							position: 'fixed',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							bgcolor: 'rgba(0, 0, 0, 0.7)',
							zIndex: 1300,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							p: 3,
						}}
						onClick={() => setShowMobileGrid(false)}
					>
						<Paper
							sx={{
								p: 4,
								borderRadius: 3,
								maxWidth: '90vw',
								maxHeight: '70vh',
								overflow: 'auto',
							}}
							onClick={(e) => e.stopPropagation()}
						>
							<Typography variant='h6' sx={{ mb: 3, textAlign: 'center' }}>
								Jump to Question
							</Typography>

							<Box
								sx={{
									display: 'grid',
									gridTemplateColumns: 'repeat(auto-fit, minmax(50px, 1fr))',
									gap: 2,
									mb: 3,
								}}
							>
								{userAnswers.map((_, index) => (
									<Button
										key={index}
										variant={
											index === currentQuestion ? 'contained' : 'outlined'
										}
										onClick={() => {
											transitionToQuestion(index);
											setShowMobileGrid(false);
										}}
										sx={{
											minWidth: 50,
											height: 50,
											borderRadius: 2,
											fontSize: '0.9rem',
											fontWeight: 600,
											bgcolor:
												index === currentQuestion
													? 'primary.main'
													: userAnswers[index] !== null
													? 'success.light'
													: 'transparent',
											color:
												index === currentQuestion
													? 'white'
													: userAnswers[index] !== null
													? 'success.dark'
													: 'text.primary',
											borderColor:
												index === currentQuestion
													? 'primary.main'
													: userAnswers[index] !== null
													? 'success.main'
													: 'grey.300',
										}}
									>
										{index + 1}
									</Button>
								))}
							</Box>

							<Button
								fullWidth
								variant='outlined'
								onClick={() => setShowMobileGrid(false)}
								sx={{ mt: 2 }}
							>
								Close
							</Button>
						</Paper>
					</Box>
				)}

				{/* Floating Grid Button */}
				<Fab
					color='primary'
					size='medium'
					onClick={() => setShowMobileGrid(true)}
					sx={{
						position: 'fixed',
						top: 20,
						right: 20,
						zIndex: 1000,
						boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
					}}
				>
					<Grid3X3 size={20} />
				</Fab>

				{/* Mobile In-Flow Navigation - Part of document flow */}
				<Box
					sx={{
						mt: 4,
						mb: 2,
						mx: 2,
						bgcolor: 'white',
						borderRadius: 3,
						border: '1px solid #e0e0e0',
						boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
						overflow: 'hidden',
					}}
				>
			

					{/* Navigation Controls */}
					<Box sx={{ p: 3 }}>
						{/* Question Info */}
					
						{/* Navigation Buttons */}
						<Stack direction='row' spacing={2}>
							<Button
								variant='outlined'
								onClick={goToPrevQuestion}
								disabled={currentQuestion === 0 || isSubmitting}
								startIcon={<ArrowLeft size={16} />}
								sx={{
									flex: 1,
									py: 1.5,
									borderRadius: 2,
									fontWeight: 600,
									'&:disabled': { opacity: 0.4 },
								}}
							>
								Previous
							</Button>

							{isLastQuestion ? (
								<Button
									variant='contained'
									onClick={handleFinishClick}
									disabled={isSubmitting}
									endIcon={<Flag size={16} />}
									sx={{
										flex: 1,
										py: 1.5,
										bgcolor: 'success.main',
										borderRadius: 2,
										fontWeight: 700,
										'&:hover': { bgcolor: 'success.dark' },
									}}
								>
									{isSubmitting ? 'Submitting...' : 'Finish Quiz'}
								</Button>
							) : (
								<Button
									variant='contained'
									onClick={goToNextQuestion}
									disabled={isSubmitting}
									endIcon={<ArrowRight size={16} />}
									sx={{
										flex: 1,
										py: 1.5,
										borderRadius: 2,
										fontWeight: 600,
										'&:disabled': { opacity: 0.4 },
									}}
								>
									Next
								</Button>
							)}
						</Stack>
					</Box>
				</Box>
			</>
		);
	}

	// DESKTOP/TABLET: Enhanced navigation
	return (
		<Box
			sx={{
				borderTop: '1px solid #e5e7eb',
				pt: 4,
				mt: 4,
			}}
		>
			{/* Desktop Question Indicators - Improved Layout */}
			<Box sx={{ mb: 4, textAlign: 'center' }}>
				{/* Question Grid */}
				<Box
					sx={{
						display: 'flex',
						flexWrap: 'wrap',
						justifyContent: 'center',
						gap: 1,
						mb: 3,
						maxWidth: '100%',
					}}
				>
					{userAnswers.map((_, index) => {
						const isVisible =
							totalQuestions <= 15 || // Show all if 15 or fewer
							Math.abs(index - currentQuestion) <= 3 || // Show 3 on each side of current
							index === 0 || // Always show first
							index === totalQuestions - 1; // Always show last

						if (
							!isVisible &&
							index !== currentQuestion - 4 &&
							index !== currentQuestion + 4
						) {
							return null;
						}

						if (!isVisible) {
							return (
								<Typography key={index} sx={{ mx: 1, color: 'text.secondary' }}>
									...
								</Typography>
							);
						}

						return (
							<Tooltip
								key={index}
								title={`Question ${index + 1}${
									userAnswers[index] !== null ? ' - Answered' : ''
								}`}
								arrow
							>
								<IconButton
									size='small'
									onClick={() => transitionToQuestion(index)}
									disabled={isSubmitting}
									sx={{
										width: 40,
										height: 40,
										borderRadius: 2,
										bgcolor:
											index === currentQuestion
												? 'primary.main'
												: userAnswers[index] !== null
												? 'success.main'
												: 'transparent',
										color:
											index === currentQuestion || userAnswers[index] !== null
												? 'white'
												: 'text.primary',
										border: '2px solid',
										borderColor:
											index === currentQuestion
												? 'primary.main'
												: userAnswers[index] !== null
												? 'success.main'
												: 'grey.300',
										fontSize: '0.875rem',
										fontWeight: 600,
										transition: 'all 0.2s ease',
										'&:hover:not(:disabled)': {
											transform: 'translateY(-2px)',
											boxShadow: 2,
										},
									}}
								>
									{index + 1}
								</IconButton>
							</Tooltip>
						);
					})}
				</Box>

				{/* Progress Summary */}
				<Stack
					direction='row'
					spacing={3}
					justifyContent='center'
					alignItems='center'
				>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<Box
							sx={{
								width: 12,
								height: 12,
								borderRadius: '50%',
								bgcolor: 'success.main',
							}}
						/>
						<Typography variant='body2' color='text.secondary'>
							{answeredCount} Answered
						</Typography>
					</Box>

					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<Box
							sx={{
								width: 12,
								height: 12,
								borderRadius: '50%',
								bgcolor: 'grey.300',
							}}
						/>
						<Typography variant='body2' color='text.secondary'>
							{totalQuestions - answeredCount} Remaining
						</Typography>
					</Box>
				</Stack>
			</Box>

			{/* Desktop Navigation Buttons */}
			<Stack
				direction='row'
				justifyContent='space-between'
				alignItems='center'
				sx={{ gap: 3 }}
			>
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
						margin: 4,

						textTransform: 'none',
						minWidth: 120,
						transition: 'all 0.2s ease',
						'&:hover:not(:disabled)': {
							transform: 'translateY(-1px)',
							boxShadow: 2,
						},
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
							bgcolor: 'success.main',
							borderRadius: 2,
							px: 3,
							py: 1.5,
							fontWeight: 600,
							textTransform: 'none',
							minWidth: 120,
							transition: 'all 0.2s ease',
							'&:hover': {
								bgcolor: 'success.dark',
								transform: 'translateY(-1px)',
								boxShadow: 3,
							},
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
							margin: 4,

							transition: 'all 0.2s ease',
							'&:hover:not(:disabled)': {
								transform: 'translateY(-1px)',
								boxShadow: 3,
							},
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
