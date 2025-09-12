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
  Loader2,
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
        width: '32px',
        height: '32px',
        border: '3px solid #f3f4f6',
        borderTop: '3px solid #3b82f6',
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
          <Stack spacing={2}>
            <Typography variant="h6">Something went wrong</Typography>
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
  const userInitials = useMemo(() => getUserInitials(user?.displayName), [user?.displayName]);
  const firstName = useMemo(() => user?.displayName?.split(' ')[0] || 'User', [user?.displayName]);

  return (
    <WelcomeCard>
      <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
        <Stack spacing={{ xs: 3, sm: 4 }}>
          {/* Header Section */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={{ xs: 2, sm: 3 }} 
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Avatar
              sx={{
                width: { xs: 56, sm: 72 },
                height: { xs: 56, sm: 72 },
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                fontWeight: 700,
                fontSize: { xs: '1.25rem', sm: '1.75rem' },
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              }}
            >
              {userInitials}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
                  lineHeight: 1.2,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
              >
                Welcome back, {firstName}!
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  opacity: 0.95,
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  fontWeight: 400,
                  lineHeight: 1.5,
                  color:'#d5d5d5'
                }}
              >
                Ready to create some amazing quizzes today?
              </Typography>
            </Box>
          </Stack>

          {/* Status and Action Section */}
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={{ xs: 3, md: 4 }} 
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent="space-between"
          >
            {/* Status Chips */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={{ xs: 1.5, sm: 2 }}
              sx={{ flex: 1 }}
            >
              <Chip
                icon={userDataLoading ? <Loader2 size={18} style={{animation: 'spin 1s linear infinite'}} /> : (isPremium ? <Award size={18} /> : <Users size={18} />)}
                label={userDataLoading ? 'Loading...' : (isPremium ? 'Premium Member' : `${credits} Credits Available`)}
                sx={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '0.9rem' },
                  height: { xs: 36, sm: 40 },
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
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
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 193, 7, 0.3)',
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '0.9rem' },
                  height: { xs: 36, sm: 40 },
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              />
            </Stack>

            {/* Action Button */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'stretch', md: 'flex-end' } }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowRight size={20} />}
                onClick={onCreateQuiz}
                sx={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: { xs: '0.95rem', sm: '1rem' },
                  px: { xs: 3, sm: 4 },
                  py: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  minWidth: { xs: 'auto', md: '180px' },
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.35)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                  },
                  '&:active': {
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Create New Quiz
              </Button>

              <Typography
                variant="body2"
                sx={{
                  opacity: 0.85,
                  textAlign: { xs: 'center', md: 'right' },
                  fontSize: '0.875rem',
                  fontWeight: 400,
                  color:'#d5d5d5',
                  mt: 1.5,
                }}
              >
                Last quiz: 2 days ago
              </Typography>
            </Box>
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
          borderRadius: 2,
          px: 3,
          py: 1,
          fontWeight: 600,
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
          borderRadius: 2,
          px: 3,
          py: 1,
          fontWeight: 600,
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
          borderRadius: 2,
          px: 3,
          py: 1,
          fontWeight: 600,
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
      icon: <Upload size={28} />,
      color: 'primary',
      action: handleUploadNavigation,
    },
    {
      title: 'AI Quiz Generator',
      description: 'Let AI create questions from your content',
      icon: <Brain size={28} />,
      color: 'secondary',
      action: handleUploadNavigation,
    },
    {
      title: 'View Analytics',
      description: 'Check your performance and insights',
      icon: <BarChart3 size={28} />,
      color: 'success',
      action: showAnalytics,
    },
    {
      title: 'Your Progress',
      description: 'See progress, average score, streak and time spent',
      icon: <Zap size={28} />,
      color: 'warning',
      action: showProgress,
    },
    {
      title: 'Recent Quizzes',
      description: 'View and retake your recent quiz attempts',
      icon: <History size={28} />,
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
          py: { xs: 3, sm: 4, md: 5 },
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 100%)',
        }}>
          <Container maxWidth="lg">
            <Stack spacing={{ xs: 4, sm: 5, md: 6 }}>
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