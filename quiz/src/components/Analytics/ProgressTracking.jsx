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
  Alert,
  AlertTitle,
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
import { mockProgressData, formatTime, formatStreak } from './quizAnalyticsMockData';
import { db } from '../../firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from 'firebase/firestore';

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
    <Stack spacing={2} alignItems='center'>
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
        <Typography
          variant='h4'
          sx={{ fontWeight: 800, color: 'text.primary' }}
        >
          {value}
        </Typography>
        <Typography
          variant='body2'
          sx={{ color: 'text.secondary', fontWeight: 500 }}
        >
          {label}
        </Typography>
        {subtitle && (
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  </StatsCard>
);

const ProgressTracking = ({
  userId,
  timePeriod = 'all_time',
  showCharts = true,
  compact = false,
}) => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [indexError, setIndexError] = useState(false);

  useEffect(() => {
    const fetchProgressData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch user's quiz history from Firebase
        const quizzesRef = collection(db, 'quizzes');
        const q = query(
          quizzesRef,
          where('userId', '==', user.uid),
          orderBy('completedAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const quizzes = [];
        let totalScore = 0;
        let totalTime = 0;
        let streak = 0;
        let bestScore = 0;

        // Calculate statistics from quiz data
        querySnapshot.forEach((doc) => {
          const quizData = doc.data();
          quizzes.push(quizData);

          totalScore += quizData.score || 0;
          totalTime += quizData.timeTaken || 0;
          bestScore = Math.max(bestScore, quizData.score || 0);

          // Simple streak calculation (you might want to improve this)
          if (quizData.score >= 70) {
            streak++;
          } else {
            streak = 0;
          }
        });

        const totalQuizzes = quizzes.length;
        const averageScore = totalQuizzes > 0 ? totalScore / totalQuizzes : 0;

        // Generate weekly progress data
        const weeklyProgress = calculateWeeklyProgress(quizzes);

        const progressData = {
          totalQuizzes,
          averageScore,
          totalTimeSpent: totalTime,
          currentStreak: streak,
          bestScore,
          completionRate: calculateCompletionRate(quizzes),
          topicsStudied: calculateTopicsStudied(quizzes),
          weeklyProgress,
        };

        setProgressData(progressData);
        setIndexError(false);
      } catch (error) {
        console.error('Failed to fetch progress data:', error);
        
        // Check if it's an index error
        if (error.code === 'failed-precondition' && error.message.includes('index')) {
          setIndexError(true);
        }
        
        // Fallback to empty data instead of mock data
        setProgressData(getEmptyProgressData());
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [user, timePeriod]);

  // Helper functions
  const calculateWeeklyProgress = (quizzes) => {
    // Implementation to group quizzes by week and calculate average scores
    const weeklyData = {};

    quizzes.forEach((quiz) => {
      const week = getWeekNumber(quiz.completedAt.toDate());
      if (!weeklyData[week]) {
        weeklyData[week] = { total: 0, count: 0 };
      }
      weeklyData[week].total += quiz.score;
      weeklyData[week].count++;
    });

    return Object.keys(weeklyData)
      .map((week) => ({
        week: `Week ${week}`,
        score: Math.round(weeklyData[week].total / weeklyData[week].count),
      }))
      .slice(0, 8); // Last 8 weeks
  };

  const calculateCompletionRate = (quizzes) => {
    // Calculate based on completed vs started quizzes if you track that
    return quizzes.length > 0 ? 100 : 0; // Simplified
  };

  const calculateTopicsStudied = (quizzes) => {
    const topics = new Set();
    quizzes.forEach((quiz) => {
      if (quiz.topic) topics.add(quiz.topic);
    });
    return topics.size;
  };

  const getEmptyProgressData = () => ({
    totalQuizzes: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    currentStreak: 0,
    bestScore: 0,
    completionRate: 0,
    topicsStudied: 0,
    weeklyProgress: [],
  });

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  if (loading) {
    return (
      <Box>
        <Stack direction='row' spacing={2} alignItems='center' sx={{ mb: 3 }}>
          <TrendingUpIcon color='primary' />
          <Typography variant='h5' sx={{ fontWeight: 600 }}>
            Your Progress
          </Typography>
        </Stack>

        <Stack spacing={3}>
          <Stack direction='row' spacing={2}>
            {[...Array(4)].map((_, index) => (
              <Skeleton
                key={index}
                variant='rectangular'
                height={120}
                sx={{ flex: 1, borderRadius: 2 }}
              />
            ))}
          </Stack>
          {showCharts && (
            <Skeleton
              variant='rectangular'
              height={300}
              sx={{ borderRadius: 2 }}
            />
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
      subtitle: `${progressData.completionRate}% completion rate`,
    },
    {
      label: 'Average Score',
      value: `${Math.round(progressData.averageScore)}%`,
      icon: <TargetIcon />,
      color: 'success',
      subtitle: `Best: ${progressData.bestScore}%`,
    },
    {
      label: 'Time Spent',
      value: formatTime(progressData.totalTimeSpent),
      icon: <TimerIcon />,
      color: 'info',
      subtitle: `${progressData.topicsStudied} topics studied`,
    },
    {
      label: 'Current Streak',
      value: formatStreak(progressData.currentStreak),
      icon: <StreakIcon />,
      color: 'warning',
      subtitle: 'Keep it up! 🔥',
    },
  ];

  return (
    <Box>
      <Stack direction='row' spacing={2} alignItems='center' sx={{ mb: 3 }}>
        <TrendingUpIcon color='primary' />
        <Typography variant='h5' sx={{ fontWeight: 600 }}>
          Your Progress
        </Typography>
      </Stack>

      {indexError && (
        <Alert severity='warning' sx={{ mb: 2 }}>
          <AlertTitle>Index Required</AlertTitle>
          Please create the required Firestore index by following the link in the console.
          Progress data may be limited until the index is created.
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Stats Grid */}
        <Stack direction='row' spacing={2}>
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
              <Typography variant='h6' sx={{ fontWeight: 600, mb: 3 }}>
                Weekly Progress Trend
              </Typography>

              <Box sx={{ height: 300 }}>
                <LineChart
                  series={[
                    {
                      data: progressData.weeklyProgress.map(
                        (item) => item.score
                      ),
                      label: 'Average Score',
                      color: '#6366F1',
                    },
                  ]}
                  xAxis={[
                    {
                      data: progressData.weeklyProgress.map(
                        (item) => item.week
                      ),
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
              <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'
              >
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  Overall Completion Rate
                </Typography>
                <Typography
                  variant='h6'
                  sx={{ fontWeight: 600, color: 'success.main' }}
                >
                  {progressData.completionRate}%
                </Typography>
              </Stack>

              <LinearProgress
                variant='determinate'
                value={progressData.completionRate}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background:
                      'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                  },
                }}
              />

              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                You've completed {progressData.totalQuizzes} out of{' '}
                {Math.round(
                  progressData.totalQuizzes /
                    (progressData.completionRate / 100)
                )}{' '}
                attempted quizzes
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default ProgressTracking;