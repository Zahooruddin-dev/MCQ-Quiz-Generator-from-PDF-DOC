import React from 'react';
import { Box, Typography, Stack, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  borderRadius: theme.shape.borderRadius * 2,
  background: 'white',
  border: '1px solid',
  borderColor: theme.palette.grey[100],
  transition: 'all 0.3s ease',
  '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[4] },
}));

const StatCard = ({ icon, label, value, color = 'primary', subtitle }) => (
  <StatsCard elevation={0}>
    <Stack spacing={2} alignItems="center">
      <Box sx={{
        width: 48, height: 48, borderRadius: '50%', background: `var(--mui-palette-${color}-main)15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: `var(--mui-palette-${color}-main)`,
      }}>{icon}</Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>{value}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>{label}</Typography>
        {subtitle && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{subtitle}</Typography>}
      </Box>
    </Stack>
  </StatsCard>
);

export default StatCard;
