import './QuizEngine.css';

const Question = ({ questionData, selectedAnswer, onSelectAnswer }) => {
  if (!questionData || !questionData.options) {
    return <div className="question-error">Invalid question data</div>;
  }

  return (
    <div className="question-container">
      <div className="question-text">
        <h2>Question</h2>
        <p>{questionData.question}</p>
      </div>

      <div className="options-container">
        {questionData.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const optionId = `option-${index}`;
          
          return (
            <div 
              key={index} 
              className={`option ${isSelected ? 'selected' : ''}`}
            >
              <input
                type="radio"
                id={optionId}
                name="quiz-option"
                checked={isSelected}
                onChange={() => onSelectAnswer(index)}
                className="option-input"
              />
              <label htmlFor={optionId} className="option-label">
                <span className="option-letter">{String.fromCharCode(97 + index)})</span>
                <span className="option-text">{option}</span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Question;