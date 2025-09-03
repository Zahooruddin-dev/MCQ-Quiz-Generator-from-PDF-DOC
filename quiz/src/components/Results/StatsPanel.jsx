const StatsPanel = ({ correct, wrong, unattempted }) => (
  <div className="stats">
    <div className="stat correct">
      <span className="stat-value">{correct}</span>
      <span className="stat-label">Correct</span>
    </div>
    <div className="stat wrong">
      <span className="stat-value">{wrong}</span>
      <span className="stat-label">Wrong</span>
    </div>
    <div className="stat unattempted">
      <span className="stat-value">{unattempted}</span>
      <span className="stat-label">Unattempted</span>
    </div>
  </div>
);

export default StatsPanel;
