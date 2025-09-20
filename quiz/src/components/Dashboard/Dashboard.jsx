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
  useTheme,
  useMediaQuery,
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
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { WelcomeCard } from './StyledCards';
import QuickActions from './QuickActions';

const ProgressTracking = lazy(() => import('./ProgressTracking/ProgressTracking'));
const AnalyticsDashboard = lazy(() => import('./Analytics/AnalyticsDashboard'));
const RecentQuizzes = lazy(() => import('./RecentQuizzes/RecentQuizzes'));

const ComponentLoader = () => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        '& .mini-spinner': {
          width: '32px',
          height: '32px',
          border: `3px solid ${theme.palette.grey[200]}`,
          borderTop: `3px solid ${theme.palette.primary.main}`,
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
};

// Simple error boundary to protect lazy views
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('Dashboard view error:', error, info);
  }
  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
  };
  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Typography variant="h6" color="error">Something went wrong</Typography>
            <Typography variant="body2" color="text.secondary">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </Typography>
            <Button variant="outlined" onClick={this.handleReset}>Back to Dashboard</Button>
          </Stack>
        </Container>
      );
    }
    return this.props.children;
  }
}

const getUserInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const WelcomeSection = React.memo(({ user, credits, isPremium, userDataLoading, onCreateQuiz }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const userInitials = useMemo(() => getUserInitials(user?.displayName), [user?.displayName]);
  const firstName = useMemo(() => user?.displayName?.split(' ')[0] || 'User', [user?.displayName]);

  return (
    <WelcomeCard>
      <CardContent sx={{ 
        p: { xs: 2.5, sm: 3.5, md: 4.5 },
        '&:last-child': { pb: { xs: 2.5, sm: 3.5, md: 4.5 } }
      }}>
        <Stack spacing={{ xs: 2.5, sm: 3.5 }}>
          {/* Header Section */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={{ xs: 2, sm: 3 }} 
            alignItems={{ xs: 'center', sm: 'flex-start' }}
            textAlign={{ xs: 'center', sm: 'left' }}
          >
            <Avatar
              sx={{
                width: { xs: 64, sm: 80 },
                height: { xs: 64, sm: 80 },
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '2rem' },
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                flexShrink: 0,
              }}
            >
              {userInitials}
            </Avatar>
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 800,
                  mb: { xs: 0.5, sm: 1 },
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                  lineHeight: { xs: 1.3, sm: 1.2 },
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  color: 'white',
                  wordBreak: 'break-word',
                }}
              >
                Welcome back, {firstName}!
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  opacity: 0.9,
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  fontWeight: 400,
                  lineHeight: 1.5,
                  color: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                Ready to create some amazing quizzes today?
              </Typography>
            </Box>
          </Stack>

          {/* Status and Action Section */}
          <Stack 
            direction={{ xs: 'column', lg: 'row' }} 
            spacing={{ xs: 2.5, lg: 3 }} 
            alignItems={{ xs: 'stretch', lg: 'flex-end' }}
            justifyContent="space-between"
          >
            {/* Status Chips */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={{ xs: 1.5, sm: 2 }}
              sx={{ 
                flex: 1,
                alignItems: { xs: 'stretch', sm: 'flex-start' }
              }}
            >
              <Chip
                icon={userDataLoading ? 
                  <Loader2 size={18} style={{animation: 'spin 1s linear infinite'}} /> : 
                  (isPremium ? <Award size={18} /> : <Users size={18} />)
                }
                label={userDataLoading ? 'Loading...' : (isPremium ? 'Premium Member' : `${credits} Credits Available`)}
                sx={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '0.9rem' },
                  height: { xs: 40, sm: 44 },
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  '& .MuiChip-icon': {
                    color: 'white',
                  },
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              />
              <Chip
                label="7 Day Streak 🔥"
                sx={{
                  background: 'rgba(255, 193, 7, 0.9)',
                  color: 'rgba(0, 0, 0, 0.87)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 193, 7, 0.3)',
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '0.9rem' },
                  height: { xs: 40, sm: 44 },
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
              />
            </Stack>

            {/* Action Button */}
            <Stack spacing={1.5} alignItems={{ xs: 'stretch', lg: 'flex-end' }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowRight size={20} />}
                onClick={onCreateQuiz}
                fullWidth={isMobile}
                sx={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  px: { xs: 3, sm: 4 },
                  py: { xs: 1.5, sm: 2 },
                  borderRadius: { xs: 2, sm: 2.5 },
                  textTransform: 'none',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  minWidth: { lg: '200px' },
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&:active': {
                    transform: 'translateY(0px)',
                  },
                  // Mobile touch optimization
                  '@media (hover: none)': {
                    '&:hover': {
                      transform: 'none',
                      background: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:active': {
                      transform: 'scale(0.98)',
                      background: 'rgba(255, 255, 255, 0.25)',
                    },
                  },
                }}
              >
                Create New Quiz
              </Button>

              <Typography
                variant="body2"
                sx={{
                  opacity: 0.8,
                  textAlign: { xs: 'center', lg: 'right' },
                  fontSize: '0.875rem',
                  fontWeight: 400,
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                Last quiz: 2 days ago
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </WelcomeCard>
  );
});

WelcomeSection.displayName = 'WelcomeSection';

// Optimized view components with error boundaries
const AnalyticsView = React.memo(({ userId, onBack }) => (
  <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
    <Stack spacing={3}>
      <Button
        variant="outlined"
        onClick={onBack}
        sx={{ 
          alignSelf: 'flex-start',
          borderRadius: { xs: 1.5, sm: 2 },
          px: { xs: 2.5, sm: 3 },
          py: { xs: 1, sm: 1.25 },
          fontWeight: 600,
          fontSize: { xs: '0.875rem', sm: '1rem' },
        }}
      >
        ← Back to Dashboard
      </Button>
      <ErrorBoundary onReset={onBack}>
        <Suspense fallback={<ComponentLoader />}>
          <AnalyticsDashboard userId={userId} />
        </Suspense>
      </ErrorBoundary>
    </Stack>
  </Container>
));

AnalyticsView.displayName = 'AnalyticsView';

const ProgressView = React.memo(({ userId, onBack }) => (
  <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
    <Stack spacing={3}>
      <Button
        variant="outlined"
        onClick={onBack}
        sx={{ 
          alignSelf: 'flex-start',
          borderRadius: { xs: 1.5, sm: 2 },
          px: { xs: 2.5, sm: 3 },
          py: { xs: 1, sm: 1.25 },
          fontWeight: 600,
          fontSize: { xs: '0.875rem', sm: '1rem' },
        }}
      >
        ← Back to Dashboard
      </Button>
      <ErrorBoundary onReset={onBack}>
        <Suspense fallback={<ComponentLoader />}>
          <ProgressTracking
            userId={userId}
            onBack={onBack}
            timePeriod="all_time"
            showCharts
            key={`progress-${userId}`}
          />
        </Suspense>
      </ErrorBoundary>
    </Stack>
  </Container>
));

ProgressView.displayName = 'ProgressView';

const RecentQuizzesView = React.memo(({ onBack, onViewResults, onResumeQuiz, onRetakeQuiz }) => (
  <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
    <Stack spacing={3}>
      <Button
        variant="outlined"
        onClick={onBack}
        sx={{ 
          alignSelf: 'flex-start',
          borderRadius: { xs: 1.5, sm: 2 },
          px: { xs: 2.5, sm: 3 },
          py: { xs: 1, sm: 1.25 },
          fontWeight: 600,
          fontSize: { xs: '0.875rem', sm: '1rem' },
        }}
      >
        ← Back to Dashboard
      </Button>
      <ErrorBoundary onReset={onBack}>
        <Suspense fallback={<ComponentLoader />}>
          <RecentQuizzes
            limit={50}
            showFilters={true}
            isFullPage={true}
            onQuizClick={onViewResults}
            onResumeQuiz={onResumeQuiz}
            onRetakeQuiz={onRetakeQuiz}
          />
        </Suspense>
      </ErrorBoundary>
    </Stack>
  </Container>
));

RecentQuizzesView.displayName = 'RecentQuizzesView';

// Main Dashboard Component
const Dashboard = ({ onCreateQuiz, onViewResults, onResumeQuiz, onRetakeQuiz }) => {
  const { user, credits, isPremium, userDataLoading } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      title: 'AI Quiz Generator',
      description: 'Let AI generate quizzes from your documents',
      icon: <Brain size={isMobile ? 24 : 28} />,
      color: 'secondary',
      action: handleUploadNavigation,
    },
    {
      title: 'Upload Document',
      description: 'Upload PDF, DOCX, or paste text to generate quiz',
      icon: <Upload size={isMobile ? 24 : 28} />,
      color: 'primary',
      action: handleUploadNavigation,
    },
    {
      title: 'View Analytics',
      description: 'Check your performance and insights',
      icon: <BarChart3 size={isMobile ? 24 : 28} />,
      color: 'success',
      action: showAnalytics,
    },
    {
      title: 'Your Progress',
      description: 'See progress, average score, streak and time spent',
      icon: <Zap size={isMobile ? 24 : 28} />,
      color: 'warning',
      action: showProgress,
    },
    {
      title: 'Recent Quizzes',
      description: 'View and retake your recent quiz attempts',
      icon: <History size={isMobile ? 24 : 28} />,
      color: 'info',
      action: showRecentQuizzes,
    },
  ], [handleUploadNavigation, showAnalytics, showProgress, showRecentQuizzes, isMobile]);

  // Memoize user ID for child components
  const userId = useMemo(() => user?.uid, [user?.uid]);

  // Render different views based on state
  switch (activeView) {
    case 'analytics':
      return <AnalyticsView userId={userId} onBack={showDashboard} />;
    
    case 'progress':
      return <ProgressView userId={userId} onBack={showDashboard} />;
    
    case 'recent':
      return (
        <RecentQuizzesView 
          onBack={showDashboard} 
          onViewResults={onViewResults}
          onResumeQuiz={onResumeQuiz}
          onRetakeQuiz={onRetakeQuiz}
        />
      );
    
    default:
      return (
        <Box sx={{ 
          py: { xs: 2, sm: 3, md: 4 },
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 100%)',
        }}>
          <Container maxWidth="lg">
            <Stack spacing={{ xs: 3, sm: 4, md: 5 }}>
              {/* Welcome Section - Memoized */}
              <WelcomeSection
                user={user}
                credits={credits}
                isPremium={isPremium}
                userDataLoading={userDataLoading}
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