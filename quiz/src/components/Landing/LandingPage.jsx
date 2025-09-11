import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  Brain,
  Zap,
  Shield,
  BarChart3,
  Users,
  Globe,
  Smartphone,
  Award,
  BookOpen,
  ChevronRight
} from 'lucide-react';

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Features data
  const features = [
    {
      icon: <Zap size={32} />,
      title: "Lightning Fast",
      description: "Generate quizzes in seconds with our optimized AI engine"
    },
    {
      icon: <Shield size={32} />,
      title: "Secure & Private",
      description: "Your documents are processed securely with end-to-end encryption"
    },
    {
      icon: <BarChart3 size={32} />,
      title: "Advanced Analytics",
      description: "Track performance and identify knowledge gaps with detailed insights"
    },
    {
      icon: <Globe size={32} />,
      title: "Multi-language Support",
      description: "Generate quizzes in multiple languages with accurate translations"
    },
    {
      icon: <Smartphone size={32} />,
      title: "Mobile Optimized",
      description: "Perfect experience on any device, anywhere"
    },
    {
      icon: <Award size={32} />,
      title: "Premium Content",
      description: "Access high-quality question templates and learning materials"
    }
  ];

  // Testimonials data
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

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section */}
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
            background: 'url("data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M0 0h20v20H0V0zm10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm0-11a4 4 0 1 1 0 8 4 4 0 0 1 0-8z\" fill=\"%23ffffff\" fill-opacity=\"0.05\" fill-rule=\"evenodd\"/%3E%3C/svg%3E")',
            opacity: 0.5
          }
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip
                label="New: Enhanced OCR Technology"
                sx={{
                  background: alpha('#fff', 0.2),
                  color: 'white',
                  mb: 2,
                  fontWeight: 600
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 800,
                  lineHeight: 1.2,
                  mb: 2
                }}
              >
                Transform Documents into Engaging Quizzes with AI
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  opacity: 0.9,
                  mb: 4,
                  fontWeight: 400
                }}
              >
                Upload PDFs, DOCX, or images and let our advanced AI generate customized quizzes in seconds.
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
                    '&:hover': {
                      background: alpha('#fff', 0.9)
                    }
                  }}
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
                      background: alpha('#fff', 0.1)
                    }
                  }}
                >
                  See Demo
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                sx={{
                  background: alpha('#fff', 0.1),
                  borderRadius: 4,
                  p: 2,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: alpha('#fff', 0.2),
                  maxWidth: 400,
                  mx: 'auto'
                }}
              >
                <Box
                  sx={{
                    background: 'white',
                    borderRadius: 3,
                    overflow: 'hidden',
                    color: theme.palette.text.primary,
                    boxShadow: theme.shadows[10]
                  }}
                >
                  <Box sx={{ p: 2, background: theme.palette.grey[100], display: 'flex', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                      Quiz: World History Chapter 3
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        1. What was the primary cause of the Industrial Revolution?
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography variant="body2">A) Agricultural advancements</Typography>
                        <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                          B) Technological innovations ✓
                        </Typography>
                        <Typography variant="body2">C) Political revolutions</Typography>
                        <Typography variant="body2">D) Religious movements</Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        2. Which invention revolutionized textile manufacturing?
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography variant="body2">A) Steam engine</Typography>
                        <Typography variant="body2">B) Telegraph</Typography>
                        <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
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

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto', mb: { xs: 6, md: 10 } }}>
            <Chip
              label="Powerful Features"
              color="primary"
              sx={{ mb: 2, fontWeight: 600 }}
            />
            <Typography variant="h2" sx={{ mb: 3, fontWeight: 700 }}>
              Why Educators Love QuizAI
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
              Our advanced AI technology makes quiz creation effortless and effective for educators, trainers, and students alike.
            </Typography>
          </Box>

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

      {/* How It Works Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, background: theme.palette.grey[50] }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto', mb: { xs: 6, md: 10 } }}>
            <Chip
              label="Simple Process"
              color="primary"
              sx={{ mb: 2, fontWeight: 600 }}
            />
            <Typography variant="h2" sx={{ mb: 3, fontWeight: 700 }}>
              How QuizAI Works
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
              Transform your educational materials into engaging quizzes in three simple steps.
            </Typography>
          </Box>

          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
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
                    1
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Upload Content
                  </Typography>
                </Box>
                <Typography sx={{ color: 'text.secondary', pl: 6 }}>
                  Upload PDFs, DOCX files, images, or even text. Our advanced OCR extracts text with incredible accuracy.
                </Typography>
              </Box>

              <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mt: 6 }}>
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
                    2
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    AI Analysis
                  </Typography>
                </Box>
                <Typography sx={{ color: 'text.secondary', pl: 6 }}>
                  Our AI analyzes the content, identifies key concepts, and generates relevant questions based on learning objectives.
                </Typography>
              </Box>

              <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mt: 6 }}>
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
                    3
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Generate & Share
                  </Typography>
                </Box>
                <Typography sx={{ color: 'text.secondary', pl: 6 }}>
                  Customize your quiz format, difficulty, and share with students via link, LMS, or printable format.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Box
                sx={{
                  background: 'white',
                  borderRadius: 4,
                  p: 3,
                  boxShadow: theme.shadows[3],
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Box sx={{ display: 'flex', mb: 3 }}>
                  <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      background: theme.palette.grey[100],
                      borderRadius: 2,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      color: 'text.secondary'
                    }}
                  >
                    quizai.com/upload
                  </Box>
                  <Box sx={{ flex: 1 }} />
                </Box>

                <Box sx={{ p: 2, background: theme.palette.grey[50], borderRadius: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          p: 3,
                          background: 'white',
                          borderRadius: 2,
                          border: '2px dashed',
                          borderColor: 'divider',
                          textAlign: 'center',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: theme.palette.primary.main,
                            mb: 2
                          }}
                        >
                          <BookOpen size={24} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Upload Document
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          PDF, DOCX, or Image
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          p: 3,
                          background: 'white',
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          height: '100%'
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                          Quiz Settings
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                            Question Types
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip label="Multiple Choice" size="small" color="primary" variant="outlined" />
                            <Chip label="True/False" size="small" />
                            <Chip label="Short Answer" size="small" />
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                            Difficulty
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip label="Easy" size="small" />
                            <Chip label="Medium" size="small" color="primary" />
                            <Chip label="Hard" size="small" />
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 2,
                          background: theme.palette.primary.main,
                          color: 'white',
                          borderRadius: 2,
                          textAlign: 'center',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                          fontWeight: 600
                        }}
                      >
                        Generate Quiz <ChevronRight size={20} />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto', mb: { xs: 6, md: 10 } }}>
            <Chip
              label="Testimonials"
              color="primary"
              sx={{ mb: 2, fontWeight: 600 }}
            />
            <Typography variant="h2" sx={{ mb: 3, fontWeight: 700 }}>
              Trusted by Educators Worldwide
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
              Join thousands of educators who are transforming their teaching with QuizAI.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    background: theme.palette.grey[50],
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                    p: 3
                  }}
                >
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
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {testimonial.role}
                      </Typography>
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

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white'
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
                '&:hover': {
                  background: alpha('#fff', 0.9)
                }
              }}
            >
              Get Started Free
            </Button>
            <Typography variant="body2" sx={{ mt: 3, opacity: 0.8 , color:'whitesmoke'}}>
              No credit card required. Free plan includes 5 quizzes per month.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, background: theme.palette.grey[100] }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: theme.shape.borderRadius,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    mr: 2
                  }}
                >
                  <Brain size={24} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  QuizAI
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 400, mb: 3 }}>
                The next generation AI-powered quiz generator that helps educators create engaging assessments in seconds.
              </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                Product
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Features
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Pricing
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Use Cases
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                Resources
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Blog
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Documentation
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Support
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                Company
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  About
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Careers
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Contact
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              © {new Date().getFullYear()} QuizAI. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;