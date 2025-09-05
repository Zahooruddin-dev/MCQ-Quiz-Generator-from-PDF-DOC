import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  Stack,
  Chip,
  Avatar,
  Paper
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { 
  Upload, 
  Brain, 
  BarChart3, 
  Zap, 
  Shield, 
  Users,
  ArrowRight,
  CheckCircle,
  Star,
  FileText,
  Clock,
  Target
} from 'lucide-react';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
    pointerEvents: 'none',
  },
}));

const FloatingElement = styled(Box)(({ theme, delay = 0 }) => ({
  position: 'absolute',
  animation: `${float} 6s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  opacity: 0.1,
  pointerEvents: 'none',
}));

const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    background: 'rgba(255, 255, 255, 0.15)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  },
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '1px solid',
  borderColor: theme.palette.grey[200],
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    borderColor: theme.palette.primary.main,
  },
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  borderRadius: theme.shape.borderRadius * 2,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
  border: '1px solid',
  borderColor: theme.palette.primary.light + '30',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[4],
  },
}));

const AnimatedSection = styled(Box)({
  animation: `${slideInUp} 0.8s ease-out`,
});

const LandingPage = ({ onGetStarted }) => {
  const features = [
    {
      icon: <Upload size={32} />,
      title: 'Smart File Upload',
      description: 'Upload PDFs, DOCX, or paste text directly. Our AI processes any format instantly.',
      color: 'primary',
    },
    {
      icon: <Brain size={32} />,
      title: 'AI-Powered Generation',
      description: 'Advanced AI creates contextual multiple-choice questions from your content.',
      color: 'secondary',
    },
    {
      icon: <BarChart3 size={32} />,
      title: 'Detailed Analytics',
      description: 'Get comprehensive insights into your performance with detailed breakdowns.',
      color: 'success',
    },
    {
      icon: <Zap size={32} />,
      title: 'Lightning Fast',
      description: 'Generate quizzes in seconds, not hours. Perfect for quick assessments.',
      color: 'warning',
    },
    {
      icon: <Shield size={32} />,
      title: 'Secure & Private',
      description: 'Your data is encrypted and secure. We never store your personal content.',
      color: 'error',
    },
    {
      icon: <Users size={32} />,
      title: 'Team Friendly',
      description: 'Share quizzes with your team or students. Perfect for education and training.',
      color: 'info',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Upload Content',
      description: 'Upload your PDF, DOCX file, or paste text directly into our platform.',
      icon: <FileText size={24} />,
    },
    {
      step: '02',
      title: 'AI Processing',
      description: 'Our advanced AI analyzes your content and generates relevant questions.',
      icon: <Brain size={24} />,
    },
    {
      step: '03',
      title: 'Take Quiz',
      description: 'Answer the generated questions in our intuitive quiz interface.',
      icon: <Target size={24} />,
    },
    {
      step: '04',
      title: 'Get Results',
      description: 'Receive detailed analytics and insights about your performance.',
      icon: <BarChart3 size={24} />,
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Education Director',
      avatar: 'https://i.pravatar.cc/150?img=1',
      content: 'This tool has revolutionized how we create assessments. What used to take hours now takes minutes!',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Training Manager',
      avatar: 'https://i.pravatar.cc/150?img=2',
      content: 'The AI-generated questions are surprisingly accurate and relevant. Our team loves it!',
      rating: 5,
    },
    {
      name: 'Emily Davis',
      role: 'Content Creator',
      avatar: 'https://i.pravatar.cc/150?img=3',
      content: 'Perfect for creating quick knowledge checks. The interface is intuitive and beautiful.',
      rating: 5,
    },
  ];

  const stats = [
    { number: '10K+', label: 'Quizzes Created' },
    { number: '50K+', label: 'Questions Generated' },
    { number: '95%', label: 'Accuracy Rate' },
    { number: '2.5s', label: 'Avg. Generation Time' },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <HeroSection>
        {/* Floating Elements */}
        <FloatingElement sx={{ top: '10%', left: '10%' }} delay={0}>
          <Brain size={60} />
        </FloatingElement>
        <FloatingElement sx={{ top: '20%', right: '15%' }} delay={2}>
          <BarChart3 size={80} />
        </FloatingElement>
        <FloatingElement sx={{ bottom: '30%', left: '20%' }} delay={4}>
          <Zap size={40} />
        </FloatingElement>
        <FloatingElement sx={{ bottom: '20%', right: '10%' }} delay={1}>
          <Target size={50} />
        </FloatingElement>

        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center" sx={{ minHeight: '100vh' }}>
            <Grid item xs={12} md={6}>
              <AnimatedSection>
                <Stack spacing={4}>
                  <Chip 
                    label="🚀 AI-Powered Quiz Generation" 
                    sx={{ 
                      alignSelf: 'flex-start',
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }} 
                  />
                  
                  <Typography 
                    variant="h1" 
                    sx={{ 
                      color: 'white',
                      fontWeight: 900,
                      background: 'linear-gradient(45deg, #ffffff 30%, #f1f5f9 90%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Transform Any Content Into 
                    <Box component="span" sx={{ display: 'block', color: '#FFD700' }}>
                      Interactive Quizzes
                    </Box>
                  </Typography>
                  
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: 400,
                      lineHeight: 1.6,
                    }}
                  >
                    Upload your documents or paste text, and let our AI create engaging multiple-choice questions in seconds. Perfect for education, training, and assessment.
                  </Typography>
                  
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<ArrowRight />}
                      onClick={onGetStarted}
                      sx={{
                        background: 'linear-gradient(45deg, #FFD700 30%, #FFA500 90%)',
                        color: '#1E293B',
                        fontWeight: 700,
                        py: 2,
                        px: 4,
                        fontSize: '1.1rem',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #FFA500 30%, #FFD700 90%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 10px 20px rgba(255, 215, 0, 0.3)',
                        },
                      }}
                    >
                      Get Started Free
                    </Button>
                    
                    <Button
                      variant="outlined"
                      size="large"
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        color: 'white',
                        borderWidth: 2,
                        py: 2,
                        px: 4,
                        '&:hover': {
                          borderColor: 'white',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderWidth: 2,
                        },
                      }}
                    >
                      Watch Demo
                    </Button>
                  </Stack>
                  
                  <Stack direction="row" spacing={4} sx={{ pt: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#FFD700', fontWeight: 800 }}>
                        10K+
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Quizzes Created
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#FFD700', fontWeight: 800 }}>
                        95%
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Accuracy Rate
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#FFD700', fontWeight: 800 }}>
                        2.5s
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Generation Time
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </AnimatedSection>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative' }}>
                <GlassCard sx={{ p: 4, textAlign: 'center' }}>
                  <Stack spacing={3} alignItems="center">
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #FFD700 30%, #FFA500 90%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: `${pulse} 2s infinite`,
                      }}
                    >
                      <Brain size={40} color="#1E293B" />
                    </Box>
                    
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                      AI Quiz Generator
                    </Typography>
                    
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      Experience the future of assessment creation with our intelligent platform
                    </Typography>
                    
                    <Stack direction="row" spacing={1}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={20} fill="#FFD700" color="#FFD700" />
                      ))}
                    </Stack>
                    
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Trusted by 10,000+ educators worldwide
                    </Typography>
                  </Stack>
                </GlassCard>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      {/* Features Section */}
      <Box sx={{ py: 12, background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)' }}>
        <Container maxWidth="lg">
          <Stack spacing={8}>
            <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
              <Typography variant="h2" sx={{ mb: 3, color: 'text.primary' }}>
                Powerful Features for Modern Learning
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                Everything you need to create, manage, and analyze quizzes with the power of artificial intelligence
              </Typography>
            </Box>
            
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <FeatureCard>
                    <CardContent sx={{ p: 4, height: '100%' }}>
                      <Stack spacing={3} sx={{ height: '100%' }}>
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${
                              feature.color === 'primary' ? '#6366F1' :
                              feature.color === 'secondary' ? '#8B5CF6' :
                              feature.color === 'success' ? '#10B981' :
                              feature.color === 'warning' ? '#F59E0B' :
                              feature.color === 'error' ? '#EF4444' : '#3B82F6'
                            }15 0%, ${
                              feature.color === 'primary' ? '#6366F1' :
                              feature.color === 'secondary' ? '#8B5CF6' :
                              feature.color === 'success' ? '#10B981' :
                              feature.color === 'warning' ? '#F59E0B' :
                              feature.color === 'error' ? '#EF4444' : '#3B82F6'
                            }25 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: feature.color === 'primary' ? '#6366F1' :
                              feature.color === 'secondary' ? '#8B5CF6' :
                              feature.color === 'success' ? '#10B981' :
                              feature.color === 'warning' ? '#F59E0B' :
                              feature.color === 'error' ? '#EF4444' : '#3B82F6',
                          }}
                        >
                          {feature.icon}
                        </Box>
                        
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                            {feature.title}
                          </Typography>
                          <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                            {feature.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </FeatureCard>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: 12, background: '#F8FAFC' }}>
        <Container maxWidth="lg">
          <Stack spacing={8}>
            <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
              <Typography variant="h2" sx={{ mb: 3, color: 'text.primary' }}>
                How It Works
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                Create professional quizzes in just four simple steps
              </Typography>
            </Box>
            
            <Grid container spacing={6}>
              {steps.map((step, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Stack spacing={3} sx={{ textAlign: 'center', position: 'relative' }}>
                    {index < steps.length - 1 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 40,
                          left: '60%',
                          right: '-40%',
                          height: 2,
                          background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)',
                          display: { xs: 'none', md: 'block' },
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            right: -8,
                            top: -4,
                            width: 0,
                            height: 0,
                            borderLeft: '8px solid #8B5CF6',
                            borderTop: '5px solid transparent',
                            borderBottom: '5px solid transparent',
                          },
                        }}
                      />
                    )}
                    
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        mx: 'auto',
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      {step.icon}
                    </Box>
                    
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'primary.main',
                        fontWeight: 800,
                        fontSize: '0.875rem',
                        letterSpacing: '0.1em',
                      }}
                    >
                      STEP {step.step}
                    </Typography>
                    
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      {step.title}
                    </Typography>
                    
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      {step.description}
                    </Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 12, background: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <StatsCard elevation={0}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                    {stat.number}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    {stat.label}
                  </Typography>
                </StatsCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 12, background: '#F8FAFC' }}>
        <Container maxWidth="lg">
          <Stack spacing={8}>
            <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
              <Typography variant="h2" sx={{ mb: 3, color: 'text.primary' }}>
                Loved by Educators Worldwide
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                See what our users are saying about their experience
              </Typography>
            </Box>
            
            <Grid container spacing={4}>
              {testimonials.map((testimonial, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card sx={{ height: '100%', p: 3 }}>
                    <Stack spacing={3}>
                      <Stack direction="row" spacing={1}>
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} size={20} fill="#FFD700" color="#FFD700" />
                        ))}
                      </Stack>
                      
                      <Typography variant="body1" sx={{ fontStyle: 'italic', lineHeight: 1.6 }}>
                        "{testimonial.content}"
                      </Typography>
                      
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar src={testimonial.avatar} sx={{ width: 48, height: 48 }} />
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {testimonial.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {testimonial.role}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 12,
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={4} alignItems="center" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Typography variant="h2" sx={{ color: 'white', fontWeight: 800 }}>
              Ready to Transform Your Content?
            </Typography>
            
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)', maxWidth: 600 }}>
              Join thousands of educators and trainers who are already creating amazing quizzes with AI
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowRight />}
              onClick={onGetStarted}
              sx={{
                background: 'linear-gradient(45deg, #FFD700 30%, #FFA500 90%)',
                color: '#1E293B',
                fontWeight: 700,
                py: 2,
                px: 6,
                fontSize: '1.2rem',
                mt: 2,
                '&:hover': {
                  background: 'linear-gradient(45deg, #FFA500 30%, #FFD700 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 20px rgba(255, 215, 0, 0.3)',
                },
              }}
            >
              Start Creating Now
            </Button>
            
            <Stack direction="row" spacing={4} sx={{ pt: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircle size={20} color="white" />
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Free to start
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircle size={20} color="white" />
                <Typography variant="body2" sx={{ color: 'white' }}>
                  No credit card required
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircle size={20} color="white" />
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Setup in 30 seconds
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;