import { useState, useRef } from 'react';
import { LLMService } from '../utils/llmService';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB limit (user-friendly guard)
const SUPPORTED = ['text', 'pdf', 'msword', 'vnd.openxmlformats-officedocument.wordprocessingml.document', 'html'];

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

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

  // UX states
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(null);
  const [fileType, setFileType] = useState('');
  const [showTextMode, setShowTextMode] = useState(false);
  const [pastedText, setPastedText] = useState('');

  const effectiveLoading = isLoading || loadingFromParent;

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

      // UX immediate state so user sees file name ASAP
      setFileName(file.name || 'uploaded-file');
      setFileSize(file.size || null);
      setFileType(file.type || '');

      // client-side sanity checks
      if (file.size && file.size > MAX_FILE_SIZE) {
        setError(`File is too big (${formatBytes(file.size)}). Max allowed is ${formatBytes(MAX_FILE_SIZE)}.`);
        setFileName('');
        setFileSize(null);
        return;
      }

      // basic mime check (informal)
      const mime = (file.type || '').toLowerCase();
      const isSupported = SUPPORTED.some(s => mime.includes(s)) || /\.(pdf|docx?|txt|html)$/i.test(file.name || '');
      if (!isSupported) {
        setError('Unsupported file type. Supported: PDF, DOCX, TXT, HTML.');
        return;
      }

      // If AI is off, just hand file up to parent (no generation)
      if (!useAI) {
        onFileUpload(file, false, null);
        return;
      }

      const apiKey = localStorage.getItem('geminiApiKey');
      if (!apiKey || apiKey.trim().length < 8) {
        setError('Please configure your API key first (click Configure API).');
        return;
      }

      startLoading();

      const llmService = new LLMService(
        apiKey,
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
      );

      const questions = await llmService.generateQuizQuestions(file, aiOptions);

      // on success, hand the normalized questions to parent
      onFileUpload(questions, true, aiOptions);
    } catch (err) {
      if (err?.name === 'AbortError') {
        setError('Request timed out. Try fewer questions or a smaller file.');
      } else {
        console.error('Error processing file:', err);
        setError(err?.message || 'Failed to process file.');
      }
      // keep file name visible so user can retry with same file if needed
    } finally {
      stopLoading();
    }
  };

  const handleTextSubmit = async (textContent) => {
    if (busyRef.current) return;
    setError(null);

    try {
      if (!textContent || !textContent.trim()) {
        setError('Please paste some content first.');
        return;
      }

      const apiKey = localStorage.getItem('geminiApiKey');
      if (!apiKey || apiKey.trim().length < 8) {
        setError('Please configure your API key first (click Configure API).');
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
      setPastedText('');
      setShowTextMode(false);
    }
  };

  const handleReconfigure = (e) => {
    e?.preventDefault?.();
    if (typeof onReconfigure === 'function') onReconfigure();
  };

  const clearSelectedFile = () => {
    setFileName('');
    setFileSize(null);
    setFileType('');
    setError(null);
  };

  // keyboard accessible click for dropzone
  const handleDropzoneKeyDown = (e) => {
    if (effectiveLoading) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      document.getElementById('file-input')?.click();
    }
  };

  // small sample content to let people try without file
  const SAMPLE_TEXT = `Sample MCQ source text:
1) The capital of France is Paris.
2) Water boils at 100 degrees Celsius at sea level.`;

  return (
    <div className="upload-container" aria-live="polite">
      {error && (
        <div className="error-message" role="alert" aria-live="assertive">
          <span>{error}</span>
          <button onClick={() => setError(null)} aria-label="Dismiss error">✕</button>
        </div>
      )}

      {/* AI config panel (unchanged logic, slight UX tweaks) */}
      {hasAI && (
        <div className="ai-config-panel" aria-hidden={effectiveLoading}>
          <div className="panel-header">
            <span className="icon">⚙️</span>
            <h3>AI Generation Settings</h3>
          </div>

          <div className="ai-toggle">
            <label className="switch" title="Enable/disable AI question generation">
              <input
                type="checkbox"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                disabled={effectiveLoading}
              />
              <span className="slider" />
            </label>
            <span className="toggle-label">Use AI Generation</span>
            <small style={{ marginLeft: 12, color: '#444' }}>
              (Requires API key. Free quotas may apply.)
            </small>
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
                      numQuestions: Math.max(5, Math.min(50, Number(e.target.value || 10))),
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

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button
              onClick={handleReconfigure}
              className="btn btn-secondary"
              type="button"
              disabled={effectiveLoading}
            >
              <span className="icon">🔐</span>
              Configure API
            </button>

            <button
              onClick={() => {
                // quick sample flow (pastes sample text through text submit)
                if (!useAI) {
                  setError('Enable "Use AI Generation" to generate from text samples.');
                  return;
                }
                handleTextSubmit(SAMPLE_TEXT);
              }}
              className="btn"
              type="button"
              disabled={effectiveLoading}
              title="Try a quick sample (no file required)"
            >
              Try sample text
            </button>
          </div>
        </div>
      )}

      {/* Dropzone / upload area */}
      <div
        className={`dropzone ${dragOver ? 'drag-active' : ''} ${effectiveLoading ? 'loading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !effectiveLoading && document.getElementById('file-input')?.click()}
        onKeyDown={handleDropzoneKeyDown}
        role="button"
        tabIndex={0}
        aria-disabled={effectiveLoading}
        aria-busy={effectiveLoading}
      >
        {effectiveLoading ? (
          <div className="loading-state" aria-live="polite">
            <div className="spinner" aria-hidden="true" />
            <h3>Generating MCQs…</h3>
            <p>We’re analyzing your document and creating questions. This may take a little while.</p>
          </div>
        ) : (
          <div className="upload-content">
            <span className="upload-icon">📁</span>
            <h3>{fileName ? `Selected: ${fileName}` : 'Upload Your Document'}</h3>
            {!fileName && <p>Drag & drop your file here or click to browse</p>}
            {fileName && (
              <p style={{ color: '#444', marginTop: 8 }}>
                {formatBytes(fileSize)} • {fileType || 'unknown type'}
                <button onClick={(e) => { e.stopPropagation(); clearSelectedFile(); }} style={{ marginLeft: 12 }} aria-label="Clear file">✕</button>
              </p>
            )}

            <div className="supported-formats" style={{ marginTop: 12 }}>
              <span>Supported formats:</span>
              <div className="format-tags" style={{ marginTop: 8 }}>
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
        accept=".txt,.docx,.doc,.html,.pdf"
        onChange={(e) => {
          const file = e.target.files && e.target.files[0];
          if (file) handleFileSelect(file);
          e.target.value = ''; // allow re-upload same file
        }}
        disabled={effectiveLoading}
      />

      {/* Optional paste-text mode for quick testing */}
      <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          className="btn btn-secondary"
          onClick={() => setShowTextMode((s) => !s)}
          disabled={effectiveLoading}
        >
          {showTextMode ? 'Close text input' : 'Paste text instead'}
        </button>

        <button
          className="btn"
          onClick={() => {
            // quick fallback: if AI disabled, hand empty file up so parent can take text path
            if (!useAI) {
              setError('Enable AI or paste text to generate questions from content.');
              return;
            }
            setPastedText(SAMPLE_TEXT);
            handleTextSubmit(SAMPLE_TEXT);
          }}
          disabled={effectiveLoading}
          title="Quick sample generation"
        >
          Quick sample
        </button>
      </div>

      {showTextMode && (
        <div style={{ marginTop: 12, width: '100%' }} className="text-input-container">
          <h3>Paste source text (large passages OK)</h3>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste text or chapter content here..."
            disabled={effectiveLoading}
          />
          <div className="button-group" style={{ marginTop: 12 }}>
            <button
              className="btn"
              onClick={() => handleTextSubmit(pastedText)}
              disabled={effectiveLoading}
            >
              Generate Questions
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => { setShowTextMode(false); setPastedText(''); }}
              disabled={effectiveLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
