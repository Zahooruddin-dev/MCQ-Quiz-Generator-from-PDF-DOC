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
  useMediaQuery,
  alpha,
  Stack
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';

const PricingSection = ({ user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      buttonText: user?.plan === 'free' ? 'Current Plan' : 'Get Started Free',
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
        window.location.href = '/checkout/pro';
      } else if (plan.name === 'Enterprise') {
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
        py: { xs: 6, sm: 8, md: 12 }, 
        background: `linear-gradient(135deg, ${alpha(theme.palette.grey[50], 0.8)} 0%, ${alpha(theme.palette.grey[100], 0.6)} 100%)`,
        position: 'relative',
        overflow: 'hidden'
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
          backgroundImage: `radial-gradient(circle at 25% 25%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, ${alpha(theme.palette.secondary.main, 0.03)} 0%, transparent 50%)`,
          pointerEvents: 'none'
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header - Mobile optimized */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: { xs: 5, sm: 6, md: 8 },
          px: { xs: 2, sm: 0 }
        }}>
          <Typography 
            variant={isSmallMobile ? "h4" : isMobile ? "h3" : "h2"} 
            sx={{ 
              fontWeight: { xs: 700, md: 800 }, 
              mb: { xs: 2, md: 2.5 },
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: {
                xs: '1.8rem',
                sm: '2.2rem',
                md: '2.8rem'
              }
            }}
          >
            Simple, Transparent Pricing
          </Typography>
          <Typography 
            variant={isMobile ? "body1" : "h5"} 
            sx={{ 
              color: 'text.secondary', 
              maxWidth: { xs: '100%', md: 700 }, 
              mx: 'auto',
              fontWeight: 400,
              fontSize: {
                xs: '1rem',
                sm: '1.1rem',
                md: '1.25rem'
              },
              lineHeight: { xs: 1.6, md: 1.5 }
            }}
          >
            Choose the perfect plan for your quiz generation needs. All plans include our AI-powered question generation.
          </Typography>
        </Box>

        {/* Pricing Cards - Better mobile layout */}
        <Grid container spacing={{ xs: 3, sm: 3, md: 4 }} justifyContent="center">
          {plans.map((plan) => (
            <Grid item xs={12} sm={6} lg={4} key={plan.name}>
              <Card
                sx={{
                  position: 'relative',
                  height: '100%',
                  border: plan.popular ? `3px solid ${theme.palette.primary.main}` : '2px solid',
                  borderColor: plan.popular ? 'primary.main' : alpha(theme.palette.divider, 0.3),
                  boxShadow: plan.popular 
                    ? `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}` 
                    : `0 4px 20px ${alpha(theme.palette.grey[500], 0.08)}`,
                  borderRadius: { xs: 3, md: 4 },
                  background: plan.popular 
                    ? alpha('#fff', 0.98) 
                    : alpha('#fff', 0.95),
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transform: plan.popular && !isMobile ? 'scale(1.02)' : 'scale(1)',
                  '&:hover': {
                    transform: plan.popular && !isMobile ? 'scale(1.05)' : 'scale(1.02)',
                    boxShadow: plan.popular 
                      ? `0 20px 60px ${alpha(theme.palette.primary.main, 0.25)}` 
                      : `0 8px 30px ${alpha(theme.palette.grey[500], 0.15)}`
                  }
                }}
              >
                {plan.popular && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: { xs: -0, md: -0 },
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      color: 'white',
                      px: { xs: 2.5, md: 3 },
                      py: { xs: 0.8, md: 1 },
                      borderRadius: 20,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontWeight: 'bold',
                      margin: 0.4,
                      fontSize: { xs: '0.4rem', md: '0.475rem' },
                      boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
                      zIndex: 1
                    }}
                  >
                    <StarIcon sx={{ fontSize: { xs: 14, md: 16 } }} />
                    Popular
                  </Box>
                )}

                <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
                  {/* Plan name */}
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 1,
                      fontSize: { xs: '1.5rem', md: '2rem' }
                    }}
                  >
                    {plan.name}
                  </Typography>
                  
                  {/* Price */}
                  <Box sx={{ mb: { xs: 2.5, md: 3 } }}>
                    <Typography
                      variant={isMobile ? "h3" : "h2"}
                      sx={{ 
                        fontWeight: 800, 
                        color: 'primary.main',
                        display: 'inline',
                        fontSize: {
                          xs: '2rem',
                          sm: '2.5rem',
                          md: '3rem'
                        }
                      }}
                    >
                      {plan.price}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ 
                        color: 'text.secondary',
                        display: 'inline',
                        ml: 0.5,
                        fontSize: { xs: '1rem', md: '1.25rem' }
                      }}
                    >
                      {plan.period}
                    </Typography>
                  </Box>

                  {/* Description */}
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'text.secondary', 
                      mb: { xs: 2.5, md: 3 },
                      fontSize: { xs: '0.95rem', md: '1rem' }
                    }}
                  >
                    {plan.description}
                  </Typography>

                  {/* Credits */}
                  <Chip 
                    label={plan.credits}
                    variant="outlined"
                    color="primary"
                    sx={{ 
                      mb: { xs: 3, md: 4 }, 
                      fontWeight: 'bold',
                      fontSize: { xs: '0.8rem', md: '0.875rem' },
                      px: { xs: 1.5, md: 2 },
                      py: 0.5,
                      height: 'auto'
                    }}
                  />

                  {/* Features list - Mobile optimized */}
                  <List sx={{ mb: { xs: 3, md: 4 }, textAlign: 'left', py: 0 }}>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} sx={{ py: { xs: 0.5, md: 0.75 }, px: 0 }}>
                        <ListItemIcon sx={{ minWidth: { xs: 28, md: 36 } }}>
                          <CheckCircleIcon 
                            sx={{ 
                              color: 'success.main', 
                              fontSize: { xs: 18, md: 22 }
                            }} 
                          />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature}
                          primaryTypographyProps={{
                            variant: 'body2',
                            sx: { 
                              fontWeight: 500,
                              fontSize: { xs: '0.85rem', md: '0.9rem' },
                              lineHeight: { xs: 1.4, md: 1.5 }
                            }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {/* CTA Button - Mobile optimized */}
                  <Button
                    variant={plan.buttonColor}
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={plan.disabled}
                    onClick={() => handlePlanSelect(plan)}
                    sx={{
                      py: { xs: 1.75, md: 2 },
                      fontWeight: 'bold',
                      fontSize: { xs: '0.95rem', md: '1rem' },
                      borderRadius: { xs: 2, md: 2.5 },
                      textTransform: 'none',
                      minHeight: { xs: 48, md: 56 },
                      ...(plan.popular && {
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        color: 'white',
                        boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                          boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                        }
                      }),
                      ...(plan.disabled && {
                        background: alpha(theme.palette.grey[300], 0.5),
                        color: alpha(theme.palette.grey[600], 0.7)
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

        {/* Additional Info - Mobile friendly */}
        <Box sx={{ mt: { xs: 6, md: 10 }, textAlign: 'center' }}>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            sx={{ 
              mb: { xs: 1.5, md: 2 }, 
              fontWeight: 600,
              fontSize: { xs: '1.1rem', md: '1.5rem' }
            }}
          >
            Need more credits?
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary', 
              mb: { xs: 2.5, md: 3 },
              fontSize: { xs: '0.95rem', md: '1rem' },
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            All plans can be upgraded with additional credit packs. Enterprise customers can get custom pricing.
          </Typography>
          
          {/* Trust indicators - Mobile stack */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 2, sm: 4 }}
            sx={{ 
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontSize: { xs: '0.85rem', md: '0.9rem' }
              }}
            >
              💳 Secure payments powered by Paddle
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontSize: { xs: '0.85rem', md: '0.9rem' }
              }}
            >
              ✅ 30-day money-back guarantee
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontSize: { xs: '0.85rem', md: '0.9rem' }
              }}
            >
              🔒 Cancel anytime
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default PricingSection;