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
  orderBy,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';

// Import sub-components
import ExportButton from './ExportButton';
import ScoreDistributionChart from './ScoreDistributionChart';
import MonthlyStatsChart from './MonthlyStatsChart';
import TopicPerformanceChart from './TopicPerformanceChart';
import PerformanceTrendChart from './PerformanceTrendChart';
import AnalyticsLoadingState from './AnalyticsLoadingState';
import AnalyticsErrorState from './AnalyticsErrorState';

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
        const diff = d.getDay();
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
        return null;
    }
  };

  const processQuizData = (quizzes) => {
    console.log('Processing quiz data:', quizzes?.length || 0, 'quizzes');
    
    if (!quizzes || quizzes.length === 0) {
      return {
        totalQuizzes: 0,
        avgScore: 0,
        bestScore: 0,
        streak: 0,
        scoreDistribution: [],
        monthlyStats: [],
        topicPerformance: [],
        quizzesCompleted: 0,
        averageScore: 0,
      };
    }

    // Helper function to get score from quiz data
    const getScore = (quiz) => {
      return quiz.results?.percentage || quiz.score || 0;
    };

    // Score distribution
    const scoreRanges = [
      { range: '90-100%', min: 90, max: 100, count: 0 },
      { range: '80-89%', min: 80, max: 89, count: 0 },
      { range: '70-79%', min: 70, max: 79, count: 0 },
      { range: '60-69%', min: 60, max: 69, count: 0 },
      { range: 'Below 60%', min: 0, max: 59, count: 0 },
    ];

    quizzes.forEach(quiz => {
      const score = getScore(quiz);
      const range = scoreRanges.find(r => score >= r.min && score <= r.max);
      if (range) range.count++;
    });

    const scoreDistribution = scoreRanges.filter(range => range.count > 0);

    // Monthly stats
    const monthlyData = {};
    quizzes.forEach(quiz => {
      // Handle timestamp numbers from quiz manager
      const timestamp = quiz.completedAt || quiz.createdAt || 0;
      const date = new Date(timestamp);
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
      monthlyData[monthKey].totalScore += getScore(quiz);
      monthlyData[monthKey].avgScore = monthlyData[monthKey].totalScore / monthlyData[monthKey].quizzes;
    });

    const monthlyStats = Object.keys(monthlyData)
      .sort()
      .map(k => monthlyData[k])
      .slice(-6);

    // Topic performance (use title as topic since quiz manager doesn't set topic)
    const topicData = {};
    quizzes.forEach(quiz => {
      const topic = quiz.topic || quiz.title || 'General';
      if (!topicData[topic]) {
        topicData[topic] = {
          topic,
          totalScore: 0,
          quizCount: 0,
          avgScore: 0,
        };
      }
      
      topicData[topic].totalScore += getScore(quiz);
      topicData[topic].quizCount++;
      topicData[topic].avgScore = topicData[topic].totalScore / topicData[topic].quizCount;
    });

    const topicPerformance = Object.values(topicData)
      .sort((a, b) => b.avgScore - a.avgScore);

    const totalQuizzes = quizzes.length;
    const totalScore = quizzes.reduce((sum, quiz) => sum + getScore(quiz), 0);
    const avgScore = totalQuizzes > 0 ? totalScore / totalQuizzes : 0;
    const bestScore = Math.max(...quizzes.map(quiz => getScore(quiz)));

    // Calculate streak
    let streak = 0;
    const sortedQuizzes = [...quizzes].sort((a, b) => {
      const timestampA = a.completedAt || a.createdAt || 0;
      const timestampB = b.completedAt || b.createdAt || 0;
      return timestampB - timestampA;
    });

    for (const quiz of sortedQuizzes) {
      if (getScore(quiz) >= 70) {
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
      quizzesCompleted: totalQuizzes,
      averageScore: avgScore,
    };
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!targetUserId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching analytics for user:', targetUserId);
        
        // Read from the correct subcollection path
        const quizzesRef = collection(db, 'users', targetUserId, 'quizzes');
        let allQuizzes = [];
        
        try {
          // Try with ordering first
          const quizzesQuery = query(quizzesRef, orderBy('createdAt', 'desc'));
          const snapshot = await getDocs(quizzesQuery);
          allQuizzes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          console.log(`Fetched ${allQuizzes.length} quizzes from subcollection`);
        } catch (orderError) {
          console.log('Ordering failed, fetching all quizzes:', orderError);
          // Fallback: get all without ordering
          const snapshot = await getDocs(quizzesRef);
          allQuizzes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          
          // Sort manually by timestamp
          allQuizzes.sort((a, b) => {
            const timestampA = a.createdAt || 0;
            const timestampB = b.createdAt || 0;
            return timestampB - timestampA;
          });
          console.log(`Fetched ${allQuizzes.length} quizzes using fallback`);
        }

        // Apply date filtering if needed
        const dateFilter = getDateFilter(timePeriod);
        let filteredQuizzes = allQuizzes;
        
        if (dateFilter) {
          filteredQuizzes = allQuizzes.filter(quiz => {
            const timestamp = quiz.completedAt || quiz.createdAt || 0;
            return timestamp >= dateFilter.getTime();
          });
          console.log(`Filtered to ${filteredQuizzes.length} quizzes for ${timePeriod}`);
        }

        // Get recent quizzes for trend chart
        const recent = allQuizzes.slice(0, 10);
        setRecentQuizzes(recent);

        // Process the data
        const processedData = processQuizData(filteredQuizzes);
        console.log('Processed analytics data:', processedData);
        setAnalyticsData(processedData);

        // Update user stats with all-time data (for ProfileStats)
        const allTimeStats = processQuizData(allQuizzes);
        try {
          const userRef = doc(db, "users", targetUserId);
          await updateDoc(userRef, { 
            stats: {
              quizzesCompleted: allTimeStats.quizzesCompleted,
              averageScore: allTimeStats.averageScore,
              totalQuizzes: allTimeStats.totalQuizzes,
              avgScore: allTimeStats.avgScore,
              bestScore: allTimeStats.bestScore,
              streak: allTimeStats.streak,
              lastUpdated: new Date()
            }
          });
          console.log(`Updated user stats: ${allTimeStats.quizzesCompleted} quizzes, ${allTimeStats.averageScore.toFixed(1)}% avg`);
        } catch (updateError) {
          console.error("Failed to update user stats:", updateError);
        }

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
    return <AnalyticsLoadingState />;
  }

  if (error) {
    return <AnalyticsErrorState error={error} />;
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

      {/* Debug info - remove this once working */}
      {analyticsData && (
        <Card sx={{ mb: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="body2">
              📊 Debug: {analyticsData.totalQuizzes} quizzes, {analyticsData.avgScore.toFixed(1)}% avg, 
              {analyticsData.scoreDistribution?.length} score ranges, {analyticsData.monthlyStats?.length} months
            </Typography>
          </CardContent>
        </Card>
      )}
      
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
          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1 }}>
              <ScoreDistributionChart 
                data={analyticsData?.scoreDistribution || []} 
                key={`score-${analyticsData?.totalQuizzes || 0}`}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <MonthlyStatsChart 
                data={analyticsData?.monthlyStats || []} 
                key={`monthly-${analyticsData?.totalQuizzes || 0}`}
              />
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1 }}>
              <TopicPerformanceChart 
                data={analyticsData?.topicPerformance || []} 
                key={`topic-${analyticsData?.totalQuizzes || 0}`}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <PerformanceTrendChart 
                quizzes={recentQuizzes || []} 
                key={`trend-${recentQuizzes?.length || 0}`}
              />
            </Box>
          </Stack>
          
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