import { useState } from 'react';
import ScoreDisplay from './ScoreDisplay';
import StatsPanel from './StatsPanel';
import ReviewQuestion from './ReviewQuestion';

const ResultPage = ({ questions, userAnswers, onNewQuiz, fileName }) => {
  if (!questions || !userAnswers) {
    return (
      <div className="results-container">
        <div className="results-header">
          <h2>No Results Available</h2>
          <button className="btn" onClick={onNewQuiz}>Start New Quiz</button>
        </div>
      </div>
    );
  }

  const calculateResults = () => {
    let correct = 0, wrong = 0, unattempted = 0;
    userAnswers.forEach((answer, i) => {
      if (answer === null) unattempted++;
      else if (answer === questions[i].correctAnswer) correct++;
      else wrong++;
    });
    return { correct, wrong, unattempted, score: (correct / questions.length) * 100 };
  };

  const results = calculateResults();
  const [expandedIndexes, setExpandedIndexes] = useState([]);

  const toggleExpand = (index) => {
    setExpandedIndexes(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const allExpanded = expandedIndexes.length === questions.length;
  const toggleAll = () => {
    setExpandedIndexes(allExpanded ? [] : questions.map((_, i) => i));
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>Quiz Results</h2>
        <p>File: {fileName || 'Unknown File'}</p>
      </div>

      <ScoreDisplay score={results.score} />
      <StatsPanel correct={results.correct} wrong={results.wrong} unattempted={results.unattempted} />

      <div className="review-section">
        <div className="review-header">
          <h3>Question Review</h3>
          <div className="review-actions">
            <button className="btn small" onClick={toggleAll}>
              {allExpanded ? 'Collapse All' : 'Expand All'}
            </button>
          </div>
        </div>

        {questions.map((q, idx) => (
          <ReviewQuestion
            key={idx}
            question={q}
            userAnswerIndex={userAnswers[idx]}
            isExpanded={expandedIndexes.includes(idx)}
            toggleExpand={toggleExpand}
            index={idx}
          />
        ))}
      </div>

      <div className="actions">
        <button className="btn" onClick={onNewQuiz}>Start New Quiz</button>
      </div>
    </div>
  );
};

export default ResultPage;