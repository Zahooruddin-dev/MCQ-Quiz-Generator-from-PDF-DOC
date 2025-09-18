import React, { useCallback } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Stack,
	Typography,
	IconButton,
	Box,
	Paper,
	Divider,
	Button,
	Chip,
	useTheme,
	useMediaQuery,
	Slide,
} from '@mui/material';
import { Brain, X, PlayCircle, Download } from 'lucide-react';
import DownloadQuizButton from './DownloadQuizButton/DownloadQuizButton';

// Slide transition for mobile
const SlideTransition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});

const QuizOptionsDialog = ({
	open,
	onClose,
	isMobile,
	generatedQuestions,
	onStartInteractiveQuiz,
	quizData,
}) => {
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

	const handleInteractiveQuizClick = useCallback(() => {
		onStartInteractiveQuiz();
		onClose();
	}, [onStartInteractiveQuiz, onClose]);

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			fullScreen={fullScreen}
			TransitionComponent={fullScreen ? SlideTransition : undefined}
			PaperProps={{
				sx: {
					borderRadius: fullScreen ? 0 : 3,
					boxShadow: fullScreen ? 'none' : '0 20px 40px rgba(0,0,0,0.1)',
					zIndex: 9999,
					margin: fullScreen ? 0 : 'auto',
					maxHeight: fullScreen ? '100vh' : '90vh',
					overflowY: 'auto',
					background: fullScreen
						? 'linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)'
						: '#ffffff',
				},
			}}
			sx={{
				zIndex: 9998,
				'& .MuiDialog-container': {
					padding: fullScreen ? 0 : theme.spacing(2),
					alignItems: fullScreen ? 'flex-end' : 'center',
				},
				'& .MuiBackdrop-root': {
					backgroundColor: fullScreen
						? 'rgba(0, 0, 0, 0.7)'
						: 'rgba(0, 0, 0, 0.5)',
				},
			}}
		>
			<DialogTitle
				sx={{
					pb: 1,
					pt: fullScreen ? 2 : 3,
					px: fullScreen ? 2 : 3,
					position: 'sticky',
					top: 0,
					bgcolor: 'background.paper',
					zIndex: 1,
					borderBottom: fullScreen ? '1px solid' : 'none',
					borderColor: 'divider',
				}}
			>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
					spacing={2}
				>
					<Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
						<Brain color="#6366F1" size={fullScreen ? 20 : 24} />
						<Typography
							variant={fullScreen ? 'h6' : 'h6'}
							sx={{
								fontWeight: 600,
								fontSize: fullScreen ? '1.1rem' : '1.25rem',
								lineHeight: 1.2,
							}}
						>
							Quiz Generated!
						</Typography>
					</Stack>
					<IconButton
						onClick={onClose}
						size="small"
						sx={{ color: 'text.secondary', flexShrink: 0 }}
					>
						<X size={20} />
					</IconButton>
				</Stack>
			</DialogTitle>

			<DialogContent sx={{ pb: 2, px: fullScreen ? 2 : 3, pt: 2 }}>
				<Typography
					variant="body2"
					color="text.secondary"
					sx={{
						mb: 3,
						fontSize: fullScreen ? '0.875rem' : '0.875rem',
						lineHeight: 1.5,
					}}
				>
					Your quiz has been generated with {generatedQuestions?.length || 0}{' '}
					questions! Choose how you'd like to use it:
				</Typography>

				<Stack spacing={2}>
					{/* Interactive Quiz Option */}
					<Paper
						sx={{
							p: fullScreen ? 2 : 3,
							cursor: 'pointer',
							border: '2px solid transparent',
							transition: 'all 0.2s ease',
							'&:hover': {
								borderColor: 'primary.main',
								bgcolor: 'primary.50',
								transform: fullScreen ? 'none' : 'translateY(-2px)',
								boxShadow: fullScreen
									? '0 4px 12px rgba(99, 102, 241, 0.15)'
									: '0 8px 25px rgba(99, 102, 241, 0.15)',
							},
							'&:active': {
								transform: 'scale(0.98)',
							},
						}}
						onClick={handleInteractiveQuizClick}
					>
						<Stack
							direction={fullScreen ? 'column' : 'row'}
							spacing={fullScreen ? 2 : 3}
							alignItems={fullScreen ? 'stretch' : 'center'}
						>
							<Box
								sx={{
									width: fullScreen ? '100%' : 60,
									height: 60,
									borderRadius: 2,
									background:
										'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									alignSelf: fullScreen ? 'center' : 'flex-start',
									flexShrink: 0,
									maxWidth: fullScreen ? 60 : 'none',
								}}
							>
								<PlayCircle color="white" size={fullScreen ? 24 : 28} />
							</Box>
							<Box sx={{ flex: 1, textAlign: fullScreen ? 'center' : 'left' }}>
								<Typography
									variant="h6"
									sx={{
										fontWeight: 600,
										mb: 0.5,
										fontSize: fullScreen ? '1rem' : '1.25rem',
									}}
								>
									Take Interactive Quiz
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{
										fontSize: fullScreen ? '0.8rem' : '0.875rem',
										lineHeight: 1.4,
									}}
								>
									Start the quiz now with instant feedback, timer, and detailed
									results
								</Typography>
								<Stack
									direction="row"
									spacing={1}
									sx={{
										mt: 1.5,
										justifyContent: fullScreen ? 'center' : 'flex-start',
										flexWrap: 'wrap',
									}}
								>
									<Chip
										label="AI Generated"
										size="small"
										color="primary"
										sx={{ fontSize: fullScreen ? '0.7rem' : '0.75rem' }}
									/>
									<Chip
										label="Instant Feedback"
										size="small"
										variant="outlined"
										sx={{ fontSize: fullScreen ? '0.7rem' : '0.75rem' }}
									/>
								</Stack>
							</Box>
						</Stack>
					</Paper>

					<Divider sx={{ my: 1 }}>
						<Typography variant="caption" color="text.secondary">
							OR
						</Typography>
					</Divider>

					{/* Download Quiz Option */}
					<Paper
						sx={{
							p: fullScreen ? 2 : 3,
							border: '2px solid transparent',
							transition: 'all 0.2s ease',
							position: 'relative',
							zIndex: (theme) => theme.zIndex.modal + 1,
							'&:hover': {
								borderColor: 'secondary.main',
								bgcolor: 'grey.50',
								transform: fullScreen ? 'none' : 'translateY(-2px)',
								boxShadow: fullScreen
									? '0 4px 12px rgba(0, 0, 0, 0.1)'
									: '0 8px 25px rgba(0, 0, 0, 0.1)',
							},
						}}
					>
						<Stack
							direction={fullScreen ? 'column' : 'row'}
							spacing={fullScreen ? 2 : 3}
							alignItems={fullScreen ? 'stretch' : 'center'}
						>
							<Box
								sx={{
									width: fullScreen ? '100%' : 60,
									height: 60,
									borderRadius: 2,
									background:
										'linear-gradient(135deg, #10B981 0%, #059669 100%)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									alignSelf: fullScreen ? 'center' : 'flex-start',
									flexShrink: 0,
									maxWidth: fullScreen ? 60 : 'none',
								}}
							>
								<Download color="white" size={fullScreen ? 24 : 28} />
							</Box>
							<Box sx={{ flex: 1, textAlign: fullScreen ? 'center' : 'left' }}>
								<Typography
									variant="h6"
									sx={{
										fontWeight: 600,
										mb: 0.5,
										fontSize: fullScreen ? '1rem' : '1.25rem',
									}}
								>
									Download Quiz
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{
										mb: 2,
										fontSize: fullScreen ? '0.8rem' : '0.875rem',
										lineHeight: 1.4,
									}}
								>
									Generate and download PDF or DOCX files for offline use or
									printing
								</Typography>
								<Stack
									direction="row"
									spacing={1}
									sx={{
										mb: 2,
										justifyContent: fullScreen ? 'center' : 'flex-start',
										flexWrap: 'wrap',
										gap: 1,
									}}
								>
									<Chip
										label="PDF Format"
										size="small"
										color="error"
										sx={{ fontSize: fullScreen ? '0.7rem' : '0.75rem' }}
									/>
									<Chip
										label="DOCX Format"
										size="small"
										color="info"
										sx={{ fontSize: fullScreen ? '0.7rem' : '0.75rem' }}
									/>
									<Chip
										label="Printable"
										size="small"
										variant="outlined"
										sx={{ fontSize: fullScreen ? '0.7rem' : '0.75rem' }}
									/>
								</Stack>

								<DownloadQuizButton
									quizData={quizData}
									questions={quizData.questions}
									variant="contained"
									size={fullScreen ? 'medium' : 'medium'}
									fullWidth={fullScreen}
								/>
							</Box>
						</Stack>
					</Paper>
				</Stack>
			</DialogContent>

			<DialogActions
				sx={{
					p: fullScreen ? 2 : 3,
					pt: 1,
					position: fullScreen ? 'sticky' : 'static',
					bottom: 0,
					bgcolor: 'background.paper',
					borderTop: fullScreen ? '1px solid' : 'none',
					borderColor: 'divider',
				}}
			>
				<Button
					onClick={onClose}
					color="inherit"
					sx={{
						borderRadius: 2,
						minWidth: fullScreen ? 80 : 'auto',
					}}
					fullWidth={fullScreen}
				>
					Close
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default React.memo(QuizOptionsDialog);
