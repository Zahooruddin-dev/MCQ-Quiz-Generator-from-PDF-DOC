
import { useState } from 'react';

const FileUpload = ({ onFileUpload, hasAI, loading, onReconfigure }) => {
  const [dragOver, setDragOver] = useState(false);
  const [useAI, setUseAI] = useState(hasAI);
  const [aiOptions, setAiOptions] = useState({
    numQuestions: 10,
    difficulty: 'medium',
    questionTypes: ['multiple-choice']
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
    if (file.type === 'application/pdf' || 
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      onFileUpload(file, useAI, aiOptions);
    } else {
      alert('Please select a PDF or DOCX file.');
    }
  };

  return (
    <div className="upload-section">
      {hasAI && (
        <div className="ai-options">
          <h3>Generation Options</h3>
          <div className="option-group">
            <label>
              <input
                type="checkbox"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
              />
              Use AI to generate questions
            </label>
          </div>

          {useAI && (
            <div className="ai-settings">
              <div className="setting">
                <label>Number of Questions:</label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={aiOptions.numQuestions}
                  onChange={(e) => setAiOptions(prev => ({
                    ...prev,
                    numQuestions: parseInt(e.target.value)
                  }))}
                />
              </div>
              <div className="setting">
                <label>Difficulty:</label>
                <select
                  value={aiOptions.difficulty}
                  onChange={(e) => setAiOptions(prev => ({
                    ...prev,
                    difficulty: e.target.value
                  }))}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          )}

          <button onClick={onReconfigure} className="reconfigure-btn">
            Change API Settings
          </button>
        </div>
      )}

      <div 
        className={`upload-box ${dragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Processing your file with AI...</p>
          </div>
        ) : (
          <>
            <div className="upload-icon">📁</div>
            <h3>Click to upload or drag and drop</h3>
            <p>Supported formats: PDF, DOCX</p>
            <p className="ai-indicator">
              {hasAI ? (useAI ? '🤖 AI-powered generation enabled' : '📝 Traditional parsing mode') : '📝 Traditional parsing only'}
            </p>
          </>
        )}
      </div>
      
      <input
        id="file-input"
        type="file"
        className="file-input"
        accept=".pdf,.docx"
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