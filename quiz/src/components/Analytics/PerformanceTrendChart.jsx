import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { LineChart } from '@mui/x-charts/LineChart';

const AnalyticsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

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

export default PerformanceTrendChart;