import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  useTheme, 
  alpha,
  useMediaQuery 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CTASection = ({ user }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        py: { xs: 6, sm: 8, md: 10 },
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        // Add subtle animation background
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 30% 70%, ${alpha('#ffffff', 0.1)} 0%, transparent 50%), 
                           radial-gradient(circle at 70% 30%, ${alpha('#ffffff', 0.05)} 0%, transparent 50%)`,
          animation: 'pulse 4s ease-in-out infinite',
        },
        '@keyframes pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Box 
          sx={{ 
            textAlign: 'center', 
            maxWidth: { xs: '100%', sm: 600, md: 700 }, 
            mx: 'auto',
            px: { xs: 2, sm: 3, md: 0 }
          }}
        >
          {/* Main Heading - Responsive sizing */}
          <Typography 
            variant={isSmallMobile ? "h4" : isMobile ? "h3" : "h2"} 
            sx={{ 
              mb: { xs: 2, md: 3 }, 
              fontWeight: { xs: 600, md: 700 },
              lineHeight: { xs: 1.3, md: 1.2 },
              fontSize: {
                xs: '1.8rem',
                sm: '2.2rem', 
                md: '2.8rem',
                lg: '3.2rem'
              }
            }}
          >
            Ready to Transform Your Teaching?
          </Typography>

          {/* Subtitle - Better mobile spacing */}
          <Typography 
            variant={isMobile ? "body1" : "h5"} 
            sx={{ 
              mb: { xs: 3, sm: 4, md: 5 }, 
              opacity: 0.95, 
              fontWeight: { xs: 400, md: 400 },
              fontSize: {
                xs: '1.1rem',
                sm: '1.25rem',
                md: '1.35rem'
              },
              lineHeight: { xs: 1.5, md: 1.4 },
              px: { xs: 1, sm: 2 }
            }}
          >
            Join thousands of educators saving time and enhancing learning with QuizAI.
          </Typography>

          {/* CTA Button - Mobile optimized */}
          <Button
            variant="contained"
            size={isMobile ? "large" : "large"}
            sx={{
              background: 'white',
              color: theme.palette.primary.main,
              fontWeight: { xs: 600, md: 700 },
              px: { xs: 4, sm: 5, md: 6 },
              py: { xs: 1.5, md: 1.75 },
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.15rem' },
              borderRadius: { xs: 2, md: 2.5 },
              textTransform: 'none',
              minWidth: { xs: 200, sm: 220 },
              boxShadow: '0 4px 20px rgba(255, 255, 255, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': { 
                background: alpha('#fff', 0.95),
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 25px rgba(255, 255, 255, 0.4)',
              },
              // Touch-friendly for mobile
              '@media (pointer: coarse)': {
                minHeight: 48,
              }
            }}
            onClick={handleGetStarted}
          >
            Get Started Free
          </Button>

          {/* Disclaimer text - Mobile friendly */}
          <Typography 
            variant="body2" 
            sx={{ 
              mt: { xs: 2.5, md: 3 }, 
              opacity: 0.85, 
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: { xs: '0.85rem', md: '0.9rem' },
              maxWidth: { xs: 280, sm: 400, md: 'none' },
              mx: 'auto',
              lineHeight: 1.4
            }}
          >
            No credit card required • Free plan includes 5 quizzes per month
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default CTASection;