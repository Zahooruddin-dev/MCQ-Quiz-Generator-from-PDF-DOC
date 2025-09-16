import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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

export default MonthlyStatsChart;