import React from 'react';
import { Typography, Box } from '@mui/material';
import { Brain } from 'lucide-react';
import { LogoSectionBox, LogoIcon } from './styles';

const LogoSection = ({ onClick }) => (
  <LogoSectionBox onClick={onClick} sx={{ flexGrow: 1 }}>
    <LogoIcon>
      <Brain size={24} />
    </LogoIcon>
    <Box>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 800,
          background: 'linear-gradient(45deg, #6366F1 30%, #8B5CF6 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: { xs: '1.1rem', md: '1.25rem' },
        }}
      >
        QuizAI
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          fontSize: '0.7rem',
          display: { xs: 'none', sm: 'block' },
        }}
      >
        AI-Powered Quiz Generator
      </Typography>
    </Box>
  </LogoSectionBox>
);

export default LogoSection;
