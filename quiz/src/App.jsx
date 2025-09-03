import { useState } from "react";
import FileUpload from "./components/FileUpload/FileUpload";
import QuizEngine from "./components/Engine/QuizEngine";
import ResultPage from "./components/Results/ResultPage";
import APIConfig from "./components/APIconfig/APIConfig";
import AuthForm from "./components/Auth/AuthForm";
import { useAuth } from "./context/AuthContext";
import UserInfo from "./components/UserInfo/UserInfo"; // ✅ new import
import "./App.css";

const App = () => {
  const { user, logout } = useAuth();
  const [showUserInfo, setShowUserInfo] = useState(false); // ✅ toggle state

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

  if (!user) {
    return (
      <div className="app auth-wrapper">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="app">
      {/* ✅ Header */}
      <header className="app-header">
        <h1>AI Quiz Generator</h1>
        <div className="header-actions">
          <button className="btn small-btn" onClick={() => setShowUserInfo(true)}>
            👤 Profile
          </button>
          <button className="btn small-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* ✅ User Info Popup */}
      {showUserInfo && (
        <UserInfo user={user} onClose={() => setShowUserInfo(false)} />
      )}

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
