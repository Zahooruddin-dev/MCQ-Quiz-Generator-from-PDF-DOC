// src/components/LandingPage/TestimonialsSection.jsx
import React from "react";
import { Container, Grid, Typography, Stack, Avatar } from "@mui/material";
import { GlassCard, AnimatedSection } from "./Styles";

const testimonials = [
  { name: "Sarah L.", role: "Teacher", text: "This saves me hours of work creating quizzes.", avatar: "https://i.pravatar.cc/150?img=1" },
  { name: "James K.", role: "Student", text: "The flashcards help me prepare quickly for exams!", avatar: "https://i.pravatar.cc/150?img=2" },
  { name: "Emily R.", role: "Tutor", text: "Sharing quizzes with my students is seamless.", avatar: "https://i.pravatar.cc/150?img=3" },
];

const TestimonialsSection = () => (
  <Container maxWidth="lg" sx={{ py: 12 }}>
    <AnimatedSection>
      <Typography variant="h2" align="center" gutterBottom>
        Loved by Educators & Students
      </Typography>
      <Grid container spacing={4}>
        {testimonials.map((t, i) => (
          <Grid item xs={12} md={4} key={i}>
            <GlassCard sx={{ p: 3 }}>
              <Stack spacing={2} alignItems="center">
                <Avatar src={t.avatar} alt={t.name} sx={{ width: 56, height: 56 }} />
                <Typography variant="h6">{t.name}</Typography>
                <Typography variant="caption" color="text.secondary">{t.role}</Typography>
                <Typography variant="body2" color="text.secondary" align="center">“{t.text}”</Typography>
              </Stack>
            </GlassCard>
          </Grid>
        ))}
      </Grid>
    </AnimatedSection>
  </Container>
);

export default TestimonialsSection;
