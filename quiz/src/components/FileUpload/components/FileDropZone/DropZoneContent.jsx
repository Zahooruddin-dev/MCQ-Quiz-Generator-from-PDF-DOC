// src/components/FileDropZone/DropZoneContent.jsx
import React, { useMemo, useCallback } from 'react';
import {
	Box,
	Typography,
	Button,
	Stack,
	LinearProgress,
	Snackbar,
	Alert,
	useTheme,
	useMediaQuery,
	Fade,
	Grow,
} from '@mui/material';
import { Upload, X, Brain, FileText, AlertCircle } from 'lucide-react';
import { DropZone } from '../../ModernFileUpload.styles';

const DropZoneContent = ({
	dragOver,
	fileName,
	fileSize,
	fileType,
	fileReadStatus,
	error,
	effectiveLoading,
	uploadProgress,
	loadingStage,
	stageColor,
	stageMessage,
	safeDetails,
	fileInputRef,
	onClear,
	handleDrop,
	handleDragOver,
	handleDragLeave,
	handleDropZoneClick,
	handleKeyDown,
	handleFileInputChange,
	handleCloseError,
	handleGenerateQuizClick,
	useAI,
	isQuizGenerationDisabled,
	pulse,
	StageIcon,
	formatBytes,
	MAX_FILE_SIZE,
	FileIcon,
	LoadingOverlay,
	getFileIcon,
}) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const isTablet = useMediaQuery(theme.breakpoints.down('md'));

	// Memoize stage title for better performance
	const stageTitle = useMemo(() => {
		const stages = {
			reading: 'Reading Document',
			processing: 'Processing Content',
			ocr: 'Extracting Text',
			analyzing: 'Analyzing Content',
			generating: 'Generating Questions',
			finalizing: 'Finalizing Quiz',
			complete: 'Complete!',
		};
		return stages[loadingStage] || 'Processing Your Content';
	}, [loadingStage]);

	// Memoize file browse handler
	const handleBrowseClick = useCallback((e) => {
		e.stopPropagation();
		fileInputRef.current?.click();
	}, [fileInputRef]);

	// Memoize generate quiz handler
	const handleQuizClick = useCallback((e) => {
		e.stopPropagation();
		handleGenerateQuizClick(e);
	}, [handleGenerateQuizClick]);

	// Memoize clear handler
	const handleClearClick = useCallback((e) => {
		e.stopPropagation();
		onClear();
	}, [onClear]);

	// Memoize processing details display
	const ProcessingDetails = useMemo(() => {
		const hasDetails = safeDetails.textExtracted > 0 || 
			safeDetails.ocrConfidence || 
			safeDetails.questionsGenerated > 0;

		if (!hasDetails) return null;

		return (
			<Fade in={true} timeout={500}>
				<Box sx={{ mb: 2, textAlign: 'center' }}>
					<Stack
						direction={isMobile ? 'column' : 'row'}
						spacing={isMobile ? 1 : 2}
						justifyContent="center"
						alignItems="center"
						flexWrap="wrap"
						sx={{ gap: 1 }}
					>
						{typeof safeDetails.ocrConfidence === 'number' && (
							<Typography
								variant="caption"
								sx={{
									bgcolor: 'rgba(255,255,255,0.15)',
									backdropFilter: 'blur(10px)',
									px: isMobile ? 1.5 : 2,
									py: 0.75,
									borderRadius: 2,
									color: 'white',
									fontWeight: 500,
									fontSize: isMobile ? '0.7rem' : '0.75rem',
									display: 'flex',
									alignItems: 'center',
									gap: 0.5,
									border: '1px solid rgba(255,255,255,0.1)',
								}}
							>
								👁️ {Math.round(safeDetails.ocrConfidence)}% confidence
							</Typography>
						)}
						{safeDetails.questionsGenerated > 0 && (
							<Typography
								variant="caption"
								sx={{
									bgcolor: 'rgba(255,255,255,0.15)',
									backdropFilter: 'blur(10px)',
									px: isMobile ? 1.5 : 2,
									py: 0.75,
									borderRadius: 2,
									color: 'white',
									fontWeight: 500,
									fontSize: isMobile ? '0.7rem' : '0.75rem',
									display: 'flex',
									alignItems: 'center',
									gap: 0.5,
									border: '1px solid rgba(255,255,255,0.1)',
								}}
							>
								🧠 {safeDetails.questionsGenerated} questions created
							</Typography>
						)}
						{safeDetails.textExtracted > 0 && (
							<Typography
								variant="caption"
								sx={{
									bgcolor: 'rgba(255,255,255,0.15)',
									backdropFilter: 'blur(10px)',
									px: isMobile ? 1.5 : 2,
									py: 0.75,
									borderRadius: 2,
									color: 'white',
									fontWeight: 500,
									fontSize: isMobile ? '0.7rem' : '0.75rem',
									display: 'flex',
									alignItems: 'center',
									gap: 0.5,
									border: '1px solid rgba(255,255,255,0.1)',
								}}
							>
								📄 {safeDetails.textExtracted} chars extracted
							</Typography>
						)}
					</Stack>
				</Box>
			</Fade>
		);
	}, [safeDetails, isMobile]);

	// Memoize file status indicator
	const FileStatus = useMemo(() => {
		if (fileReadStatus === 'error') {
			return (
				<Stack 
					direction="row" 
					spacing={1} 
					alignItems="center"
					sx={{ 
						color: 'error.main',
						bgcolor: 'error.50',
						px: 2,
						py: 1,
						borderRadius: 2,
						mt: 1,
					}}
				>
					<AlertCircle size={16} />
					<Typography variant="caption" sx={{ fontWeight: 500 }}>
						Error reading file
					</Typography>
				</Stack>
			);
		}
		
		if (fileReadStatus === 'reading') {
			return (
				<Stack 
					direction="row" 
					spacing={1} 
					alignItems="center"
					sx={{ 
						color: 'info.main',
						bgcolor: 'info.50',
						px: 2,
						py: 1,
						borderRadius: 2,
						mt: 1,
					}}
				>
					<FileText size={16} />
					<Typography variant="caption" sx={{ fontWeight: 500 }}>
						Reading file...
					</Typography>
				</Stack>
			);
		}

		return null;
	}, [fileReadStatus]);

	return (
		<DropZone
			isDragActive={dragOver}
			hasFile={!!fileName}
			onDrop={handleDrop}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onClick={handleDropZoneClick}
			role="button"
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
				minHeight: isMobile ? 200 : 280,
				padding: isMobile ? theme.spacing(2) : theme.spacing(3),
				transition: 'all 0.3s ease',
				border: dragOver ? 
					`2px dashed ${theme.palette.primary.main}` : 
					`2px dashed ${theme.palette.divider}`,
				borderRadius: isMobile ? 2 : 3,
				'&:hover': {
					borderColor: !fileName && !effectiveLoading ? 'primary.main' : 'divider',
					bgcolor: !fileName && !effectiveLoading ? 'primary.50' : 'transparent',
				},
				'&:focus-visible': {
					outline: `2px solid ${theme.palette.primary.main}`,
					outlineOffset: 2,
				},
			}}
		>
			{/* LOADING STATE - Enhanced for Mobile */}
			{effectiveLoading && (
				<LoadingOverlay
					sx={{
						padding: isMobile ? 2 : 3,
					}}
				>
					<Grow in={true} timeout={800}>
						<Box
							sx={{
								width: isMobile ? 60 : 80,
								height: isMobile ? 60 : 80,
								borderRadius: '50%',
								background: `linear-gradient(135deg, ${stageColor} 0%, #6366F1 100%)`,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: 'white',
								mb: isMobile ? 2 : 3,
								animation: `${pulse} 1.5s infinite`,
								boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
							}}
						>
							<StageIcon size={isMobile ? 24 : 32} />
						</Box>
					</Grow>

					<Typography
						variant={isMobile ? 'subtitle1' : 'h6'}
						sx={{ 
							mb: 1, 
							fontWeight: 600, 
							textAlign: 'center',
							fontSize: isMobile ? '1.1rem' : '1.25rem',
						}}
					>
						{stageTitle}
					</Typography>

					<Typography
						variant="body2"
						sx={{
							color: 'text.secondary',
							mb: isMobile ? 2 : 3,
							textAlign: 'center',
							minHeight: isMobile ? '2em' : '2.5em',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontSize: isMobile ? '0.85rem' : '0.875rem',
							lineHeight: 1.4,
							px: isMobile ? 1 : 0,
						}}
					>
						{stageMessage || 'Please wait while we process your file...'}
					</Typography>

					{/* Processing details */}
					{ProcessingDetails}

					<Box sx={{ width: '100%', maxWidth: isMobile ? 280 : 400 }}>
						<LinearProgress
							variant="determinate"
							value={uploadProgress}
							sx={{
								height: isMobile ? 6 : 8,
								borderRadius: 4,
								bgcolor: 'rgba(255,255,255,0.2)',
								'& .MuiLinearProgress-bar': {
									background: `linear-gradient(90deg, ${stageColor} 0%, #6366F1 100%)`,
									borderRadius: 4,
								},
							}}
						/>
						<Typography
							variant="caption"
							sx={{
								mt: 1,
								display: 'block',
								textAlign: 'center',
								color: 'white',
								fontWeight: 500,
								fontSize: isMobile ? '0.75rem' : '0.8rem',
							}}
						>
							{Math.round(uploadProgress)}% Complete
						</Typography>
					</Box>
				</LoadingOverlay>
			)}

			{/* NO FILE YET - Enhanced for Mobile */}
			{!fileName ? (
				<Fade in={!effectiveLoading} timeout={300}>
					<Box sx={{ textAlign: 'center' }}>
						<FileIcon
							sx={{
								mb: isMobile ? 1.5 : 2,
								fontSize: isMobile ? '2.5rem' : '3rem',
								color: dragOver ? 'primary.main' : 'text.secondary',
								transition: 'all 0.3s ease',
							}}
						>
							<Upload size={isMobile ? 28 : 36} />
						</FileIcon>
						
						<Typography 
							variant={isMobile ? 'subtitle1' : 'h6'} 
							sx={{ 
								mb: 1, 
								fontWeight: 600,
								fontSize: isMobile ? '1.1rem' : '1.25rem',
								px: isMobile ? 1 : 0,
							}}
						>
							{isMobile ? 'Drop your file here' : 'Drag & drop your study material here'}
						</Typography>
						
						<Typography 
							variant="body2" 
							sx={{ 
								mb: isMobile ? 2 : 3, 
								color: 'text.secondary',
								fontSize: isMobile ? '0.85rem' : '0.875rem',
								px: isMobile ? 1 : 0,
								lineHeight: 1.4,
							}}
						>
							Supports PDF, DOCX, TXT, HTML
							{!isMobile && ` (Max ${formatBytes(MAX_FILE_SIZE)})`}
						</Typography>
						
						<Button
							variant="contained"
							startIcon={<Upload size={isMobile ? 18 : 20} />}
							onClick={handleBrowseClick}
							sx={{ 
								borderRadius: 2,
								px: isMobile ? 3 : 4,
								py: isMobile ? 1 : 1.5,
								fontSize: isMobile ? '0.9rem' : '1rem',
								fontWeight: 600,
								boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
								'&:hover': {
									boxShadow: '0 6px 20px rgba(99, 102, 241, 0.5)',
									transform: 'translateY(-1px)',
								},
							}}
							aria-label="Browse files to upload"
						>
							{isMobile ? 'Browse' : 'Browse Files'}
						</Button>
						
						{isMobile && (
							<Typography 
								variant="caption" 
								sx={{ 
									mt: 1.5,
									display: 'block',
									color: 'text.secondary',
									fontSize: '0.75rem',
								}}
							>
								Max {formatBytes(MAX_FILE_SIZE)}
							</Typography>
						)}
					</Box>
				</Fade>
			) : (
				<Fade in={!effectiveLoading} timeout={300}>
					<Box sx={{ textAlign: 'center' }}>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								mb: isMobile ? 1.5 : 2,
							}}
						>
							<FileIcon
								sx={{
									mr: isMobile ? 1 : 1.5,
									fontSize: isMobile ? '2rem' : '2.5rem',
								}}
							>
								{getFileIcon(fileType)}
							</FileIcon>
							<Box sx={{ textAlign: 'left' }}>
								<Typography 
									variant={isMobile ? 'subtitle2' : 'h6'} 
									sx={{ 
										fontWeight: 600,
										fontSize: isMobile ? '1rem' : '1.25rem',
										wordBreak: 'break-word',
										maxWidth: isMobile ? 200 : 300,
									}}
								>
									{fileName}
								</Typography>
								{fileSize && (
									<Typography 
										variant="caption" 
										sx={{ 
											color: 'text.secondary',
											fontSize: isMobile ? '0.75rem' : '0.8rem',
										}}
									>
										{formatBytes(fileSize)}
									</Typography>
								)}
							</Box>
						</Box>

						{FileStatus}

						<Stack
							direction={isMobile ? 'column' : 'row'}
							spacing={isMobile ? 1.5 : 2}
							justifyContent="center"
							sx={{ mt: isMobile ? 2 : 2.5 }}
						>
							{useAI && (
								<Button
									variant="contained"
									startIcon={<Brain size={isMobile ? 18 : 20} />}
									onClick={handleQuizClick}
									disabled={isQuizGenerationDisabled}
									sx={{ 
										borderRadius: 2,
										px: isMobile ? 3 : 4,
										py: isMobile ? 1 : 1.5,
										fontSize: isMobile ? '0.9rem' : '1rem',
										fontWeight: 600,
										minWidth: isMobile ? 120 : 140,
										boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
										'&:hover': {
											boxShadow: '0 6px 20px rgba(99, 102, 241, 0.5)',
											transform: 'translateY(-1px)',
										},
										'&:disabled': {
											boxShadow: 'none',
											transform: 'none',
										},
									}}
								>
									{fileReadStatus === 'reading'
										? 'Reading...'
										: isMobile ? 'Quiz' : 'Generate Quiz'}
								</Button>
							)}
							<Button
								variant="outlined"
								startIcon={<X size={isMobile ? 18 : 20} />}
								onClick={handleClearClick}
								disabled={effectiveLoading}
								sx={{ 
									borderRadius: 2,
									px: isMobile ? 3 : 4,
									py: isMobile ? 1 : 1.5,
									fontSize: isMobile ? '0.9rem' : '1rem',
									fontWeight: 600,
									minWidth: isMobile ? 100 : 120,
									'&:hover': {
										transform: 'translateY(-1px)',
									},
									'&:disabled': {
										transform: 'none',
									},
								}}
							>
								Remove
							</Button>
						</Stack>
					</Box>
				</Fade>
			)}

			{/* File input */}
			<input
				type="file"
				ref={fileInputRef}
				style={{ display: 'none' }}
				onChange={handleFileInputChange}
				accept=".pdf,.doc,.docx,.txt,.html"
				aria-hidden="true"
				tabIndex={-1}
			/>

			{/* Enhanced Error Snackbar */}
			<Snackbar
				open={!!error}
				autoHideDuration={7000}
				onClose={handleCloseError}
				anchorOrigin={{ 
					vertical: isMobile ? 'bottom' : 'top', 
					horizontal: 'center' 
				}}
				sx={{
					'& .MuiSnackbarContent-root': {
						borderRadius: 2,
					},
				}}
			>
				<Alert
					onClose={handleCloseError}
					severity="error"
					sx={{ 
						width: '100%',
						borderRadius: 2,
						fontSize: isMobile ? '0.85rem' : '0.875rem',
					}}
					variant="filled"
				>
					{error}
				</Alert>
			</Snackbar>
		</DropZone>
	);
};

export default React.memo(DropZoneContent);