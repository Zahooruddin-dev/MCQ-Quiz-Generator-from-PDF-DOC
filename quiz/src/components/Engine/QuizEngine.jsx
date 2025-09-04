import { useState, useMemo, useCallback } from 'react';
import Context from '../Context';
import ProgressBar from './ProgressBar';
import Question from './Question';
import NavigationButtons from './NavigationButtons';
import FinishConfirmation from './FinishConfirmation';
import './QuizEngine.css';

const QuizEngine = ({ questions = [], onFinish, quizTitle = "Interactive Quiz" }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState(
    new Array(questions.length).fill(null)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  // Memoize derived values to prevent unnecessary recalculations
  const answeredCount = useMemo(() => 
    userAnswers.filter(a => a !== null).length, 
    [userAnswers]
  );

  const progressPercentage = useMemo(() => 
    (answeredCount / questions.length) * 100, 
    [answeredCount, questions.length]
  );

  const unansweredCount = useMemo(() => 
    userAnswers.filter(a => a === null).length,
    [userAnswers]
  );

  if (!questions.length) {
    return <div className="quiz-engine-error">No questions available. Please try again.</div>;
  }

  const currentQ = questions[currentQuestion];

  const handleAnswerSelect = useCallback((index) => {
    setUserAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestion] = index;
      return newAnswers;
    });
  }, [currentQuestion]);

  const goToNextQuestion = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  }, [currentQuestion, questions.length]);

  const goToPrevQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  }, [currentQuestion]);

  const handleFinishClick = useCallback(() => {
    if (unansweredCount > 0) {
      setShowFinishConfirm(true);
    } else {
      submitQuiz();
    }
  }, [unansweredCount]);

  const submitQuiz = useCallback(async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setShowFinishConfirm(false);

    try {
      const score = userAnswers.reduce((total, answer, idx) => {
        return total + (answer === questions[idx]?.correctAnswer ? 1 : 0);
      }, 0);
      
      const results = {
        answers: userAnswers,
        score: (score / questions.length) * 100,
        totalQuestions: questions.length,
        answeredQuestions: questions.length - unansweredCount,
        correctAnswers: score,
        timestamp: new Date().toISOString(),
      };

      await onFinish?.(results);
    } catch (error) {
      console.error("Error finishing quiz:", error);
      alert("There was an error submitting your quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [userAnswers, questions, onFinish, isSubmitting, unansweredCount]);

  const cancelFinish = useCallback(() => {
    setShowFinishConfirm(false);
  }, []);

  return (
    <div className="quiz-engine">
      <div className="quiz-header">
        <h1>{quizTitle}</h1>
        <div className="quiz-meta">
          <span className="question-count">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="answered-count">
            {answeredCount} answered
          </span>
        </div>
      </div>

      <ProgressBar progress={progressPercentage} />
      
      <div className="quiz-content">
        {/* Render context safely */}
        {currentQ?.context && (
          <div className="question-context">
            <Context>{currentQ.context}</Context>
          </div>
        )}

        {/* Render question */}
        {currentQ ? (
          <Question
            questionData={currentQ}
            selectedAnswer={userAnswers[currentQuestion]}
            onSelectAnswer={handleAnswerSelect}
          />
        ) : (
          <div className="question-error">Question data missing.</div>
        )}
      </div>

      <NavigationButtons
        currentQuestion={currentQuestion}
        totalQuestions={questions.length}
        goToPrevQuestion={goToPrevQuestion}
        goToNextQuestion={goToNextQuestion}
        handleFinish={handleFinishClick}
        isSubmitting={isSubmitting}
        hasAnswer={userAnswers[currentQuestion] !== null}
      />

      {showFinishConfirm && (
        <FinishConfirmation
          unansweredCount={unansweredCount}
          onConfirm={submitQuiz}
          onCancel={cancelFinish}
        />
      )}
    </div>
  );
};

export default QuizEngine;