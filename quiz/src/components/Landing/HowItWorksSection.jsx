import React from 'react';
import { Box, Container, Grid, Chip, Typography, useTheme } from '@mui/material';

const HowItWorks = () => {
  const theme = useTheme();

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
    <Box sx={{ py: { xs: 8, md: 12 }, background: theme.palette.grey[50] }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto', mb: { xs: 6, md: 10 } }}>
          <Chip label="Simple Process" color="primary" sx={{ mb: 2, fontWeight: 600 }} />
          <Typography variant="h2" sx={{ mb: 3, fontWeight: 700 }}>How QuizAI Works</Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
            Transform your educational materials into engaging quizzes in three simple steps.
          </Typography>
        </Box>

        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={4}>
            {steps.map((step) => (
              <Box key={step.number} sx={{ textAlign: { xs: 'center', md: 'left' }, mt: step.number !== 1 ? 6 : 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: theme.palette.primary.main,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      mr: 2
                    }}
                  >
                    {step.number}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>{step.title}</Typography>
                </Box>
                <Typography sx={{ color: 'text.secondary', pl: 6 }}>{step.description}</Typography>
              </Box>
            ))}
          </Grid>

          <Grid item xs={12} md={8}>
            {/* You can move the quiz preview box here if you want */}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HowItWorks;
