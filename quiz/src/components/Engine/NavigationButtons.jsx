import './QuizEngine.css';

const NavigationButtons = ({
  currentQuestion,
  totalQuestions,
  goToPrevQuestion,
  goToNextQuestion,
  handleFinish,
  isSubmitting,
  hasAnswer
}) => {
  const isFirstQuestion = currentQuestion === 0;
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  return (
    <div className="navigation-buttons">
      <button
        onClick={goToPrevQuestion}
        disabled={isFirstQuestion || isSubmitting}
        className="nav-button prev-button"
      >
        Previous
      </button>
      
      {!isLastQuestion ? (
        <button
          onClick={goToNextQuestion}
          disabled={isSubmitting}
          className="nav-button next-button"
        >
          Next
        </button>
      ) : (
        <button
          onClick={handleFinish}
          disabled={isSubmitting}
          className="nav-button finish-button"
        >
          {isSubmitting ? 'Submitting...' : 'Finish Quiz'}
        </button>
      )}
    </div>
  );
};

export default NavigationButtons;