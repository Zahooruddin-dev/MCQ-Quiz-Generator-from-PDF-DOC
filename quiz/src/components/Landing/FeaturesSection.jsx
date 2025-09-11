import React from 'react';
import { Box, Container, Grid, Card, CardContent, Typography, Chip, useTheme, alpha } from '@mui/material';
import { Bolt, Shield, BarChart3, Globe, Smartphone, Award } from 'lucide-react';

const features = [
  { icon: <Bolt size={32} />, title: "Lightning Fast", description: "Generate quizzes in seconds with our optimized AI engine" },
  { icon: <Shield size={32} />, title: "Secure & Private", description: "Your documents are processed securely with end-to-end encryption" },
  { icon: <BarChart3 size={32} />, title: "Advanced Analytics", description: "Track performance and identify knowledge gaps with detailed insights" },
  { icon: <Globe size={32} />, title: "Multi-language Support", description: "Generate quizzes in multiple languages with accurate translations" },
  { icon: <Smartphone size={32} />, title: "Mobile Optimized", description: "Perfect experience on any device, anywhere" },
  { icon: <Award size={32} />, title: "Premium Content", description: "Access high-quality question templates and learning materials" }
];

const FeaturesSection = () => {
  const theme = useTheme();

  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto', mb: { xs: 6, md: 10 } }}>
          <Chip label="Powerful Features" color="primary" sx={{ mb: 2, fontWeight: 600 }} />
          <Typography variant="h2" sx={{ mb: 3, fontWeight: 700 }}>Why Educators Love QuizAI</Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
            Our advanced AI technology makes quiz creation effortless and effective for educators, trainers, and students alike.
          </Typography>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 2,
                      borderRadius: 2,
                      background: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      mb: 3
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturesSection;
