import React from 'react';
import { Box, Container, Typography, Button, useTheme, alpha } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CTASection = ({ user }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', maxWidth: 700, mx: 'auto' }}>
          <Typography variant="h2" sx={{ mb: 3, fontWeight: 700 }}>
            Ready to Transform Your Teaching?
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, fontWeight: 400 }}>
            Join thousands of educators saving time and enhancing learning with QuizAI.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              background: 'white',
              color: theme.palette.primary.main,
              fontWeight: 700,
              px: 6,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': { background: alpha('#fff', 0.9) },
            }}
            onClick={handleGetStarted}
          >
            Get Started Free
          </Button>
          <Typography variant="body2" sx={{ mt: 3, opacity: 0.8, color: 'whitesmoke' }}>
            No credit card required. Free plan includes 5 quizzes per month.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default CTASection;
