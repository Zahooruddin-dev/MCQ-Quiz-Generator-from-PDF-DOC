import React from 'react';
import { Card, CardContent, Stack, Typography, LinearProgress } from '@mui/material';

const CompletionCard = ({ data }) => (
  <Card>
    <CardContent sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Overall Completion Rate</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>{data.completionRate}%</Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={data.completionRate}
          sx={{
            height: 8, borderRadius: 4, backgroundColor: 'grey.200',
            '& .MuiLinearProgress-bar': { borderRadius: 4, background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)' },
          }}
        />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>You've completed {data.totalQuizzes} quizzes with great success!</Typography>
      </Stack>
    </CardContent>
  </Card>
);

export default CompletionCard;
