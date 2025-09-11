import React from 'react';
import { Box } from '@mui/material';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import HowItWorks from './HowItWorksSection';
import Testimonials from './TestimonialsSection';
import CTASection from './CTASection';
import Footer from './Footer';
import { useAuth } from '../../context/AuthContext';

const LandingPage = () => {
  const { user } = useAuth(); // ✅ Get user here

  return (
    <Box sx={{ overflow: 'hidden' }}>
      <HeroSection user={user} />
      <FeaturesSection />
      <HowItWorks />
      <Testimonials />
      <CTASection user={user} />
      <Footer />
    </Box>
  );
};

export default LandingPage;
