// src/components/FileDropZone.jsx
import React, { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Button,
	Stack,
	Chip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	IconButton,
	Paper,
	Divider,
} from '@mui/material';
import {
	Brain,
	X,
	PlayCircle,
	Download,
} from 'lucide-react';
import { FileIcon, LoadingOverlay, pulse } from '../../ModernFileUpload.styles';
import { formatBytes, MAX_FILE_SIZE } from '../../utils';
import DownloadQuizButton from './DownloadQuizButton/DownloadQuizButton';
import { getStageIcon, getStageColor } from './getStage';
import { createHandlers } from './handlers';
import DropZoneContent from './DropZoneContent';
import { getFileIcon } from './getFileIcon';

const FileDropZone = ({
	dragOver,
	fileName,
	fileSize,
	fileType,
	useAI,
	effectiveLoading,
	uploadProgress,
	loadingStage,
	stageMessage,
	processingDetails,
	fileInputRef,
	onDrop,
	onDragOver,
	onDragLeave,
	onFileSelect,
	onClear,
	onGenerateQuiz,
	error,
	setError,
	fileReadStatus = 'none',
	extractedText = '',
	// NEW: Props for the new flow
	generatedQuestions = null,
	showQuizOptionsDialog = false,
	onCloseQuizOptions,
	onStartInteractiveQuiz,
}) => {
	// Remove local showQuizOptions state since it's now controlled from parent
	// const [showQuizOptions, setShowQuizOptions] = useState(false);

	const {
		handleCloseError,
		handleDropZoneClick,
		handleFileInputChange,
		handleDrop,
		handleDragOver,
		handleDragLeave,
		handleKeyDown,
		handleGenerateQuizClick,
		handleInteractiveQuiz,
	} = createHandlers({
		fileName,
		effectiveLoading,
		fileInputRef,
		onFileSelect,
		onDrop,
		onDragOver,
		onDragLeave,
		setError,
		setShowQuizOptions: null, // No longer needed
		onGenerateQuiz,
		// NEW: Pass the interactive quiz handler
		onStartInteractiveQuiz,
	});

	const StageIcon = getStageIcon(loadingStage);
	const stageColor = getStageColor(loadingStage);

	const safeDetails = processingDetails || {
		textExtracted: 0,
		ocrConfidence: null,
		questionsGenerated: 0,
	};

	// Create quiz data based on generated questions or mock data
	const quizData = generatedQuestions ? {
		title: fileName ? fileName.replace(/\.[^/.]+$/, '') : 'Quiz',
		totalQuestions: generatedQuestions.length,
		difficulty: 'Medium',
		extractedText: extractedText,
		questions: generatedQuestions,
	} : {
		title: fileName ? fileName.replace(/\.[^/.]+$/, '') : 'Quiz',
		totalQuestions: Math.min(
			Math.max(Math.floor(extractedText.length / 200), 5),
			20
		),
		difficulty: 'Medium',
		extractedText: extractedText,
		questions: generateMockQuestions(extractedText),
	};

	// Generate mock questions based on extracted text (fallback)
	function generateMockQuestions(text) {
		if (!text || text.length < 100) {
			return [];
		}

		const sentences = text
			.split(/[.!?]+/)
			.filter((s) => s.trim().length > 20)
			.slice(0, 10);

		return sentences.map((sentence, index) => ({
			id: index + 1,
			question: `Based on the content: ${sentence.trim().substring(0, 80)}...?`,
			options: [
				'Option A (Mock)',
				'Option B (Mock)',
				'Option C (Mock)',
				'Option D (Mock)',
			],
			correctAnswer: 0,
			explanation:
				'This is a mock question generated from your document content.',
			type: 'multiple-choice',
		}));
	}

	const isQuizGenerationDisabled =
		effectiveLoading ||
		fileReadStatus === 'reading' ||
		fileReadStatus === 'error' ||
		!extractedText;

	return (
		<>
			<DropZoneContent
				dragOver={dragOver}
				fileName={fileName}
				fileSize={fileSize}
				fileType={fileType}
				fileReadStatus={fileReadStatus}
				error={error}
				effectiveLoading={effectiveLoading}
				uploadProgress={uploadProgress}
				loadingStage={loadingStage}
				stageColor={stageColor}
				stageMessage={stageMessage}
				safeDetails={safeDetails}
				fileInputRef={fileInputRef}
				onClear={onClear}
				handleDrop={handleDrop}
				handleDragOver={handleDragOver}
				handleDragLeave={handleDragLeave}
				handleDropZoneClick={handleDropZoneClick}
				handleKeyDown={handleKeyDown}
				handleFileInputChange={handleFileInputChange}
				handleCloseError={handleCloseError}
				handleGenerateQuizClick={handleGenerateQuizClick}
				useAI={useAI}
				isQuizGenerationDisabled={isQuizGenerationDisabled}
				pulse={pulse}
				StageIcon={StageIcon}
				formatBytes={formatBytes}
				MAX_FILE_SIZE={MAX_FILE_SIZE}
				FileIcon={FileIcon}
				LoadingOverlay={LoadingOverlay}
				getFileIcon={getFileIcon}
			/>

			{/* Quiz Options Dialog - Now controlled from parent */}
			<Dialog
				open={showQuizOptionsDialog}
				onClose={onCloseQuizOptions}
				maxWidth='sm'
				fullWidth
				PaperProps={{
					sx: {
						borderRadius: 3,
						boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
						zIndex: 9999,
					},
				}}
				sx={{
					zIndex: 9998,
				}}
			>
				<DialogTitle>
					<Stack
						direction='row'
						justifyContent='space-between'
						alignItems='center'
					>
						<Stack direction='row' spacing={2} alignItems='center'>
							<Brain color='#6366F1' size={24} />
							<Typography variant='h6' sx={{ fontWeight: 600 }}>
								Quiz Generated Successfully!
							</Typography>
						</Stack>
						<IconButton
							onClick={onCloseQuizOptions}
							size='small'
							sx={{ color: 'text.secondary' }}
						>
							<X size={20} />
						</IconButton>
					</Stack>
				</DialogTitle>

				<DialogContent sx={{ pb: 2 }}>
					<Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
						Your quiz has been generated with {generatedQuestions?.length || 0} questions! 
						Choose how you'd like to use it:
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
								},
							}}
							onClick={() => {
								onStartInteractiveQuiz();
								onCloseQuizOptions();
							}}
						>
							<Stack direction='row' spacing={3} alignItems='center'>
								<Box
									sx={{
										width: 60,
										height: 60,
										borderRadius: 2,
										background:
											'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<PlayCircle color='white' size={28} />
								</Box>
								<Box sx={{ flex: 1 }}>
									<Typography variant='h6' sx={{ fontWeight: 600, mb: 0.5 }}>
										Take Interactive Quiz
									</Typography>
									<Typography variant='body2' color='text.secondary'>
										Start the quiz now with instant feedback, timer, and
										detailed results
									</Typography>
									<Stack direction='row' spacing={1} sx={{ mt: 1 }}>
										<Chip label='AI Generated' size='small' color='primary' />
										<Chip
											label='Instant Feedback'
											size='small'
											variant='outlined'
										/>
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
								position: 'relative',
								zIndex: (theme) => theme.zIndex.modal + 1,
								'&:hover': {
									borderColor: 'secondary.main',
									bgcolor: 'grey.50',
									transform: 'translateY(-2px)',
									boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
								},
							}}
						>
							<Stack direction='row' spacing={3} alignItems='center'>
								<Box
									sx={{
										width: 60,
										height: 60,
										borderRadius: 2,
										background:
											'linear-gradient(135deg, #10B981 0%, #059669 100%)',
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
									<Typography
										variant='body2'
										color='text.secondary'
										sx={{ mb: 2 }}
									>
										Generate and download PDF or DOCX files for offline use or
										printing
									</Typography>
									<Stack direction='row' spacing={1} sx={{ mb: 2 }}>
										<Chip label='PDF Format' size='small' color='error' />
										<Chip label='DOCX Format' size='small' color='info' />
										<Chip label='Printable' size='small' variant='outlined' />
									</Stack>

									<DownloadQuizButton
										quizData={quizData}
										questions={quizData.questions}
										variant='contained'
										size='medium'
										fullWidth={false}
									/>
								</Box>
							</Stack>
						</Paper>
					</Stack>
				</DialogContent>

				<DialogActions sx={{ p: 3, pt: 0 }}>
					<Button
						onClick={onCloseQuizOptions}
						color='inherit'
						sx={{ borderRadius: 2 }}
					>
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default React.memo(FileDropZone);