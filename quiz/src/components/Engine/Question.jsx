const Question = ({ questionData, selectedAnswer, onSelectAnswer }) => {
  return (
    <div className="question">
      <div className="question-number">Question</div>
      <div className="question-text">{questionData.question}</div>

      <div className="options">
        {questionData.options.map((option, index) => (
          <div
            key={index}
            className={`option ${selectedAnswer === index ? 'selected' : ''}`}
            onClick={() => onSelectAnswer(index)}
          >
            {String.fromCharCode(97 + index)}) {option}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Question;
