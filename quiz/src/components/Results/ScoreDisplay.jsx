const ScoreDisplay = ({ score }) => (
  <div className="score-display">
    <div className="score-circle">
      <span className="score-value">{score.toFixed(1)}%</span>
    </div>
    <p className="score-label">Overall Score</p>
  </div>
);

export default ScoreDisplay;
