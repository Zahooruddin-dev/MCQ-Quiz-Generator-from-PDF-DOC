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
import { PieChart } from '@mui/x-charts/PieChart';

const AnalyticsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

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

export default ScoreDistributionChart;