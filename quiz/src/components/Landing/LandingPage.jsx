// src/components/LandingPage/LandingPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import HowItWorksSection from "./HowItWorksSection";
import StatsSection from "./StatsSection";
import TestimonialsSection from "./TestimonialsSection";
import CTASection from "./CTASection";

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) navigate("/dashboard");
    else navigate("/auth");
  };

  return (
    <>
      <HeroSection handleGetStarted={handleGetStarted} />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <TestimonialsSection />
      <CTASection handleGetStarted={handleGetStarted} />
    </>
  );
};

export default LandingPage;
