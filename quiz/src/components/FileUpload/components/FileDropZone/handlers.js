// src/components/FileDropZone/handlers.js
export const createHandlers = ({
	fileName,
	effectiveLoading,
	fileInputRef,
	onFileSelect,
	onDrop,
	onDragOver,
	onDragLeave,
	setError,
	setShowQuizOptions, // This is now optional (can be null)
	onGenerateQuiz,
	onStartInteractiveQuiz, // NEW: Handler for starting interactive quiz
}) => {
	const handleCloseError = () => {
		setError(null);
	};

	const handleDropZoneClick = () => {
		if (fileInputRef.current && !effectiveLoading) {
			fileInputRef.current.click();
		}
	};

	const handleFileInputChange = (e) => {
		const file = e.target.files?.[0];
		if (file) {
			onFileSelect(file);
		}
	};

	const handleDrop = (e) => {
		e.preventDefault();
		onDrop(e);
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		onDragOver(e);
	};

	const handleDragLeave = (e) => {
		e.preventDefault();
		onDragLeave(e);
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			if (!effectiveLoading) {
				handleDropZoneClick();
			}
		}
	};

	// MODIFIED: Now directly triggers quiz generation instead of showing dialog
	const handleGenerateQuizClick = () => {
		if (!fileName || effectiveLoading) return;
		
		// Call the quiz generation function directly
		onGenerateQuiz();
	};

	// NEW: Handler for interactive quiz (called from dialog)
	const handleInteractiveQuiz = () => {
		if (onStartInteractiveQuiz) {
			onStartInteractiveQuiz();
		}
	};

	return {
		handleCloseError,
		handleDropZoneClick,
		handleFileInputChange,
		handleDrop,
		handleDragOver,
		handleDragLeave,
		handleKeyDown,
		handleGenerateQuizClick,
		handleInteractiveQuiz,
	};
};