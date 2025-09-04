import { useState } from 'react';
import Context from '../Context';
import ProgressBar from './ProgressBar';
import Question from './Question';
import NavigationButtons from './NavigationButtons';

const QuizEngine = ({ questions = [], onFinish }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState(
    new Array(questions.length).fill(null)
  );

  if (!questions.length) {
    return <p className="error">No questions available. Please try again.</p>;
  }

  const currentQ = questions[currentQuestion];

  const handleAnswerSelect = (index) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = index;
    setUserAnswers(newAnswers);
  };

  const goToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1);
  };

  const goToPrevQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const handleFinish = () => {
    const unanswered = userAnswers.filter((a) => a === null).length;
    if (unanswered > 0) {
      const confirmFinish = window.confirm(
        `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Are you sure you want to finish?`
      );
      if (!confirmFinish) return;
    }

    const results = {
      answers: userAnswers,
      fileName: 'Quiz',
      score:
        (userAnswers.filter(
          (answer, idx) => answer === questions[idx]?.correctAnswer
        ).length / questions.length) * 100,
      totalQuestions: questions.length,
      answeredQuestions: questions.length - unanswered,
    };

    onFinish?.(results);
  };

  const calculateProgress = () => {
    const answered = userAnswers.filter((a) => a !== null).length;
    return (answered / questions.length) * 100;
  };

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>Interactive Quiz</h2>
        <ProgressBar progress={calculateProgress()} />
        <div className="quiz-info">
          <span>
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span>{userAnswers.filter((a) => a !== null).length} answered</span>
        </div>
      </div>

      {/* Render context safely */}
      {currentQ?.context ? (
        <div className="quiz-context">
          <Context context={currentQ.context} />
        </div>
      ) : null}

      {/* Render question */}
      {currentQ ? (
        <Question
          questionData={currentQ}
          selectedAnswer={userAnswers[currentQuestion]}
          onSelectAnswer={handleAnswerSelect}
        />
      ) : (
        <p className="error">Question data missing.</p>
      )}

      <NavigationButtons
        currentQuestion={currentQuestion}
        totalQuestions={questions.length}
        goToPrevQuestion={goToPrevQuestion}
        goToNextQuestion={goToNextQuestion}
        handleFinish={handleFinish}
      />
    </div>
  );
};

export default QuizEngine;
