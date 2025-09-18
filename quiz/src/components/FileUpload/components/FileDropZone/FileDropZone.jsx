// src/components/FileDropZone.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';

import { FileIcon, LoadingOverlay, pulse } from '../../ModernFileUpload.styles';
import { formatBytes, MAX_FILE_SIZE } from '../../utils';
import { getStageIcon, getStageColor } from './getStage';
import { createHandlers } from './handlers';
import DropZoneContent from './DropZoneContent';
import { getFileIcon } from './getFileIcon';
import QuizOptionsDialog from './QuizOptionsDialog';

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
	fileReadStatus = 'none',
	extractedText = '',
	generatedQuestions = null,
	showQuizOptionsDialog = false,
	onCloseQuizOptions,
	onStartInteractiveQuiz,
}) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const isTablet = useMediaQuery(theme.breakpoints.down('md'));

	// Memoize handlers to prevent unnecessary re-renders
	const handlers = useMemo(
		() =>
			createHandlers({
				fileName,
				effectiveLoading,
				fileInputRef,
				onFileSelect,
				onDrop,
				onDragOver,
				onDragLeave,
				setError,
				setShowQuizOptions: null,
				onGenerateQuiz,
				onStartInteractiveQuiz,
			}),
		[
			fileName,
			effectiveLoading,
			fileInputRef,
			onFileSelect,
			onDrop,
			onDragOver,
			onDragLeave,
			setError,
			onGenerateQuiz,
			onStartInteractiveQuiz,
		]
	);

	const {
		handleCloseError,
		handleDropZoneClick,
		handleFileInputChange,
		handleDrop,
		handleDragOver,
		handleDragLeave,
		handleKeyDown,
		handleGenerateQuizClick,
	} = handlers;

	// Memoize stage data
	const stageData = useMemo(
		() => ({
			icon: getStageIcon(loadingStage),
			color: getStageColor(loadingStage),
		}),
		[loadingStage]
	);

	// Memoize processing details with defaults
	const safeDetails = useMemo(
		() =>
			processingDetails || {
				textExtracted: 0,
				ocrConfidence: null,
				questionsGenerated: 0,
			},
		[processingDetails]
	);

	// Generate mock questions with better performance
	const generateMockQuestions = useCallback((text) => {
		if (!text || text.length < 100) {
			return [];
		}

		const sentences = text
			.split(/[.!?]+/)
			.filter((s) => s.trim().length > 20)
			.slice(0, 10);

		return sentences.map((sentence, index) => ({
			id: index + 1,
			question: `Based on the content: ${sentence.trim().substring(0, 80)}...?`,
			options: [
				'Option A (Mock)',
				'Option B (Mock)',
				'Option C (Mock)',
				'Option D (Mock)',
			],
			correctAnswer: 0,
			explanation:
				'This is a mock question generated from your document content.',
			type: 'multiple-choice',
		}));
	}, []);

	// Memoize quiz data
	const quizData = useMemo(() => {
		const baseTitle = fileName ? fileName.replace(/\.[^/.]+$/, '') : 'Quiz';
		const totalQuestions = generatedQuestions
			? generatedQuestions.length
			: Math.min(Math.max(Math.floor(extractedText.length / 200), 5), 20);

		return {
			title: baseTitle,
			totalQuestions,
			difficulty: 'Medium',
			extractedText: extractedText,
			questions: generatedQuestions || generateMockQuestions(extractedText),
		};
	}, [fileName, generatedQuestions, extractedText, generateMockQuestions]);

	// Memoize disabled state
	const isQuizGenerationDisabled = useMemo(
		() =>
			effectiveLoading ||
			fileReadStatus === 'reading' ||
			fileReadStatus === 'error' ||
			!extractedText,
		[effectiveLoading, fileReadStatus, extractedText]
	);


	return (
		<>
			<DropZoneContent
				dragOver={dragOver}
				fileName={fileName}
				fileSize={fileSize}
				fileType={fileType}
				fileReadStatus={fileReadStatus}
				error={error}
				effectiveLoading={effectiveLoading}
				uploadProgress={uploadProgress}
				loadingStage={loadingStage}
				stageColor={stageData.color}
				stageMessage={stageMessage}
				safeDetails={safeDetails}
				fileInputRef={fileInputRef}
				onClear={onClear}
				handleDrop={handleDrop}
				handleDragOver={handleDragOver}
				handleDragLeave={handleDragLeave}
				handleDropZoneClick={handleDropZoneClick}
				handleKeyDown={handleKeyDown}
				handleFileInputChange={handleFileInputChange}
				handleCloseError={handleCloseError}
				handleGenerateQuizClick={handleGenerateQuizClick}
				useAI={useAI}
				isQuizGenerationDisabled={isQuizGenerationDisabled}
				pulse={pulse}
				StageIcon={stageData.icon}
				formatBytes={formatBytes}
				MAX_FILE_SIZE={MAX_FILE_SIZE}
				FileIcon={FileIcon}
				LoadingOverlay={LoadingOverlay}
				getFileIcon={getFileIcon}
			/>

			{/* Enhanced Mobile-Friendly Quiz Options Dialog */}

			<QuizOptionsDialog
				open={showQuizOptionsDialog}
				onClose={onCloseQuizOptions}
				isMobile={isMobile}
				generatedQuestions={generatedQuestions}
				onStartInteractiveQuiz={onStartInteractiveQuiz}
				quizData={quizData}
			/>
		</>
	);
};

export default React.memo(FileDropZone);
