import React from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Chip, 
  Typography, 
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';

const HowItWorks = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const steps = [
    {
      number: 1,
      title: 'Upload Content',
      description: 'Upload PDFs, DOCX files, images, or even text. Our advanced OCR extracts text with incredible accuracy.'
    },
    {
      number: 2,
      title: 'AI Analysis',
      description: 'Our AI analyzes the content, identifies key concepts, and generates relevant questions based on learning objectives.'
    },
    {
      number: 3,
      title: 'Generate & Share',
      description: 'Customize your quiz format, difficulty, and share with students via link, LMS, or printable format.'
    }
  ];

  return (
    <Box sx={{ 
      py: { xs: 6, sm: 8, md: 12 }, 
      background: alpha(theme.palette.grey[50], 0.7)
    }}>
      <Container maxWidth="lg">
        {/* Section Header - Mobile optimized */}
        <Box sx={{ 
          textAlign: 'center', 
          maxWidth: { xs: '100%', md: 600 }, 
          mx: 'auto', 
          mb: { xs: 5, sm: 6, md: 8 },
          px: { xs: 2, sm: 0 }
        }}>
          <Chip 
            label="Simple Process" 
            color="primary" 
            sx={{ 
              mb: { xs: 1.5, md: 2 }, 
              fontWeight: 600,
              fontSize: { xs: '0.8rem', md: '0.875rem' }
            }} 
          />
          <Typography 
            variant={isSmallMobile ? "h4" : isMobile ? "h3" : "h2"} 
            sx={{ 
              mb: { xs: 2, md: 3 }, 
              fontWeight: { xs: 600, md: 700 },
              fontSize: {
                xs: '1.75rem',
                sm: '2.1rem',
                md: '2.5rem'
              },
              lineHeight: { xs: 1.3, md: 1.2 }
            }}
          >
            How QuizAI Works
          </Typography>
          <Typography 
            variant={isMobile ? "body1" : "h6"} 
            sx={{ 
              color: 'text.secondary', 
              fontWeight: 400,
              fontSize: {
                xs: '1rem',
                sm: '1.1rem',
                md: '1.25rem'
              },
              lineHeight: { xs: 1.5, md: 1.4 }
            }}
          >
            Transform your educational materials into engaging quizzes in three simple steps.
          </Typography>
        </Box>

        {/* Steps Layout - Better mobile flow */}
        {isMobile ? (
          // Mobile: Vertical layout
          <Box sx={{ maxWidth: 500, mx: 'auto' }}>
            {steps.map((step, index) => (
              <Box 
                key={step.number} 
                sx={{ 
                  display: 'flex',
                  mb: index !== steps.length - 1 ? 4 : 0,
                  position: 'relative'
                }}
              >
                {/* Connecting line for mobile */}
                {index !== steps.length - 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 19,
                      top: 40,
                      width: 2,
                      height: 40,
                      background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.3)})`,
                    }}
                  />
                )}
                
                {/* Step number */}
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    mr: 3,
                    flexShrink: 0,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                    zIndex: 1,
                    position: 'relative'
                  }}
                >
                  {step.number}
                </Box>
                
                {/* Step content */}
                <Box sx={{ flex: 1, pt: 0.5 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 1,
                      fontSize: { xs: '1.1rem', sm: '1.25rem' }
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: { xs: '0.95rem', sm: '1rem' },
                      lineHeight: 1.6
                    }}
                  >
                    {step.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          // Desktop: Grid layout
          <Grid container spacing={6} justifyContent="center">
            {steps.map((step, index) => (
              <Grid item xs={12} md={4} key={step.number}>
                <Box 
                  sx={{ 
                    textAlign: 'center',
                    position: 'relative',
                    '&::after': index !== steps.length - 1 ? {
                      content: '""',
                      position: 'absolute',
                      top: 20,
                      right: -48,
                      width: 96,
                      height: 2,
                      background: `linear-gradient(to right, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.3)})`,
                      zIndex: 0
                    } : {}
                  }}
                >
                  {/* Step number */}
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1.5rem',
                      mx: 'auto',
                      mb: 3,
                      boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                      zIndex: 1,
                      position: 'relative'
                    }}
                  >
                    {step.number}
                  </Box>
                  
                  {/* Step content */}
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                    {step.title}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: '1.1rem', lineHeight: 1.6 }}>
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default HowItWorks;