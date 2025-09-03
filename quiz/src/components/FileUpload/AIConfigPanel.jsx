const AIConfigPanel = ({ useAI, setUseAI, aiOptions, setAiOptions, effectiveLoading, onReconfigure, onSample }) => {
  return (
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
      </div>

      {useAI && (
        <div className="ai-controls">
          <div className="control-group">
            <label>🔢 Number of Questions</label>
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
            <label>🎚️ Difficulty</label>
            <select
              value={aiOptions.difficulty}
              onChange={(e) => setAiOptions((prev) => ({ ...prev, difficulty: e.target.value }))}
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
        <button onClick={onReconfigure} className="btn btn-secondary" disabled={effectiveLoading}>
          🔐 Configure API
        </button>
{/*         <button onClick={onSample} className="btn" disabled={effectiveLoading}>
          Try sample text
        </button> */}
      </div>
    </div>
  );
};
export default AIConfigPanel;
