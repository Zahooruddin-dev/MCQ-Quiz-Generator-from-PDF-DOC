import React from 'react';
import {
  Paper,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Stack,
} from '@mui/material';
import { Zap } from 'lucide-react';

const AIToggle = ({
  isMobile,
  useAI,
  handleToggleAI,
  loading,
  canUseAI,
  credits,
}) => {
  return (
    <Paper
      sx={{
        p: isMobile ? 1.5 : 2,
        borderRadius: 2,
        bgcolor: useAI ? 'rgba(99, 102, 241, 0.05)' : 'rgba(0, 0, 0, 0.02)',
        border: useAI ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid',
        borderColor: useAI ? 'rgba(99, 102, 241, 0.2)' : 'divider',
        transition: 'all 0.3s ease',
      }}
    >
      <FormControlLabel
        control={
          <Switch
            checked={useAI || false}
            onChange={handleToggleAI}
            disabled={loading || !canUseAI}
            sx={{
              '& .MuiSwitch-thumb': {
                boxShadow: useAI
                  ? '0 2px 8px rgba(99, 102, 241, 0.4)'
                  : 'default',
              },
            }}
          />
        }
        label={
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography
                component="span"
                sx={{
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  fontWeight: 500,
                }}
              >
                Enable AI-powered question generation
              </Typography>
              {useAI && <Zap size={16} color="#6366F1" />}
            </Stack>
            {!canUseAI && (
              <Typography
                variant="caption"
                color="error"
                display="block"
                sx={{ fontSize: isMobile ? '0.75rem' : '0.8rem' }}
              >
                {credits <= 0
                  ? 'No credits remaining - upgrade to Premium or wait for daily reset'
                  : 'AI features require credits or Premium subscription'}
              </Typography>
            )}
          </Box>
        }
        sx={{
          margin: 0,
          width: '100%',
          alignItems: 'flex-start',
        }}
      />
    </Paper>
  );
};

export default React.memo(AIToggle);
