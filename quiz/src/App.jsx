import { useState } from "react";
import FileUpload from "./components/FileUpload/FileUpload";
import QuizEngine from "./components/QuizEngine";
import ResultPage from "./components/ResultPage";
import APIConfig from "./components/APIConfig";
import "./App.css";

const App = () => {
  const [questions, setQuestions] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Load saved API key from localStorage
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("geminiApiKey") || "");
  const [baseUrl, setBaseUrl] = useState(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
  );
  const [showApiConfig, setShowApiConfig] = useState(!apiKey); // if no key → show config

  // 🔹 Called when user saves API key
  const handleConfigSave = (newApiKey, newBaseUrl) => {
    setApiKey(newApiKey);
    setBaseUrl(newBaseUrl);
    setShowApiConfig(false);
  };

  // 🔹 After PDF is uploaded & questions are generated
  const handleFileUpload = (generatedQuestions) => {
    setQuestions(generatedQuestions);
  };

  // 🔹 When quiz is finished
  const handleQuizFinish = (results) => {
    setQuizResults(results);
    setShowResults(true);
  };

  // 🔹 Restart quiz flow
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
      ) : showResults ? (
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
  );
};

export default App;
