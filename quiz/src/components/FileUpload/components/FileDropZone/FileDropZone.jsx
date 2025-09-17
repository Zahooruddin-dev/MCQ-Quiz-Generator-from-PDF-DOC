// src/components/FileDropZone.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
	useTheme,
	useMediaQuery,
	Slide,
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

// Slide transition for mobile
const SlideTransition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});

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
	generatedQuestions = null,
	showQuizOptionsDialog = false,
	onCloseQuizOptions,
	onStartInteractiveQuiz,
}) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const isTablet = useMediaQuery(theme.breakpoints.down('md'));
	
	// Memoize handlers to prevent unnecessary re-renders
	const handlers = useMemo(() => createHandlers({
		fileName,
		effectiveLoading,
		fileInputRef,
		onFileSelect,
		onDrop,
		onDragOver,
		onDragLeave,
		setError,
		setShowQuizOptions: null,
		onGenerateQuiz,
		onStartInteractiveQuiz,
	}), [
		fileName,
		effectiveLoading,
		fileInputRef,
		onFileSelect,
		onDrop,
		onDragOver,
		onDragLeave,
		setError,
		onGenerateQuiz,
		onStartInteractiveQuiz,
	]);

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
	} = handlers;

	// Memoize stage data
	const stageData = useMemo(() => ({
		icon: getStageIcon(loadingStage),
		color: getStageColor(loadingStage),
	}), [loadingStage]);

	// Memoize processing details with defaults
	const safeDetails = useMemo(() => processingDetails || {
		textExtracted: 0,
		ocrConfidence: null,
		questionsGenerated: 0,
	}, [processingDetails]);

	// Generate mock questions with better performance
	const generateMockQuestions = useCallback((text) => {
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
			explanation: 'This is a mock question generated from your document content.',
			type: 'multiple-choice',
		}));
	}, []);

	// Memoize quiz data
	const quizData = useMemo(() => {
		const baseTitle = fileName ? fileName.replace(/\.[^/.]+$/, '') : 'Quiz';
		const totalQuestions = generatedQuestions 
			? generatedQuestions.length 
			: Math.min(Math.max(Math.floor(extractedText.length / 200), 5), 20);

		return {
			title: baseTitle,
			totalQuestions,
			difficulty: 'Medium',
			extractedText: extractedText,
			questions: generatedQuestions || generateMockQuestions(extractedText),
		};
	}, [fileName, generatedQuestions, extractedText, generateMockQuestions]);

	// Memoize disabled state
	const isQuizGenerationDisabled = useMemo(() => 
		effectiveLoading ||
		fileReadStatus === 'reading' ||
		fileReadStatus === 'error' ||
		!extractedText,
		[effectiveLoading, fileReadStatus, extractedText]
	);

	// Handle interactive quiz with better UX
	const handleInteractiveQuizClick = useCallback(() => {
		onStartInteractiveQuiz();
		onCloseQuizOptions();
	}, [onStartInteractiveQuiz, onCloseQuizOptions]);

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
				stageColor={stageData.color}
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
				StageIcon={stageData.icon}
				formatBytes={formatBytes}
				MAX_FILE_SIZE={MAX_FILE_SIZE}
				FileIcon={FileIcon}
				LoadingOverlay={LoadingOverlay}
				getFileIcon={getFileIcon}
			/>

			{/* Enhanced Mobile-Friendly Quiz Options Dialog */}
			<Dialog
				open={showQuizOptionsDialog}
				onClose={onCloseQuizOptions}
				maxWidth="sm"
				fullWidth
				fullScreen={isMobile}
				TransitionComponent={isMobile ? SlideTransition : undefined}
				PaperProps={{
					sx: {
						borderRadius: isMobile ? 0 : 3,
						boxShadow: isMobile ? 'none' : '0 20px 40px rgba(0,0,0,0.1)',
						zIndex: 9999,
						margin: isMobile ? 0 : 'auto',
						maxHeight: isMobile ? '100vh' : '90vh',
						overflowY: 'auto',
						background: isMobile ? 
							'linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)' : 
							'#ffffff',
					},
				}}
				sx={{
					zIndex: 9998,
					'& .MuiDialog-container': {
						padding: isMobile ? 0 : theme.spacing(2),
						alignItems: isMobile ? 'flex-end' : 'center',
					},
					'& .MuiBackdrop-root': {
						backgroundColor: isMobile ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
					},
				}}
			>
				<DialogTitle
					sx={{
						pb: 1,
						pt: isMobile ? 2 : 3,
						px: isMobile ? 2 : 3,
						position: 'sticky',
						top: 0,
						bgcolor: 'background.paper',
						zIndex: 1,
						borderBottom: isMobile ? '1px solid' : 'none',
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
							<Brain color="#6366F1" size={isMobile ? 20 : 24} />
							<Typography 
								variant={isMobile ? 'h6' : 'h6'} 
								sx={{ 
									fontWeight: 600,
									fontSize: isMobile ? '1.1rem' : '1.25rem',
									lineHeight: 1.2,
								}}
							>
								Quiz Generated!
							</Typography>
						</Stack>
						<IconButton
							onClick={onCloseQuizOptions}
							size="small"
							sx={{ 
								color: 'text.secondary',
								flexShrink: 0,
							}}
						>
							<X size={20} />
						</IconButton>
					</Stack>
				</DialogTitle>

				<DialogContent 
					sx={{ 
						pb: 2, 
						px: isMobile ? 2 : 3,
						pt: 2,
					}}
				>
					<Typography 
						variant="body2" 
						color="text.secondary" 
						sx={{ 
							mb: 3,
							fontSize: isMobile ? '0.875rem' : '0.875rem',
							lineHeight: 1.5,
						}}
					>
						Your quiz has been generated with {generatedQuestions?.length || 0} questions! 
						Choose how you'd like to use it:
					</Typography>

					<Stack spacing={isMobile ? 2 : 2}>
						{/* Interactive Quiz Option - Enhanced for Mobile */}
						<Paper
							sx={{
								p: isMobile ? 2 : 3,
								cursor: 'pointer',
								border: '2px solid transparent',
								transition: 'all 0.2s ease',
								'&:hover': {
									borderColor: 'primary.main',
									bgcolor: 'primary.50',
									transform: isMobile ? 'none' : 'translateY(-2px)',
									boxShadow: isMobile ? 
										'0 4px 12px rgba(99, 102, 241, 0.15)' :
										'0 8px 25px rgba(99, 102, 241, 0.15)',
								},
								'&:active': {
									transform: 'scale(0.98)',
								},
							}}
							onClick={handleInteractiveQuizClick}
						>
							<Stack 
								direction={isMobile ? 'column' : 'row'} 
								spacing={isMobile ? 2 : 3} 
								alignItems={isMobile ? 'stretch' : 'center'}
							>
								<Box
									sx={{
										width: isMobile ? '100%' : 60,
										height: 60,
										borderRadius: 2,
										background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										alignSelf: isMobile ? 'center' : 'flex-start',
										flexShrink: 0,
										maxWidth: isMobile ? 60 : 'none',
									}}
								>
									<PlayCircle color="white" size={isMobile ? 24 : 28} />
								</Box>
								<Box sx={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
									<Typography 
										variant="h6" 
										sx={{ 
											fontWeight: 600, 
											mb: 0.5,
											fontSize: isMobile ? '1rem' : '1.25rem',
										}}
									>
										Take Interactive Quiz
									</Typography>
									<Typography 
										variant="body2" 
										color="text.secondary"
										sx={{
											fontSize: isMobile ? '0.8rem' : '0.875rem',
											lineHeight: 1.4,
										}}
									>
										Start the quiz now with instant feedback, timer, and detailed results
									</Typography>
									<Stack 
										direction="row" 
										spacing={1} 
										sx={{ 
											mt: 1.5,
											justifyContent: isMobile ? 'center' : 'flex-start',
											flexWrap: 'wrap',
										}}
									>
										<Chip 
											label="AI Generated" 
											size="small" 
											color="primary"
											sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}
										/>
										<Chip
											label="Instant Feedback"
											size="small"
											variant="outlined"
											sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}
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

						{/* Download Quiz Option - Enhanced for Mobile */}
						<Paper
							sx={{
								p: isMobile ? 2 : 3,
								border: '2px solid transparent',
								transition: 'all 0.2s ease',
								position: 'relative',
								zIndex: (theme) => theme.zIndex.modal + 1,
								'&:hover': {
									borderColor: 'secondary.main',
									bgcolor: 'grey.50',
									transform: isMobile ? 'none' : 'translateY(-2px)',
									boxShadow: isMobile ? 
										'0 4px 12px rgba(0, 0, 0, 0.1)' :
										'0 8px 25px rgba(0, 0, 0, 0.1)',
								},
							}}
						>
							<Stack 
								direction={isMobile ? 'column' : 'row'} 
								spacing={isMobile ? 2 : 3} 
								alignItems={isMobile ? 'stretch' : 'center'}
							>
								<Box
									sx={{
										width: isMobile ? '100%' : 60,
										height: 60,
										borderRadius: 2,
										background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										alignSelf: isMobile ? 'center' : 'flex-start',
										flexShrink: 0,
										maxWidth: isMobile ? 60 : 'none',
									}}
								>
									<Download color="white" size={isMobile ? 24 : 28} />
								</Box>
								<Box sx={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
									<Typography 
										variant="h6" 
										sx={{ 
											fontWeight: 600, 
											mb: 0.5,
											fontSize: isMobile ? '1rem' : '1.25rem',
										}}
									>
										Download Quiz
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ 
											mb: 2,
											fontSize: isMobile ? '0.8rem' : '0.875rem',
											lineHeight: 1.4,
										}}
									>
										Generate and download PDF or DOCX files for offline use or printing
									</Typography>
									<Stack 
										direction="row" 
										spacing={1} 
										sx={{ 
											mb: 2,
											justifyContent: isMobile ? 'center' : 'flex-start',
											flexWrap: 'wrap',
											gap: 1,
										}}
									>
										<Chip 
											label="PDF Format" 
											size="small" 
											color="error"
											sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}
										/>
										<Chip 
											label="DOCX Format" 
											size="small" 
											color="info"
											sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}
										/>
										<Chip 
											label="Printable" 
											size="small" 
											variant="outlined"
											sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}
										/>
									</Stack>

									<DownloadQuizButton
										quizData={quizData}
										questions={quizData.questions}
										variant="contained"
										size={isMobile ? "medium" : "medium"}
										fullWidth={isMobile}
									/>
								</Box>
							</Stack>
						</Paper>
					</Stack>
				</DialogContent>

				<DialogActions 
					sx={{ 
						p: isMobile ? 2 : 3, 
						pt: 1,
						position: isMobile ? 'sticky' : 'static',
						bottom: 0,
						bgcolor: 'background.paper',
						borderTop: isMobile ? '1px solid' : 'none',
						borderColor: 'divider',
					}}
				>
					<Button
						onClick={onCloseQuizOptions}
						color="inherit"
						sx={{ 
							borderRadius: 2,
							minWidth: isMobile ? 80 : 'auto',
						}}
						fullWidth={isMobile}
					>
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default React.memo(FileDropZone);