// FileDropZone Handlers
export const createHandlers = ({
  fileName,
  effectiveLoading,
  fileInputRef,
  onFileSelect,
  onDrop,
  onDragOver,
  onDragLeave,
  setError,
  setShowQuizOptions,
  onGenerateQuiz,
  extractedText, // optional for consistency
}) => {
  // Close error snackbar
  const handleCloseError = () => {
    setError?.(null);
  };

  // Drop zone click
  const handleDropZoneClick = (e) => {
    if (fileName || effectiveLoading) {
      e.stopPropagation();
      return;
    }
    if (e.target.closest('button') || e.target.closest('input')) {
      e.stopPropagation();
      return;
    }
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  // File input change
  const handleFileInputChange = (e) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    e.target.value = ''; // reset input
  };

  // Drag events
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDrop?.(e);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDragOver?.(e);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDragLeave?.(e);
  };

  // Keyboard handler
  const handleKeyDown = (e) => {
    if (
      !fileName &&
      !effectiveLoading &&
      (e.key === 'Enter' || e.key === ' ')
    ) {
      e.preventDefault();
      e.stopPropagation();
      fileInputRef.current?.click();
    }
  };

  // Quiz generation
  const handleGenerateQuizClick = (e) => {
    e.stopPropagation();
    console.log('Generate quiz clicked, opening dialog...');
    setShowQuizOptions?.(true);
  };

  const handleInteractiveQuiz = () => {
    console.log('Interactive quiz selected');
    setShowQuizOptions?.(false);
    onGenerateQuiz?.();
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
