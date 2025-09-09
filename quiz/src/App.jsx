// src/App.jsx - Optimized with safe route-based code splitting
import { useState, useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import theme from "./theme";
import { useAuth } from "./context/AuthContext";
import ShareQuizModal from "./components/ShareQuizModal/ShareQuizModal";

// Loader
const OptimizedLoader = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: "white",
  "& .spinner": {
    width: "32px",
    height: "32px",
    border: "3px solid rgba(255,255,255,0.3)",
    borderTop: "3px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "16px",
  },
  "@keyframes spin": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" },
  },
}));

const LoadingFallback = ({ text = "Loading..." }) => (
  <OptimizedLoader>
    <div className="spinner" />
    <Typography
      variant="h6"
      sx={{ fontWeight: 600, fontSize: { xs: "1rem", sm: "1.25rem" } }}
    >
      {text}
    </Typography>
  </OptimizedLoader>
);

// Route-based lazy imports - Only load when needed
const LandingPage = lazy(() => import("./components/Landing/LandingPage"));
const ModernAuthForm = lazy(() => import("./components/Auth/ModernAuthForm"));

// Main app components - loaded together for performance
const ModernHeader = lazy(() => import("./components/Layout/ModernHeader"));
const Dashboard = lazy(() => import("./components/Dashboard/Dashboard"));

// Feature-specific components
const ModernFileUpload = lazy(() => import("./components/FileUpload/ModernFileUpload"));
const ModernQuizEngine = lazy(() => import("./components/Engine/ModernQuizEngine"));
const ModernResultPage = lazy(() => import("./components/Results/ModernResultPage"));

// Admin and settings
const ModernAPIConfig = lazy(() => import("./components/APIconfig/ModernAPIConfig"));
const ModernUserProfile = lazy(() => import("./components/UserInfo/ModernUserProfile"));
const ModernAdminDashboard = lazy(() => import("./components/Admin/ModernAdminDashboard"));

// Optimized Firebase operations
let firebaseCache = null;
const getFirebase = async () => {
  if (firebaseCache) return firebaseCache;

  const [firestoreModule, configModule] = await Promise.all([
    import("firebase/firestore"),
    import("./firebaseConfig"),
  ]);

  firebaseCache = {
    doc: firestoreModule.doc,
    getDoc: firestoreModule.getDoc,
    db: configModule.db,
  };

  return firebaseCache;
};

const ADMIN_EMAIL = "mizuka886@gmail.com";

const AppContainer = styled(Box)({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
});

// Wrapper components for better code splitting
const FileUploadWrapper = ({ questions, setQuestions, apiKey, baseUrl }) => {
  const navigate = useNavigate();

  const handleFileUpload = (uploadedQuestions) => {
    setQuestions(uploadedQuestions);
    navigate("/quiz");
  };

  return (
    <Suspense fallback={<LoadingFallback text="Loading Upload..." />}>
      <ModernFileUpload
        hasAI={!!apiKey}
        apiKey={apiKey}
        baseUrl={baseUrl}
        onFileUpload={handleFileUpload}
      />
    </Suspense>
  );
};

const QuizEngineWrapper = ({ questions, setQuizResults, setShowResults }) => {
  const navigate = useNavigate();

  const handleQuizFinish = (results) => {
    setQuizResults(results);
    setShowResults(true);
    navigate("/results");
  };

  if (!questions) {
    navigate("/dashboard");
    return null;
  }

  return (
    <Suspense fallback={<LoadingFallback text="Loading Quiz..." />}>
      <ModernQuizEngine questions={questions} onFinish={handleQuizFinish} />
    </Suspense>
  );
};

const ResultPageWrapper = ({ questions, quizResults, showResults, resetQuiz }) => {
  const navigate = useNavigate();

  const handleNewQuiz = () => {
    resetQuiz();
    navigate("/dashboard");
  };

  if (!showResults || !quizResults) {
    navigate("/dashboard");
    return null;
  }

  return (
    <Suspense fallback={<LoadingFallback text="Loading Results..." />}>
      <ModernResultPage
        questions={questions}
        userAnswers={quizResults.answers}
        onNewQuiz={handleNewQuiz}
      />
    </Suspense>
  );
};

const DashboardWrapper = () => {
  const navigate = useNavigate();

  return (
    <Suspense fallback={<LoadingFallback text="Loading Dashboard..." />}>
      <Dashboard
        onCreateQuiz={() => navigate("/upload")}
        onViewResults={(quiz) => navigate(`/results/${quiz.id}`)}
        onUploadFile={() => navigate("/upload")}
      />
    </Suspense>
  );
};

const HeaderWrapper = ({ onProfileClick, onApiConfigClick, showApiConfig }) => (
  <Suspense fallback={null}>
    <ModernHeader
      onProfileClick={onProfileClick}
      onApiConfigClick={onApiConfigClick}
      showApiConfig={showApiConfig}
    />
  </Suspense>
);

// Main App
const App = () => {
  const { user, loading } = useAuth();
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showApiConfig, setShowApiConfig] = useState(false);

  const [apiKey, setApiKey] = useState(() => {
    try {
      return (
        localStorage.getItem("geminiApiKey") || import.meta.env.VITE_DEFAULT_API_KEY
      );
    } catch {
      return import.meta.env.VITE_DEFAULT_API_KEY;
    }
  });
  const [baseUrl] = useState(import.meta.env.VITE_DEFAULT_BASE_URL);

  const resetQuiz = () => {
    setQuestions(null);
    setQuizResults(null);
    setShowResults(false);
  };

  // Optimized API Key fetching with error handling
  useEffect(() => {
    if (!user || apiKey) return;

    let isMounted = true;

    const fetchApiKey = async () => {
      try {
        const { doc, getDoc, db } = await getFirebase();
        const docSnap = await getDoc(doc(db, "settings", "apiKey"));

        if (!isMounted) return;

        if (docSnap.exists()) {
          const key = docSnap.data().value;
          setApiKey(key);
          try {
            localStorage.setItem("geminiApiKey", key);
          } catch (e) {
            console.warn("LocalStorage not available:", e);
          }
        } else if (user.email === ADMIN_EMAIL && !apiKey) {
          setShowApiConfig(true);
        }
      } catch (err) {
        console.error("Failed to fetch API key:", err);
        if (isMounted && user.email === ADMIN_EMAIL && !apiKey) {
          setShowApiConfig(true);
        }
      }
    };

    const timeoutId = setTimeout(fetchApiKey, 100);
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [user, apiKey]);

  // Loading state
  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoadingFallback text="Loading QuizAI..." />
      </ThemeProvider>
    );
  }

  // Not logged in - Public routes with lazy loading
  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<ModernAuthForm />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    );
  }

  // Logged in - Protected routes with optimized loading
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContainer>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route
              path="/dashboard"
              element={
                <>
                  <HeaderWrapper
                    onProfileClick={() => setShowUserInfo(true)}
                    onApiConfigClick={() => setShowApiConfig(true)}
                    showApiConfig={showApiConfig}
                  />
                  <DashboardWrapper />
                </>
              }
            />

            <Route
              path="/shared"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <ShareQuizModal />
                </Suspense>
              }
            />

            <Route
              path="/upload"
              element={
                <>
                  <HeaderWrapper
                    onProfileClick={() => setShowUserInfo(true)}
                    onApiConfigClick={() => setShowApiConfig(true)}
                    showApiConfig={showApiConfig}
                  />
                  <FileUploadWrapper
                    questions={questions}
                    setQuestions={setQuestions}
                    apiKey={apiKey}
                    baseUrl={baseUrl}
                  />
                </>
              }
            />

            <Route
              path="/quiz"
              element={
                <>
                  <HeaderWrapper
                    onProfileClick={() => setShowUserInfo(true)}
                    onApiConfigClick={() => setShowApiConfig(true)}
                    showApiConfig={showApiConfig}
                  />
                  <QuizEngineWrapper
                    questions={questions}
                    setQuizResults={setQuizResults}
                    setShowResults={setShowResults}
                  />
                </>
              }
            />

            <Route
              path="/results"
              element={
                <>
                  <HeaderWrapper
                    onProfileClick={() => setShowUserInfo(true)}
                    onApiConfigClick={() => setShowApiConfig(true)}
                    showApiConfig={showApiConfig}
                  />
                  <ResultPageWrapper
                    questions={questions}
                    quizResults={quizResults}
                    showResults={showResults}
                    resetQuiz={resetQuiz}
                  />
                </>
              }
            />

            <Route
              path="/admin"
              element={
                user.email === ADMIN_EMAIL ? (
                  <Suspense fallback={<LoadingFallback text="Loading Admin..." />}>
                    <ModernAdminDashboard />
                  </Suspense>
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          {/* Modals - Lazy loaded only when shown */}
          {showUserInfo && (
            <Suspense fallback={null}>
              <ModernUserProfile
                user={user}
                onClose={() => setShowUserInfo(false)}
                isAdmin={user.email === ADMIN_EMAIL}
              />
            </Suspense>
          )}

          {user.email === ADMIN_EMAIL && showApiConfig && (
            <Suspense fallback={null}>
              <ModernAPIConfig
                apiKey={apiKey}
                baseUrl={baseUrl}
                onConfigSave={(newApiKey, newBaseUrl) => {
                  setApiKey(newApiKey);
                  try {
                    localStorage.setItem("geminiApiKey", newApiKey);
                  } catch (e) {
                    console.warn("LocalStorage not available:", e);
                  }
                  setShowApiConfig(false);
                }}
                onClose={() => setShowApiConfig(false)}
              />
            </Suspense>
          )}
        </AppContainer>
      </Router>
    </ThemeProvider>
  );
};

export default App;