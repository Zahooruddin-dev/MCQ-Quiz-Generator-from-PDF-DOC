import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Alert,
} from '@mui/material';
import { PollOutlined as AnalyticsIcon } from '@mui/icons-material';

const AnalyticsErrorState = ({ error }) => {
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
};

export default AnalyticsErrorState;