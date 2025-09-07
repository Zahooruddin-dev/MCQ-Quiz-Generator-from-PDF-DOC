// src/components/LandingPage/CTASection.jsx
import React from "react";
import { Container, Typography, Button, Stack } from "@mui/material";
import { AnimatedSection } from "./Styles";

const CTASection = ({ handleGetStarted }) => (
  <Container maxWidth="md" sx={{ py: 12, textAlign: "center" }}>
    <AnimatedSection>
      <Typography variant="h3" gutterBottom>
        Ready to Create Your First Quiz?
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Join thousands of students and teachers using our AI quiz generator.
      </Typography>
      <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 4 }}>
        <Button variant="contained" size="large" onClick={handleGetStarted}>
          Get Started Free
        </Button>
        <Button variant="outlined" size="large">Learn More</Button>
      </Stack>
    </AnimatedSection>
  </Container>
);

export default CTASection;
