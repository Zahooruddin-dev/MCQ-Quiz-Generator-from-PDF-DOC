import React from 'react';
import { Box, Container, Grid, Card, Typography, Chip, useTheme } from '@mui/material';

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "High School Teacher",
    content: "QuizAI has transformed how I create assessments. It saves me hours each week and my students love the engaging format.",
    avatar: "SJ"
  },
  {
    name: "Michael Chen",
    role: "Corporate Trainer",
    content: "The accuracy of content extraction from our training materials is impressive. It understands context better than any tool we've tried.",
    avatar: "MC"
  },
  {
    name: "Emma Rodriguez",
    role: "University Professor",
    content: "The multi-language support is exceptional. I can now create quizzes in Spanish and English for my diverse student body with ease.",
    avatar: "ER"
  }
];

const Testimonials = () => {
  const theme = useTheme();

  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto', mb: { xs: 6, md: 10 } }}>
          <Chip label="Testimonials" color="primary" sx={{ mb: 2, fontWeight: 600 }} />
          <Typography variant="h2" sx={{ mb: 3, fontWeight: 700 }}>Trusted by Educators Worldwide</Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
            Join thousands of educators who are transforming their teaching with QuizAI.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', background: theme.palette.grey[50], border: '1px solid', borderColor: 'divider', boxShadow: 'none', p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
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
                    {testimonial.avatar}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{testimonial.name}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{testimonial.role}</Typography>
                  </Box>
                </Box>
                <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                  "{testimonial.content}"
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Testimonials;
