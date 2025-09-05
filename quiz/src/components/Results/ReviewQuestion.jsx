const ReviewQuestion = ({ question, userAnswerIndex, isExpanded, toggleExpand, index }) => {
  const isCorrect = userAnswerIndex === question.correctAnswer;
  const isUnattempted = userAnswerIndex === null || userAnswerIndex === undefined;
  
  return (
    <div className={`review-question ${isCorrect ? 'correct' : isUnattempted ? 'unattempted' : 'incorrect'}`}>
      <div className="review-question-header" onClick={toggleExpand}>
        <div className="question-number">
          <span>Question {index + 1}</span>
        </div>
        <div className="question-status">
          <span className={`status ${isCorrect ? 'correct' : isUnattempted ? 'unattempted' : 'incorrect'}`}>
            {isUnattempted ? 'Unattempted' : isCorrect ? 'Correct' : 'Incorrect'}
          </span>
          <span className="toggle-icon">{isExpanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="review-body">
          <div className="review-question-text">{question.question}</div>
          
          {question.context && question.context !== 'Context not available' && (
            <div className="question-context">
              <strong>Context:</strong> {question.context}
            </div>
          )}
          
          <div className="review-options">
            {question.options.map((option, optIndex) => {
              const isUserAnswer = userAnswerIndex === optIndex;
              const isCorrectAnswer = optIndex === question.correctAnswer;
              
              let className = 'review-option';
              if (isCorrectAnswer) className += ' correct-answer';
              if (isUserAnswer && !isCorrectAnswer) className += ' user-incorrect-answer';
              if (isUserAnswer && isCorrectAnswer) className += ' user-correct-answer';
              
              return (
                <div key={optIndex} className={className}>
                  <span className="option-letter">{String.fromCharCode(97 + optIndex)})</span>
                  <span className="option-text">{option}</span>
                  {isCorrectAnswer && <span className="correct-indicator">✓ Correct Answer</span>}
                  {isUserAnswer && !isCorrectAnswer && <span className="incorrect-indicator">✗ Your Answer</span>}
                </div>
              );
            })}
          </div>
          
          {question.explanation && (
            <div className="explanation">
              <strong>Explanation:</strong> {question.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewQuestion;