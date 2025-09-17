// src/components/FileDropZone/DropZoneContent.jsx
import React from 'react';
import {
	Box,
	Typography,
	Button,
	Stack,
	LinearProgress,
	Snackbar,
	Alert,
} from '@mui/material';
import { Upload, X, Brain } from 'lucide-react';
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
	return (
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
			{/* LOADING STATE */}
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

			{/* NO FILE YET */}
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

			{/* File input */}
			<input
				type='file'
				ref={fileInputRef}
				style={{ display: 'none' }}
				onChange={handleFileInputChange}
				accept='.pdf,.doc,.docx,.txt,.html'
				aria-hidden='true'
				tabIndex={-1}
			/>

			{/* Error Snackbar */}
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
	);
};

export default DropZoneContent;
