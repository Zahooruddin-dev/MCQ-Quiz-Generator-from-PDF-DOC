import { useState, useEffect, lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate
} from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import {
	CssBaseline,
	Box,
	CircularProgress,
	Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Import theme
import theme from './theme';

// Lazy load heavy components
const LandingPage = lazy(() => import('./components/Landing/LandingPage'));
const ModernHeader = lazy(() => import('./components/Layout/ModernHeader'));
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const ModernFileUpload = lazy(() => import('./components/FileUpload/ModernFileUpload'));
const ModernQuizEngine = lazy(() => import('./components/Engine/ModernQuizEngine'));
const ModernResultPage = lazy(() => import('./components/Results/ModernResultPage'));
const ModernAPIConfig = lazy(() => import('./components/APIconfig/ModernAPIConfig'));
const ModernAuthForm = lazy(() => import('./components/Auth/ModernAuthForm'));
const ModernUserProfile = lazy(() => import('./components/UserInfo/ModernUserProfile'));
const ModernAdminDashboard = lazy(() => import('./components/Admin/ModernAdminDashboard'));

// Import context
import { useAuth } from './context/AuthContext';
import ShareQuizModal from './components/ShareQuizModal/ShareQuizModal';

// Lazy load Firebase functions to avoid blocking main thread
const getFirebaseDoc = () => import('firebase/firestore').then(module => ({ doc: module.doc, getDoc: module.getDoc }));
const getFirebaseDb = () => import('./firebaseConfig').then(module => module.db);

const ADMIN_EMAIL = 'mizuka886@gmail.com';

// Styled Components
const LoadingContainer = styled(Box)(({ theme }) => ({
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
	alignItems: 'center',
	minHeight: '100vh',
	background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
	color: 'white',
}));

const AppContainer = styled(Box)({
	minHeight: '100vh',
	display: 'flex',
	flexDirection: 'column',
});

// Loading fallback component
const PageLoading = () => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '400px' 
  }}>
    <CircularProgress />
  </Box>
);

// Component wrappers that have access to navigate
const FileUploadWrapper = ({ questions, setQuestions, apiKey, baseUrl }) => {
  const navigate = useNavigate();
  
  const handleFileUpload = (uploadedQuestions, isAI, options) => {
    setQuestions(uploadedQuestions);
    navigate('/quiz');
  };

  return (
    <ModernFileUpload
      hasAI={!!apiKey}
      apiKey={apiKey}
      baseUrl={baseUrl}
      onFileUpload={handleFileUpload}
    />
  );
};

const QuizEngineWrapper = ({ questions, setQuizResults, setShowResults }) => {
  const navigate = useNavigate();
  
  const handleQuizFinish = (results) => {
    setQuizResults(results);
    setShowResults(true);
    navigate('/results');
  };

  if (!questions) {
    navigate('/dashboard');
    return null;
  }

  return (
    <ModernQuizEngine
      questions={questions}
      onFinish={handleQuizFinish}
    />
  );
};

const ResultPageWrapper = ({ questions, quizResults, showResults, resetQuiz }) => {
  const navigate = useNavigate();
  
  const handleNewQuiz = () => {
    resetQuiz();
    navigate('/dashboard');
  };

  if (!showResults || !quizResults) {
    navigate('/dashboard');
    return null;
  }

  return (
    <ModernResultPage
      questions={questions}
      userAnswers={quizResults.answers}
      onNewQuiz={handleNewQuiz}
    />
  );
};

const DashboardWrapper = () => {
  const navigate = useNavigate();
  
  return (
    <Dashboard
      onCreateQuiz={() => navigate('/upload')}
      onViewResults={(quiz) => navigate(`/results/${quiz.id}`)}
      onUploadFile={() => navigate('/upload')}
    />
  );
};

const App = () => {
  const { user, loading } = useAuth();
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showApiConfig, setShowApiConfig] = useState(false);
  
  const [apiKey, setApiKey] = useState(() => {
    // Get from localStorage first, then fallback to env
    return localStorage.getItem('geminiApiKey') || import.meta.env.VITE_DEFAULT_API_KEY;
  });
  const [baseUrl, setBaseUrl] = useState(import.meta.env.VITE_DEFAULT_BASE_URL);

  // Reset quiz function
  const resetQuiz = () => {
    setQuestions(null);
    setQuizResults(null);
    setShowResults(false);
  };

  // Async fetch API key from Firestore - non-blocking
  useEffect(() => {
    if (!user) return;

    const fetchApiKey = async () => {
      try {
        const { doc, getDoc } = await getFirebaseDoc();
        const db = await getFirebaseDb();
        const docSnap = await getDoc(doc(db, 'settings', 'apiKey'));
        
        if (docSnap.exists()) {
          const key = docSnap.data().value;
          setApiKey(key);
          localStorage.setItem('geminiApiKey', key);
        } else if (user.email === ADMIN_EMAIL && !apiKey) {
          setShowApiConfig(true);
        }
      } catch (err) {
        console.error('Failed to fetch API key:', err);
        if (user.email === ADMIN_EMAIL && !apiKey) {
          setShowApiConfig(true);
        }
      }
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if (window.requestIdleCallback) {
      requestIdleCallback(fetchApiKey);
    } else {
      setTimeout(fetchApiKey, 100);
    }
  }, [user]);

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoadingContainer>
          <CircularProgress size={40} sx={{ color: 'white', mb: 2 }} />
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            Loading QuizAI...
          </Typography>
        </LoadingContainer>
      </ThemeProvider>
    );
  }

  // Show auth form if not authenticated
  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Suspense fallback={<PageLoading />}>
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

  // Main app content for authenticated users
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContainer>
          <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
              />
              
              <Route
                path="/dashboard"
                element={
                  <>
                    <ModernHeader
                      onProfileClick={() => setShowUserInfo(true)}
                      onApiConfigClick={() => setShowApiConfig(true)}
                      showApiConfig={showApiConfig}
                    />
                    <DashboardWrapper />
                  </>
                }
              />
              <Route
              path='/shared'
              element={<ShareQuizModal />}
              ></Route>

              <Route
                path="/upload"
                element={
                  <>
                    <ModernHeader
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
                    <ModernHeader
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
                    <ModernHeader
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
                    <ModernAdminDashboard />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                }
              />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>

          {/* Modals - Only render when needed */}
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
                  setBaseUrl(newBaseUrl);
                  localStorage.setItem('geminiApiKey', newApiKey);
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