import { useEffect } from 'react';

const AIConfigPanel = ({
  useAI,
  setUseAI,
  aiOptions,
  setAiOptions,
  effectiveLoading,
}) => {
  // Defaults when useAI is off
  const effectiveNumQuestions = useAI ? aiOptions.numQuestions : 10;
  const effectiveDifficulty = useAI ? aiOptions.difficulty : "easy";

  // ✅ Move state update to useEffect
  useEffect(() => {
    if (!useAI && (aiOptions.numQuestions !== 10 || aiOptions.difficulty !== "easy")) {
      setAiOptions({ numQuestions: 10, difficulty: "easy" });
    }
  }, [useAI, aiOptions, setAiOptions]);

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
        <span className="toggle-label">Use Custom Settings</span>
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
              onChange={(e) =>
                setAiOptions((prev) => ({ ...prev, difficulty: e.target.value }))
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
    </div>
  );
};

export default AIConfigPanel;
