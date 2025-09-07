// src/components/LandingPage/HeroSection.jsx
import React from "react";
import { Container, Grid, Stack, Typography, Button, Box, Chip } from "@mui/material";
import { ArrowRight, Brain, BarChart3, Zap, Target, Star } from "lucide-react";
import { HeroSectionWrapper, FloatingElement, GlassCard, AnimatedSection, pulse } from "./Styles";

const HeroSection = ({ handleGetStarted }) => (
  <HeroSectionWrapper>
    <FloatingElement sx={{ top: "10%", left: "10%" }} delay={0}><Brain size={60} /></FloatingElement>
    <FloatingElement sx={{ top: "20%", right: "15%" }} delay={2}><BarChart3 size={80} /></FloatingElement>
    <FloatingElement sx={{ bottom: "30%", left: "20%" }} delay={4}><Zap size={40} /></FloatingElement>
    <FloatingElement sx={{ bottom: "20%", right: "10%" }} delay={1}><Target size={50} /></FloatingElement>

    <Container maxWidth="lg">
      <Grid container spacing={6} alignItems="center" sx={{ minHeight: "100vh" }}>
        <Grid item xs={12} md={6}>
          <AnimatedSection>
            <Stack spacing={4}>
              <Chip
                label="🚀 AI-Powered Quiz Generation"
                sx={{ alignSelf: "flex-start", background: "rgba(255,255,255,0.2)", color: "white", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.3)" }}
              />
              <Typography variant="h1" sx={{ color: "white", fontWeight: 900 }}>
                Transform Any Content Into
                <Box component="span" sx={{ display: "block", color: "#FFD700" }}>
                  Interactive Quizzes
                </Box>
              </Typography>
              <Typography variant="h5" sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 400 }}>
                Upload documents or paste text and let AI create quizzes in seconds.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button variant="contained" size="large" endIcon={<ArrowRight />} onClick={handleGetStarted}>
                  Get Started Free
                </Button>
                <Button variant="outlined" size="large">Watch Demo</Button>
              </Stack>
            </Stack>
          </AnimatedSection>
        </Grid>
        <Grid item xs={12} md={6}>
          <GlassCard sx={{ p: 4, textAlign: "center" }}>
            <Stack spacing={3} alignItems="center">
              <Box
                sx={{
                  width: 80, height: 80, borderRadius: "50%",
                  background: "linear-gradient(45deg, #FFD700 30%, #FFA500 90%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  animation: `${pulse} 2s infinite`,
                }}
              >
                <Brain size={40} color="#1E293B" />
              </Box>
              <Typography variant="h4" sx={{ color: "white", fontWeight: 700 }}>AI Quiz Generator</Typography>
              <Stack direction="row" spacing={1}>
                {[1,2,3,4,5].map(i => <Star key={i} size={20} fill="#FFD700" />)}
              </Stack>
            </Stack>
          </GlassCard>
        </Grid>
      </Grid>
    </Container>
  </HeroSectionWrapper>
);

export default HeroSection;
