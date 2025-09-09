// src/App.jsx
import { useState, useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import theme from "./theme";
import { useAuth } from "./context/AuthContext";

// Loader Component
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

// Route-based Lazy Loading - Only load when route is accessed
const LandingPage = lazy(() => 
  import("./components/Landing/LandingPage").then(module => ({
    default: module.default
  }))
);

const AuthPage = lazy(() => 
  import("./components/Auth/ModernAuthForm").then(module => ({
    default: module.default
  }))
);

// Dashboard Route with its dependencies
const DashboardRoute = lazy(() => 
  Promise.all([
    import("./components/Layout/ModernHeader"),
    import("./components/Dashboard/Dashboard")
  ]).then(([headerModule, dashboardModule]) => ({
    default: ({ 
      onProfileClick, 
      onApiConfigClick, 
      showApiConfig,
      onCreateQuiz,
      onViewResults,
      onUploadFile 
    }) => (
      <>
        <headerModule.default
          onProfileClick={onProfileClick}
          onApiConfigClick={onApiConfigClick}
          showApiConfig={showApiConfig}
        />
        <dashboardModule.default
          onCreateQuiz={onCreateQuiz}
          onViewResults={onViewResults}
          onUploadFile={onUploadFile}
        />
      </>
    )
  }))
);

// Upload Route with its dependencies
const UploadRoute = lazy(() => 
  Promise.all([
    import("./components/Layout/ModernHeader"),
    import("./components/FileUpload/ModernFileUpload")
  ]).then(([headerModule, uploadModule]) => ({
    default: ({ 
      onProfileClick, 
      onApiConfigClick, 
      showApiConfig,
      hasAI,
      apiKey,
      baseUrl,
      onFileUpload 
    }) => (
      <>
        <headerModule.default
          onProfileClick={onProfileClick}
          onApiConfigClick={onApiConfigClick}
          showApiConfig={showApiConfig}
        />
        <uploadModule.default
          hasAI={hasAI}
          apiKey={apiKey}
          baseUrl={baseUrl}
          onFileUpload={onFileUpload}
        />
      </>
    )
  }))
);

// Quiz Route with its dependencies
const QuizRoute = lazy(() => 
  Promise.all([
    import("./components/Layout/ModernHeader"),
    import("./components/Engine/ModernQuizEngine")
  ]).then(([headerModule, quizModule]) => ({
    default: ({ 
      onProfileClick, 
      onApiConfigClick, 
      showApiConfig,
      questions,
      onFinish 
    }) => (
      <>
        <headerModule.default
          onProfileClick={onProfileClick}
          onApiConfigClick={onApiConfigClick}
          showApiConfig={showApiConfig}
        />
        <quizModule.default
          questions={questions}
          onFinish={onFinish}
        />
      </>
    )
  }))
);

// Results Route with its dependencies
const ResultsRoute = lazy(() => 
  Promise.all([
    import("./components/Layout/ModernHeader"),
    import("./components/Results/ModernResultPage")
  ]).then(([headerModule, resultsModule]) => ({
    default: ({ 
      onProfileClick, 
      onApiConfigClick, 
      showApiConfig,
      questions,
      userAnswers,
      onNewQuiz 
    }) => (
      <>
        <headerModule.default
          onProfileClick={onProfileClick}
          onApiConfigClick={onApiConfigClick}
          showApiConfig={showApiConfig}
        />
        <resultsModule.default
          questions={questions}
          userAnswers={userAnswers}
          onNewQuiz={onNewQuiz}
        />
      </>
    )
  }))
);

// Admin Route
const AdminRoute = lazy(() => 
  import("./components/Admin/ModernAdminDashboard").then(module => ({
    default: module.default
  }))
);

// Shared Quiz Route
const SharedQuizRoute = lazy(() => 
  import("./components/ShareQuizModal/ShareQuizModal").then(module => ({
    default: module.default
  }))
);

// Modal Components - Lazy loaded only when needed
const UserProfileModal = lazy(() => 
  import("./components/UserInfo/ModernUserProfile")
);

const ApiConfigModal = lazy(() => 
  import("./components/APIconfig/ModernAPIConfig")
);

// Firebase utilities
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

// Main App Component
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

  // Route handlers
  const handleFileUpload = (uploadedQuestions) => {
    setQuestions(uploadedQuestions);
    window.location.href = "/quiz";
  };

  const handleQuizFinish = (results) => {
    setQuizResults(results);
    setShowResults(true);
    window.location.href = "/results";
  };

  const handleNewQuiz = () => {
    resetQuiz();
    window.location.href = "/dashboard";
  };

  // Fetch API Key
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

  // Not logged in - Public routes
  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route 
              path="/" 
              element={
                <Suspense fallback={<LoadingFallback text="Loading..." />}>
                  <LandingPage />
                </Suspense>
              } 
            />
            <Route 
              path="/auth" 
              element={
                <Suspense fallback={<LoadingFallback text="Loading Auth..." />}>
                  <AuthPage />
                </Suspense>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    );
  }

  // Logged in - Protected routes with route-based splitting
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
                <Suspense fallback={<LoadingFallback text="Loading Dashboard..." />}>
                  <DashboardRoute
                    onProfileClick={() => setShowUserInfo(true)}
                    onApiConfigClick={() => setShowApiConfig(true)}
                    showApiConfig={showApiConfig}
                    onCreateQuiz={() => window.location.href = "/upload"}
                    onViewResults={(quiz) => window.location.href = `/results/${quiz.id}`}
                    onUploadFile={() => window.location.href = "/upload"}
                  />
                </Suspense>
              }
            />

            <Route
              path="/shared"
              element={
                <Suspense fallback={<LoadingFallback text="Loading Shared Quiz..." />}>
                  <SharedQuizRoute />
                </Suspense>
              }
            />

            <Route
              path="/upload"
              element={
                <Suspense fallback={<LoadingFallback text="Loading Upload..." />}>
                  <UploadRoute
                    onProfileClick={() => setShowUserInfo(true)}
                    onApiConfigClick={() => setShowApiConfig(true)}
                    showApiConfig={showApiConfig}
                    hasAI={!!apiKey}
                    apiKey={apiKey}
                    baseUrl={baseUrl}
                    onFileUpload={handleFileUpload}
                  />
                </Suspense>
              }
            />

            <Route
              path="/quiz"
              element={
                questions ? (
                  <Suspense fallback={<LoadingFallback text="Loading Quiz..." />}>
                    <QuizRoute
                      onProfileClick={() => setShowUserInfo(true)}
                      onApiConfigClick={() => setShowApiConfig(true)}
                      showApiConfig={showApiConfig}
                      questions={questions}
                      onFinish={handleQuizFinish}
                    />
                  </Suspense>
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />

            <Route
              path="/results"
              element={
                showResults && quizResults ? (
                  <Suspense fallback={<LoadingFallback text="Loading Results..." />}>
                    <ResultsRoute
                      onProfileClick={() => setShowUserInfo(true)}
                      onApiConfigClick={() => setShowApiConfig(true)}
                      showApiConfig={showApiConfig}
                      questions={questions}
                      userAnswers={quizResults.answers}
                      onNewQuiz={handleNewQuiz}
                    />
                  </Suspense>
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />

            <Route
              path="/admin"
              element={
                user.email === ADMIN_EMAIL ? (
                  <Suspense fallback={<LoadingFallback text="Loading Admin..." />}>
                    <AdminRoute />
                  </Suspense>
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          {/* Modals - Only loaded when needed */}
          {showUserInfo && (
            <Suspense fallback={null}>
              <UserProfileModal
                user={user}
                onClose={() => setShowUserInfo(false)}
                isAdmin={user.email === ADMIN_EMAIL}
              />
            </Suspense>
          )}

          {user.email === ADMIN_EMAIL && showApiConfig && (
            <Suspense fallback={null}>
              <ApiConfigModal
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