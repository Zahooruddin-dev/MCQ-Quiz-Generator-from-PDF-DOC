import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Skeleton,
  Chip,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  PollOutlined as AnalyticsIcon,
  SaveAltOutlined as ExportIcon,
  FilterAltOutlined as FilterIcon,
} from '@mui/icons-material';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { useAuth } from '../../context/AuthContext';

// Firebase imports
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';

const db = getFirestore();

// Time period constants
const TimePeriod = {
  ALL_TIME: 'all_time',
  THIS_MONTH: 'this_month',
  THIS_WEEK: 'this_week',
  LAST_30_DAYS: 'last_30_days',
};

const AnalyticsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const ExportButton = ({ onExport, data }) => {
  const handleExport = () => {
    if (!data) return;

    // Create CSV data
    const csvData = [
      ['Metric', 'Value'],
      ['Total Quizzes', data.totalQuizzes || 0],
      ['Average Score', `${(data.avgScore || 0).toFixed(1)}%`],
      ['Best Score', `${data.bestScore || 0}%`],
      ['Current Streak', data.streak || 0],
      ...data.topicPerformance.map(topic => [`${topic.topic} Average`, `${topic.avgScore.toFixed(1)}%`]),
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quiz-analytics.csv';
    link.click();
    window.URL.revokeObjectURL(url);
    
    if (onExport) onExport(data);
  };

  return (
    <Button
      startIcon={<ExportIcon />}
      onClick={handleExport}
      variant="outlined"
      size="small"
      disabled={!data}
    >
      Export Data
    </Button>
  );
};

const ScoreDistributionChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <AnalyticsCard>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Score Distribution
          </Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No quiz data available
            </Typography>
          </Box>
        </CardContent>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Score Distribution
        </Typography>
        
        <Box sx={{ height: 300 }}>
          <PieChart
            series={[
              {
                data: data.map((item, index) => ({
                  id: index,
                  value: item.count,
                  label: item.range,
                })),
                highlightScope: { faded: 'global', highlighted: 'item' },
              },
            ]}
            height={300}
            margin={{ right: 100 }}
          />
        </Box>
        
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
          {data.map((item, index) => (
            <Chip
              key={index}
              label={`${item.range}: ${item.count} quizzes`}
              size="small"
              variant="outlined"
            />
          ))}
        </Stack>
      </CardContent>
    </AnalyticsCard>
  );
};

const MonthlyStatsChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <AnalyticsCard>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Monthly Performance
          </Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No monthly data available
            </Typography>
          </Box>
        </CardContent>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Monthly Performance
        </Typography>
        
        <Box sx={{ height: 300 }}>
          <BarChart
            series={[
              {
                data: data.map(item => item.quizzes),
                label: 'Quizzes Taken',
                color: '#6366F1',
              },
              {
                data: data.map(item => item.avgScore),
                label: 'Average Score',
                color: '#10B981',
              },
            ]}
            xAxis={[
              {
                data: data.map(item => item.month),
                scaleType: 'band',
              },
            ]}
            height={300}
            margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
          />
        </Box>
      </CardContent>
    </AnalyticsCard>
  );
};

const TopicPerformanceChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <AnalyticsCard>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Topic Performance
          </Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No topic data available
            </Typography>
          </Box>
        </CardContent>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Topic Performance
        </Typography>
        
        <Box sx={{ height: 300 }}>
          <BarChart
            series={[
              {
                data: data.map(item => item.avgScore),
                label: 'Average Score (%)',
                color: '#8B5CF6',
              },
            ]}
            xAxis={[
              {
                data: data.map(item => item.topic),
                scaleType: 'band',
              },
            ]}
            yAxis={[
              {
                min: 0,
                max: 100,
              },
            ]}
            height={300}
            margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
          />
        </Box>
        
        <Stack spacing={1} sx={{ mt: 2 }}>
          {data.map((topic, index) => (
            <Stack key={index} direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">{topic.topic}</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={`${topic.avgScore.toFixed(1)}%`}
                  size="small"
                  color={topic.avgScore >= 85 ? 'success' : topic.avgScore >= 70 ? 'warning' : 'error'}
                />
                <Typography variant="caption" color="text.secondary">
                  {topic.quizCount} quizzes
                </Typography>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </AnalyticsCard>
  );
};

const PerformanceTrendChart = ({ quizzes }) => {
  if (!quizzes || quizzes.length === 0) {
    return (
      <AnalyticsCard>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Recent Performance Trend
          </Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No recent quiz data available
            </Typography>
          </Box>
        </CardContent>
      </AnalyticsCard>
    );
  }

  const trendData = quizzes.slice(-10).map((quiz, index) => ({
    quiz: index + 1,
    score: quiz.score,
    date: quiz.completedAt?.toDate?.() || new Date(quiz.completedAt),
  }));

  return (
    <AnalyticsCard>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Recent Performance Trend
        </Typography>
        
        <Box sx={{ height: 300 }}>
          <LineChart
            series={[
              {
                data: trendData.map(item => item.score),
                label: 'Score (%)',
                color: '#F59E0B',
                curve: 'smooth',
              },
            ]}
            xAxis={[
              {
                data: trendData.map((_, index) => `Quiz ${index + 1}`),
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
    </AnalyticsCard>
  );
};

const AnalyticsDashboard = ({ 
  userId, 
  showExportOptions = true, 
  allowFiltering = true, 
  chartHeight = 300,
  onDataExport 
}) => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState(TimePeriod.ALL_TIME);

  const getDateFilter = (period) => {
    const now = new Date();
    switch (period) {
      case TimePeriod.THIS_WEEK:
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return weekStart;
      case TimePeriod.THIS_MONTH:
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case TimePeriod.LAST_30_DAYS:
        return new Date(now.setDate(now.getDate() - 30));
      default:
        return null; // ALL_TIME
    }
  };

  const processQuizData = (quizzes) => {
    if (!quizzes || quizzes.length === 0) {
      return {
        totalQuizzes: 0,
        avgScore: 0,
        bestScore: 0,
        streak: 0,
        scoreDistribution: [],
        monthlyStats: [],
        topicPerformance: [],
      };
    }

    // Score distribution
    const scoreRanges = [
      { range: '90-100%', min: 90, max: 100, count: 0 },
      { range: '80-89%', min: 80, max: 89, count: 0 },
      { range: '70-79%', min: 70, max: 79, count: 0 },
      { range: '60-69%', min: 60, max: 69, count: 0 },
      { range: 'Below 60%', min: 0, max: 59, count: 0 },
    ];

    quizzes.forEach(quiz => {
      const score = quiz.score || 0;
      const range = scoreRanges.find(r => score >= r.min && score <= r.max);
      if (range) range.count++;
    });

    // Filter out empty ranges
    const scoreDistribution = scoreRanges.filter(range => range.count > 0);

    // Monthly stats
    const monthlyData = {};
    quizzes.forEach(quiz => {
      const date = quiz.completedAt?.toDate ? quiz.completedAt.toDate() : new Date(quiz.completedAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
          quizzes: 0,
          totalScore: 0,
          avgScore: 0,
        };
      }
      
      monthlyData[monthKey].quizzes++;
      monthlyData[monthKey].totalScore += quiz.score || 0;
      monthlyData[monthKey].avgScore = monthlyData[monthKey].totalScore / monthlyData[monthKey].quizzes;
    });

    const monthlyStats = Object.values(monthlyData).slice(-6); // Last 6 months

    // Topic performance
    const topicData = {};
    quizzes.forEach(quiz => {
      const topic = quiz.topic || 'General';
      if (!topicData[topic]) {
        topicData[topic] = {
          topic,
          totalScore: 0,
          quizCount: 0,
          avgScore: 0,
        };
      }
      
      topicData[topic].totalScore += quiz.score || 0;
      topicData[topic].quizCount++;
      topicData[topic].avgScore = topicData[topic].totalScore / topicData[topic].quizCount;
    });

    const topicPerformance = Object.values(topicData)
      .sort((a, b) => b.avgScore - a.avgScore);

    // Calculate overall stats
    const totalQuizzes = quizzes.length;
    const totalScore = quizzes.reduce((sum, quiz) => sum + (quiz.score || 0), 0);
    const avgScore = totalScore / totalQuizzes;
    const bestScore = Math.max(...quizzes.map(quiz => quiz.score || 0));

    // Calculate current streak
    let streak = 0;
    const sortedQuizzes = [...quizzes].sort((a, b) => {
      const dateA = a.completedAt?.toDate ? a.completedAt.toDate() : new Date(a.completedAt);
      const dateB = b.completedAt?.toDate ? b.completedAt.toDate() : new Date(b.completedAt);
      return dateB - dateA;
    });

    for (const quiz of sortedQuizzes) {
      if ((quiz.score || 0) >= 70) {
        streak++;
      } else {
        break;
      }
    }

    return {
      totalQuizzes,
      avgScore,
      bestScore,
      streak,
      scoreDistribution,
      monthlyStats,
      topicPerformance,
    };
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch ALL user's quizzes first (this avoids the composite index requirement)
        const quizQuery = query(
          collection(db, 'quizzes'),
          where('userId', '==', user.uid)
        );

        const quizSnapshot = await getDocs(quizQuery);
        let allQuizzes = quizSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort by date in JavaScript (since we can't use orderBy with where clause without index)
        allQuizzes.sort((a, b) => {
          const dateA = a.completedAt?.toDate ? a.completedAt.toDate() : new Date(a.completedAt);
          const dateB = b.completedAt?.toDate ? b.completedAt.toDate() : new Date(b.completedAt);
          return dateB - dateA; // Most recent first
        });

        // Apply date filter in JavaScript if needed
        const dateFilter = getDateFilter(timePeriod);
        let filteredQuizzes = allQuizzes;
        
        if (dateFilter) {
          filteredQuizzes = allQuizzes.filter(quiz => {
            const quizDate = quiz.completedAt?.toDate ? quiz.completedAt.toDate() : new Date(quiz.completedAt);
            return quizDate >= dateFilter;
          });
        }

        // Get recent quizzes for trend chart (last 10)
        const recent = allQuizzes.slice(0, 10);
        setRecentQuizzes(recent);

        // Process the filtered data
        const processedData = processQuizData(filteredQuizzes);
        setAnalyticsData(processedData);

      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
        setError('Failed to load analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [user, timePeriod]);

  if (loading) {
    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <AnalyticsIcon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Analytics Dashboard
            </Typography>
          </Stack>
        </Stack>
        
        <Stack spacing={3}>
          <Stack direction="row" spacing={2}>
            <Skeleton variant="rectangular" height={400} sx={{ flex: 1, borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={400} sx={{ flex: 1, borderRadius: 2 }} />
          </Stack>
          <Stack direction="row" spacing={2}>
            <Skeleton variant="rectangular" height={400} sx={{ flex: 1, borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={400} sx={{ flex: 1, borderRadius: 2 }} />
          </Stack>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <AnalyticsIcon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Analytics Dashboard
            </Typography>
          </Stack>
        </Stack>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <AnalyticsIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Analytics Dashboard
          </Typography>
        </Stack>
        
        <Stack direction="row" spacing={2}>
          {allowFiltering && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Period</InputLabel>
              <Select
                value={timePeriod}
                label="Time Period"
                onChange={(e) => setTimePeriod(e.target.value)}
                startAdornment={<FilterIcon sx={{ mr: 1, color: 'action.active' }} />}
              >
                <MenuItem value={TimePeriod.ALL_TIME}>All Time</MenuItem>
                <MenuItem value={TimePeriod.THIS_MONTH}>This Month</MenuItem>
                <MenuItem value={TimePeriod.THIS_WEEK}>This Week</MenuItem>
                <MenuItem value={TimePeriod.LAST_30_DAYS}>Last 30 Days</MenuItem>
              </Select>
            </FormControl>
          )}
          
          {showExportOptions && (
            <ExportButton onExport={onDataExport} data={analyticsData} />
          )}
        </Stack>
      </Stack>
      
      {analyticsData?.totalQuizzes === 0 ? (
        <Card>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No Quiz Data Available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete some quizzes to see your analytics here.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={3}>
          {/* First Row - Score Distribution and Monthly Stats */}
          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1 }}>
              <ScoreDistributionChart data={analyticsData?.scoreDistribution || []} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <MonthlyStatsChart data={analyticsData?.monthlyStats || []} />
            </Box>
          </Stack>
          
          {/* Second Row - Topic Performance and Performance Trend */}
          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1 }}>
              <TopicPerformanceChart data={analyticsData?.topicPerformance || []} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <PerformanceTrendChart quizzes={recentQuizzes} />
            </Box>
          </Stack>
          
          {/* Summary Insights */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Performance Insights
              </Typography>
              
              <Stack spacing={2}>
                {analyticsData?.topicPerformance?.length > 0 && (
                  <>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: 'success.main' }}>
                        🎯 Strongest Topic: {analyticsData.topicPerformance[0]?.topic}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Average score of {analyticsData.topicPerformance[0]?.avgScore.toFixed(1)}% across {analyticsData.topicPerformance[0]?.quizCount} quizzes
                      </Typography>
                    </Box>
                    
                    {analyticsData.topicPerformance.length > 1 && (
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: 'warning.main' }}>
                          📈 Area for Improvement: {analyticsData.topicPerformance[analyticsData.topicPerformance.length - 1]?.topic}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Consider reviewing this topic to improve your {analyticsData.topicPerformance[analyticsData.topicPerformance.length - 1]?.avgScore.toFixed(1)}% average
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
                
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: 'info.main' }}>
                    📊 Overall Progress: {analyticsData?.avgScore >= 85 ? 'Excellent' : analyticsData?.avgScore >= 70 ? 'Good' : 'Keep Improving'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You've completed {analyticsData?.totalQuizzes} quizzes with an average score of {analyticsData?.avgScore.toFixed(1)}%
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      )}
    </Box>
  );
};

export default AnalyticsDashboard;