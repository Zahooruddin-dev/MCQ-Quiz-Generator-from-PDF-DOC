// src/components/LandingPage/StatsSection.jsx
import React from "react";
import { Container, Grid, Typography } from "@mui/material";
import { StatsCard, AnimatedSection } from "./Styles";

const stats = [
  { number: "50K+", label: "Quizzes Generated" },
  { number: "200K+", label: "Questions Created" },
  { number: "10K+", label: "Active Users" },
  { number: "99.9%", label: "Accuracy Rate" },
];

const StatsSection = () => (
  <Container maxWidth="lg" sx={{ py: 12 }}>
    <AnimatedSection>
      <Grid container spacing={4}>
        {stats.map((s, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <StatsCard>
              <Typography variant="h4">{s.number}</Typography>
              <Typography variant="body2" color="text.secondary">{s.label}</Typography>
            </StatsCard>
          </Grid>
        ))}
      </Grid>
    </AnimatedSection>
  </Container>
);

export default StatsSection;
