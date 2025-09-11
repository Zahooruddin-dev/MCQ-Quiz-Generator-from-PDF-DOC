import React, { useState, useRef, useCallback } from 'react';
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

				const effectiveApiKey = apiKey || localStorage.getItem('geminiApiKey');
				if (!effectiveApiKey || effectiveApiKey.trim().length < 8) {
					setError(
						'Please configure your API key first. Click the settings button to get started.'
					);
					return;
				}

				startLoading();
				const progressInterval = simulateProgress();

				try {
					const llmService = new LLMService(effectiveApiKey, baseUrl);
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
			apiKey,
			baseUrl,
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
		setDragOver(false);
	}, []);

	return (
		<UploadContainer maxWidth='md'>
			<Stack spacing={4}>
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
					baseUrl={baseUrl}
					onFileUpload={onFileUpload}
				/>
			</Stack>
		</UploadContainer>
	);
};

export default ModernFileUpload;
