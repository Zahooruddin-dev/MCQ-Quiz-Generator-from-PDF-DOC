import React, { useState } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	Stack,
	Paper,
	Chip,
	Divider,
	IconButton,
	Box,
} from '@mui/material';
import {
	Brain,
	X,
	PlayCircle,
	Download,
} from 'lucide-react';

const QuizGenerationDialog = ({
	open,
	onClose,
	onInteractiveQuiz,
	onDownloadQuiz,
	fileName,
	extractedText,
	isQuizGenerationDisabled,
}) => {
	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth='sm'
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: 3,
					boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
					zIndex: 9999,
				}
			}}
			sx={{
				zIndex: 9998,
			}}
		>
			<DialogTitle>
				<Stack direction='row' justifyContent='space-between' alignItems='center'>
					<Stack direction='row' spacing={2} alignItems='center'>
						<Brain color='#6366F1' size={24} />
						<Typography variant='h6' sx={{ fontWeight: 600 }}>
							Choose Quiz Type
						</Typography>
					</Stack>
					<IconButton 
						onClick={onClose} 
						size='small'
						sx={{ color: 'text.secondary' }}
					>
						<X size={20} />
					</IconButton>
				</Stack>
			</DialogTitle>

			<DialogContent sx={{ pb: 2 }}>
				<Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
					How would you like to use your quiz? Choose interactive mode to take the quiz online, or download it for offline use.
				</Typography>

				<Stack spacing={2}>
					{/* Interactive Quiz Option */}
					<Paper
						sx={{
							p: 3,
							cursor: 'pointer',
							border: '2px solid transparent',
							transition: 'all 0.2s ease',
							'&:hover': {
								borderColor: 'primary.main',
								bgcolor: 'primary.50',
								transform: 'translateY(-2px)',
								boxShadow: '0 8px 25px rgba(99, 102, 241, 0.15)',
							}
						}}
						onClick={onInteractiveQuiz}
					>
						<Stack direction='row' spacing={3} alignItems='center'>
							<Box
								sx={{
									width: 60,
									height: 60,
									borderRadius: 2,
									background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<PlayCircle color='white' size={28} />
							</Box>
							<Box sx={{ flex: 1 }}>
								<Typography variant='h6' sx={{ fontWeight: 600, mb: 0.5 }}>
									Interactive Quiz
								</Typography>
								<Typography variant='body2' color='text.secondary'>
									Take the quiz online with instant feedback, timer, and detailed results
								</Typography>
								<Stack direction='row' spacing={1} sx={{ mt: 1 }}>
									<Chip label='AI Generated' size='small' color='primary' />
									<Chip label='Instant Feedback' size='small' variant='outlined' />
								</Stack>
							</Box>
						</Stack>
					</Paper>

					<Divider sx={{ my: 1 }}>
						<Typography variant='caption' color='text.secondary'>
							OR
						</Typography>
					</Divider>

					{/* Download Quiz Option */}
					<Paper
						sx={{
							p: 3,
							border: '2px solid transparent',
							transition: 'all 0.2s ease',
							'&:hover': {
								borderColor: 'secondary.main',
								bgcolor: 'grey.50',
								transform: 'translateY(-2px)',
								boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
							}
						}}
					>
						<Stack direction='row' spacing={3} alignItems='center'>
							<Box
								sx={{
									width: 60,
									height: 60,
									borderRadius: 2,
									background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<Download color='white' size={28} />
							</Box>
							<Box sx={{ flex: 1 }}>
								<Typography variant='h6' sx={{ fontWeight: 600, mb: 0.5 }}>
									Download Quiz
								</Typography>
								<Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
									Generate and download PDF or DOCX files for offline use or printing
								</Typography>
								<Stack direction='row' spacing={1} sx={{ mb: 2 }}>
									<Chip label='AI Generated' size='small' color='primary' />
									<Chip label='PDF Format' size='small' color='error' />
									<Chip label='DOCX Format' size='small' color='info' />
									<Chip label='Printable' size='small' variant='outlined' />
								</Stack>
								
								{/* Download Format Buttons */}
								<Stack direction='row' spacing={2}>
									<Button
										variant='contained'
										size='medium'
										onClick={() => onDownloadQuiz('pdf')}
										disabled={isQuizGenerationDisabled}
										sx={{
											background: 'linear-gradient(45deg, #DC2626 30%, #EF4444 90%)',
											color: 'white',
											'&:hover': {
												background: 'linear-gradient(45deg, #B91C1C 30%, #DC2626 90%)',
											}
										}}
									>
										Download PDF
									</Button>
									<Button
										variant='contained'
										size='medium'
										onClick={() => onDownloadQuiz('docx')}
										disabled={isQuizGenerationDisabled}
										sx={{
											background: 'linear-gradient(45deg, #2563EB 30%, #3B82F6 90%)',
											color: 'white',
											'&:hover': {
												background: 'linear-gradient(45deg, #1D4ED8 30%, #2563EB 90%)',
											}
										}}
									>
										Download DOCX
									</Button>
								</Stack>
							</Box>
						</Stack>
					</Paper>
				</Stack>
			</DialogContent>

			<DialogActions sx={{ p: 3, pt: 0 }}>
				<Button 
					onClick={onClose} 
					color='inherit'
					sx={{ borderRadius: 2 }}
				>
					Cancel
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default QuizGenerationDialog;