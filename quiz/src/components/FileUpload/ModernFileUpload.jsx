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
	const busyRef = useRef(false);
	const fileInputRef = useRef(null);

	const effectiveLoading = isLoading || loadingFromParent;

	// ----- NEW: Call preloadApiConfig on component mount -----
	useEffect(() => {
		LLMService.preloadApiConfig().catch(console.error);
	}, []); // Empty dependency array ensures it runs only once on mount
	// ---------------------------------------------------------

	const startLoading = useCallback(() => {
		setError(null);
		setIsLoading(true);
		busyRef.current = true;
		setUploadProgress(0);
	}, []);

	const stopLoading = useCallback(() => {
		setIsLoading(false);
		busyRef.current = false;
		setUploadProgress(0);
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

	const simulateProgress = useCallback(() => {
		const interval = setInterval(() => {
			setUploadProgress((prev) => {
				if (prev >= 90) {
					clearInterval(interval);
					return prev;
				}
				return prev + Math.random() * 15;
			});
		}, 200);
		return interval;
	}, []);

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

				// The ensureApiKey and ensureEndpoint calls in LLMService constructor and methods
				// will now leverage the preloaded values or fetch them if still missing.
				// We no longer explicitly check localStorage.getItem('geminiApiKey') here as LLMService handles it.
				// However, if `apiKey` prop is explicitly passed and is empty, we should still warn.
				if (!apiKey && !sessionStorage.getItem('llm_apiKey')) {
					setError(
						'Please configure your API key first. Click the settings button to get started.'
					);
					return;
				}


				startLoading();
				const progressInterval = simulateProgress();

				try {
					// Instantiate LLMService without passing apiKey/baseUrl if they are managed internally
					// The LLMService instance will use the preloaded values or fetch them.
					const llmService = new LLMService(); // No arguments needed now
					const questions = await llmService.generateQuizQuestions(
						file,
						aiOptions
					);

					setUploadProgress(100);
					setTimeout(() => {
						onFileUpload(questions, true, aiOptions);
						stopLoading();
					}, 500);
				} catch (err) {
					clearInterval(progressInterval);
					throw err;
				}
			} catch (err) {
				console.error('Error processing file:', err);
				setError(err?.message || 'Failed to process file. Please try again.');
				stopLoading();
			}
		},
		[
			useAI,
			apiKey, // Keep apiKey in dependency array if it's passed as a prop and used for initial check
			aiOptions,
			onFileUpload,
			startLoading,
			stopLoading,
			simulateProgress,
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

	const handleKeyDown = useCallback((e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			if (fileInputRef.current && !effectiveLoading) {
				fileInputRef.current.click();
			}
		}
	}, [effectiveLoading]);

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