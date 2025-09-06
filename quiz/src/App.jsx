import { useState, useEffect } from 'react';
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
	Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Import theme
import theme from './theme';
// Import components
import LandingPage from './components/Landing/LandingPage';
import ModernHeader from './components/Layout/ModernHeader';
import Dashboard from './components/Dashboard/Dashboard';
import ModernFileUpload from './components/FileUpload/ModernFileUpload';
import ModernQuizEngine from './components/Engine/ModernQuizEngine';
import ModernResultPage from './components/Results/ModernResultPage';
import ModernAPIConfig from './components/APIconfig/ModernAPIConfig';
import ModernAuthForm from './components/Auth/ModernAuthForm';
import ModernUserProfile  from './components/UserInfo/ModernUserProfile';
import ModernAdminDashboard from './components/Admin/ModernAdminDashboard';

// Import context
import { useAuth } from './context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

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

const MainContent = styled(Box)({
	flex: 1,
	display: 'flex',
	flexDirection: 'column',
});

// Component wrappers that have access to navigate
const FileUploadWrapper = ({ questions, setQuestions, apiKey, baseUrl }) => {
  const navigate = useNavigate();
  
  const handleFileUpload = (uploadedQuestions, isAI, options) => {
    console.log('File upload successful:', { uploadedQuestions, isAI, options });
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
    console.log('Quiz finished:', results);
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
  const [appLoading, setAppLoading] = useState(true);
  const [showApiConfig, setShowApiConfig] = useState(false);
  
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_DEFAULT_API_KEY);
	const [baseUrl, setBaseUrl] = useState(import.meta.env.VITE_DEFAULT_BASE_URL);

  // Reset quiz function
  const resetQuiz = () => {
    setQuestions(null);
    setQuizResults(null);
    setShowResults(false);
  };

  // Add a slight delay to prevent flash of login screen
	useEffect(() => {
		if (!loading) {
			const timer = setTimeout(() => {
				setAppLoading(false);
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [loading]);

	// Fetch API key from Firestore if admin has set it
	useEffect(() => {
		const fetchApiKey = async () => {
			if (!user) return;

			try {
				const docSnap = await getDoc(doc(db, 'settings', 'apiKey'));
				if (docSnap.exists()) {
					const key = docSnap.data().value;
					setApiKey(key);
					localStorage.setItem('geminiApiKey', key);
				} else if (user.email === ADMIN_EMAIL) {
					setShowApiConfig(true);
				}
			} catch (err) {
				console.error('Failed to fetch API key:', err);
				if (user.email === ADMIN_EMAIL) setShowApiConfig(true);
			}
		};

		fetchApiKey();
	}, [user]);

  // Show loading screen while checking auth state
  if (appLoading) {
    return (
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<LoadingContainer>
					<CircularProgress size={60} sx={{ color: 'white', mb: 3 }} />
					<Typography variant='h6' sx={{ fontWeight: 600 }}>
						Loading QuizAI...
					</Typography>
					<Typography variant='body2' sx={{ opacity: 0.8, mt: 1 }}>
						Preparing your AI-powered quiz experience
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
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<ModernAuthForm />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
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

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          {/* Modals */}
          {showUserInfo && (
            <ModernUserProfile
              user={user}
              onClose={() => setShowUserInfo(false)}
              isAdmin={user.email === ADMIN_EMAIL}
            />
          )}

          {user.email === ADMIN_EMAIL && showApiConfig && (
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
          )}
        </AppContainer>
      </Router>
    </ThemeProvider>
  );
};

export default App;