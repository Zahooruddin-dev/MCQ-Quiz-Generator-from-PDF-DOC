import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Stack, Fade, Zoom } from '@mui/material';
import { LLMService } from '../../utils/llmService/llmService';
import { useAuth } from '../../context/AuthContext';
import Header from './components/Header';
import Features from './components/Features';
import { UploadContainer } from './ModernFileUpload.styles';
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

	// Enhanced state for better UX
	const [generatedQuestions, setGeneratedQuestions] = useState(null);
	const [showQuizOptionsDialog, setShowQuizOptionsDialog] = useState(false);
	const [mounted, setMounted] = useState(false);

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

	// Enhanced mount effect with staggered animations
	useEffect(() => {
		const timer = setTimeout(() => setMounted(true), 100);
		LLMService.preloadApiConfig().catch(console.error);
		return () => clearTimeout(timer);
	}, []);

	// Enhanced loading helpers with better feedback
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
		setGeneratedQuestions(null);
		setShowQuizOptionsDialog(false);
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

	// Enhanced AI processing with better error handling and user feedback
	const processFileForAI = useCallback(
		async (file, preExtractedText) => {
			if (busyRef.current) return;
			setError(null);

			try {
				// Enhanced credit checking with better messaging
				if (!isPremium && !isAdmin && credits <= 0) {
					setError(
						'No credits remaining. Upgrade to Premium for unlimited access or wait 24 hours for daily credit reset.'
					);
					return;
				}

				// Enhanced API key validation
				if (!apiKey && !sessionStorage.getItem('llm_apiKey')) {
					setError(
						'API configuration required. Please configure your AI provider in Settings to continue.'
					);
					return;
				}

				// Start AI processing with enhanced feedback
				startLoading('analyzing', 'Analyzing document content...');

				try {
					const llmService = new LLMService();

					updateLoadingStage('analyzing', 'Processing text content...', 25, {
						textExtracted: preExtractedText?.length || 0,
					});

					// Credit validation with better UX
					updateLoadingStage('validating', 'Validating credits...', 35);

					const canUseCredit = await useCredit();
					if (!canUseCredit) {
						throw new Error(
							'Insufficient credits. You need at least 1 credit to generate a quiz.'
						);
					}

					let creditDeducted = true;

					try {
						// Enhanced AI generation with progress updates
						updateLoadingStage(
							'generating',
							'AI is crafting personalized quiz questions...',
							50
						);

						const questions = await llmService.generateQuizQuestions(
							preExtractedText,
							aiOptions
						);

						// Success feedback with celebration
						updateLoadingStage(
							'finalizing',
							`Successfully generated ${questions.length} questions! 🎉`,
							90,
							{ questionsGenerated: questions.length }
						);

						updateLoadingStage('complete', 'Quiz ready for review!', 100);
						
						// Smooth transition to dialog
						setTimeout(() => {
							setGeneratedQuestions(questions);
							setShowQuizOptionsDialog(true);
							stopLoading();
						}, 1200);

					} catch (apiError) {
						// Enhanced error handling with credit refund
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

				// Enhanced error messaging with actionable suggestions
				let userMessage = err?.message || 'Failed to process file. Please try again.';

				if (userMessage.includes('API key')) {
					userMessage = '🔑 API key missing. Please configure your AI provider in Settings.';
				} else if (
					userMessage.includes('network') ||
					userMessage.includes('timeout') ||
					userMessage.includes('503') ||
					userMessage.includes('overloaded') ||
					userMessage.includes('Service Unavailable')
				) {
					userMessage = '🌐 AI service temporarily unavailable. Credit refunded. Please retry in a moment.';
				} else if (
					userMessage.includes('API failed') ||
					userMessage.includes('500') ||
					userMessage.includes('502') ||
					userMessage.includes('504')
				) {
					userMessage = '⚠️ Server error occurred. Credit refunded. Please try again.';
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

	// Enhanced quiz generation with better validation
	const handleGenerateQuiz = useCallback(async () => {
		if (!selectedFile) {
			setError('📁 Please select a file to generate quiz questions.');
			return;
		}

		if (fileReadStatus === 'reading') {
			setError('⏳ File is still being processed. Please wait...');
			return;
		}

		if (fileReadStatus === 'error') {
			setError('❌ File reading failed. Please try a different file or format.');
			return;
		}

		if (!extractedText?.trim()) {
			setError('📄 No text content found. Please try a file with readable text.');
			return;
		}

		try {
			await processFileForAI(selectedFile, extractedText);
		} catch (error) {
			console.error('Quiz generation failed:', error);
			setError(error.message);
		}
	}, [selectedFile, extractedText, fileReadStatus, processFileForAI]);

	// Enhanced non-AI upload handling
	const handleNonAIUpload = useCallback(() => {
		if (selectedFile && !useAI) {
			onFileUpload(selectedFile, false, null);
		}
	}, [selectedFile, useAI, onFileUpload]);

	// Auto-upload for non-AI files with smooth transition
	useEffect(() => {
		if (selectedFile && !useAI && fileReadStatus === 'ready') {
			const timer = setTimeout(handleNonAIUpload, 300);
			return () => clearTimeout(timer);
		}
	}, [selectedFile, useAI, fileReadStatus, handleNonAIUpload]);

	// Enhanced quiz handling
	const handleStartInteractiveQuiz = useCallback(() => {
		if (generatedQuestions) {
			onFileUpload(generatedQuestions, true, aiOptions);
		}
	}, [generatedQuestions, onFileUpload, aiOptions]);

	const handleCloseQuizOptions = useCallback(() => {
		setShowQuizOptionsDialog(false);
	}, []);

	// Enhanced drag and drop with better feedback
	const handleDrop = useCallback(
		(e) => {
			e.preventDefault();
			setDragOver(false);
			if (e.dataTransfer.files.length && !effectiveLoading) {
				handleFileSelect(e.dataTransfer.files[0]);
			}
		},
		[handleFileSelect, effectiveLoading]
	);

	const handleDragOver = useCallback((e) => {
		e.preventDefault();
		if (!effectiveLoading) {
			setDragOver(true);
		}
	}, [effectiveLoading]);

	const handleDragLeave = useCallback((e) => {
		e.preventDefault();
		if (!e.currentTarget.contains(e.relatedTarget)) {
			setDragOver(false);
		}
	}, []);

	// Enhanced keyboard navigation
	const handleKeyDown = useCallback(
		(e) => {
			if ((e.key === 'Enter' || e.key === ' ') && !effectiveLoading) {
				e.preventDefault();
				if (fileInputRef.current) {
					fileInputRef.current.click();
				}
			}
		},
		[effectiveLoading]
	);

	return (
		<UploadContainer maxWidth='lg'>
			<Fade in={mounted} timeout={800}>
				<Stack spacing={{ xs: 2, sm: 3, md: 4, lg: 5 }}>
					<Zoom in={mounted} timeout={600} style={{ transitionDelay: '200ms' }}>
						<div>
							<Header />
						</div>
					</Zoom>
					
					<Zoom in={mounted} timeout={600} style={{ transitionDelay: '400ms' }}>
						<div>
							<Features />
						</div>
					</Zoom>

					<Zoom in={mounted} timeout={600} style={{ transitionDelay: '600ms' }}>
						<div>
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
								generatedQuestions={generatedQuestions}
								showQuizOptionsDialog={showQuizOptionsDialog}
								onCloseQuizOptions={handleCloseQuizOptions}
								onStartInteractiveQuiz={handleStartInteractiveQuiz}
							/>
						</div>
					</Zoom>
				</Stack>
			</Fade>
		</UploadContainer>
	);
};

export default ModernFileUpload;