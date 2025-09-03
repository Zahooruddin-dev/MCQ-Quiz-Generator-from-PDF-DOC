const ReviewQuestion = ({ question, userAnswerIndex, isExpanded, toggleExpand, index }) => (
  <div className="review-question">
    <div className="review-question-header" onClick={() => toggleExpand(index)}>
      <span>Question {index + 1}</span>
      <span className={`status ${userAnswerIndex === question.correctAnswer ? 'correct' : 'incorrect'}`}>
        {userAnswerIndex === null ? 'Unattempted' : userAnswerIndex === question.correctAnswer ? 'Correct' : 'Incorrect'}
      </span>
      <span className="toggle-icon">{isExpanded ? '▲' : '▼'}</span>
    </div>

    {isExpanded && (
      <div className="review-body">
        <div className="review-question-text">{question.question}</div>
        <div className="review-options">
          {question.options.map((option, optIndex) => {
            let className = 'review-option';
            if (optIndex === question.correctAnswer) className += ' correct-answer';
            else if (userAnswerIndex === optIndex) className += ' user-answer';
            return (
              <div key={optIndex} className={className}>
                {String.fromCharCode(97 + optIndex)}) {option}
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
);

export default ReviewQuestion;
