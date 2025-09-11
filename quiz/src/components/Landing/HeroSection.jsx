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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HeroSection = ({ user }) => {
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
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: 'white',
        py: { xs: 8, md: 12 },
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0V0zm10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm0-11a4 4 0 1 1 0 8 4 4 0 0 1 0-8z\' fill=\'%23ffffff\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
          opacity: 0.5,
        },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Left Side */}
          <Grid item xs={12} md={6}>
            <Chip
              label="New: Enhanced OCR Technology"
              sx={{
                background: alpha('#fff', 0.2),
                color: 'white',
                mb: 2,
                fontWeight: 600,
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 800,
                lineHeight: 1.2,
                mb: 2,
              }}
            >
              Transform Documents into Engaging Quizzes with AI
            </Typography>
            <Typography
              variant="h5"
              sx={{ opacity: 0.9, mb: 4, fontWeight: 400 }}
            >
              Upload PDFs, DOCX, or images and let our advanced AI generate
              customized quizzes in seconds.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  background: 'white',
                  color: theme.palette.primary.main,
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  '&:hover': { background: alpha('#fff', 0.9) },
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
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    borderColor: 'white',
                    background: alpha('#fff', 0.1),
                  },
                }}
              >
                See Demo
              </Button>
            </Box>
          </Grid>

          {/* Right Side Preview */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{ display: { xs: 'none', md: 'block' } }}
          >
            <Box
              sx={{
                background: alpha('#fff', 0.1),
                borderRadius: 4,
                p: 2,
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: alpha('#fff', 0.2),
                maxWidth: 400,
                mx: 'auto',
              }}
            >
              <Box
                sx={{
                  background: 'white',
                  borderRadius: 3,
                  overflow: 'hidden',
                  color: theme.palette.text.primary,
                  boxShadow: theme.shadows[10],
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    background: theme.palette.grey[100],
                    display: 'flex',
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: '#ff5f56',
                    }}
                  />
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: '#ffbd2e',
                    }}
                  />
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: '#27c93f',
                    }}
                  />
                </Box>
                <Box sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 700 }}
                  >
                    Quiz: World History Chapter 3
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      1. What was the primary cause of the Industrial
                      Revolution?
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body2">A) Agricultural advancements</Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'success.main', fontWeight: 600 }}
                      >
                        B) Technological innovations ✓
                      </Typography>
                      <Typography variant="body2">C) Political revolutions</Typography>
                      <Typography variant="body2">D) Religious movements</Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      2. Which invention revolutionized textile manufacturing?
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body2">A) Steam engine</Typography>
                      <Typography variant="body2">B) Telegraph</Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'success.main', fontWeight: 600 }}
                      >
                        C) Spinning jenny ✓
                      </Typography>
                      <Typography variant="body2">D) Cotton gin</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;
