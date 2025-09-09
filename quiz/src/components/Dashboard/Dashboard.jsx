import React, { useState, useMemo, useCallback, lazy, Suspense, useEffect, useRef } from 'react';
import {
	Box,
	Container,
	Typography,
	Grid,
	CardContent,
	Button,
	Stack,
	Avatar,
	Chip,
} from '@mui/material';
import {
	Award,
	Users,
	ArrowRight,
	History,
	Upload,
	Brain,
	BarChart3,
	Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { WelcomeCard } from './StyledCards';
import QuickActions from './QuickActions';

// Preload critical components on idle
const preloadComponents = () => {
	if ('requestIdleCallback' in window) {
		requestIdleCallback(() => {
			import('../ProgressTracking/ProgressTracking');
			import('../Analytics/AnalyticsDashboard');
			import('../RecentQuizzes/RecentQuizzes');
		});
	}
};

// Ultra-lightweight lazy loading with resource hints
const ProgressTracking = lazy(() => 
	import(/* webpackChunkName: "progress", webpackPrefetch: true */ '../ProgressTracking/ProgressTracking')
);
const AnalyticsDashboard = lazy(() => 
	import(/* webpackChunkName: "analytics", webpackPrefetch: true */ '../Analytics/AnalyticsDashboard')
);
const RecentQuizzes = lazy(() => 
	import(/* webpackChunkName: "recent-quizzes", webpackPrefetch: true */ '../RecentQuizzes/RecentQuizzes')
);

// Optimized loading component with intersection observer
const ComponentLoader = React.memo(() => {
	const [isVisible, setIsVisible] = useState(false);
	const loaderRef = useRef(null);
	
	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				setIsVisible(entry.isIntersecting);
			},
			{ threshold: 0.1 }
		);
		
		if (loaderRef.current) {
			observer.observe(loaderRef.current);
		}
		
		return () => observer.disconnect();
	}, []);
	
	return (
		<Box 
			ref={loaderRef}
			sx={{ 
				display: 'flex', 
				justifyContent: 'center', 
				alignItems: 'center', 
				minHeight: '200px',
				opacity: isVisible ? 1 : 0.7,
				transition: 'opacity 0.3s ease',
				'& .mini-spinner': {
					width: '24px',
					height: '24px',
					border: '2px solid #e0e0e0',
					borderTop: '2px solid #1976d2',
					borderRadius: '50%',
					animation: isVisible ? 'spin 1s linear infinite' : 'none'
				},
				'@keyframes spin': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				}
			}}
		>
			<div className="mini-spinner" />
		</Box>
	);
});

ComponentLoader.displayName = 'ComponentLoader';

// Memoized user initials with caching
const userInitialsCache = new Map();
const getUserInitials = (name) => {
	if (!name) return 'U';
	if (userInitialsCache.has(name)) {
		return userInitialsCache.get(name);
	}
	
	const initials = name
		.split(' ')
		.map((word) => word[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
		
	userInitialsCache.set(name, initials);
	return initials;
};

// Ultra-optimized WelcomeSection with deep memoization
const WelcomeSection = React.memo(({ user, credits, isPremium, onCreateQuiz }) => {
	const userDisplayName = user?.displayName;
	
	const userInitials = useMemo(() => getUserInitials(userDisplayName), [userDisplayName]);
	const firstName = useMemo(() => {
		if (!userDisplayName) return 'User';
		return userDisplayName.split(' ')[0];
	}, [userDisplayName]);
	
	const premiumChip = useMemo(() => ({
		icon: isPremium ? <Award size={16} /> : <Users size={16} />,
		label: isPremium ? 'Premium Member' : `${credits} Credits Available`,
	}), [isPremium, credits]);
	
	return (
		<WelcomeCard>
			<CardContent sx={{ p: { xs: 2, sm: 4 } }}>
				<Grid container spacing={{ xs: 2, md: 4 }} alignItems="center">
					<Grid item xs={12} md={8}>
						<Stack spacing={2}>
							<Stack direction="row" spacing={2} alignItems="center">
								<Avatar
									sx={{
										width: { xs: 48, sm: 64 },
										height: { xs: 48, sm: 64 },
										background: 'rgba(255, 255, 255, 0.2)',
										backdropFilter: 'blur(10px)',
										border: '2px solid rgba(255, 255, 255, 0.3)',
										fontWeight: 600,
										fontSize: { xs: '1rem', sm: '1.5rem' },
									}}
								>
									{userInitials}
								</Avatar>
								<Box>
									<Typography 
										variant="h4" 
										component="h1"
										sx={{ 
											fontWeight: 700, 
											mb: 0.5,
											fontSize: { xs: '1.5rem', sm: '2rem' }
										}}
									>
										Welcome back, {firstName}!
									</Typography>
									<Typography 
										variant="body1" 
										component="p"
										sx={{ 
											opacity: 0.9,
											fontSize: { xs: '0.875rem', sm: '1rem' }
										}}
									>
										Ready to create some amazing quizzes today?
									</Typography>
								</Box>
							</Stack>

							<Stack 
								direction={{ xs: 'column', sm: 'row' }} 
								spacing={2} 
								sx={{ mt: 2 }}
							>
								<Chip
									icon={premiumChip.icon}
									label={premiumChip.label}
									sx={{
										background: 'rgba(255, 255, 255, 0.2)',
										color: 'white',
										backdropFilter: 'blur(10px)',
										border: '1px solid rgba(255, 255, 255, 0.3)',
										fontWeight: 600,
									}}
								/>
								<Chip
									label="7 Day Streak 🔥"
									sx={{
										background: 'rgba(255, 215, 0, 0.2)',
										color: 'white',
										backdropFilter: 'blur(10px)',
										border: '1px solid rgba(255, 215, 0, 0.3)',
										fontWeight: 600,
									}}
								/>
							</Stack>
						</Stack>
					</Grid>

					<Grid item xs={12} md={4}>
						<Stack
							spacing={2}
							alignItems={{ xs: 'flex-start', md: 'flex-end' }}
						>
							<Button
								variant="contained"
								size="large"
								endIcon={<ArrowRight size={20} />}
								onClick={onCreateQuiz}
								sx={{
									background: 'rgba(255, 255, 255, 0.2)',
									backdropFilter: 'blur(10px)',
									border: '1px solid rgba(255, 255, 255, 0.3)',
									color: 'white',
									fontWeight: 600,
									width: { xs: '100%', md: 'auto' },
									minHeight: 44,
									'&:hover': {
										background: 'rgba(255, 255, 255, 0.3)',
										transform: 'translateY(-2px)',
									},
									'&:active': {
										transform: 'translateY(0px)',
									},
								}}
							>
								Create New Quiz
							</Button>

							<Typography
								variant="body2"
								component="span"
								sx={{
									opacity: 0.8,
									textAlign: { xs: 'left', md: 'right' },
									fontSize: '0.875rem'
								}}
							>
								Last quiz: 2 days ago
							</Typography>
						</Stack>
					</Grid>
				</Grid>
			</CardContent>
		</WelcomeCard>
	);
}, (prevProps, nextProps) => {
	// Custom comparison for better memoization
	return (
		prevProps.user?.uid === nextProps.user?.uid &&
		prevProps.user?.displayName === nextProps.user?.displayName &&
		prevProps.credits === nextProps.credits &&
		prevProps.isPremium === nextProps.isPremium &&
		prevProps.onCreateQuiz === nextProps.onCreateQuiz
	);
});

WelcomeSection.displayName = 'WelcomeSection';

// Optimized view components with cleanup
const AnalyticsView = React.memo(({ userId, onBack }) => {
	const mountedRef = useRef(true);
	
	useEffect(() => {
		return () => {
			mountedRef.current = false;
		};
	}, []);
	
	return (
		<Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
			<Stack spacing={3}>
				<Button
					variant="outlined"
					onClick={onBack}
					sx={{ 
						alignSelf: 'flex-start',
						minHeight: 36,
						fontSize: '0.875rem'
					}}
				>
					← Back to Dashboard
				</Button>
				<Suspense fallback={<ComponentLoader />}>
					<AnalyticsDashboard userId={userId} />
				</Suspense>
			</Stack>
		</Container>
	);
});

AnalyticsView.displayName = 'AnalyticsView';

const ProgressView = React.memo(({ userId, onBack }) => {
	const mountedRef = useRef(true);
	
	useEffect(() => {
		return () => {
			mountedRef.current = false;
		};
	}, []);
	
	return (
		<Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
			<Stack spacing={3}>
				<Button
					variant="outlined"
					onClick={onBack}
					sx={{ 
						alignSelf: 'flex-start',
						minHeight: 36,
						fontSize: '0.875rem'
					}}
				>
					← Back to Dashboard
				</Button>
				<Suspense fallback={<ComponentLoader />}>
					<ProgressTracking
						userId={userId}
						onBack={onBack}
						timePeriod="all_time"
						showCharts
						key={`progress-${userId}`}
					/>
				</Suspense>
			</Stack>
		</Container>
	);
});

ProgressView.displayName = 'ProgressView';

const RecentQuizzesView = React.memo(({ onBack, onViewResults }) => {
	const mountedRef = useRef(true);
	
	useEffect(() => {
		return () => {
			mountedRef.current = false;
		};
	}, []);
	
	return (
		<Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
			<Stack spacing={3}>
				<Button
					variant="outlined"
					onClick={onBack}
					sx={{ 
						alignSelf: 'flex-start',
						minHeight: 36,
						fontSize: '0.875rem'
					}}
				>
					← Back to Dashboard
				</Button>
				<Suspense fallback={<ComponentLoader />}>
					<RecentQuizzes
						limit={10}
						showFilters={true}
						onQuizClick={onViewResults}
					/>
				</Suspense>
			</Stack>
		</Container>
	);
});

RecentQuizzesView.displayName = 'RecentQuizzesView';

// Quick action icons cache to prevent recreation
const iconCache = {
	upload: <Upload size={32} />,
	brain: <Brain size={32} />,
	analytics: <BarChart3 size={32} />,
	progress: <Zap size={32} />,
	history: <History size={32} />
};

// Main Dashboard Component with comprehensive optimization
const Dashboard = ({ onCreateQuiz, onViewResults }) => {
	const { user, credits, isPremium } = useAuth();
	const navigate = useNavigate();
	const [activeView, setActiveView] = useState('dashboard');
	const mountedRef = useRef(true);
	const preloadTriggered = useRef(false);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			mountedRef.current = false;
			// Clear any caches if needed
			if (userInitialsCache.size > 50) {
				userInitialsCache.clear();
			}
		};
	}, []);

	// Preload components on first render
	useEffect(() => {
		if (!preloadTriggered.current) {
			preloadTriggered.current = true;
			preloadComponents();
		}
	}, []);

	// Stable navigation handlers with cleanup check
	const handleUploadNavigation = useCallback(() => {
		if (mountedRef.current) {
			navigate('/upload');
		}
	}, [navigate]);
	
	// View handlers with stable references
	const viewHandlers = useMemo(() => ({
		showAnalytics: () => mountedRef.current && setActiveView('analytics'),
		showProgress: () => mountedRef.current && setActiveView('progress'),
		showRecentQuizzes: () => mountedRef.current && setActiveView('recent'),
		showDashboard: () => mountedRef.current && setActiveView('dashboard'),
	}), []);

	// Memoized quick actions with cached icons and stable handlers
	const quickActions = useMemo(() => [
		{
			title: 'Upload Document',
			description: 'Upload PDF, DOCX, or paste text to generate quiz',
			icon: iconCache.upload,
			color: 'primary',
			action: handleUploadNavigation,
		},
		{
			title: 'AI Quiz Generator',
			description: 'Let AI create questions from your content',
			icon: iconCache.brain,
			color: 'secondary',
			action: handleUploadNavigation,
		},
		{
			title: 'View Analytics',
			description: 'Check your performance and insights',
			icon: iconCache.analytics,
			color: 'success',
			action: viewHandlers.showAnalytics,
		},
		{
			title: 'Your Progress',
			description: 'See your progress, average score, streak and time spent',
			icon: iconCache.progress,
			color: 'warning',
			action: viewHandlers.showProgress,
		},
		{
			title: 'Recent Quizzes',
			description: 'View and retake your recent quiz attempts',
			icon: iconCache.history,
			color: 'info',
			action: viewHandlers.showRecentQuizzes,
		},
	], [handleUploadNavigation, viewHandlers]);

	// Memoized user data to prevent unnecessary re-renders
	const userData = useMemo(() => ({
		user,
		userId: user?.uid,
		credits,
		isPremium
	}), [user, user?.uid, credits, isPremium]);

	// Render views with proper cleanup
	const renderView = useCallback(() => {
		if (!mountedRef.current) return null;
		
		switch (activeView) {
			case 'analytics':
				return <AnalyticsView userId={userData.userId} onBack={viewHandlers.showDashboard} />;
			
			case 'progress':
				return <ProgressView userId={userData.userId} onBack={viewHandlers.showDashboard} />;
			
			case 'recent':
				return <RecentQuizzesView onBack={viewHandlers.showDashboard} onViewResults={onViewResults} />;
			
			default:
				return (
					<Box sx={{ py: { xs: 2, sm: 4 } }}>
						<Container maxWidth="lg">
							<Stack spacing={{ xs: 3, sm: 4 }}>
								<WelcomeSection
									user={userData.user}
									credits={userData.credits}
									isPremium={userData.isPremium}
									onCreateQuiz={onCreateQuiz}
								/>
								<QuickActions quickActions={quickActions} />
							</Stack>
						</Container>
					</Box>
				);
		}
	}, [activeView, userData, viewHandlers, onCreateQuiz, onViewResults, quickActions]);

	return renderView();
};

export default React.memo(Dashboard, (prevProps, nextProps) => {
	// Custom comparison for Dashboard props
	return (
		prevProps.onCreateQuiz === nextProps.onCreateQuiz &&
		prevProps.onViewResults === nextProps.onViewResults
	);
});