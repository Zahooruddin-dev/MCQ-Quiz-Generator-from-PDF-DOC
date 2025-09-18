import React from 'react';
import {
  Stack,
  Box,
  Typography,
  Chip,
  Fade,
  Zoom,
} from '@mui/material';
import { Settings, Coins, Crown } from 'lucide-react';

const ConfigHeader = ({ isMobile, creditStatus }) => {
  return (
    <Stack
      direction={isMobile ? 'column' : 'row'}
      alignItems={isMobile ? 'stretch' : 'center'}
      spacing={2}
      sx={{ mb: isMobile ? 1 : 2 }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{ flex: 1 }}
      >
        <Zoom in={true} timeout={600}>
          <Box
            sx={{
              width: isMobile ? 36 : 40,
              height: isMobile ? 36 : 40,
              borderRadius: 1,
              background:
                'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
            }}
          >
            <Settings size={isMobile ? 18 : 20} />
          </Box>
        </Zoom>

        <Box sx={{ flex: 1 }}>
          <Typography
            variant={isMobile ? 'subtitle1' : 'h6'}
            sx={{
              fontWeight: 600,
              fontSize: isMobile ? '1.1rem' : '1.25rem',
              lineHeight: 1.2,
            }}
          >
            {isMobile ? 'AI Quiz Settings' : 'AI Quiz Generation Settings'}
          </Typography>

          {/* Credit Status */}
          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
            <Fade in={true} timeout={800}>
              <Chip
                icon={
                  creditStatus.type === 'free' ? (
                    <Coins size={12} />
                  ) : (
                    <Crown size={12} />
                  )
                }
                label={creditStatus.label}
                size="small"
                sx={{
                  height: isMobile ? 18 : 20,
                  fontSize: isMobile ? '0.65rem' : '0.7rem',
                  background: `linear-gradient(135deg, ${creditStatus.color} 0%, ${creditStatus.color}AA 100%)`,
                  color: 'white',
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    fontSize: isMobile ? 10 : 12,
                  },
                }}
              />
            </Fade>
          </Stack>
        </Box>
      </Stack>
    </Stack>
  );
};

export default React.memo(ConfigHeader);
