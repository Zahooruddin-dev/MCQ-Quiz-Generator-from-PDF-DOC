import { useState } from "react";
import FileUpload from "./components/FileUpload/FileUpload";
import QuizEngine from "./components/Engine/QuizEngine";
import ResultPage from "./components/Results/ResultPage";
import APIConfig from "./components/APIconfig/APIConfig";
import "./App.css";

const App = () => {
  const [questions, setQuestions] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const [apiKey, setApiKey] = useState(() => localStorage.getItem("geminiApiKey") || "");
  const [baseUrl, setBaseUrl] = useState(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
  );
  const [showApiConfig, setShowApiConfig] = useState(!apiKey);

  const handleConfigSave = (newApiKey, newBaseUrl) => {
    setApiKey(newApiKey);
    setBaseUrl(newBaseUrl);
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
      {showApiConfig ? (
        <APIConfig onConfigSave={handleConfigSave} />
      ) : !questions ? (
        <FileUpload
          hasAI={!!apiKey}
          onFileUpload={handleFileUpload}
          onReconfigure={() => setShowApiConfig(true)}
        />
      ) : (
        <div className="quiz-wrapper">
          {/* ❌ Close Button */}
          <button className="close-btn" onClick={handleNewQuiz}>
            ✖
          </button>

          {showResults ? (
            <ResultPage
              questions={questions}
              userAnswers={quizResults.answers}
              onNewQuiz={handleNewQuiz}
              fileName={quizResults.fileName || "Quiz"}
            />
          ) : (
            <QuizEngine
              questions={questions}
              onFinish={handleQuizFinish}
              apiKey={apiKey}
              baseUrl={baseUrl}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default App;
