import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import FileUpload from "./components/FileUpload/FileUpload";
import QuizEngine from "./components/Engine/QuizEngine";
import ResultPage from "./components/Results/ResultPage";
import APIConfig from "./components/APIconfig/APIConfig";
import AuthForm from "./components/Auth/AuthForm";
import { useAuth } from "./context/AuthContext";
import UserInfo from "./components/UserInfo/UserInfo";
import AdminDashboard from "./components/Admin/AdminDashboard";
import { doc, getDoc } from "firebase/firestore";
import "./App.css";
import { db } from "./firebaseConfig";
import AppHeader from "./components/Layout/AppHeader";

const ADMIN_EMAIL = "mizuka886@gmail.com";

const App = () => {
  const { user } = useAuth();
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const [apiKey, setApiKey] = useState(import.meta.env.VITE_DEFAULT_API_KEY);
  const [baseUrl, setBaseUrl] = useState(import.meta.env.VITE_DEFAULT_BASE_URL);
  const [showApiConfig, setShowApiConfig] = useState(false);

  // Fetch API key from Firestore if admin has set it
  useEffect(() => {
    const fetchApiKey = async () => {
      if (!user) return;

      try {
        const docSnap = await getDoc(doc(db, "settings", "apiKey"));
        if (docSnap.exists()) {
          const key = docSnap.data().value;
          setApiKey(key);
          localStorage.setItem("geminiApiKey", key);
        } else if (user.email === ADMIN_EMAIL) {
          setShowApiConfig(true);
        }
      } catch (err) {
        console.error("Failed to fetch API key:", err);
        if (user.email === ADMIN_EMAIL) setShowApiConfig(true);
      }
    };

    fetchApiKey();
  }, [user]);

  const handleFileUpload = (generatedQuestions) => setQuestions(generatedQuestions);
  const handleQuizFinish = (results) => {
    setQuizResults(results);
    setShowResults(true);
  };
  const handleNewQuiz = () => {
    setQuestions(null);
    setQuizResults(null);
    setShowResults(false);
  };

  if (!user) return <div className="app auth-wrapper"><AuthForm /></div>;

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="app">
          
              {showUserInfo && (
                <UserInfo
                  user={user}
                  onClose={() => setShowUserInfo(false)}
                  isAdmin={user.email === ADMIN_EMAIL}
                />
              )}

              {/* Admin API Config */}
              {user.email === ADMIN_EMAIL && showApiConfig && (
                <APIConfig
                  apiKey={apiKey}
                  baseUrl={baseUrl}
                  onConfigSave={(newApiKey, newBaseUrl) => {
                    setApiKey(newApiKey);
                    setBaseUrl(newBaseUrl);
                    localStorage.setItem("geminiApiKey", newApiKey);
                    setShowApiConfig(false);
                  }}
                />
              )}

              {/* FileUpload or Quiz */}
              {!questions ? (
                <FileUpload
                  hasAI={!!apiKey}
                  apiKey={apiKey}
                  baseUrl={baseUrl}
                  onFileUpload={handleFileUpload}
                  onProfileClick={() => setShowUserInfo(true)}
                  onReconfigure={user.email === ADMIN_EMAIL ? () => setShowApiConfig(true) : undefined}
                />
              ) : (
                <div className="quiz-wrapper">
                  <button className="close-btn" onClick={handleNewQuiz}>✖</button>
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
          }
        />

        <Route
          path="/admin"
          element={user.email === ADMIN_EMAIL ? <AdminDashboard /> : <Navigate to="/" replace />}
        />
      </Routes>
    </Router>
  );
};

export default App;
