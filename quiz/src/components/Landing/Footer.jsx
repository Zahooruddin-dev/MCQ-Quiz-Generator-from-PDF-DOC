import React from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  useTheme,
  useMediaQuery,
  alpha,
  Stack
} from '@mui/material';
import { Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const theme = useTheme();
  const year = new Date().getFullYear();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const footerLinks = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Use Cases', href: '#use-cases' },
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Blog', href: '/blog' },
        { label: 'Documentation', href: '/docs' },
        { label: 'Support', href: '/support' },
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Terms and Conditions', href: '/terms', component: Link },
        { label: 'Contact', href: '/contact' },
      ]
    }
  ];

  return (
    <Box sx={{ 
      py: { xs: 4, sm: 5, md: 6 }, 
      background: alpha(theme.palette.grey[100], 0.8),
      borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`
    }}>
      <Container maxWidth='lg'>
        <Grid container spacing={{ xs: 4, md: 4 }}>
          {/* Logo & Description - Full width on mobile */}
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: { xs: 2, md: 2.5 },
              justifyContent: { xs: 'center', md: 'flex-start' },
              textAlign: { xs: 'center', md: 'left' }
            }}>
              <Box
                sx={{
                  width: { xs: 36, md: 40 },
                  height: { xs: 36, md: 40 },
                  borderRadius: theme.shape.borderRadius,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  mr: { xs: 1.5, md: 2 },
                  boxShadow: `0 3px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <Brain size={isMobile ? 20 : 24} />
              </Box>
              <Typography 
                variant='h6' 
                sx={{ 
                  fontWeight: 800,
                  fontSize: { xs: '1.3rem', md: '1.5rem' }
                }}
              >
                QuizAI
              </Typography>
            </Box>
            <Typography
              variant='body2'
              sx={{ 
                color: 'text.secondary', 
                maxWidth: { xs: '100%', md: 400 }, 
                mb: { xs: 2, md: 3 },
                textAlign: { xs: 'center', md: 'left' },
                fontSize: { xs: '0.9rem', md: '0.95rem' },
                lineHeight: { xs: 1.6, md: 1.7 },
                px: { xs: 2, sm: 0 }
              }}
            >
              The next generation AI-powered quiz generator that helps educators
              create engaging assessments in seconds.
            </Typography>
          </Grid>

          {/* Footer Links - Better mobile layout */}
          <Grid item xs={12} md={6}>
            {isMobile ? (
              // Mobile: Stack links vertically
              <Stack spacing={3} sx={{ textAlign: 'center' }}>
                {footerLinks.map((section, index) => (
                  <Box key={index}>
                    <Typography 
                      variant='subtitle2' 
                      sx={{ 
                        fontWeight: 600, 
                        mb: 1.5,
                        fontSize: '1rem',
                        color: 'text.primary'
                      }}
                    >
                      {section.title}
                    </Typography>
                    <Stack spacing={1}>
                      {section.links.map((link, linkIndex) => (
                        <Typography
                          key={linkIndex}
                          variant='body2'
                          component={link.component || 'a'}
                          href={link.href}
                          to={link.component === Link ? link.href : undefined}
                          sx={{
                            color: 'text.secondary',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            transition: 'color 0.2s ease',
                            '&:hover': {
                              color: 'primary.main',
                            }
                          }}
                        >
                          {link.label}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : (
              // Desktop: Grid layout
              <Grid container spacing={4}>
                {footerLinks.map((section, index) => (
                  <Grid item xs={4} key={index}>
                    <Typography 
                      variant='subtitle2' 
                      sx={{ fontWeight: 600, mb: 2 }}
                    >
                      {section.title}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {section.links.map((link, linkIndex) => (
                        <Typography
                          key={linkIndex}
                          variant='body2'
                          component={link.component || 'a'}
                          href={link.href}
                          to={link.component === Link ? link.href : undefined}
                          sx={{
                            color: 'text.secondary',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            transition: 'color 0.2s ease',
                            '&:hover': {
                              color: 'primary.main',
                            }
                          }}
                        >
                          {link.label}
                        </Typography>
                      ))}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* Copyright - Better mobile spacing */}
        <Box
          sx={{
            mt: { xs: 4, md: 6 },
            pt: { xs: 3, md: 4 },
            borderTop: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.5),
            textAlign: 'center',
          }}
        >
          <Typography 
            variant='body2' 
            sx={{ 
              color: 'text.secondary',
              fontSize: { xs: '0.85rem', md: '0.9rem' }
            }}
          >
            © {year} QuizAI. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;