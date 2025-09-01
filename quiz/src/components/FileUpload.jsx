import { useState, useRef } from 'react';
import { LLMService } from '../utils/llmService';

const FileUpload = ({ onFileUpload, hasAI, loading: loadingFromParent = false, onReconfigure }) => {
  const [dragOver, setDragOver] = useState(false);
  const [useAI, setUseAI] = useState(hasAI);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const busyRef = useRef(false); // prevent re-entrancy

  const [aiOptions, setAiOptions] = useState({
    numQuestions: 10,
    difficulty: 'medium',
  });

  const startLoading = () => { setError(null); setIsLoading(true); busyRef.current = true; };
  const stopLoading = () => { setIsLoading(false); busyRef.current = false; };

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragOver(false); };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) handleFileSelect(files[0]);
  };

  const handleFileSelect = async (file) => {
    if (busyRef.current) return; // ignore while processing
    setError(null);

    try {
      if (!file) return;

      // If AI is off, just hand file up to parent
      if (!useAI) {
        onFileUpload(file, false, null);
        return;
      }

      const apiKey = localStorage.getItem('geminiApiKey');
      if (!apiKey || apiKey.trim().length < 8) {
        setError('Please configure your API key first.');
        return;
      }

      startLoading();

      const llmService = new LLMService(
        apiKey,
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
      );

      const questions = await llmService.generateQuizQuestions(file, aiOptions);
      onFileUpload(questions, true, aiOptions);
    } catch (err) {
      console.error('Error processing file:', err);
      setError(err?.message || 'Failed to process file.');
    } finally {
      stopLoading();
    }
  };

  const handleTextSubmit = async (textContent) => {
    // If you also keep a manual text mode elsewhere, call this with content.
    if (busyRef.current) return;
    setError(null);

    try {
      const apiKey = localStorage.getItem('geminiApiKey');
      if (!apiKey || apiKey.trim().length < 8) {
        setError('Please configure your API key first.');
        return;
      }

      if (!textContent || !textContent.trim()) {
        setError('Please paste some content first.');
        return;
      }

      startLoading();

      const llmService = new LLMService(
        apiKey,
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
      );

      const questions = await llmService.generateQuizQuestions(textContent, aiOptions);
      onFileUpload(questions, true, aiOptions);
    } catch (err) {
      console.error('Error processing text:', err);
      setError(err?.message || 'Failed to process text.');
    } finally {
      stopLoading();
    }
  };

  const handleReconfigure = (e) => {
    e.preventDefault();
    if (typeof onReconfigure === 'function') onReconfigure();
  };

  const effectiveLoading = isLoading || loadingFromParent;

  return (
    <div className="upload-container">
      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => setError(null)} aria-label="Dismiss error">✕</button>
        </div>
      )}

      {hasAI && (
        <div className="ai-config-panel">
          <div className="panel-header">
            <span className="icon">⚙️</span>
            <h3>AI Generation Settings</h3>
          </div>

          <div className="ai-toggle">
            <label className="switch">
              <input
                type="checkbox"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                disabled={effectiveLoading}
              />
              <span className="slider"></span>
            </label>
            <span className="toggle-label">Use AI Generation</span>
          </div>

          {useAI && (
            <div className="ai-controls">
              <div className="control-group">
                <label>
                  <span className="icon">🔢</span>
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={aiOptions.numQuestions}
                  onChange={(e) =>
                    setAiOptions((prev) => ({
                      ...prev,
                      numQuestions: Number(e.target.value || 10),
                    }))
                  }
                  className="number-input"
                  disabled={effectiveLoading}
                />
              </div>

              <div className="control-group">
                <label>
                  <span className="icon">🎚️</span>
                  Difficulty Level
                </label>
                <select
                  value={aiOptions.difficulty}
                  onChange={(e) =>
                    setAiOptions((prev) => ({
                      ...prev,
                      difficulty: e.target.value,
                    }))
                  }
                  className="select-input"
                  disabled={effectiveLoading}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          )}

          <button
            onClick={handleReconfigure}
            className="btn btn-secondary"
            type="button"
            disabled={effectiveLoading}
          >
            <span className="icon">🔐</span>
            Configure API
          </button>
        </div>
      )}

      <div
        className={`dropzone ${dragOver ? 'drag-active' : ''} ${effectiveLoading ? 'loading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !effectiveLoading && document.getElementById('file-input')?.click()}
        role="button"
        tabIndex={0}
      >
        {effectiveLoading ? (
          <div className="loading-state">
            <div className="spinner" aria-hidden="true"></div>
            <h3>Generating MCQs…</h3>
            <p>We’re analyzing your document and creating questions.</p>
          </div>
        ) : (
          <div className="upload-content">
            <span className="upload-icon">📁</span>
            <h3>Upload Your Document</h3>
            <p>Drag & drop your file here or click to browse</p>
            <div className="supported-formats">
              <span>Supported formats:</span>
              <div className="format-tags">
                <span className="format-tag">PDF</span>
                <span className="format-tag">DOCX</span>
                <span className="format-tag">TXT</span>
                <span className="format-tag">HTML</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <input
        id="file-input"
        type="file"
        className="file-input"
        accept=".txt,.docx,.html,.pdf"
        onChange={(e) => {
          const file = e.target.files && e.target.files[0];
          if (file) handleFileSelect(file);
          e.target.value = ''; // allow re-upload same file
        }}
        disabled={effectiveLoading}
      />
    </div>
  );
};

export default FileUpload;
