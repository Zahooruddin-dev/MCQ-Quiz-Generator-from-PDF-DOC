import React from 'react';
import { Box, Fade, useMediaQuery, useTheme } from '@mui/material';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import HowItWorks from './HowItWorksSection';
import PricingSection from './PricingSection';
import Testimonials from './TestimonialsSection';
import CTASection from './CTASection';
import Footer from './Footer';
import { useAuth } from '../../context/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box 
      sx={{ 
        overflow: 'hidden',
        // Smooth scrolling for better mobile experience
        scrollBehavior: 'smooth',
        // Optimize for mobile performance
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Hero Section - Full viewport attention */}
      <Fade in={true} timeout={800}>
        <Box>
          <HeroSection user={user} />
        </Box>
      </Fade>

      {/* Features Section - Showcase capabilities */}
      <Fade in={true} timeout={1000}>
        <Box id="features">
          <FeaturesSection />
        </Box>
      </Fade>

      {/* How It Works - Process explanation */}
      <Fade in={true} timeout={1200}>
        <Box id="how-it-works">
          <HowItWorks />
        </Box>
      </Fade>

      {/* Pricing Section - Conversion focus */}
      <Fade in={true} timeout={1400}>
        <Box id="pricing">
          <PricingSection user={user} />
        </Box>
      </Fade>

      {/* Testimonials - Social proof */}
      <Fade in={true} timeout={1600}>
        <Box id="testimonials">
          <Testimonials />
        </Box>
      </Fade>

      {/* Final CTA - Last conversion opportunity */}
      <Fade in={true} timeout={1800}>
        <Box id="cta">
          <CTASection user={user} />
        </Box>
      </Fade>

      {/* Footer - Links and info */}
      <Footer />

      {/* Mobile-specific optimizations */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 'env(safe-area-inset-bottom)',
            background: 'transparent',
            pointerEvents: 'none',
            zIndex: -1
          }}
        />
      )}
    </Box>
  );
};

export default LandingPage;