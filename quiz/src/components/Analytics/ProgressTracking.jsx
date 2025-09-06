import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Paper,
  Skeleton,
  LinearProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TrendingUpOutlined as TrendingUpIcon,
  GpsFixedOutlined as TargetIcon,
  TimerOutlined as TimerIcon,
  WhatshotOutlined as StreakIcon,
  PollOutlined as QuizIcon,
} from '@mui/icons-material';
import { LineChart } from '@mui/x-charts/LineChart';
import { useAuth } from '../../context/AuthContext';
import { LLMService } from '../../utils/llmService';
import { mockProgressData, formatTime, formatStreak } from './quizAnalyticsMockData';

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  borderRadius: theme.shape.borderRadius * 2,
  background: 'white',
  border: '1px solid',
  borderColor: theme.palette.grey[100],
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const StatCard = ({ icon, label, value, color = 'primary', subtitle }) => (
  <StatsCard elevation={0}>
    <Stack spacing={2} alignItems="center">
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: `var(--mui-palette-${color}-main)15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: `var(--mui-palette-${color}-main)`,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {label}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  </StatsCard>
);

const ProgressTracking = ({ userId, timePeriod = 'all_time', showCharts = true, compact = false }) => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgressData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Try to fetch real data from Firebase
        const llmService = new LLMService('dummy-key', 'dummy-url');
        const dashboardData = await llmService.getDashboardData();
        
        if (dashboardData) {
          // Transform dashboard data to progress data format
          const transformedData = {
            totalQuizzes: dashboardData.quizzesTaken || 0,
            averageScore: dashboardData.avgScore || 0,
            totalTimeSpent: dashboardData.totalTime || 0,
            currentStreak: dashboardData.streak || 0,
            bestScore: 98, // This would need to be calculated from quiz history
            completionRate: 96, // This would need to be calculated
            topicsStudied: 8, // This would need to be calculated
            weeklyProgress: mockProgressData.weeklyProgress, // Use mock data for chart
          };
          setProgressData(transformedData);
        } else {
          // Fallback to mock data
          setProgressData(mockProgressData);
        }
      } catch (error) {
        console.error('Failed to fetch progress data:', error);
        // Use mock data as fallback
        setProgressData(mockProgressData);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [user, timePeriod]);

  if (loading) {
    return (
      <Box>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <TrendingUpIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Your Progress
          </Typography>
        </Stack>
        
        <Stack spacing={3}>
          <Stack direction="row" spacing={2}>
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={120} sx={{ flex: 1, borderRadius: 2 }} />
            ))}
          </Stack>
          {showCharts && (
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          )}
        </Stack>
      </Box>
    );
  }

  const stats = [
    {
      label: 'Total Quizzes',
      value: progressData.totalQuizzes,
      icon: <QuizIcon />,
      color: 'primary',
      subtitle: `${progressData.completionRate}% completion rate`
    },
    {
      label: 'Average Score',
      value: `${Math.round(progressData.averageScore)}%`,
      icon: <TargetIcon />,
      color: 'success',
      subtitle: `Best: ${progressData.bestScore}%`
    },
    {
      label: 'Time Spent',
      value: formatTime(progressData.totalTimeSpent),
      icon: <TimerIcon />,
      color: 'info',
      subtitle: `${progressData.topicsStudied} topics studied`
    },
    {
      label: 'Current Streak',
      value: formatStreak(progressData.currentStreak),
      icon: <StreakIcon />,
      color: 'warning',
      subtitle: 'Keep it up! 🔥'
    },
  ];

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <TrendingUpIcon color="primary" />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Your Progress
        </Typography>
      </Stack>
      
      <Stack spacing={3}>
        {/* Stats Grid */}
        <Stack direction="row" spacing={2}>
          {stats.map((stat, index) => (
            <Box key={index} sx={{ flex: 1 }}>
              <StatCard {...stat} />
            </Box>
          ))}
        </Stack>
        
        {/* Progress Chart */}
        {showCharts && !compact && (
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Weekly Progress Trend
              </Typography>
              
              <Box sx={{ height: 300 }}>
                <LineChart
                  series={[
                    {
                      data: progressData.weeklyProgress.map(item => item.score),
                      label: 'Average Score',
                      color: '#6366F1',
                    },
                  ]}
                  xAxis={[
                    {
                      data: progressData.weeklyProgress.map(item => item.week),
                      scaleType: 'point',
                    },
                  ]}
                  yAxis={[
                    {
                      min: 0,
                      max: 100,
                      label: 'Score (%)',
                    },
                  ]}
                  height={300}
                  margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
                  grid={{ vertical: true, horizontal: true }}
                />
              </Box>
            </CardContent>
          </Card>
        )}
        
        {/* Completion Rate Progress */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Overall Completion Rate
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {progressData.completionRate}%
                </Typography>
              </Stack>
              
              <LinearProgress
                variant="determinate"
                value={progressData.completionRate}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                  },
                }}
              />
              
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                You've completed {progressData.totalQuizzes} out of {Math.round(progressData.totalQuizzes / (progressData.completionRate / 100))} attempted quizzes
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default ProgressTracking;