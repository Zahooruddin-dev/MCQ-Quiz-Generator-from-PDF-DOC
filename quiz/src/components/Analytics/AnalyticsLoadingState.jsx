import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Skeleton,
} from '@mui/material';
import { PollOutlined as AnalyticsIcon } from '@mui/icons-material';

const AnalyticsLoadingState = () => {
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
};

export default AnalyticsLoadingState;