import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Upload,
  Brain,
  BarChart3,
  Zap,
  ArrowRight,
  History,
  Award,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ProgressTracking from '../Analytics/ProgressTracking';
import RecentQuizzes from '../Analytics/RecentQuizzes';
import { useNavigate } from 'react-router-dom';

const WelcomeCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '40%',
    height: '100%',
    background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
}));

const ActionCard = styled(Card)(({ theme }) => ({
  height: '100%',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '1px solid',
  borderColor: theme.palette.grey[200],
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    borderColor: theme.palette.primary.main,
    '& .action-icon': {
      transform: 'scale(1.1)',
      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
      color: 'white',
    },
  },
}));

const RecentActivityCard = styled(Card)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const Dashboard = ({ onCreateQuiz, onViewResults, onUploadFile }) => {
  const { user, credits, isPremium } = useAuth();
  const navigate = useNavigate();
  const [showAnalytics, setShowAnalytics] = useState(false);

  const [recentQuizzes] = useState([
    {
      id: 1,
      title: 'JavaScript Fundamentals',
      date: '2024-01-15',
      score: 85,
      questions: 10,
      status: 'completed',
    },
    {
      id: 2,
      title: 'React Components',
      date: '2024-01-14',
      score: 92,
      questions: 15,
      status: 'completed',
    },
    {
      id: 3,
      title: 'Database Design',
      date: '2024-01-13',
      score: 78,
      questions: 12,
      status: 'completed',
    },
  ]);

  const quickActions = [
    {
      title: 'Upload Document',
      description: 'Upload PDF, DOCX, or paste text to generate quiz',
      icon: <Upload size={32} />,
      color: 'primary',
      action: () => navigate('/upload'),
    },
    {
      title: 'AI Quiz Generator',
      description: 'Let AI create questions from your content',
      icon: <Brain size={32} />,
      color: 'secondary',
      action: () => navigate('/upload'),
    },
    {
      title: 'View Analytics',
      description: 'Check your performance and progress',
      icon: <BarChart3 size={32} />,
      color: 'success',
      action: () => setShowAnalytics(true),
    },
    {
      title: 'Quick Quiz',
      description: 'Start a practice quiz immediately',
      icon: <Zap size={32} />,
      color: 'warning',
      action: () => console.log('Quick quiz'),
    },
  ];

  const getScoreColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // 🔄 Analytics Mode
  if (showAnalytics) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Button
            variant="outlined"
            onClick={() => setShowAnalytics(false)}
            sx={{ alignSelf: 'flex-start' }}
          >
            ← Back to Dashboard
          </Button>
          <ProgressTracking
            userId={user?.uid}
            timePeriod="all_time"
            showCharts={true}
          />
        </Stack>
      </Container>
    );
  }

  // 🏠 Default Dashboard Mode
  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          {/* Welcome Section */}
          <WelcomeCard>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          width: 64,
                          height: 64,
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          fontWeight: 600,
                          fontSize: '1.5rem',
                        }}
                      >
                        {getUserInitials(user?.displayName)}
                      </Avatar>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                          Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                          Ready to create some amazing quizzes today?
                        </Typography>
                      </Box>
                    </Stack>
                    
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
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
                
                <Grid item xs={12} md={4}>
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
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.3)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      Create New Quiz
                    </Button>
                    
                    <Typography variant="body2" sx={{ opacity: 0.8, textAlign: { xs: 'left', md: 'right' } }}>
                      Last quiz: 2 days ago
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </WelcomeCard>

          {/* Quick Actions */}
          <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={3}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <ActionCard onClick={action.action}>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Stack spacing={2} alignItems="center">
                        <Box
                          className="action-icon"
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: 2,
                            background: `${action.color === 'primary' ? '#6366F1' :
                              action.color === 'secondary' ? '#8B5CF6' :
                              action.color === 'success' ? '#10B981' :
                              action.color === 'warning' ? '#F59E0B' : '#3B82F6'}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: action.color === 'primary' ? '#6366F1' :
                              action.color === 'secondary' ? '#8B5CF6' :
                              action.color === 'success' ? '#10B981' :
                              action.color === 'warning' ? '#F59E0B' : '#3B82F6',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {action.icon}
                        </Box>
                        
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {action.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
                            {action.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </ActionCard>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Progress Tracking */}
{/*           <ProgressTracking userId={user?.uid} timePeriod="all_time" showCharts={true} compact={false} />
 */}
          {/* Recent Activity */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Recent Quizzes
              </Typography>
              <Button endIcon={<History size={16} />} sx={{ color: 'text.secondary' }}>
                View All
              </Button>
            </Stack>
            
            <Grid container spacing={3}>
              {recentQuizzes.map((quiz) => (
                <Grid item xs={12} md={4} key={quiz.id}>
                  <RecentActivityCard>
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {quiz.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {new Date(quiz.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </Typography>
                          </Box>
                          
                          <Chip
                            label={`${quiz.score}%`}
                            size="small"
                            color={getScoreColor(quiz.score)}
                            sx={{ fontWeight: 600 }}
                          />
                        </Stack>
                        
                        <Box>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              Progress
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {quiz.questions} questions
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={quiz.score}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                background: quiz.score >= 90
                                  ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                                  : quiz.score >= 70
                                  ? 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)'
                                  : 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)',
                              },
                            }}
                          />
                        </Box>
                        
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{ flex: 1 }}
                            onClick={() => onViewResults(quiz)}
                          >
                            View Results
                          </Button>
                          <IconButton size="small" color="primary">
                            <ArrowRight size={16} />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </RecentActivityCard>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default Dashboard;
