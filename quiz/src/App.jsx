import { useState } from 'react';
import FileUpload from './components/FileUpload';
import QuizEngine from './components/QuizEngine';
import ResultPage from './components/ResultPage';
import APIConfig from './components/APIConfig';
import './App.css';

const App = () => {
	const [questions, setQuestions] = useState(null);
	const [quizResults, setQuizResults] = useState(null);
	const [showResults, setShowResults] = useState(false);
	const [showApiConfig, setShowApiConfig] = useState(true);
	const [apiKey, setApiKey] = useState(() =>
		localStorage.getItem('geminiApiKey')
	);

	const handleConfigSave = (newApiKey, baseUrl) => {
		setApiKey(newApiKey);
		setShowApiConfig(false);
	};

	const handleFileUpload = (generatedQuestions) => {
		setQuestions(generatedQuestions);
	};

	const handleQuizFinish = (results) => {
		setQuizResults(results);
		setShowResults(true);
	};

	const handleNewQuiz = () => {
		setQuestions(null);
		setQuizResults(null);
		setShowResults(false);
	};
return (
  <div className="app">
    <div className="card">
      {showApiConfig ? (
        <APIConfig onConfigSave={handleConfigSave} />
      ) : !questions ? (
        <FileUpload
          hasAI={!!apiKey}
          onFileUpload={handleFileUpload}
          onReconfigure={() => setShowApiConfig(true)}
        />
      ) : showResults ? (
        <ResultPage
          questions={questions}
          userAnswers={quizResults.answers}
          onNewQuiz={handleNewQuiz}
          fileName={quizResults.fileName || 'Quiz'}
        />
      ) : (
        <QuizEngine questions={questions} onFinish={handleQuizFinish} />
      )}
    </div>
  </div>
);

};

export default App;
