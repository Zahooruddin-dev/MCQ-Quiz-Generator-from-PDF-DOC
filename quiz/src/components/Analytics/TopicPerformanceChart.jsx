import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { BarChart } from '@mui/x-charts/BarChart';

const AnalyticsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

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

export default TopicPerformanceChart;