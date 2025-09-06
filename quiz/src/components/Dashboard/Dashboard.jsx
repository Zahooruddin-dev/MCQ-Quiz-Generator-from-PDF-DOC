import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  CardContent,
  Button,
  Stack,
  Avatar,
  Chip,
} from "@mui/material";
import { Award, Users, ArrowRight, Upload, Brain, BarChart3, Zap } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ProgressTracking from "../Analytics/ProgressTracking";
import { WelcomeCard } from "./StyledCards";
import QuickActions from "./QuickActions";
import RecentQuizzes from "./RecentQuizzes";

const Dashboard = ({ onCreateQuiz, onViewResults }) => {
  const { user, credits, isPremium } = useAuth();
  const navigate = useNavigate();
  const [showAnalytics, setShowAnalytics] = useState(false);

  const [recentQuizzes] = useState([
    { id: 1, title: "JavaScript Fundamentals", date: "2024-01-15", score: 85, questions: 10 },
    { id: 2, title: "React Components", date: "2024-01-14", score: 92, questions: 15 },
    { id: 3, title: "Database Design", date: "2024-01-13", score: 78, questions: 12 },
  ]);

  const quickActions = [
    {
      title: "Upload Document",
      description: "Upload PDF, DOCX, or paste text to generate quiz",
      icon: <Upload size={32} />,
      color: "primary",
      action: () => navigate("/upload"),
    },
    {
      title: "AI Quiz Generator",
      description: "Let AI create questions from your content",
      icon: <Brain size={32} />,
      color: "secondary",
      action: () => navigate("/upload"),
    },
    {
      title: "View Analytics",
      description: "Check your performance and progress",
      icon: <BarChart3 size={32} />,
      color: "success",
      action: () => setShowAnalytics(true),
    },
    {
      title: "Quick Quiz",
      description: "Start a practice quiz immediately",
      icon: <Zap size={32} />,
      color: "warning",
      action: () => console.log("Quick quiz"),
    },
  ];

  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // 🔄 Analytics Mode
  if (showAnalytics) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Button
            variant="outlined"
            onClick={() => setShowAnalytics(false)}
            sx={{ alignSelf: "flex-start" }}
          >
            ← Back to Dashboard
          </Button>
          <ProgressTracking userId={user?.uid} timePeriod="all_time" showCharts />
        </Stack>
      </Container>
    );
  }

  // 🏠 Default Dashboard Mode
  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          {/* Welcome Section */}
          <WelcomeCard>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          width: 64,
                          height: 64,
                          background: "rgba(255, 255, 255, 0.2)",
                          backdropFilter: "blur(10px)",
                          border: "2px solid rgba(255, 255, 255, 0.3)",
                          fontWeight: 600,
                          fontSize: "1.5rem",
                        }}
                      >
                        {getUserInitials(user?.displayName)}
                      </Avatar>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                          Welcome back, {user?.displayName?.split(" ")[0] || "User"}!
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                          Ready to create some amazing quizzes today?
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      <Chip
                        icon={isPremium ? <Award size={16} /> : <Users size={16} />}
                        label={
                          isPremium ? "Premium Member" : `${credits} Credits Available`
                        }
                        sx={{
                          background: "rgba(255, 255, 255, 0.2)",
                          color: "white",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(255, 255, 255, 0.3)",
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        label="7 Day Streak 🔥"
                        sx={{
                          background: "rgba(255, 215, 0, 0.2)",
                          color: "white",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(255, 215, 0, 0.3)",
                          fontWeight: 600,
                        }}
                      />
                    </Stack>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Stack
                    spacing={2}
                    alignItems={{ xs: "flex-start", md: "flex-end" }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<ArrowRight />}
                      onClick={onCreateQuiz}
                      sx={{
                        background: "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        color: "white",
                        fontWeight: 600,
                        "&:hover": {
                          background: "rgba(255, 255, 255, 0.3)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      Create New Quiz
                    </Button>

                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.8, textAlign: { xs: "left", md: "right" } }}
                    >
                      Last quiz: 2 days ago
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </WelcomeCard>

          {/* Quick Actions */}
          <QuickActions quickActions={quickActions} />

          {/* Recent Quizzes */}
          <RecentQuizzes
            recentQuizzes={recentQuizzes}
            onViewResults={onViewResults}
          />
        </Stack>
      </Container>
    </Box>
  );
};

export default Dashboard;
