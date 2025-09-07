// src/components/LandingPage/FeaturesSection.jsx
import React from "react";
import { Container, Grid, Typography, Stack } from "@mui/material";
import { FileText, ClipboardList, Share2, BookOpen } from "lucide-react";
import { FeatureCard, AnimatedSection } from "./Styles";

const features = [
  { icon: <FileText size={32} />, title: "Upload Documents", desc: "Support for PDFs, Word files, and plain text." },
  { icon: <ClipboardList size={32} />, title: "Auto Quiz Generation", desc: "AI creates multiple-choice and open-ended questions." },
  { icon: <Share2 size={32} />, title: "Share & Export", desc: "Export quizzes or share them online." },
  { icon: <BookOpen size={32} />, title: "Study Mode", desc: "Practice with flashcards and spaced repetition." },
];

const FeaturesSection = () => (
  <Container maxWidth="lg" sx={{ py: 12 }}>
    <AnimatedSection>
      <Typography variant="h2" align="center" gutterBottom>
        Powerful Features
      </Typography>
      <Grid container spacing={4}>
        {features.map((f, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <FeatureCard sx={{ p: 3 }}>
              <Stack spacing={2} alignItems="center">
                {f.icon}
                <Typography variant="h6">{f.title}</Typography>
                <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
              </Stack>
            </FeatureCard>
          </Grid>
        ))}
      </Grid>
    </AnimatedSection>
  </Container>
);

export default FeaturesSection;
