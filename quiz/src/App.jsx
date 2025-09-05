import { useState, useEffect } from 'react';
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
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
import APIConfig from './components/APIconfig/APIConfig';
import ModernAuthForm from './components/Auth/ModernAuthForm';
import UserInfo from './components/UserInfo/UserInfo';
import AdminDashboard from './components/Admin/AdminDashboard';

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

const App = () => {
	const { user, loading } = useAuth();
	const [currentView, setCurrentView] = useState('landing'); // landing, dashboard, upload, quiz, results
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

	// Set initial view based on user state
	useEffect(() => {
		if (user && currentView === 'landing') {
			setCurrentView('dashboard');
		}
	}, [user, currentView]);

	// Navigation handlers
	const handleGetStarted = () => {
		if (user) {
			setCurrentView('dashboard');
		} else {
			setCurrentView('auth');
		}
	};

	const handleCreateQuiz = () => setCurrentView('upload');
	const handleViewResults = (quiz) => {
		if (quiz) {
			// Handle viewing specific quiz results
			console.log('Viewing results for:', quiz);
		}
		setCurrentView('results');
	};
	const handleUploadFile = () => setCurrentView('upload');

	const handleFileUpload = (generatedQuestions) => {
		setQuestions(generatedQuestions);
		setCurrentView('quiz');
	};

	const handleQuizFinish = (results) => {
		setQuizResults(results);
		setShowResults(true);
		setCurrentView('results');
	};

	const handleNewQuiz = () => {
		setQuestions(null);
		setQuizResults(null);
		setShowResults(false);
		setCurrentView('dashboard');
	};

	const handleBackToDashboard = () => {
		setCurrentView('dashboard');
	};

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
				<ModernAuthForm />
			</ThemeProvider>
		);
	}

	// Main app content for authenticated users
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Router>
				<Routes>
					<Route
						path='/'
						element={
							<AppContainer>
								{/* Header - only show when not on landing page */}
								{currentView !== 'landing' && (
									<ModernHeader
										onProfileClick={() => setShowUserInfo(true)}
										onApiConfigClick={() => setShowApiConfig(true)}
										showApiConfig={showApiConfig}
									/>
								)}

								<MainContent>
									{/* User Info Modal */}
									{showUserInfo && (
										<UserInfo
											user={user}
											onClose={() => setShowUserInfo(false)}
											isAdmin={user.email === ADMIN_EMAIL}
										/>
									)}

									{/* API Config Modal */}
									{user.email === ADMIN_EMAIL && showApiConfig && (
										<APIConfig
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

									{/* Main Content Based on Current View */}
									{currentView === 'landing' && (
										<LandingPage onGetStarted={handleGetStarted} />
									)}

									{currentView === 'dashboard' && (
										<Dashboard
											onCreateQuiz={handleCreateQuiz}
											onViewResults={handleViewResults}
											onUploadFile={handleUploadFile}
										/>
									)}

									{currentView === 'upload' && (
										<ModernFileUpload
											hasAI={!!apiKey}
											apiKey={apiKey}
											baseUrl={baseUrl}
											onFileUpload={handleFileUpload}
											onReconfigure={
												user.email === ADMIN_EMAIL
													? () => setShowApiConfig(true)
													: undefined
											}
										/>
									)}

									{currentView === 'quiz' && questions && (
										<ModernQuizEngine
											questions={questions}
											onFinish={handleQuizFinish}
											apiKey={apiKey}
											baseUrl={baseUrl}
										/>
									)}

									{currentView === 'results' && showResults && quizResults && (
										<ModernResultPage
											questions={questions}
											userAnswers={quizResults.answers}
											onNewQuiz={handleNewQuiz}
											fileName={quizResults.fileName || 'Quiz'}
										/>
									)}
								</MainContent>
							</AppContainer>
						}
					/>

					<Route
						path='/admin'
						element={
							user.email === ADMIN_EMAIL ? (
								<AdminDashboard />
							) : (
								<Navigate to='/' replace />
							)
						}
					/>

					{/* Fallback route */}
					<Route path='*' element={<Navigate to='/' replace />} />
				</Routes>
			</Router>
		</ThemeProvider>
	);
};

export default App;
