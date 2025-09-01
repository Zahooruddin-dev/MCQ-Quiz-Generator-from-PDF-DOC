import { useState } from 'react';

const FileUpload = ({ onFileUpload, hasAI, loading, onReconfigure }) => {
  const [dragOver, setDragOver] = useState(false);
  const [useAI, setUseAI] = useState(hasAI);
  const [aiOptions, setAiOptions] = useState({
    numQuestions: 10,
    difficulty: 'medium'
  });

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    onFileUpload(file, useAI, aiOptions);
  };

  const handleReconfigure = (e) => {
    e.preventDefault();
    if (typeof onReconfigure === 'function') {
      onReconfigure();
    }
  };

  return (
    <div className="upload-container">
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
                  onChange={(e) => setAiOptions(prev => ({
                    ...prev,
                    numQuestions: parseInt(e.target.value)
                  }))}
                  className="number-input"
                />
              </div>

              <div className="control-group">
                <label>
                  <span className="icon">🎚️</span>
                  Difficulty Level
                </label>
                <select
                  value={aiOptions.difficulty}
                  onChange={(e) => setAiOptions(prev => ({
                    ...prev,
                    difficulty: e.target.value
                  }))}
                  className="select-input"
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
          >
            <span className="icon">⚙️</span>
            Configure API
          </button>
        </div>
      )}

      <div 
        className={`dropzone ${dragOver ? 'drag-active' : ''} ${loading ? 'loading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <h3>Processing with AI</h3>
            <p>Please wait while we analyze your document...</p>
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
          if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
          }
        }}
      />
    </div>
  );
};

export default FileUpload;