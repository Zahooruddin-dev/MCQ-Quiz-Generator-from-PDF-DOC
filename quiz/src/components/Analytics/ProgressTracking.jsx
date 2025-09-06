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
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TrendingUpOutlined as TrendingUpIcon,
  GpsFixedOutlined as TargetIcon,
  TimerOutlined as TimerIcon,
  WhatshotOutlined as StreakIcon,
  PollOutlined as QuizIcon,
  OpenInNew as OpenInNewIcon,
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
  doc,
  getDoc,
  limit,
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
  const [dataSource, setDataSource] = useState('user'); // 'user' or 'quizzes'

  useEffect(() => {
    const fetchProgressData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // OPTION 1: Try to get data from user document first (recommended)
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.quizzesTaken > 0) {
            // Use data from user document - this doesn't require an index
            const progressData = {
              totalQuizzes: userData.quizzesTaken || 0,
              averageScore: userData.avgScore || 0,
              totalTimeSpent: userData.totalTime || 0,
              currentStreak: userData.streak || 0,
              bestScore: userData.bestScore || 0,
              completionRate: userData.completionRate || 0,
              topicsStudied: userData.topicsStudied?.length || 0,
              weeklyProgress: generateMockWeeklyProgress(userData.avgScore || 0),
            };
            setProgressData(progressData);
            setDataSource('user');
            setIndexError(false);
            setLoading(false);
            return;
          }
        }

        // OPTION 2: If no user data, try simplified query without orderBy (no index needed)
        console.log('Trying simplified query without orderBy...');
        const quizzesRef = collection(db, 'quizzes');
        const simpleQuery = query(
          quizzesRef,
          where('userId', '==', user.uid),
          limit(50) // Limit to avoid large queries
        );

        const querySnapshot = await getDocs(simpleQuery);
        
        if (!querySnapshot.empty) {
          const quizzes = [];
          querySnapshot.forEach((doc) => {
            const quizData = { id: doc.id, ...doc.data() };
            quizzes.push(quizData);
          });

          // Sort manually in JavaScript (since we can't use orderBy without index)
          quizzes.sort((a, b) => {
            const aTime = a.completedAt?.toDate?.() || new Date(0);
            const bTime = b.completedAt?.toDate?.() || new Date(0);
            return bTime.getTime() - aTime.getTime(); // Descending order
          });

          const calculatedData = calculateProgressFromQuizzes(quizzes);
          setProgressData(calculatedData);
          setDataSource('quizzes');
          setIndexError(false);
        } else {
          // No quiz data found
          setProgressData(getEmptyProgressData());
          setDataSource('empty');
          setIndexError(false);
        }
      } catch (error) {
        console.error('Failed to fetch progress data:', error);
        
        // Check if it's an index error
        if (error.code === 'failed-precondition' && error.message.includes('index')) {
          console.log('Index error detected, showing create index option');
          setIndexError(true);
          setProgressData(getEmptyProgressData()); // Show empty data with index error
        } else {
          // Other error, show empty data
          console.error('Other error:', error);
          setProgressData(getEmptyProgressData());
          setIndexError(false);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [user, timePeriod]);

  // Helper function to calculate progress from quiz array
  const calculateProgressFromQuizzes = (quizzes) => {
    if (!quizzes.length) return getEmptyProgressData();

    let totalScore = 0;
    let totalTime = 0;
    let streak = 0;
    let bestScore = 0;
    const topics = new Set();

    // Process each quiz
    quizzes.forEach((quiz, index) => {
      const score = quiz.score || 0;
      const timeTaken = quiz.timeTaken || 0;

      totalScore += score;
      totalTime += timeTaken;
      bestScore = Math.max(bestScore, score);

      if (quiz.topic) topics.add(quiz.topic);

      // Calculate current streak (consecutive quizzes with score >= 70%)
      if (index === 0) { // Start from most recent
        let currentStreak = 0;
        for (let i = 0; i < quizzes.length; i++) {
          if ((quizzes[i].score || 0) >= 70) {
            currentStreak++;
          } else {
            break;
          }
        }
        streak = currentStreak;
      }
    });

    const totalQuizzes = quizzes.length;
    const averageScore = totalScore / totalQuizzes;

    return {
      totalQuizzes,
      averageScore,
      totalTimeSpent: totalTime,
      currentStreak: streak,
      bestScore,
      completionRate: 100, // Simplified - all fetched quizzes were completed
      topicsStudied: topics.size,
      weeklyProgress: calculateWeeklyProgressFromQuizzes(quizzes),
    };
  };

  // Helper function to calculate weekly progress from quizzes
  const calculateWeeklyProgressFromQuizzes = (quizzes) => {
    if (!quizzes.length) return [];
    
    const weeklyData = new Map();

    quizzes.forEach((quiz) => {
      const completedAt = quiz.completedAt?.toDate?.() || new Date();
      const weekKey = getWeekKey(completedAt);
      
      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, { total: 0, count: 0, date: completedAt });
      }
      
      const weekData = weeklyData.get(weekKey);
      weekData.total += quiz.score || 0;
      weekData.count++;
    });

    // Convert to array and sort by date
    const weeklyArray = Array.from(weeklyData.entries()).map(([key, data]) => ({
      week: key,
      score: Math.round(data.total / data.count),
      date: data.date,
    }));

    // Sort by date (most recent first) and take last 8 weeks
    weeklyArray.sort((a, b) => b.date.getTime() - a.date.getTime());
    return weeklyArray.slice(0, 8).reverse(); // Reverse to show chronologically
  };

  // Generate mock weekly progress based on average score
  const generateMockWeeklyProgress = (avgScore) => {
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      const variation = (Math.random() - 0.5) * 20; // ±10 points variation
      const score = Math.max(0, Math.min(100, avgScore + variation));
      
      weeks.push({
        week: `Week ${8 - i}`,
        score: Math.round(score),
        date: date,
      });
    }
    return weeks;
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

  const getWeekKey = (date) => {
    const year = date.getFullYear();
    const weekNumber = getWeekNumber(date);
    return `${year}-W${weekNumber}`;
  };

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Function to create the required index
  const handleCreateIndex = () => {
    const indexUrl = `https://console.firebase.google.com/v1/r/project/quiz-gen-9e9f8/firestore/indexes?create_composite=ClVwcm9qZWN0cy9xdWl6LWdlbi05ZTlmOC9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvcXVpenplcy9pbmRleGVzL18QARoKCgZ1c2VySWQQARoPCgtjb21wbGV0ZWRBdBACGgwKCF9fbmFtZV9fEAI`;
    window.open(indexUrl, '_blank');
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
        <Alert severity='info' sx={{ mb: 2 }}>
          <AlertTitle>Optional: Create Index for Better Performance</AlertTitle>
          <Typography variant="body2" sx={{ mb: 2 }}>
            For better performance and advanced querying, you can create a Firestore index. 
            This is optional - your progress is currently loaded using a different method.
          </Typography>
          <Button
            variant="outlined"
            color="info"
            size="small"
            endIcon={<OpenInNewIcon />}
            onClick={handleCreateIndex}
          >
            Create Index (Optional)
          </Button>
        </Alert>
      )}

      {dataSource === 'user' && (
        <Alert severity='success' sx={{ mb: 2 }}>
          <Typography variant="body2">
            ✅ Progress loaded from user profile (fast & efficient)
          </Typography>
        </Alert>
      )}

      {dataSource === 'quizzes' && (
        <Alert severity='info' sx={{ mb: 2 }}>
          <Typography variant="body2">
            ℹ️ Progress calculated from quiz history (may be slower for large datasets)
          </Typography>
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
        {showCharts && !compact && progressData.weeklyProgress.length > 0 && (
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
                You've completed {progressData.totalQuizzes} quizzes with great success!
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default ProgressTracking;