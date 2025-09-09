import React, { useState, useMemo, useCallback, lazy, Suspense } from 'react';
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

const ProgressTracking = lazy(() => import('../ProgressTracking/ProgressTracking'));
const AnalyticsDashboard = lazy(() => import('../Analytics/AnalyticsDashboard'));
const RecentQuizzes = lazy(() => import('../RecentQuizzes/RecentQuizzes'));

const ComponentLoader = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
      '& .mini-spinner': {
        width: '24px',
        height: '24px',
        border: '2px solid #e0e0e0',
        borderTop: '2px solid #1976d2',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      },
      '@keyframes spin': {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
      },
    }}
  >
    <div className="mini-spinner" />
  </Box>
);

const getUserInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const WelcomeSection = React.memo(({ user, credits, isPremium, onCreateQuiz }) => {
  const userInitials = useMemo(() => getUserInitials(user?.displayName), [user?.displayName]);
  const firstName = useMemo(() => user?.displayName?.split(' ')[0] || 'User', [user?.displayName]);

  return (
    <WelcomeCard>
      <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
        <Grid container spacing={{ xs: 2, md: 4 }} alignItems="center">
          {/* Removed `item` prop */}
          <Grid xs={12} md={8}>
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
                    sx={{
                      fontWeight: 700,
                      mb: 0.5,
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                    }}
                  >
                    Welcome back, {firstName}!
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      opacity: 0.9,
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    }}
                  >
                    Ready to create some amazing quizzes today?
                  </Typography>
                </Box>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                <Chip
                  icon={isPremium ? <Award size={16} /> : <Users size={16} />}
                  label={isPremium ? 'Premium Member' : `${credits} Credits Available`}
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

          {/* Removed `item` prop */}
          <Grid xs={12} md={4}>
            <Stack spacing={2} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowRight />}
                onClick={onCreateQuiz}
                sx={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontWeight: 600,
                  width: { xs: '100%', md: 'auto' },
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.3)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Create New Quiz
              </Button>

              <Typography
                variant="body2"
                sx={{
                  opacity: 0.8,
                  textAlign: { xs: 'left', md: 'right' },
                  fontSize: '0.875rem',
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
});

WelcomeSection.displayName = 'WelcomeSection';

// rest of your Dashboard stays unchanged

// Optimized view components with error boundaries
const AnalyticsView = React.memo(({ userId, onBack }) => (
	<Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
		<Stack spacing={3}>
			<Button
				variant="outlined"
				onClick={onBack}
				sx={{ alignSelf: 'flex-start' }}
			>
				← Back to Dashboard
			</Button>
			<Suspense fallback={<ComponentLoader />}>
				<AnalyticsDashboard userId={userId} />
			</Suspense>
		</Stack>
	</Container>
));

AnalyticsView.displayName = 'AnalyticsView';

const ProgressView = React.memo(({ userId, onBack }) => (
	<Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
		<Stack spacing={3}>
			<Button
				variant="outlined"
				onClick={onBack}
				sx={{ alignSelf: 'flex-start' }}
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
));

ProgressView.displayName = 'ProgressView';

const RecentQuizzesView = React.memo(({ onBack, onViewResults }) => (
	<Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
		<Stack spacing={3}>
			<Button
				variant="outlined"
				onClick={onBack}
				sx={{ alignSelf: 'flex-start' }}
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
));

RecentQuizzesView.displayName = 'RecentQuizzesView';

// Main Dashboard Component
const Dashboard = ({ onCreateQuiz, onViewResults }) => {
	const { user, credits, isPremium } = useAuth();
	const navigate = useNavigate();
	const [activeView, setActiveView] = useState('dashboard'); // Single state for views

	// Memoize navigation handlers
	const handleUploadNavigation = useCallback(() => navigate('/upload'), [navigate]);
	
	// Memoize view handlers
	const showAnalytics = useCallback(() => setActiveView('analytics'), []);
	const showProgress = useCallback(() => setActiveView('progress'), []);
	const showRecentQuizzes = useCallback(() => setActiveView('recent'), []);
	const showDashboard = useCallback(() => setActiveView('dashboard'), []);

	// Memoize the quick actions with stable references
	const quickActions = useMemo(() => [
		{
			title: 'Upload Document',
			description: 'Upload PDF, DOCX, or paste text to generate quiz',
			icon: <Upload size={32} />,
			color: 'primary',
			action: handleUploadNavigation,
		},
		{
			title: 'AI Quiz Generator',
			description: 'Let AI create questions from your content',
			icon: <Brain size={32} />,
			color: 'secondary',
			action: handleUploadNavigation,
		},
		{
			title: 'View Analytics',
			description: 'Check your performance, and insights',
			icon: <BarChart3 size={32} />,
			color: 'success',
			action: showAnalytics,
		},
		{
			title: 'Your Progress',
			description: 'See your progress, average score, streak and time spent',
			icon: <Zap size={32} />,
			color: 'warning',
			action: showProgress,
		},
		{
			title: 'Recent Quizzes',
			description: 'View and retake your recent quiz attempts',
			icon: <History size={32} />,
			color: 'info',
			action: showRecentQuizzes,
		},
	], [handleUploadNavigation, showAnalytics, showProgress, showRecentQuizzes]);

	// Memoize user ID for child components
	const userId = useMemo(() => user?.uid, [user?.uid]);

	// Render different views based on state
	switch (activeView) {
		case 'analytics':
			return <AnalyticsView userId={userId} onBack={showDashboard} />;
		
		case 'progress':
			return <ProgressView userId={userId} onBack={showDashboard} />;
		
		case 'recent':
			return <RecentQuizzesView onBack={showDashboard} onViewResults={onViewResults} />;
		
		default:
			return (
				<Box sx={{ py: { xs: 2, sm: 4 } }}>
					<Container maxWidth="lg">
						<Stack spacing={{ xs: 3, sm: 4 }}>
							{/* Welcome Section - Memoized */}
							<WelcomeSection
								user={user}
								credits={credits}
								isPremium={isPremium}
								onCreateQuiz={onCreateQuiz}
							/>

							{/* Quick Actions - Memoized */}
							<QuickActions quickActions={quickActions} />
						</Stack>
					</Container>
				</Box>
			);
	}
};

export default React.memo(Dashboard);