// src/components/LandingPage/HowItWorksSection.jsx
import React from "react";
import { Container, Grid, Typography, Stack } from "@mui/material";
import { Upload, Sparkles, FileCheck } from "lucide-react";
import { GlassCard, AnimatedSection } from "./Styles";

const steps = [
  { icon: <Upload size={32} />, title: "Upload", desc: "Add your file or paste text." },
  { icon: <Sparkles size={32} />, title: "Generate", desc: "AI instantly creates questions." },
  { icon: <FileCheck size={32} />, title: "Review", desc: "Edit or approve your quiz." },
];

const HowItWorksSection = () => (
  <Container maxWidth="lg" sx={{ py: 12 }}>
    <AnimatedSection>
      <Typography variant="h2" align="center" gutterBottom>
        How It Works
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {steps.map((s, i) => (
          <Grid item xs={12} sm={4} key={i}>
            <GlassCard sx={{ p: 3, textAlign: "center" }}>
              <Stack spacing={2} alignItems="center">
                {s.icon}
                <Typography variant="h6">{s.title}</Typography>
                <Typography variant="body2" color="text.secondary">{s.desc}</Typography>
              </Stack>
            </GlassCard>
          </Grid>
        ))}
      </Grid>
    </AnimatedSection>
  </Container>
);

export default HowItWorksSection;
