import React, { useState, useRef, useCallback, useEffect } from 'react'; // Import useEffect
import { Stack } from '@mui/material';
import { LLMService } from '../../utils/llmService';
import { MAX_FILE_SIZE, SUPPORTED, formatBytes } from './utils';
import Header from './components/Header';
import Features from './components/Features';
import { UploadContainer, MainCard } from './ModernFileUpload.styles';
import UploadMainCard from './components/MainCard';
import { useFileSelector } from './hooks/useFileSelector';
import { useFileProcessor } from './hooks/useFileProcessor';

const ModernFileUpload = ({
	onFileUpload,
	hasAI,
	apiKey,
	baseUrl,
	loading: loadingFromParent = false,
	onReconfigure,
}) => {
	const [error, setError] = useState(null);
	const [useAI, setUseAI] = useState(hasAI);
	const [aiOptions, setAiOptions] = useState({
		numQuestions: 10,
		difficulty: 'medium',
		questionType: 'mixed',
	});
	const [fileName, setFileName] = useState('');
	const [fileSize, setFileSize] = useState(null);
	const [fileType, setFileType] = useState('');
	const [dragOver, setDragOver] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [selectedFile, setSelectedFile] = useState(null);
	const [loadingStage, setLoadingStage] = useState('');
	const [stageMessage, setStageMessage] = useState('');
	const [processingDetails, setProcessingDetails] = useState({
		textExtracted: 0,
		ocrConfidence: null,
		questionsGenerated: 0,
	});
	const busyRef = useRef(false);
	const fileInputRef = useRef(null);

	const effectiveLoading = isLoading || loadingFromParent;

	// ----- Call preloadApiConfig on component mount -----
	useEffect(() => {
		LLMService.preloadApiConfig().catch(console.error);
	}, []); // Empty dependency array ensures it runs only once on mount
	// ---------------------------------------------------

	// Stage-based loading helpers
	const startLoading = useCallback((stage = 'reading', message = 'Reading file...') => {
		setError(null);
		setIsLoading(true);
		busyRef.current = true;
		setUploadProgress(0);
		setLoadingStage(stage);
		setStageMessage(message);
	}, []);

	const stopLoading = useCallback(() => {
		setIsLoading(false);
		busyRef.current = false;
		setUploadProgress(0);
		setLoadingStage('');
		setStageMessage('');
	}, []);

	const updateLoadingStage = useCallback((stage, message, progress, details = {}) => {
		setLoadingStage(stage);
		setStageMessage(message);
		setUploadProgress(progress);
		setProcessingDetails(prev => ({ ...prev, ...details }));
	}, []);

	const clearSelectedFile = useCallback(() => {
		setFileName('');
		setFileSize(null);
		setFileType('');
		setSelectedFile(null);
		setError(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	}, []);

	const handleReconfigure = useCallback(
		(e) => {
			e?.preventDefault?.();
			if (typeof onReconfigure === 'function') onReconfigure();
		},
		[onReconfigure]
	);

	const processFile = useCallback(
		async (file) => {
			if (busyRef.current) return;
			setError(null);

			try {
				if (!file) return;

				if (!useAI) {
					onFileUpload(file, false, null);
					return;
				}

				// Check API key availability
				if (!apiKey && !sessionStorage.getItem('llm_apiKey')) {
					setError(
						'Please configure your API key first. Click the settings button to get started.'
					);
					return;
				}

				// Stage 1: Start file reading
				startLoading('reading', `Reading ${file.name}...`);

				try {
					const llmService = new LLMService();

					// Stage 2: File processing with enhanced feedback
					updateLoadingStage('processing', 'Extracting text from document...', 20);

					// Read file content with progress tracking
					let extractedText;
					try {
						extractedText = await llmService.readFileContent(file, (progressInfo) => {
							if (progressInfo.stage === 'ocr') {
								updateLoadingStage(
									'ocr',
									progressInfo.message || 'Using OCR to extract text from image...',
									20 + progressInfo.progress * 0.4,
									{ ocrConfidence: progressInfo.confidence }
								);
							} else {
								updateLoadingStage(
									'processing',
									progressInfo.message || 'Processing document...',
									20 + progressInfo.progress * 0.4
								);
							}
						});
					} catch (fileError) {
						// Enhanced error messages based on error type
						let userFriendlyMessage = 'Failed to process the file.';

						if (fileError.message.includes('OCR')) {
							userFriendlyMessage =
								'Could not extract text from this image. Please ensure the image is clear and contains readable text.';
						} else if (fileError.message.includes('PDF')) {
							userFriendlyMessage =
								'Could not read this PDF file. It may be password-protected or corrupted.';
						} else if (fileError.message.includes('DOCX')) {
							userFriendlyMessage =
								'Could not read this Word document. The file may be corrupted.';
						} else if (fileError.message.includes('size')) {
							userFriendlyMessage = 'File is too large. Please use a smaller file.';
						} else if (fileError.message.includes('format')) {
							userFriendlyMessage =
								'Unsupported file format. Please use PDF, DOCX, TXT, HTML, or image files.';
						}

						throw new Error(userFriendlyMessage);
					}

					// Stage 3: Analyzing
					updateLoadingStage('analyzing', 'Analyzing content...', 60, {
						textExtracted: extractedText?.length || 0,
					});

					// Stage 4: AI question generation
					updateLoadingStage('generating', 'AI is generating quiz questions...', 70);

					const questions = await llmService.generateQuizQuestions(
						extractedText,
						aiOptions
					);

					// Stage 5: Finalizing
					updateLoadingStage(
						'finalizing',
						`Generated ${questions.length} questions successfully!`,
						95,
						{ questionsGenerated: questions.length }
					);

					// Stage 6: Complete
					setTimeout(() => {
						updateLoadingStage('complete', 'Quiz ready!', 100);
						setTimeout(() => {
							onFileUpload(questions, true, aiOptions);
							stopLoading();
						}, 500);
					}, 800);
				} catch (err) {
					throw err;
				}
			} catch (err) {
				console.error('Error processing file:', err);

				// Enhanced error handling
				let userMessage = err?.message || 'Failed to process file. Please try again.';

				// Add helpful suggestions based on error type
				if (userMessage.includes('API key')) {
					userMessage += ' Go to Settings to configure your AI provider.';
				} else if (
					userMessage.includes('network') ||
					userMessage.includes('timeout')
				) {
					userMessage += ' Check your internet connection and try again.';
				} else if (userMessage.includes('image') || userMessage.includes('OCR')) {
					userMessage += ' Try using a higher quality image or a different file format.';
				}

				setError(userMessage);
				stopLoading();
			}
		},
		[
			useAI,
			apiKey,
			aiOptions,
			onFileUpload,
			startLoading,
			stopLoading,
			updateLoadingStage,
		]
	);

	const { handleFileSelect } = useFileSelector({
		setError,
		setFileName,
		setFileSize,
		setFileType,
		setSelectedFile,
		clearSelectedFile,
		processFile,
		useAI,
	});

	const handleGenerateQuiz = useCallback(async () => {
		if (!selectedFile) {
			setError('No file selected. Please upload a file first.');
			return;
		}
		try {
			await processFile(selectedFile);
		} catch (error) {
			console.error('Quiz generation failed:', error);
			setError(error.message);
		}
	}, [selectedFile, processFile]);

	const handleDrop = useCallback(
		(e) => {
			e.preventDefault();
			setDragOver(false);
			if (e.dataTransfer.files.length) {
				handleFileSelect(e.dataTransfer.files[0]);
			}
		},
		[handleFileSelect]
	);

	const handleDragOver = useCallback((e) => {
		e.preventDefault();
		setDragOver(true);
	}, []);

	const handleDragLeave = useCallback((e) => {
		e.preventDefault();
		// Only set dragOver to false if we're actually leaving the drop zone
		if (!e.currentTarget.contains(e.relatedTarget)) {
			setDragOver(false);
		}
	}, []);

	const handleKeyDown = useCallback(
		(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				if (fileInputRef.current && !effectiveLoading) {
					fileInputRef.current.click();
				}
			}
		},
		[effectiveLoading]
	);

	return (
		<UploadContainer maxWidth='lg'>
			<Stack spacing={{ xs: 3, sm: 4, md: 5 }}>
				<Header />
				<Features />

				<UploadMainCard
					error={error}
					setError={setError}
					hasAI={hasAI}
					apiKey={apiKey}
					effectiveLoading={effectiveLoading}
					aiOptions={aiOptions}
					setAiOptions={setAiOptions}
					handleReconfigure={handleReconfigure}
					dragOver={dragOver}
					fileName={fileName}
					fileSize={fileSize}
					fileType={fileType}
					useAI={useAI}
					uploadProgress={uploadProgress}
					loadingStage={loadingStage}
					stageMessage={stageMessage}
					processingDetails={processingDetails}
					fileInputRef={fileInputRef}
					handleDrop={handleDrop}
					handleDragOver={handleDragOver}
					handleDragLeave={handleDragLeave}
					handleFileSelect={handleFileSelect}
					clearSelectedFile={clearSelectedFile}
					handleGenerateQuiz={handleGenerateQuiz}
					handleKeyDown={handleKeyDown}
					baseUrl={baseUrl}
					onFileUpload={onFileUpload}
				/>
			</Stack>
		</UploadContainer>
	);
};

export default ModernFileUpload;
