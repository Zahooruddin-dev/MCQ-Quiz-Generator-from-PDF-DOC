import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  PollOutlined as AnalyticsIcon,
  FilterAltOutlined as FilterIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

// Firebase imports
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore';

// Import sub-components
import ExportButton from './ExportButton';
import ScoreDistributionChart from './ScoreDistributionChart';
import MonthlyStatsChart from './MonthlyStatsChart';
import TopicPerformanceChart from './TopicPerformanceChart';
import PerformanceTrendChart from './PerformanceTrendChart';

const db = getFirestore();

// Time period constants
const TimePeriod = {
  ALL_TIME: 'all_time',
  THIS_MONTH: 'this_month',
  THIS_WEEK: 'this_week',
  LAST_30_DAYS: 'last_30_days',
};

const AnalyticsDashboard = ({ 
  userId, 
  showExportOptions = true, 
  allowFiltering = true, 
  chartHeight = 300,
  onDataExport 
}) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.uid;
  const [analyticsData, setAnalyticsData] = useState(null);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState(TimePeriod.ALL_TIME);

  const getDateFilter = (period) => {
    const now = new Date();
    switch (period) {
      case TimePeriod.THIS_WEEK: {
        const d = new Date(now);
        const diff = d.getDay(); // 0 (Sun) - 6 (Sat)
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - diff);
        return d;
      }
      case TimePeriod.THIS_MONTH:
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case TimePeriod.LAST_30_DAYS: {
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        return d;
      }
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

    const monthlyStats = Object.keys(monthlyData)
      .sort() // 'YYYY-MM' string sort respects chronological order
      .map(k => monthlyData[k])
      .slice(-6); // Last 6 months

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
      if (!targetUserId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const dateFilter = getDateFilter(timePeriod);

        // Try efficient query with index: by userId and completedAt desc
        let allQuizzes = [];
        try {
          const baseConstraints = [
            where('userId', '==', targetUserId),
          ];
          // If filtering by date, push where('completedAt', '>=', dateFilter)
          if (dateFilter) {
            baseConstraints.push(where('completedAt', '>=', dateFilter));
          }
          baseConstraints.push(orderBy('completedAt', 'desc'));

          const indexedQuery = query(
            collection(db, 'quizzes'),
            ...baseConstraints,
          );
          const snapshot = await getDocs(indexedQuery);
          allQuizzes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (idxErr) {
          // Fallback: no index, do basic query by userId and sort/filter client-side
          const fallbackQuery = query(
            collection(db, 'quizzes'),
            where('userId', '==', targetUserId)
          );
          const snapshot = await getDocs(fallbackQuery);
          allQuizzes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          allQuizzes.sort((a, b) => {
            const dateA = a.completedAt?.toDate ? a.completedAt.toDate() : new Date(a.completedAt);
            const dateB = b.completedAt?.toDate ? b.completedAt.toDate() : new Date(b.completedAt);
            return dateB - dateA;
          });
        }

        // Apply client-side date filtering if needed and not already filtered
        let filteredQuizzes = allQuizzes;
        if (dateFilter) {
          filteredQuizzes = allQuizzes.filter(quiz => {
            const quizDate = quiz.completedAt?.toDate ? quiz.completedAt.toDate() : new Date(quiz.completedAt);
            return quizDate >= dateFilter;
          });
        }

        // Recent 10 for trend chart
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
  }, [targetUserId, timePeriod]);

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