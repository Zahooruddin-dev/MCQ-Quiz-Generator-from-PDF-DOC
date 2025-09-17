// src/components/FileDropZone.jsx
import React, { useState } from 'react';
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
	FileText,
	Brain,
	X,
	File,
	FileType,
	Type,
	PlayCircle,
	Download,
} from 'lucide-react';
import {
	FileIcon,
	LoadingOverlay,
	pulse,
} from '../../ModernFileUpload.styles';
import { formatBytes, MAX_FILE_SIZE } from '../../utils';
import DownloadQuizButton from './DownloadQuizButton/DownloadQuizButton';
import { getStageIcon, getStageColor, getFileReadStatusInfo } from './getStage';
import { createHandlers } from './handlers';
import DropZoneContent from './DropZoneContent';

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
	fileReadStatus = 'none', // 'none', 'reading', 'ready', 'error'
	extractedText = '',
	selectedFile = null,
	apiKey = null,
	aiOptions = {},
	onFileUpload = null,
}) => {
	// State for quiz generation options dialog
	const [showQuizOptions, setShowQuizOptions] = useState(false);

	const getFileIcon = (type) => {
		const t = (type || '').toLowerCase();
		if (t.includes('pdf')) return <FileType size={40} />;
		if (t.includes('word') || t.includes('document') || t.includes('msword'))
			return <FileText size={40} />;
		if (t.includes('text') || t.includes('plain')) return <Type size={40} />;
		return <File size={40} />;
	};
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
		setShowQuizOptions,
		onGenerateQuiz,
	});

	const StageIcon = getStageIcon(loadingStage);
	const stageColor = getStageColor(loadingStage);
	const fileReadStatusInfo = getFileReadStatusInfo(
		fileReadStatus,
		extractedText
	);

	const safeDetails = processingDetails || {
		textExtracted: 0,
		ocrConfidence: null,
		questionsGenerated: 0,
	};

	// Create mock quiz data for download component with extracted text
	const mockQuizData = {
		title: fileName ? fileName.replace(/\.[^/.]+$/, '') : 'Quiz',
		totalQuestions: Math.min(
			Math.max(Math.floor(extractedText.length / 200), 5),
			20
		), // Dynamic based on content
		difficulty: 'Medium',
		extractedText: extractedText, // Pass the actual extracted text
		questions: generateMockQuestions(extractedText), // Generate some mock questions
	};

	// Generate mock questions based on extracted text
	function generateMockQuestions(text) {
		if (!text || text.length < 100) {
			return [];
		}

		// Create some basic mock questions from the text
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
				// ✅ these come from FileDropZone.jsx itself
				formatBytes={formatBytes}
				MAX_FILE_SIZE={MAX_FILE_SIZE}
				FileIcon={FileIcon}
				LoadingOverlay={LoadingOverlay}
				getFileIcon={getFileIcon}
			/>
			{/* Quiz Generation Options Dialog */}
			<Dialog
				open={showQuizOptions}
				onClose={() => {
					console.log('Dialog closed'); // Debug log
					setShowQuizOptions(false);
				}}
				maxWidth='sm'
				fullWidth
				PaperProps={{
					sx: {
						borderRadius: 3,
						boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
						zIndex: 9999, // Ensure it's on top
					},
				}}
				sx={{
					zIndex: 9998, // Ensure dialog backdrop is on top
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
								Choose Quiz Type
							</Typography>
						</Stack>
						<IconButton
							onClick={() => setShowQuizOptions(false)}
							size='small'
							sx={{ color: 'text.secondary' }}
						>
							<X size={20} />
						</IconButton>
					</Stack>
				</DialogTitle>

				<DialogContent sx={{ pb: 2 }}>
					<Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
						How would you like to use your quiz? Choose interactive mode to take
						the quiz online, or download it for offline use.
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
							onClick={handleInteractiveQuiz}
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
										Interactive Quiz
									</Typography>
									<Typography variant='body2' color='text.secondary'>
										Take the quiz online with instant feedback, timer, and
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
								position: 'relative', // 👈 make it layerable
								zIndex: (theme) => theme.zIndex.modal + 1, // 👈 ensure above dialog content
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

									{/* Use the existing DownloadQuizButton component */}
									{extractedText ? (
										<DownloadQuizButton
											quizData={mockQuizData}
											questions={mockQuizData.questions}
											variant='contained'
											size='medium'
											fullWidth={false}
										/>
									) : (
										<Button variant='outlined' disabled size='medium'>
											Download Quiz (No content available)
										</Button>
									)}
								</Box>
							</Stack>
						</Paper>
					</Stack>
				</DialogContent>

				<DialogActions sx={{ p: 3, pt: 0 }}>
					<Button
						onClick={() => setShowQuizOptions(false)}
						color='inherit'
						sx={{ borderRadius: 2 }}
					>
						Cancel
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default React.memo(FileDropZone);
