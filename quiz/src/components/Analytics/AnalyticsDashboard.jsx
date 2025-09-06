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
import { mockAnalyticsData, mockRecentQuizzes, TimePeriod } from './quizAnalyticsMockData';

const AnalyticsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const ExportButton = ({ onExport, data }) => {
  const handleExport = () => {
    // Create CSV data
    const csvData = [
      ['Metric', 'Value'],
      ['Total Quizzes', data.monthlyStats.reduce((sum, month) => sum + month.quizzes, 0)],
      ['Average Score', data.monthlyStats.reduce((sum, month) => sum + month.avgScore, 0) / data.monthlyStats.length],
      ...data.topicPerformance.map(topic => [`${topic.topic} Average`, `${topic.avgScore}%`]),
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
    >
      Export Data
    </Button>
  );
};

const ScoreDistributionChart = ({ data }) => (
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

const MonthlyStatsChart = ({ data }) => (
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

const TopicPerformanceChart = ({ data }) => (
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
                label={`${topic.avgScore}%`}
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

const PerformanceTrendChart = ({ quizzes }) => {
  const trendData = quizzes.slice(-10).map((quiz, index) => ({
    quiz: index + 1,
    score: quiz.score,
    date: quiz.date,
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
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState(TimePeriod.ALL_TIME);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // For now, use mock data since we don't have detailed analytics in Firebase yet
        // In a real implementation, you would fetch and compute analytics from Firebase
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        setAnalyticsData(mockAnalyticsData);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
        setAnalyticsData(mockAnalyticsData);
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
      
      <Stack spacing={3}>
        {/* First Row - Score Distribution and Monthly Stats */}
        <Stack direction="row" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <ScoreDistributionChart data={analyticsData.scoreDistribution} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <MonthlyStatsChart data={analyticsData.monthlyStats} />
          </Box>
        </Stack>
        
        {/* Second Row - Topic Performance and Performance Trend */}
        <Stack direction="row" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <TopicPerformanceChart data={analyticsData.topicPerformance} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <PerformanceTrendChart quizzes={mockRecentQuizzes} />
          </Box>
        </Stack>
        
        {/* Summary Insights */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Performance Insights
            </Typography>
            
            <Stack spacing={2}>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500, color: 'success.main' }}>
                  🎯 Strongest Topic: {analyticsData.topicPerformance[0]?.topic}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average score of {analyticsData.topicPerformance[0]?.avgScore}% across {analyticsData.topicPerformance[0]?.quizCount} quizzes
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500, color: 'warning.main' }}>
                  📈 Area for Improvement: {analyticsData.topicPerformance[analyticsData.topicPerformance.length - 1]?.topic}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Consider reviewing this topic to improve your {analyticsData.topicPerformance[analyticsData.topicPerformance.length - 1]?.avgScore}% average
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500, color: 'info.main' }}>
                  📊 Overall Progress: Excellent
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {analyticsData.scoreDistribution[0]?.count} out of {analyticsData.scoreDistribution.reduce((sum, item) => sum + item.count, 0)} quizzes scored 90% or higher
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default AnalyticsDashboard;