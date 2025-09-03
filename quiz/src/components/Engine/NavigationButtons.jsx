const NavigationButtons = ({
  currentQuestion,
  totalQuestions,
  goToPrevQuestion,
  goToNextQuestion,
  handleFinish,
}) => {
  return (
    <div className="navigation">
      <button
        className="btn btn-secondary"
        onClick={goToPrevQuestion}
        disabled={currentQuestion === 0}
      >
        Previous
      </button>

      {currentQuestion < totalQuestions - 1 ? (
        <button className="btn" onClick={goToNextQuestion}>
          Next
        </button>
      ) : (
        <button className="btn" onClick={handleFinish}>
          Finish Quiz
        </button>
      )}
    </div>
  );
};

export default NavigationButtons;
