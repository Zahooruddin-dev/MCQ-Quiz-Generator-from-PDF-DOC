import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  Box,
} from '@mui/material';
import { MessageSquare } from 'lucide-react';

const CurrentConfigSummary = ({
  isMobile,
  selectedDifficulty,
  selectedQuality,
  aiOptions,
  estimatedTime,
}) => {
  return (
    <Paper
      sx={{
        p: isMobile ? 1.5 : 2,
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          mb: 1,
          color: '#4F46E5',
          fontSize: isMobile ? '0.85rem' : '0.875rem',
        }}
      >
        Current Configuration
      </Typography>

      <Grid container spacing={1}>
        {/* Difficulty */}
        <Grid item xs={12} sm={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedDifficulty?.icon &&
              React.cloneElement(selectedDifficulty.icon, {
                size: isMobile ? 14 : 16,
              })}
            <Typography
              variant="body2"
              sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
            >
              <strong>Difficulty:</strong> {selectedDifficulty?.label}
            </Typography>
          </Box>
        </Grid>

        {/* Quality */}
        <Grid item xs={12} sm={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedQuality?.icon &&
              React.cloneElement(selectedQuality.icon, {
                size: isMobile ? 14 : 16,
              })}
            <Typography
              variant="body2"
              sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
            >
              <strong>Quality:</strong> {selectedQuality?.label}
            </Typography>
          </Box>
        </Grid>

        {/* Custom Instructions (if any) */}
        {aiOptions.customInstructions && (
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                mt: 1,
              }}
            >
              <MessageSquare
                size={isMobile ? 14 : 16}
                color="#8B5CF6"
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                  }}
                >
                  Custom Instructions:
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxHeight: isMobile ? 40 : 60,
                    overflow: 'auto',
                    fontSize: isMobile ? '0.65rem' : '0.75rem',
                    lineHeight: 1.3,
                  }}
                >
                  {aiOptions.customInstructions}
                </Typography>
              </Box>
            </Box>
          </Grid>
        )}

        {/* Estimated Time */}
        <Grid item xs={12}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              lineHeight: 1.4,
              fontSize: isMobile ? '0.65rem' : '0.75rem',
              mt: 0.5,
            }}
          >
            ⏱️ Estimated time: {estimatedTime}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default React.memo(CurrentConfigSummary);
