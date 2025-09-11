import React, { useState, useRef, useCallback } from 'react';
import {
	Box,
	Container,
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
	Play,
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
	ConfigPanel,
	LoadingOverlay,
	TextModeCard,
	pulse,
} from './ModernFileUpload.styles';
import { text } from 'mammoth/mammoth.browser';
import TextModeInput from './components/TextModeInput';

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
	const [showTextMode, setShowTextMode] = useState(false);
	const [pastedText, setPastedText] = useState('');
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

	const handleTextSubmit = useCallback(
		async (textContent) => {
			if (busyRef.current) return;
			setError(null);

			try {
				if (!textContent?.trim()) {
					setError('Please paste some content first.');
					return;
				}

				const wordCount = textContent.trim().split(/\s+/).length;
				if (wordCount < 10) {
					setError(
						'Please enter at least 10 words of text to generate questions.'
					);
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
						textContent,
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
				console.error('Error processing text:', err);
				setError(err?.message || 'Failed to process text. Please try again.');
				stopLoading();
			} finally {
				setPastedText('');
				setShowTextMode(false);
			}
		},
		[
			apiKey,
			baseUrl,
			aiOptions,
			onFileUpload,
			startLoading,
			stopLoading,
			simulateProgress,
		]
	);

	const getFileIcon = useCallback((type) => {
		if (type.includes('pdf')) return <FileType size={40} />;
		if (type.includes('word') || type.includes('document'))
			return <FileText size={40} />;
		if (type.includes('text')) return <Type size={40} />;
		return <File size={40} />;
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
							<ConfigPanel>
								<CardContent sx={{ p: 3 }}>
									<Stack spacing={3}>
										<Stack direction='row' alignItems='center' spacing={2}>
											<Box
												sx={{
													width: 40,
													height: 40,
													borderRadius: 1,
													background:
														'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													color: 'white',
												}}
											>
												<Settings size={20} />
											</Box>
											<Typography variant='h6' sx={{ fontWeight: 600 }}>
												AI Generation Settings
											</Typography>
										</Stack>

										<FormControlLabel
											control={
												<Switch
													checked={useAI}
													onChange={(e) => setUseAI(e.target.checked)}
													disabled={effectiveLoading}
												/>
											}
											label='Enable AI-powered question generation'
										/>

										<Collapse in={useAI}>
											<Stack spacing={3}>
												<Stack
													direction={{ xs: 'column', sm: 'row' }}
													spacing={3}
												>
													<TextField
														label='Number of Questions'
														type='number'
														value={aiOptions.numQuestions}
														onChange={(e) => {
															const val = e.target.value;
															setAiOptions((prev) => ({
																...prev,
																numQuestions: val === '' ? '' : Number(val),
															}));
														}}
														onBlur={(e) => {
															let val = Number(e.target.value);
															if (!val || val < 5) val = 5;
															if (val > 50) val = 50;
															setAiOptions((prev) => ({
																...prev,
																numQuestions: val,
															}));
														}}
														inputProps={{ min: 5, max: 50 }}
														disabled={effectiveLoading}
														sx={{ flex: 1 }}
													/>
												</Stack>

												{!apiKey && (
													<Alert severity='warning' sx={{ mt: 2 }}>
														API key not configured.
														<Button
															size='small'
															onClick={handleReconfigure}
															sx={{ ml: 1 }}
														>
															Configure Now
														</Button>
													</Alert>
												)}
											</Stack>
										</Collapse>
									</Stack>
								</CardContent>
							</ConfigPanel>
						)}

						<DropZone
							isDragActive={dragOver}
							hasFile={!!fileName}
							onDrop={handleDrop}
							onDragOver={handleDragOver}
							onDragLeave={handleDragLeave}
							onClick={() => {
								if (!fileName) {
									fileInputRef.current?.click();
								}
							}}
						>
							{effectiveLoading && (
								<LoadingOverlay>
									<Box
										sx={{
											width: 60,
											height: 60,
											borderRadius: '50%',
											background:
												'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											color: 'white',
											mb: 2,
											animation: `${pulse} 1.5s infinite`,
										}}
									>
										<Sparkles size={24} />
									</Box>
									<Typography variant='h6' sx={{ mb: 1, fontWeight: 600 }}>
										Processing Your Content
									</Typography>
									<Typography
										variant='body2'
										sx={{ color: 'text.secondary', mb: 3 }}
									>
										AI is analyzing and generating questions...
									</Typography>
									<Box sx={{ width: '100%', maxWidth: 300 }}>
										<LinearProgress
											variant='determinate'
											value={uploadProgress}
											sx={{
												height: 8,
												borderRadius: 4,
												'& .MuiLinearProgress-bar': {
													background:
														'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)',
												},
											}}
										/>
										<Typography
											variant='caption'
											sx={{ mt: 1, display: 'block', textAlign: 'center' }}
										>
											{Math.round(uploadProgress)}%
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
									<Typography
										variant='body2'
										sx={{ mb: 3, color: 'text.secondary' }}
									>
										Supports PDF, DOCX, TXT, HTML (Max{' '}
										{formatBytes(MAX_FILE_SIZE)})
									</Typography>
									<Button
										variant='contained'
										startIcon={<Upload />}
										sx={{ borderRadius: 2 }}
									>
										Browse Files
									</Button>
								</Box>
							) : (
								<Box>
									<FileIcon>{getFileIcon(fileType)}</FileIcon>
									<Typography variant='h6' sx={{ fontWeight: 600 }}>
										{fileName}
									</Typography>
									{fileSize && (
										<Typography
											variant='body2'
											sx={{ mb: 2, color: 'text.secondary' }}
										>
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
												onClick={handleGenerateQuiz}
												disabled={effectiveLoading}
												sx={{ borderRadius: 2 }}
											>
												Generate Quiz
											</Button>
										)}
										<Button
											variant='outlined'
											startIcon={<X />}
											onClick={clearSelectedFile}
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
								onChange={(e) => {
									if (e.target.files?.[0]) {
										handleFileSelect(e.target.files[0]);
									}
								}}
								accept='.pdf,.doc,.docx,.txt,.html'
							/>
						</DropZone>

						<Divider sx={{ my: 4 }}>or</Divider>

			
						<TextModeInput
							showTextMode={showTextMode}
							pastedText={pastedText}
							setPastedText={setPastedText}
							effectiveLoading={effectiveLoading}
							handleTextSubmit={handleTextSubmit}
						/>
					</CardContent>
				</MainCard>
			</Stack>
		</UploadContainer>
	);
};

export default ModernFileUpload;
