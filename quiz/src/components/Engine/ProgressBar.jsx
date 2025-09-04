import './QuizEngine.css';

const ProgressBar = ({ progress }) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <div className="progress-bar-container">
      <div 
        className="progress-bar-fill" 
        style={{ width: `${normalizedProgress}%` }}
        role="progressbar"
        aria-valuenow={normalizedProgress}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <span className="progress-text">{Math.round(normalizedProgress)}%</span>
      </div>
    </div>
  );
};

export default ProgressBar;