import React, { useState, useRef, useCallback } from 'react';
import {
	Box,
	Typography,
	Button,
	CardContent,
	Stack,
	Alert,
	LinearProgress,
	IconButton,
	Divider,
	Switch,
	FormControlLabel,
	TextField,
	Fade,
	Collapse,
} from '@mui/material';
import {
	Upload,
	FileText,
	Brain,
	Settings,
	X,
	File,
	FileType,
	Sparkles,
	Type,
} from 'lucide-react';
import { LLMService } from '../../utils/llmService';
import { MAX_FILE_SIZE, SUPPORTED, formatBytes } from './utils';
import Header from './components/Header';
import Features from './components/Features';
import {
	UploadContainer,
	MainCard,
	DropZone,
	FileIcon,
	LoadingOverlay,
	pulse,
} from './ModernFileUpload.styles';
import TextModeInput from './components/TextModeInput';
import FileDropZone from './components/FileDropZone';
import ConfigPanel from "./components/ConfigPanel";
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

	const handleFileSelect = useCallback(
		async (file) => {
			if (busyRef.current) return;
			setError(null);

			try {
				if (!file) return;

				setFileName(file.name || 'uploaded-file');
				setFileSize(file.size || null);
				setFileType(file.type || '');
				setSelectedFile(file);

				if (file.size && file.size > MAX_FILE_SIZE) {
					setError(
						`File is too large (${formatBytes(
							file.size
						)}). Maximum allowed size is ${formatBytes(MAX_FILE_SIZE)}.`
					);
					clearSelectedFile();
					return;
				}

				const mime = (file.type || '').toLowerCase();
				const isSupported =
					SUPPORTED.some((s) => mime.includes(s)) ||
					/\.(pdf|docx?|txt|html)$/i.test(file.name || '');

				if (!isSupported) {
					setError(
						'Unsupported file type. Please upload PDF, DOCX, TXT, or HTML files.'
					);
					clearSelectedFile();
					return;
				}

				if (!useAI) {
					await processFile(file);
				}
			} catch (err) {
				console.error('Error selecting file:', err);
				setError(err?.message || 'Failed to select file. Please try again.');
			}
		},
		[useAI, processFile, clearSelectedFile]
	);

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

				<MainCard>
					<CardContent sx={{ p: 4, position: 'relative' }}>
						{error && (
							<Fade in={!!error}>
								<Alert
									severity='error'
									sx={{ mb: 3 }}
									action={
										<IconButton size='small' onClick={() => setError(null)}>
											<X size={16} />
										</IconButton>
									}
								>
									{error}
								</Alert>
							</Fade>
						)}

						{hasAI && (
							<ConfigPanel
								hasAI={hasAI}
								apiKey={apiKey}
								loading={effectiveLoading}
								initialOptions={aiOptions}
								onOptionsChange={(opts) => setAiOptions(opts)}
								onReconfigure={handleReconfigure}
							/>
						)}
						<FileDropZone
							dragOver={dragOver}
							fileName={fileName}
							fileSize={fileSize}
							fileType={fileType}
							useAI={useAI}
							effectiveLoading={effectiveLoading}
							uploadProgress={uploadProgress}
							fileInputRef={fileInputRef}
							onDrop={handleDrop}
							onDragOver={handleDragOver}
							onDragLeave={handleDragLeave}
							onFileSelect={handleFileSelect}
							onClear={clearSelectedFile}
							onGenerateQuiz={handleGenerateQuiz}
						/>

						<Divider sx={{ my: 4 }}>or</Divider>

						{/* ✅ Self-contained text input */}
						<TextModeInput
							apiKey={apiKey}
							baseUrl={baseUrl}
							aiOptions={aiOptions}
							onQuizGenerated={(questions, options) =>
								onFileUpload(questions, true, options)
							}
						/>
					</CardContent>
				</MainCard>
			</Stack>
		</UploadContainer>
	);
};

export default ModernFileUpload;
