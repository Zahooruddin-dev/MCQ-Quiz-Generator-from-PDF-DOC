import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Chip,
  useTheme,
  alpha,
  useMediaQuery,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HeroSection = ({ user }) => {
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

  const handleDemo = () => {
    // Scroll to demo section or open demo modal
    const demoSection = document.getElementById('demo');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: 'white',
        py: { xs: 6, sm: 8, md: 10, lg: 12 },
        position: 'relative',
        overflow: 'hidden',
        minHeight: { xs: '85vh', sm: '90vh', md: '95vh' },
        display: 'flex',
        alignItems: 'center',
        // Enhanced background pattern
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 25% 75%, ${alpha('#ffffff', 0.1)} 0%, transparent 50%),
                           radial-gradient(circle at 75% 25%, ${alpha('#ffffff', 0.05)} 0%, transparent 50%)`,
          animation: 'float 6s ease-in-out infinite',
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      }}
    >
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
          {/* Left Side - Content */}
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              textAlign: { xs: 'center', md: 'left' },
              px: { xs: 1, sm: 2, md: 0 }
            }}>
              {/* New Feature Chip */}
              <Chip
                label="✨ New: Enhanced OCR Technology"
                sx={{
                  background: alpha('#fff', 0.15),
                  color: 'white',
                  mb: { xs: 2.5, md: 3 },
                  fontWeight: 600,
                  fontSize: { xs: '0.8rem', md: '0.875rem' },
                  px: { xs: 2, md: 3 },
                  py: 0.5,
                  border: `1px solid ${alpha('#fff', 0.2)}`,
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    background: alpha('#fff', 0.2),
                  }
                }}
              />

              {/* Main Headline */}
              <Typography
                variant="h1"
                sx={{
                  fontSize: {
                    xs: '2rem',
                    sm: '2.5rem',
                    md: '3rem',
                    lg: '3.5rem',
                    xl: '4rem'
                  },
                  fontWeight: { xs: 700, md: 800 },
                  lineHeight: { xs: 1.2, md: 1.15 },
                  mb: { xs: 2, md: 2.5 },
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  maxWidth: { xs: '100%', md: 600 }
                }}
              >
                Transform Documents into{' '}
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Engaging Quizzes
                </Box>{' '}
                with AI
              </Typography>

              {/* Subtitle */}
              <Typography
                variant="h5"
                sx={{
                  opacity: 0.95,
                  mb: { xs: 3, md: 4 },
                  fontWeight: 400,
                  fontSize: {
                    xs: '1.1rem',
                    sm: '1.25rem',
                    md: '1.35rem'
                  },
                  lineHeight: { xs: 1.5, md: 1.4 },
                  maxWidth: { xs: '100%', md: 520 }
                }}
              >
                Upload PDFs, DOCX, or images and let our advanced AI generate
                customized quizzes in seconds. Perfect for educators and trainers.
              </Typography>

              {/* CTA Buttons */}
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={{ xs: 2, sm: 3 }}
                sx={{ 
                  alignItems: 'center',
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  mb: { xs: 3, md: 0 }
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    background: 'white',
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                    px: { xs: 4, md: 5 },
                    py: { xs: 1.5, md: 1.75 },
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    minWidth: { xs: 200, sm: 180 },
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: '0 4px 20px rgba(255, 255, 255, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': { 
                      background: alpha('#fff', 0.95),
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(255, 255, 255, 0.4)',
                    },
                    '@media (pointer: coarse)': {
                      minHeight: 48,
                    }
                  }}
                  onClick={handleGetStarted}
                >
                  Get Started Free
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 600,
                    px: { xs: 4, md: 5 },
                    py: { xs: 1.5, md: 1.75 },
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    minWidth: { xs: 200, sm: 160 },
                    borderRadius: 2,
                    textTransform: 'none',
                    borderWidth: 2,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: 'white',
                      background: alpha('#fff', 0.1),
                      transform: 'translateY(-2px)',
                      borderWidth: 2,
                    },
                    '@media (pointer: coarse)': {
                      minHeight: 48,
                    }
                  }}
                  onClick={handleDemo}
                >
                  See Demo
                </Button>
              </Stack>
            </Box>
          </Grid>

          {/* Right Side - Preview (Desktop only, improved mobile handling) */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{ 
              display: { xs: isMobile ? 'none' : 'block', md: 'block' },
              mt: { xs: 4, md: 0 }
            }}
          >
            <Box
              sx={{
                background: alpha('#fff', 0.1),
                borderRadius: { xs: 3, md: 4 },
                p: { xs: 1.5, md: 2 },
                backdropFilter: 'blur(15px)',
                border: '1px solid',
                borderColor: alpha('#fff', 0.2),
                maxWidth: { xs: 350, md: 420 },
                mx: 'auto',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                transform: 'perspective(1000px) rotateY(-5deg)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'perspective(1000px) rotateY(0deg) translateY(-5px)',
                }
              }}
            >
              <Box
                sx={{
                  background: 'white',
                  borderRadius: { xs: 2.5, md: 3 },
                  overflow: 'hidden',
                  color: theme.palette.text.primary,
                  boxShadow: theme.shadows[12],
                }}
              >
                {/* Browser Header */}
                <Box
                  sx={{
                    p: { xs: 1.5, md: 2 },
                    background: theme.palette.grey[100],
                    display: 'flex',
                    gap: 1,
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
                </Box>

                {/* Quiz Content */}
                <Box sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ 
                      fontWeight: 700,
                      fontSize: { xs: '1.1rem', md: '1.25rem' },
                      mb: 2
                    }}
                  >
                    📚 Quiz: World History Chapter 3
                  </Typography>

                  {/* Question 1 */}
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="body2"
                      sx={{ 
                        fontWeight: 600, 
                        mb: 1.5,
                        fontSize: { xs: '0.9rem', md: '0.95rem' }
                      }}
                    >
                      1. What was the primary cause of the Industrial Revolution?
                    </Typography>
                    <Box sx={{ pl: 1, space: 0.5 }}>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', md: '0.9rem' }, mb: 0.5 }}>
                        A) Agricultural advancements
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ 
                          color: 'success.main', 
                          fontWeight: 600,
                          fontSize: { xs: '0.85rem', md: '0.9rem' },
                          mb: 0.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        B) Technological innovations ✅
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', md: '0.9rem' }, mb: 0.5 }}>
                        C) Political revolutions
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', md: '0.9rem' } }}>
                        D) Religious movements
                      </Typography>
                    </Box>
                  </Box>

                  {/* Question 2 */}
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ 
                        fontWeight: 600, 
                        mb: 1.5,
                        fontSize: { xs: '0.9rem', md: '0.95rem' }
                      }}
                    >
                      2. Which invention revolutionized textile manufacturing?
                    </Typography>
                    <Box sx={{ pl: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', md: '0.9rem' }, mb: 0.5 }}>
                        A) Steam engine
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', md: '0.9rem' }, mb: 0.5 }}>
                        B) Telegraph
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ 
                          color: 'success.main', 
                          fontWeight: 600,
                          fontSize: { xs: '0.85rem', md: '0.9rem' },
                          mb: 0.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        C) Spinning jenny ✅
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', md: '0.9rem' } }}>
                        D) Cotton gin
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Stats or Social Proof (Mobile visible) */}
        <Box
          sx={{
            mt: { xs: 4, md: 6 },
            textAlign: 'center',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'center',
            alignItems: 'center',
            gap: { xs: 2, sm: 4 },
            opacity: 0.9
          }}
        >
          <Typography variant="body2" sx={{ fontSize: { xs: '0.9rem', md: '1rem' }, color: '#f6f6f6' }}>
            🎓 Trusted by 10,000+ educators
          </Typography>
          <Typography variant="body2" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } ,color: '#f6f6f6'}}>
            ⚡ 50,000+ quizzes generated
          </Typography>
          <Typography variant="body2" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } , color: '#f6f6f6'}}>
            ⭐ 4.9/5 user rating
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;