// src/components/FileDropZone.jsx
import React, { useState } from 'react';
import {
	Box,
	Typography,
	Button,
	Stack,
	LinearProgress,
	Snackbar,
	Alert,
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
	Upload,
	FileText,
	Brain,
	X,
	File,
	FileType,
	Type,
	Sparkles,
	Eye,
	Settings,
	RefreshCw,
	CheckCircle,
	AlertCircle,
	Clock,
	PlayCircle,
	Download,
} from 'lucide-react';
import {
	DropZone,
	FileIcon,
	LoadingOverlay,
	pulse,
} from '../ModernFileUpload.styles';
import { formatBytes, MAX_FILE_SIZE } from '../utils';
import DownloadQuizButton from '../Engine/Results/ShareQuizModal/DownloadQuizButton/DownloadQuizButton';

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
	// File read status props
	fileReadStatus = 'none', // 'none', 'reading', 'ready', 'error'
	extractedText = '',
	// Props to handle quiz generation options
	selectedFile = null,
	apiKey = null,
	aiOptions = {},
	onFileUpload = null,
	// NEW: Loading control functions from parent
	startLoading = null,
	stopLoading = null,
	updateLoadingStage = null,
}) => {
	// State for quiz generation options dialog
	const [showQuizOptions, setShowQuizOptions] = useState(false);
	const [downloadFormat, setDownloadFormat] = useState(null); // Track download format
	const [generatedQuestions, setGeneratedQuestions] = useState([]); // Store generated questions

	const getFileIcon = (type) => {
		const t = (type || '').toLowerCase();
		if (t.includes('pdf')) return <FileType size={40} />;
		if (t.includes('word') || t.includes('document') || t.includes('msword'))
			return <FileText size={40} />;
		if (t.includes('text') || t.includes('plain')) return <Type size={40} />;
		return <File size={40} />;
	};

	const handleCloseError = () => {
		setError(null);
	};

	// Fixed click handler to prevent event bubbling
	const handleDropZoneClick = (e) => {
		// Don't trigger file input if we have a file or if loading
		if (fileName || effectiveLoading) {
			e.stopPropagation();
			return;
		}

		// Don't trigger if clicking on buttons or other interactive elements
		if (e.target.closest('button') || e.target.closest('input')) {
			e.stopPropagation();
			return;
		}

		e.stopPropagation();
		fileInputRef.current?.click();
	};

	// Fixed file input change handler
	const handleFileInputChange = (e) => {
		e.stopPropagation();
		const file = e.target.files?.[0];
		if (file) {
			onFileSelect(file);
		}
		// Reset the input value to allow selecting the same file again if needed
		e.target.value = '';
	};

	// Fixed drag handlers
	const handleDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();
		onDrop(e);
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		e.stopPropagation();
		onDragOver(e);
	};

	const handleDragLeave = (e) => {
		e.preventDefault();
		e.stopPropagation();
		onDragLeave(e);
	};

	// Fixed keyboard handler
	const handleKeyDown = (e) => {
		if (
			!fileName &&
			!effectiveLoading &&
			(e.key === 'Enter' || e.key === ' ')
		) {
			e.preventDefault();
			e.stopPropagation();
			fileInputRef.current?.click();
		}
	};

	// Handle quiz generation button click - show options dialog
	const handleGenerateQuizClick = (e) => {
		e.stopPropagation();
		console.log('Generate quiz clicked, opening dialog...'); // Debug log
		setShowQuizOptions(true);
	};

	// Handle interactive quiz selection
	const handleInteractiveQuiz = () => {
		console.log('Interactive quiz selected'); // Debug log
		setShowQuizOptions(false);
		onGenerateQuiz(); // Call the original function for interactive quiz
	};

	// NEW: Handle download quiz selection with format choice
	const handleDownloadQuiz = async (format) => {
		console.log(`Download quiz selected - Format: ${format}`);
		setDownloadFormat(format);
		setShowQuizOptions(false);
		
		// First generate the quiz using AI, then download
		await generateQuizForDownload(format);
	};

	// NEW: Generate quiz specifically for download
	const generateQuizForDownload = async (format) => {
		if (!selectedFile || !extractedText) {
			setError('No file content available for quiz generation.');
			return;
		}

		try {
			// Use parent's loading system if available
			if (startLoading) {
				startLoading('analyzing', 'Preparing quiz for download...');
			}

			// Import the AI service
			const { LLMService } = await import('../../../utils/llmService');
			const llmService = new LLMService();

			// Update progress
			if (updateLoadingStage) {
				updateLoadingStage('analyzing', 'Analyzing content for quiz...', 20);
			}

			// Generate questions using AI
			if (updateLoadingStage) {
				updateLoadingStage('generating', 'AI is generating quiz questions...', 50);
			}
			
			const questions = await llmService.generateQuizQuestions(extractedText, aiOptions);
			
			if (!questions || questions.length === 0) {
				throw new Error('No questions were generated from the content.');
			}

			// Update progress
			if (updateLoadingStage) {
				updateLoadingStage('finalizing', `Generated ${questions.length} questions. Preparing download...`, 80, {
					questionsGenerated: questions.length
				});
			}

			// Create quiz data for download
			const quizDataForDownload = {
				title: fileName ? fileName.replace(/\.[^/.]+$/, '') : 'Quiz',
				totalQuestions: questions.length,
				difficulty: aiOptions.difficulty || 'Medium',
				questions: questions,
				extractedText: extractedText
			};

			// Import and use the download components
			if (format === 'pdf') {
				const { default: CombinedPDFGenerator } = await import('../Engine/Results/ShareQuizModal/DownloadQuizButton/CombinedPDFGenerator');
				await CombinedPDFGenerator.generate(quizDataForDownload, questions);
			} else if (format === 'docx') {
				const { default: DOCXDownloadComponent } = await import('../Engine/Results/ShareQuizModal/DownloadQuizButton/DOCXDownloadComponent');
				await DOCXDownloadComponent.generate(quizDataForDownload, questions, (message) => {
					console.log(message);
				});
			}

			// Complete the process
			if (updateLoadingStage) {
				updateLoadingStage('complete', 'Download ready!', 100);
			}

			// Clear any errors
			if (setError) {
				setError(null);
			}

		} catch (error) {
			console.error('Download quiz generation failed:', error);
			let errorMessage = error.message || 'Failed to generate quiz for download';
			
			// Add specific error handling for common issues
			if (errorMessage.includes('API key')) {
				errorMessage += ' Please check your AI configuration.';
			} else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
				errorMessage += ' Please check your internet connection and try again.';
			}
			
			setError(errorMessage);
		} finally {
			// Stop loading
			if (stopLoading) {
				stopLoading();
			}
			setDownloadFormat(null);
		}
	};

	// Get stage-specific icon and color
	const getStageIcon = (stage) => {
		switch (stage) {
			case 'reading':
				return FileText;
			case 'processing':
				return Settings;
			case 'ocr':
				return Eye;
			case 'analyzing':
				return RefreshCw;
			case 'generating':
				return Brain;
			case 'finalizing':
				return Sparkles;
			case 'complete':
				return Sparkles;
			default:
				return FileText;
		}
	};

	const getStageColor = (stage) => {
		switch (stage) {
			case 'reading':
				return '#3b82f6';
			case 'processing':
				return '#f59e0b';
			case 'ocr':
				return '#8b5cf6';
			case 'analyzing':
				return '#10b981';
			case 'generating':
				return '#6366f1';
			case 'finalizing':
				return '#06b6d4';
			case 'complete':
				return '#10b981';
			default:
				return '#6366f1';
		}
	};

	// Get file read status info
	const getFileReadStatusInfo = () => {
		switch (fileReadStatus) {
			case 'reading':
				return {
					icon: Clock,
					color: '#f59e0b',
					text: 'Reading file...',
					bgColor: 'rgba(245, 158, 11, 0.1)',
				};
			case 'ready':
				return {
					icon: CheckCircle,
					color: '#10b981',
					text: `Ready (${extractedText.length} chars)`,
					bgColor: 'rgba(16, 185, 129, 0.1)',
				};
			case 'error':
				return {
					icon: AlertCircle,
					color: '#ef4444',
					text: 'Read failed',
					bgColor: 'rgba(239, 68, 68, 0.1)',
				};
			default:
				return null;
		}
	};

	const StageIcon = getStageIcon(loadingStage);
	const stageColor = getStageColor(loadingStage);
	const safeDetails = processingDetails || {
		textExtracted: 0,
		ocrConfidence: null,
		questionsGenerated: 0,
	};

	const fileReadStatusInfo = getFileReadStatusInfo();

	// Create mock quiz data for download component with extracted text
	const mockQuizData = {
		title: fileName ? fileName.replace(/\.[^/.]+$/, '') : 'Quiz',
		totalQuestions: Math.min(Math.max(Math.floor(extractedText.length / 200), 5), 20), // Dynamic based on content
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
		const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20).slice(0, 10);
		
		return sentences.map((sentence, index) => ({
			id: index + 1,
			question: `Based on the content: ${sentence.trim().substring(0, 80)}...?`,
			options: [
				'Option A (Mock)',
				'Option B (Mock)', 
				'Option C (Mock)',
				'Option D (Mock)'
			],
			correctAnswer: 0,
			explanation: 'This is a mock question generated from your document content.',
			type: 'multiple-choice'
		}));
	}

	const isQuizGenerationDisabled = 
		effectiveLoading ||
		fileReadStatus === 'reading' ||
		fileReadStatus === 'error' ||
		!extractedText;

	return (
		<>
			<DropZone
				isDragActive={dragOver}
				hasFile={!!fileName}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onClick={handleDropZoneClick}
				role='button'
				tabIndex={fileName || effectiveLoading ? -1 : 0}
				aria-label={
					!fileName
						? 'Upload file by clicking or dragging'
						: `File selected: ${fileName}`
				}
				onKeyDown={handleKeyDown}
				sx={{
					position: 'relative',
					cursor: fileName || effectiveLoading ? 'default' : 'pointer',
				}}
			>
				{effectiveLoading && (
					<LoadingOverlay>
						<Box
							sx={{
								width: 80,
								height: 80,
								borderRadius: '50%',
								background: `linear-gradient(135deg, ${stageColor} 0%, #6366F1 100%)`,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: 'white',
								mb: 3,
								animation: `${pulse} 1.5s infinite`,
							}}
						>
							<StageIcon size={32} />
						</Box>

						<Typography
							variant='h6'
							sx={{ mb: 1, fontWeight: 600, textAlign: 'center' }}
						>
							{loadingStage === 'reading' && 'Reading Document'}
							{loadingStage === 'processing' && 'Processing Content'}
							{loadingStage === 'ocr' && 'Extracting Text'}
							{loadingStage === 'analyzing' && 'Analyzing Content'}
							{loadingStage === 'generating' && 'Generating Questions'}
							{loadingStage === 'finalizing' && 'Finalizing Quiz'}
							{loadingStage === 'complete' && 'Complete!'}
							{!loadingStage && 'Processing Your Content'}
						</Typography>

						<Typography
							variant='body2'
							sx={{
								color: 'text.secondary',
								mb: 3,
								textAlign: 'center',
								minHeight: '2.5em',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							{stageMessage || 'Please wait while we process your file...'}
						</Typography>

						{/* Processing details */}
						{(safeDetails.textExtracted > 0 ||
							safeDetails.ocrConfidence ||
							safeDetails.questionsGenerated > 0) && (
							<Box sx={{ mb: 2, textAlign: 'center' }}>
								<Stack
									direction='row'
									spacing={2}
									justifyContent='center'
									flexWrap='wrap'
								>
									{typeof safeDetails.ocrConfidence === 'number' && (
										<Typography
											variant='caption'
											sx={{
												bgcolor: 'rgba(255,255,255,0.1)',
												px: 1,
												py: 0.5,
												borderRadius: 1,
												color: 'white',
											}}
										>
											👁️ {Math.round(safeDetails.ocrConfidence)}% confidence
										</Typography>
									)}
									{safeDetails.questionsGenerated > 0 && (
										<Typography
											variant='caption'
											sx={{
												bgcolor: 'rgba(255,255,255,0.1)',
												px: 1,
												py: 0.5,
												borderRadius: 1,
												color: 'white',
											}}
										>
											🧠 {safeDetails.questionsGenerated} questions created
										</Typography>
									)}
								</Stack>
							</Box>
						)}

						<Box sx={{ width: '100%', maxWidth: 400 }}>
							<LinearProgress
								variant='determinate'
								value={uploadProgress}
								sx={{
									height: 8,
									borderRadius: 4,
									'& .MuiLinearProgress-bar': {
										background: `linear-gradient(90deg, ${stageColor} 0%, #6366F1 100%)`,
									},
								}}
							/>
							<Typography
								variant='caption'
								sx={{
									mt: 1,
									display: 'block',
									textAlign: 'center',
									color: 'white',
									fontWeight: 500,
								}}
							>
								{Math.round(uploadProgress)}% Complete
							</Typography>
						</Box>
					</LoadingOverlay>
				)}

				{!fileName ? (
					<Box>
						<FileIcon>
							<Upload size={36} />
						</FileIcon>
						<Typography variant='h6' sx={{ mb: 1, fontWeight: 600 }}>
							Drag & drop your study material here
						</Typography>
						<Typography variant='body2' sx={{ mb: 3, color: 'text.secondary' }}>
							Supports PDF, DOCX, TXT, HTML (Max {formatBytes(MAX_FILE_SIZE)})
						</Typography>
						<Button
							variant='contained'
							startIcon={<Upload />}
							sx={{ borderRadius: 2 }}
							aria-label='Browse files to upload'
							onClick={(e) => {
								e.stopPropagation();
								fileInputRef.current?.click();
							}}
						>
							Browse Files
						</Button>
					</Box>
				) : (
					<Box>
						<FileIcon>{getFileIcon(fileType)}</FileIcon>
						<Typography variant='h6' sx={{ fontWeight: 600, mb: 1 }}>
							{fileName}
						</Typography>
						{fileSize && (
							<Typography variant='body2' sx={{ mb: 1, color: 'text.secondary' }}>
								{formatBytes(fileSize)}
							</Typography>
						)}

						<Stack
							direction='row'
							spacing={2}
							justifyContent='center'
							sx={{ mt: 2 }}
						>
							{useAI && (
								<Button
									variant='contained'
									startIcon={<Brain />}
									onClick={(e) => {
										e.stopPropagation();
										handleGenerateQuizClick(e);
									}}
									disabled={isQuizGenerationDisabled}
									sx={{ borderRadius: 2 }}
								>
									{fileReadStatus === 'reading'
										? 'Reading File...'
										: 'Generate Quiz'}
								</Button>
							)}
							<Button
								variant='outlined'
								startIcon={<X />}
								onClick={(e) => {
									e.stopPropagation();
									onClear();
								}}
								disabled={effectiveLoading}
								sx={{ borderRadius: 2 }}
							>
								Remove
							</Button>
						</Stack>
					</Box>
				)}

				<input
					type='file'
					ref={fileInputRef}
					style={{ display: 'none' }}
					onChange={handleFileInputChange}
					accept='.pdf,.doc,.docx,.txt,.html'
					aria-hidden='true'
					tabIndex={-1}
				/>

				{/* Error Popup */}
				<Snackbar
					open={!!error}
					autoHideDuration={7000}
					onClose={handleCloseError}
					anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
				>
					<Alert
						onClose={handleCloseError}
						severity='error'
						sx={{ width: '100%' }}
					>
						{error}
					</Alert>
				</Snackbar>
			</DropZone>

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
					}
				}}
				sx={{
					zIndex: 9998, // Ensure dialog backdrop is on top
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
							onClick={handleInteractiveQuiz}
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
											onClick={() => handleDownloadQuiz('pdf')}
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
											onClick={() => handleDownloadQuiz('docx')}
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