import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';

const ProgressChart = ({ data }) => (
  <Card>
    <CardContent sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Weekly Progress Trend</Typography>
      <Box sx={{ height: 300 }}>
        <LineChart
          series={[{ data: data.map(item => item.score), label: 'Average Score', color: '#6366F1' }]}
          xAxis={[{ data: data.map(item => item.week), scaleType: 'point' }]}
          yAxis={[{ min: 0, max: 100, label: 'Score (%)' }]}
          height={300}
          margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
          grid={{ vertical: true, horizontal: true }}
        />
      </Box>
    </CardContent>
  </Card>
);

export default ProgressChart;
