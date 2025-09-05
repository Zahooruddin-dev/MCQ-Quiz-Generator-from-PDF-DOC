import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ModernFileUpload from "./components/FileUpload/ModernFileUpload";
import ModernQuizEngine from "./components/Engine/ModernQuizEngine";
import ModernResultPage from "./components/Results/ModernResultPage";
import APIConfig from "./components/APIconfig/APIConfig";
import ModernAuthForm  from "./components/Auth/ModernAuthForm";
import { useAuth } from "./context/AuthContext";
import UserInfo from "./components/UserInfo/UserInfo";
import AdminDashboard from "./components/Admin/AdminDashboard";
import { doc, getDoc } from "firebase/firestore";
import "./App.css";
import { db } from "./firebaseConfig";
import ModernHeader from "./components/Layout/ModernHeader";

const ADMIN_EMAIL = "mizuka886@gmail.com";

const App = () => {
  const { user, loading } = useAuth();
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  const [apiKey, setApiKey] = useState(import.meta.env.VITE_DEFAULT_API_KEY);
  const [baseUrl, setBaseUrl] = useState(import.meta.env.VITE_DEFAULT_BASE_URL);
  const [showApiConfig, setShowApiConfig] = useState(false);

  // Add a slight delay to prevent flash of login screen
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setAppLoading(false);
      }, 300); // Small delay to ensure smooth transition
      return () => clearTimeout(timer);
    }
  }, [loading]);

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

  // Show loading screen while checking auth state
  if (appLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app auth-wrapper">
        <ModernAuthForm />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="app">
              {/* ✅ Always show AppHeader */}
              <ModernHeader
                onProfileClick={() => setShowUserInfo(true)}
                showApiConfig={showApiConfig}
                setShowApiConfig={setShowApiConfig}
              />

              {showUserInfo && (
                <UserInfo
                  user={user}
                  onClose={() => setShowUserInfo(false)}
                  isAdmin={user.email === ADMIN_EMAIL}
                />
              )}

              {/* ✅ Admin API Config toggleable */}
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
                  onClose={() => setShowApiConfig(false)}
                />
              )}

              {/* FileUpload or Quiz */}
              {!questions ? (
                <ModernFileUpload
                  hasAI={!!apiKey}
                  apiKey={apiKey}
                  baseUrl={baseUrl}
                  onFileUpload={handleFileUpload}
                  onProfileClick={() => setShowUserInfo(true)}
                  onReconfigure={
                    user.email === ADMIN_EMAIL
                      ? () => setShowApiConfig(true)
                      : undefined
                  }
                />
              ) : (
                <div className="quiz-wrapper">
                  <button className="close-btn" onClick={handleNewQuiz}>
                    ✖
                  </button>
                  {showResults ? (
                    <ModernResultPage
                      questions={questions}
                      userAnswers={quizResults.answers}
                      onNewQuiz={handleNewQuiz}
                      fileName={quizResults.fileName || "Quiz"}
                    />
                  ) : (
                    <ModernQuizEngine
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
          element={
            user.email === ADMIN_EMAIL ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;