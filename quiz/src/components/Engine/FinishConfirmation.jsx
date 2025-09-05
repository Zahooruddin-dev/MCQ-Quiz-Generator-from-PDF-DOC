import './QuizEngine.css';

const FinishConfirmation = ({ unansweredCount, onConfirm, onCancel }) => {
  return (
    <div className="confirmation-overlay">
      <div className="confirmation-modal">
        <div className="confirmation-header">
          <h3>Unanswered Questions</h3>
        </div>
        <div className="confirmation-body">
          <p>
            You have {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}. 
            Are you sure you want to finish the quiz?
          </p>
        </div>
        <div className="confirmation-actions">
          <button 
            className="confirmation-btn confirmation-btn-cancel"
            onClick={onCancel}
          >
            Continue Quiz
          </button>
          <button 
            className="confirmation-btn confirmation-btn-confirm"
            onClick={onConfirm}
          >
            Finish Anyway
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinishConfirmation;