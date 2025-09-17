import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Stack } from '@mui/material';
import { LLMService } from '../../utils/llmService';
import { useAuth } from '../../context/AuthContext';
import { MAX_FILE_SIZE, SUPPORTED, formatBytes } from './utils';
import Header from './components/Header';
import Features from './components/Features';
import { UploadContainer, MainCard } from './ModernFileUpload.styles';
import UploadMainCard from './components/MainCard';
import { useFileSelector } from './hooks/useFileSelector';

const ModernFileUpload = ({
	onFileUpload,
	hasAI,
	apiKey,
	baseUrl,
	loading: loadingFromParent = false,
	onReconfigure,
}) => {
	// Get credit system from AuthContext
	const { useCredit, refundCredit, credits, isPremium, isAdmin } = useAuth();
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

	// Store extracted text and file read status
	const [extractedText, setExtractedText] = useState('');
	const [fileReadStatus, setFileReadStatus] = useState('none'); // 'none', 'reading', 'ready', 'error'

	// NEW: State for the new flow
	const [generatedQuestions, setGeneratedQuestions] = useState(null);
	const [showQuizOptionsDialog, setShowQuizOptionsDialog] = useState(false);

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

	// Call preloadApiConfig on component mount
	useEffect(() => {
		LLMService.preloadApiConfig().catch(console.error);
	}, []);

	// Stage-based loading helpers
	const startLoading = useCallback(
		(stage = 'reading', message = 'Reading file...') => {
			setError(null);
			setIsLoading(true);
			busyRef.current = true;
			setUploadProgress(0);
			setLoadingStage(stage);
			setStageMessage(message);
		},
		[]
	);

	const stopLoading = useCallback(() => {
		setIsLoading(false);
		busyRef.current = false;
		setUploadProgress(0);
		setLoadingStage('');
		setStageMessage('');
	}, []);

	const updateLoadingStage = useCallback(
		(stage, message, progress, details = {}) => {
			setLoadingStage(stage);
			setStageMessage(message);
			setUploadProgress(progress);
			setProcessingDetails((prev) => ({ ...prev, ...details }));
		},
		[]
	);

	const clearSelectedFile = useCallback(() => {
		setFileName('');
		setFileSize(null);
		setFileType('');
		setSelectedFile(null);
		setExtractedText('');
		setFileReadStatus('none');
		setGeneratedQuestions(null); // NEW: Clear generated questions
		setShowQuizOptionsDialog(false); // NEW: Close dialog
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

	// MODIFIED: Process file for AI and show dialog after completion
	const processFileForAI = useCallback(
		async (file, preExtractedText) => {
			if (busyRef.current) return;
			setError(null);

			try {
				// Check credit availability first
				if (!isPremium && !isAdmin && credits <= 0) {
					setError(
						'You have no credits remaining. Please upgrade to Premium or wait 24 hours for daily credit reset.'
					);
					return;
				}

				// Check API key availability
				if (!apiKey && !sessionStorage.getItem('llm_apiKey')) {
					setError(
						'Please configure your API key first. Click the settings button to get started.'
					);
					return;
				}

				// Start AI processing
				startLoading('analyzing', 'Analyzing content...');

				try {
					const llmService = new LLMService();

					updateLoadingStage('analyzing', 'Analyzing content...', 30, {
						textExtracted: preExtractedText?.length || 0,
					});

					// Deduct credit before AI generation
					updateLoadingStage('validating', 'Checking credits...', 40);

					const canUseCredit = await useCredit();
					if (!canUseCredit) {
						throw new Error(
							'Insufficient credits. You need at least 1 credit to generate a quiz.'
						);
					}

					let creditDeducted = true;

					try {
						// AI question generation
						updateLoadingStage(
							'generating',
							'AI is generating quiz questions...',
							50
						);

						const questions = await llmService.generateQuizQuestions(
							preExtractedText,
							aiOptions
						);

						// Finalizing
						updateLoadingStage(
							'finalizing',
							`Generated ${questions.length} questions successfully! 1 credit used.`,
							90,
							{ questionsGenerated: questions.length }
						);

						// Store generated questions and show dialog
						updateLoadingStage('complete', 'Quiz ready!', 100);
						
						setTimeout(() => {
							setGeneratedQuestions(questions);
							setShowQuizOptionsDialog(true);
							stopLoading();
						}, 800);

					} catch (apiError) {
						// If API call fails after credit deduction, refund the credit
						if (creditDeducted) {
							try {
								await refundCredit();
								console.log('💰 Credit refunded due to API failure');
							} catch (refundError) {
								console.error('❌ Failed to refund credit:', refundError);
							}
						}
						throw apiError;
					}
				} catch (err) {
					throw err;
				}
			} catch (err) {
				console.error('Error processing file for AI:', err);

				// Enhanced error handling
				let userMessage =
					err?.message || 'Failed to process file. Please try again.';

				// Add helpful suggestions based on error type
				if (userMessage.includes('API key')) {
					userMessage += ' Go to Settings to configure your AI provider.';
				} else if (
					userMessage.includes('network') ||
					userMessage.includes('timeout') ||
					userMessage.includes('503') ||
					userMessage.includes('overloaded') ||
					userMessage.includes('Service Unavailable')
				) {
					userMessage +=
						' The AI service is temporarily unavailable. Your credit has been refunded. Please try again later.';
				} else if (
					userMessage.includes('API failed') ||
					userMessage.includes('500') ||
					userMessage.includes('502') ||
					userMessage.includes('504')
				) {
					userMessage +=
						' Server error occurred. Your credit has been refunded. Please try again.';
				}

				setError(userMessage);
				stopLoading();
			}
		},
		[
			useAI,
			apiKey,
			aiOptions,
			startLoading,
			stopLoading,
			updateLoadingStage,
			useCredit,
			refundCredit,
			credits,
			isPremium,
			isAdmin,
		]
	);

	const { handleFileSelect } = useFileSelector({
		setError,
		setFileName,
		setFileSize,
		setFileType,
		setSelectedFile,
		setExtractedText,
		setFileReadStatus,
		clearSelectedFile,
		processFile: processFileForAI,
		useAI,
		startLoading,
		stopLoading,
		updateLoadingStage,
	});

	// MODIFIED: Generate quiz using pre-extracted text
	const handleGenerateQuiz = useCallback(async () => {
		if (!selectedFile) {
			setError('No file selected. Please upload a file first.');
			return;
		}

		if (fileReadStatus === 'reading') {
			setError('File is still being read. Please wait for it to complete.');
			return;
		}

		if (fileReadStatus === 'error') {
			setError('File reading failed. Please try uploading a different file.');
			return;
		}

		if (!extractedText) {
			setError(
				'No text was extracted from the file. Please try a different file.'
			);
			return;
		}

		try {
			// Use the pre-extracted text for AI processing
			await processFileForAI(selectedFile, extractedText);
		} catch (error) {
			console.error('Quiz generation failed:', error);
			setError(error.message);
		}
	}, [selectedFile, extractedText, fileReadStatus, processFileForAI]);

	// Handle non-AI file uploads immediately
	const handleNonAIUpload = useCallback(() => {
		if (selectedFile && !useAI) {
			onFileUpload(selectedFile, false, null);
		}
	}, [selectedFile, useAI, onFileUpload]);

	// Auto-upload for non-AI files when file is selected
	useEffect(() => {
		if (selectedFile && !useAI && fileReadStatus === 'ready') {
			handleNonAIUpload();
		}
	}, [selectedFile, useAI, fileReadStatus, handleNonAIUpload]);

	// NEW: Handle starting interactive quiz
	const handleStartInteractiveQuiz = useCallback(() => {
		if (generatedQuestions) {
			onFileUpload(generatedQuestions, true, aiOptions);
		}
	}, [generatedQuestions, onFileUpload, aiOptions]);

	// NEW: Handle closing quiz options dialog
	const handleCloseQuizOptions = useCallback(() => {
		setShowQuizOptionsDialog(false);
		// Optionally clear generated questions if you want to regenerate
		// setGeneratedQuestions(null);
	}, []);

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
					fileReadStatus={fileReadStatus}
					extractedText={extractedText}
					selectedFile={selectedFile}
					startLoading={startLoading}
					stopLoading={stopLoading}
					updateLoadingStage={updateLoadingStage}
					// NEW: Props for the new flow
					generatedQuestions={generatedQuestions}
					showQuizOptionsDialog={showQuizOptionsDialog}
					onCloseQuizOptions={handleCloseQuizOptions}
					onStartInteractiveQuiz={handleStartInteractiveQuiz}
				/>
			</Stack>
		</UploadContainer>
	);
};

export default ModernFileUpload;