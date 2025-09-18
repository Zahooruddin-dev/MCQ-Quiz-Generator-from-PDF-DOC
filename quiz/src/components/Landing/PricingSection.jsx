import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';

const PricingSection = ({ user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for trying out QuizAI',
      credits: '5 credits',
      popular: false,
      features: [
        '50 AI-generated questions per month',
        'Basic quiz templates',
        'Export to PDF',
        'Email support',
        'Basic analytics'
      ],
      buttonText: user ? 'Current Plan' : 'Get Started Free',
      buttonColor: 'outlined',
      disabled: user?.plan === 'free'
    },
    {
      name: 'Pro',
      price: '$25',
      period: '/month',
      description: 'Best for educators and professionals',
      credits: '500 credits',
      popular: true,
      features: [
        '500 AI-generated questions per month',
        'Advanced quiz templates',
        'Custom branding',
        'Priority support',
        'Advanced analytics',
        'Bulk question generation',
        'Multiple export formats'
      ],
      buttonText: user?.plan === 'pro' ? 'Current Plan' : 'Start Pro Trial',
      buttonColor: 'contained',
      disabled: user?.plan === 'pro'
    },
    {
      name: 'Enterprise',
      price: '$250',
      period: '/month',
      description: 'For institutions and large teams',
      credits: '2600 credits',
      popular: false,
      features: [
        '2500 AI-generated questions per month',
        'Unlimited quiz templates',
        'White-label solution',
        'Dedicated account manager',
        'Custom integrations',
        'API access',
        'Advanced reporting',
        'SSO integration'
      ],
      buttonText: user?.plan === 'enterprise' ? 'Current Plan' : 'Contact Sales',
      buttonColor: 'outlined',
      disabled: user?.plan === 'enterprise'
    }
  ];

  const handlePlanSelect = (plan) => {
    if (user) {
      // User is logged in - redirect to checkout or upgrade
      if (plan.name === 'Pro') {
        // Redirect to Paddle checkout for Pro plan
        window.location.href = '/checkout/pro';
      } else if (plan.name === 'Enterprise') {
        // Open contact form or redirect to sales
        window.location.href = '/contact-sales';
      }
    } else {
      // User not logged in - redirect to signup with plan selection
      window.location.href = `/signup?plan=${plan.name.toLowerCase()}`;
    }
  };

  return (
    <Box 
      sx={{ 
        py: { xs: 8, md: 12 }, 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        position: 'relative'
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant={isMobile ? 'h3' : 'h2'} 
            sx={{ 
              fontWeight: 800, 
              mb: 2,
              background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Simple, Transparent Pricing
          </Typography>
          <Typography 
            variant={isMobile ? 'h6' : 'h5'} 
            sx={{ 
              color: 'text.secondary', 
              maxWidth: 700, 
              mx: 'auto',
              fontWeight: 400
            }}
          >
            Choose the perfect plan for your quiz generation needs. All plans include our AI-powered question generation.
          </Typography>
        </Box>

        {/* Pricing Cards */}
        <Grid container spacing={4} justifyContent="center">
          {plans.map((plan) => (
            <Grid item xs={12} sm={6} lg={4} key={plan.name}>
              <Card
                sx={{
                  position: 'relative',
                  height: '100%',
                  border: plan.popular ? `3px solid ${theme.palette.primary.main}` : '1px solid',
                  borderColor: plan.popular ? 'primary.main' : 'divider',
                  boxShadow: plan.popular 
                    ? '0 20px 40px rgba(25, 118, 210, 0.15)' 
                    : '0 4px 20px rgba(0, 0, 0, 0.08)',
                  borderRadius: 3,
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                  '&:hover': {
                    transform: plan.popular ? 'scale(1.08)' : 'scale(1.03)',
                    boxShadow: plan.popular 
                      ? '0 25px 50px rgba(25, 118, 210, 0.25)' 
                      : '0 8px 30px rgba(0, 0, 0, 0.15)'
                  }
                }}
              >
                {plan.popular && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -16,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                      color: 'white',
                      px: 3,
                      py: 1,
                      borderRadius: 20,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                      boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)'
                    }}
                  >
                    <StarIcon sx={{ fontSize: 16 }} />
                    Most Popular
                  </Box>
                )}

                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {plan.name}
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant={isMobile ? 'h3' : 'h2'}
                      sx={{ 
                        fontWeight: 800, 
                        color: 'primary.main',
                        display: 'inline'
                      }}
                    >
                      {plan.price}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ 
                        color: 'text.secondary',
                        display: 'inline',
                        ml: 0.5
                      }}
                    >
                      {plan.period}
                    </Typography>
                  </Box>

                  <Typography 
                    variant="body1" 
                    sx={{ color: 'text.secondary', mb: 3 }}
                  >
                    {plan.description}
                  </Typography>

                  <Chip 
                    label={plan.credits}
                    variant="outlined"
                    color="primary"
                    sx={{ 
                      mb: 4, 
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                      px: 2,
                      py: 0.5
                    }}
                  />

                  <List sx={{ mb: 4, textAlign: 'left' }}>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} sx={{ py: 0.75, px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircleIcon 
                            sx={{ 
                              color: 'success.main', 
                              fontSize: 22
                            }} 
                          />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature}
                          primaryTypographyProps={{
                            variant: 'body2',
                            sx: { fontWeight: 500 }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    variant={plan.buttonColor}
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={plan.disabled}
                    onClick={() => handlePlanSelect(plan)}
                    sx={{
                      py: 2,
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      borderRadius: 2,
                      textTransform: 'none',
                      ...(plan.popular && {
                        background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                        color: 'white',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1565c0, #1976d2)',
                        }
                      }),
                      ...(plan.disabled && {
                        background: 'rgba(0, 0, 0, 0.12)',
                        color: 'rgba(0, 0, 0, 0.26)'
                      })
                    }}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* FAQ/Additional Info */}
        <Box sx={{ mt: 10, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            Need more credits?
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            All plans can be upgraded with additional credit packs. Enterprise customers can get custom pricing.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
              💳 Secure payments powered by Paddle
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
              ✅ 30-day money-back guarantee
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
              🔒 Cancel anytime
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default PricingSection;