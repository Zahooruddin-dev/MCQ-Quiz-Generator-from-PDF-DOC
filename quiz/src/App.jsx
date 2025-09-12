// src/App.jsx - Optimized with safe route-based code splitting and quiz persistence
import { useState, useEffect, lazy, Suspense } from 'react';
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
	useNavigate,
	useParams,
} from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import theme from './theme';
import { useAuth } from './context/AuthContext';
import ShareQuizModal from './components/ShareQuizModal/ShareQuizModal';
import { QuizManager, initializeQuizManager } from './utils/quizManager';

// Loader
const OptimizedLoader = styled(Box)(({ theme }) => ({
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
	alignItems: 'center',
	minHeight: '100vh',
	background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
	color: 'white',
	'& .spinner': {
		width: '32px',
		height: '32px',
		border: '3px solid rgba(255,255,255,0.3)',
		borderTop: '3px solid white',
		borderRadius: '50%',
		animation: 'spin 1s linear infinite',
		marginBottom: '16px',
	},
	'@keyframes spin': {
		'0%': { transform: 'rotate(0deg)' },
		'100%': { transform: 'rotate(360deg)' },
	},
}));

const LoadingFallback = ({ text = 'Loading...' }) => (
	<OptimizedLoader>
		<div className='spinner' />
		<Typography
			variant='h6'
			sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}
		>
			{text}
		</Typography>
	</OptimizedLoader>
);

// Route-based lazy imports - Only load when needed
const LandingPage = lazy(() => import('./components/Landing/LandingPage'));
const ModernAuthForm = lazy(() => import('./components/Auth/ModernAuthForm'));

// Main app components - loaded together for performance
const ModernHeader = lazy(() => import('./components/Layout/ModernHeader'));
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));

// Feature-specific components
const ModernFileUpload = lazy(() =>
	import('./components/FileUpload/ModernFileUpload')
);
const ModernQuizEngine = lazy(() =>
	import('./components/Engine/ModernQuizEngine')
);
const ModernResultPage = lazy(() =>
	import('./components/Results/ModernResultPage')
);

// Admin and settings
const ModernAPIConfig = lazy(() =>
	import('./components/APIconfig/ModernAPIConfig')
);
const ModernUserProfile = lazy(() =>
	import('./components/UserInfo/ModernUserProfile')
);
const ModernAdminDashboard = lazy(() =>
	import('./components/Admin/ModernAdminDashboard')
);

// Optimized Firebase operations
let firebaseCache = null;
const getFirebase = async () => {
	if (firebaseCache) return firebaseCache;

	const [firestoreModule, configModule] = await Promise.all([
		import('firebase/firestore'),
		import('./firebaseConfig'),
	]);

	firebaseCache = {
		doc: firestoreModule.doc,
		getDoc: firestoreModule.getDoc,
		db: configModule.db,
	};

	return firebaseCache;
};

const ADMIN_EMAIL = 'mizuka886@gmail.com';

const AppContainer = styled(Box)({
	minHeight: '100vh',
	display: 'flex',
	flexDirection: 'column',
});

// Wrapper components for better code splitting
const FileUploadWrapper = ({ apiKey, baseUrl }) => {
	const navigate = useNavigate();

	const handleFileUpload = (uploadedQuestions, isAI, options) => {
		// Create new quiz session with uploaded questions
		const quiz = QuizManager.createQuiz(uploadedQuestions, {
			title: options?.title || 'New Quiz',
			aiGenerated: isAI,
			source: options?.source || 'File Upload'
		});
		
		navigate(`/quiz/${quiz.id}`);
	};

	return (
		<Suspense fallback={<LoadingFallback text='Loading Upload...' />}>
			<ModernFileUpload
				hasAI={!!apiKey}
				apiKey={apiKey}
				baseUrl={baseUrl}
				onFileUpload={handleFileUpload}
			/>
		</Suspense>
	);
};

const QuizEngineWrapper = () => {
	const navigate = useNavigate();
	const { quizId } = useParams();
	const [quiz, setQuiz] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const loadQuiz = async () => {
			try {
				setLoading(true);
				let currentQuiz;
				
				if (quizId) {
					// Load quiz by ID
					currentQuiz = await QuizManager.getQuizById(quizId);
					if (!currentQuiz) {
						setError('Quiz not found');
						return;
					}
				} else {
					// Load current active quiz
					currentQuiz = QuizManager.getCurrentQuiz();
					if (!currentQuiz) {
						navigate('/dashboard');
						return;
					}
				}
				
				setQuiz(currentQuiz);
			} catch (err) {
				console.error('Failed to load quiz:', err);
				setError('Failed to load quiz');
			} finally {
				setLoading(false);
			}
		};
		
		loadQuiz();
	}, [quizId, navigate]);

	const handleQuizFinish = (results) => {
		// Complete the quiz and get results
		if (quiz) {
			quiz.complete();
			navigate(`/results/${quiz.id}`);
		}
	};

	if (loading) {
		return <LoadingFallback text='Loading Quiz...' />;
	}

	if (error) {
		return (
			<OptimizedLoader>
				<Typography variant='h6' color='error'>
					{error}
				</Typography>
				<Typography variant='body2' sx={{ mt: 2 }}>
					<button onClick={() => navigate('/dashboard')} style={{ padding: '8px 16px', cursor: 'pointer' }}>
						Go to Dashboard
					</button>
				</Typography>
			</OptimizedLoader>
		);
	}

	if (!quiz) {
		navigate('/dashboard');
		return null;
	}

	return (
		<Suspense fallback={<LoadingFallback text='Loading Quiz...' />}>
			<ModernQuizEngine
				quizSession={quiz}
				onFinish={handleQuizFinish}
				showTimer={true}
			/>
		</Suspense>
	);
};

const ResultPageWrapper = () => {
	const navigate = useNavigate();
	const { quizId } = useParams();
	const [quiz, setQuiz] = useState(null);
	const [results, setResults] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const loadResults = async () => {
			try {
				setLoading(true);
				let currentQuiz;
				
				if (quizId) {
					// Load quiz by ID
					currentQuiz = await QuizManager.getQuizById(quizId);
					if (!currentQuiz) {
						// Try to get results from history
						const savedResults = QuizManager.getQuizResults(quizId);
						if (savedResults) {
							setResults(savedResults);
							return;
						}
						setError('Quiz results not found');
						return;
					}
				} else {
					// Load current active quiz
					currentQuiz = QuizManager.getCurrentQuiz();
					if (!currentQuiz || currentQuiz.status !== 'completed') {
						navigate('/dashboard');
						return;
					}
				}
				
				setQuiz(currentQuiz);
				// Get or generate results
				const quizResults = currentQuiz.getResults();
				setResults(quizResults);
			} catch (err) {
				console.error('Failed to load quiz results:', err);
				setError('Failed to load results');
			} finally {
				setLoading(false);
			}
		};
		
		loadResults();
	}, [quizId, navigate]);

	const handleNewQuiz = () => {
		// Clear current quiz session
		QuizManager.clearCurrentQuiz();
		navigate('/dashboard');
	};

	const handleRetakeQuiz = () => {
		try {
			// Get questions from the quiz or results
			let questions = quiz?.questions || results?.questions;
			
			if (!questions || !Array.isArray(questions) || questions.length === 0) {
				console.error('No questions found for retake:', { quiz, results });
				alert('Unable to retake quiz: No questions found.');
				return;
			}

			// Create new quiz session with same questions
			const newQuiz = QuizManager.createQuiz(questions, {
				title: `Retake: ${quiz?.title || results?.title || 'Quiz'}`,
				aiGenerated: quiz?.aiGenerated || false,
				source: quiz?.source || quiz?.title || results?.title || 'Retake'
			});
			
			console.log('Created new quiz for retake from results page:', newQuiz);
			navigate(`/quiz/${newQuiz.id}`);
		} catch (error) {
			console.error('Error creating retake quiz from results:', error);
			alert('Unable to retake quiz. Please try again.');
		}
	};

	if (loading) {
		return <LoadingFallback text='Loading Results...' />;
	}

	if (error) {
		return (
			<OptimizedLoader>
				<Typography variant='h6' color='error'>
					{error}
				</Typography>
				<Typography variant='body2' sx={{ mt: 2 }}>
					<button onClick={() => navigate('/dashboard')} style={{ padding: '8px 16px', cursor: 'pointer' }}>
						Go to Dashboard
					</button>
				</Typography>
			</OptimizedLoader>
		);
	}

	if (!results) {
		navigate('/dashboard');
		return null;
	}

	return (
		<Suspense fallback={<LoadingFallback text='Loading Results...' />}>
			<ModernResultPage
				questions={quiz ? quiz.questions : results?.questions}
				userAnswers={quiz ? quiz.answers : results?.answers}
				fileName={quiz ? quiz.source || quiz.title : results?.title}
				onNewQuiz={handleNewQuiz}
				onRetakeQuiz={handleRetakeQuiz}
			/>
		</Suspense>
	);
};

const DashboardWrapper = () => {
	const navigate = useNavigate();

	const handleViewResults = (quiz) => {
		console.log('Viewing results for quiz:', quiz);
		if (!quiz || !quiz.id) {
			console.error('Invalid quiz data for view results:', quiz);
			return;
		}
		navigate(`/results/${quiz.id}`);
	};

	const handleResumeQuiz = (quiz) => {
		console.log('Resuming quiz:', quiz);
		if (!quiz || !quiz.id) {
			console.error('Invalid quiz data for resume:', quiz);
			return;
		}
		navigate(`/quiz/${quiz.id}`);
	};

	const handleRetakeQuiz = (quiz) => {
		console.log('Retaking quiz:', quiz);
		if (!quiz) {
			console.error('No quiz data provided for retake');
			return;
		}

		try {
			// Get questions from the quiz data
			let questions = quiz.questions;
			
			// If questions aren't directly available, check if they're in results
			if (!questions && quiz.results && quiz.results.questions) {
				questions = quiz.results.questions;
			}

			if (!questions || !Array.isArray(questions) || questions.length === 0) {
				console.error('No questions found in quiz data:', quiz);
				alert('Unable to retake quiz: No questions found.');
				return;
			}

			// Create new quiz session with same questions
			const newQuiz = QuizManager.createQuiz(questions, {
				title: `Retake: ${quiz.title || quiz.quizTitle || 'Quiz'}`,
				aiGenerated: quiz.aiGenerated || false,
				source: quiz.source || quiz.title || 'Retake'
			});
			
			console.log('Created new quiz for retake:', newQuiz);
			navigate(`/quiz/${newQuiz.id}`);
		} catch (error) {
			console.error('Error creating retake quiz:', error);
			alert('Unable to retake quiz. Please try again.');
		}
	};

	return (
		<Suspense fallback={<LoadingFallback text='Loading Dashboard...' />}>
			<Dashboard
				onCreateQuiz={() => navigate('/upload')}
				onViewResults={handleViewResults}
				onResumeQuiz={handleResumeQuiz}
				onRetakeQuiz={handleRetakeQuiz}
				onUploadFile={() => navigate('/upload')}
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
	const [showApiConfig, setShowApiConfig] = useState(false);

	// Initialize quiz manager on app load
	useEffect(() => {
		initializeQuizManager();
	}, []);

	const [apiKey, setApiKey] = useState(() => {
		try {
			return (
				localStorage.getItem('geminiApiKey') ||
				import.meta.env.VITE_DEFAULT_API_KEY
			);
		} catch {
			return import.meta.env.VITE_DEFAULT_API_KEY;
		}
	});
	const [baseUrl] = useState(import.meta.env.VITE_DEFAULT_BASE_URL);


	// Optimized API Key fetching with error handling
	useEffect(() => {
		if (!user || apiKey) return;

		let isMounted = true;

		const fetchApiKey = async () => {
			try {
				const { doc, getDoc, db } = await getFirebase();
				const docSnap = await getDoc(doc(db, 'settings', 'apiKey'));

				if (!isMounted) return;

				if (docSnap.exists()) {
					const key = docSnap.data().value;
					setApiKey(key);
					try {
						localStorage.setItem('geminiApiKey', key);
					} catch (e) {
						console.warn('LocalStorage not available:', e);
					}
				} else if (user.email === ADMIN_EMAIL && !apiKey) {
					setShowApiConfig(true);
				}
			} catch (err) {
				console.error('Failed to fetch API key:', err);
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
				<LoadingFallback text='Loading QuizAI...' />
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
							<Route path='/' element={<LandingPage />} />
							<Route path='/auth' element={<ModernAuthForm />} />
							<Route path='*' element={<Navigate to='/' replace />} />
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
						<Route path='/' element={<Navigate to='/dashboard' replace />} />

						<Route
							path='/dashboard'
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
							path='/shared'
							element={
								<Suspense fallback={<LoadingFallback />}>
									<ShareQuizModal />
								</Suspense>
							}
						/>

						<Route
							path='/upload'
							element={
								<>
									<HeaderWrapper
										onProfileClick={() => setShowUserInfo(true)}
										onApiConfigClick={() => setShowApiConfig(true)}
										showApiConfig={showApiConfig}
									/>
									<FileUploadWrapper
										apiKey={apiKey}
										baseUrl={baseUrl}
									/>
								</>
							}
						/>

						<Route
							path='/quiz/:quizId?'
							element={
								<>
									<HeaderWrapper
										onProfileClick={() => setShowUserInfo(true)}
										onApiConfigClick={() => setShowApiConfig(true)}
										showApiConfig={showApiConfig}
									/>
									<QuizEngineWrapper />
								</>
							}
						/>

						<Route
							path='/results/:quizId?'
							element={
								<>
									<HeaderWrapper
										onProfileClick={() => setShowUserInfo(true)}
										onApiConfigClick={() => setShowApiConfig(true)}
										showApiConfig={showApiConfig}
									/>
									<ResultPageWrapper />
								</>
							}
						/>

						<Route
							path='/admin'
							element={
								user.email === ADMIN_EMAIL ? (
									<Suspense
										fallback={<LoadingFallback text='Loading Admin...' />}
									>
										<ModernAdminDashboard />
									</Suspense>
								) : (
									<Navigate to='/dashboard' replace />
								)
							}
						/>

						<Route path='*' element={<Navigate to='/dashboard' replace />} />
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
										localStorage.setItem('geminiApiKey', newApiKey);
									} catch (e) {
										console.warn('LocalStorage not available:', e);
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
