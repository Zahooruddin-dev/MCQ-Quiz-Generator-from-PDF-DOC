import React from "react";
import {
  Grid,
  CardContent,
  Typography,
  Stack,
  Box,
  Button,
  Chip,
  LinearProgress,
  IconButton,
} from "@mui/material";
import { History, ArrowRight } from "lucide-react";
import { RecentActivityCard } from "./StyledCards";

const RecentQuizzes = ({ recentQuizzes, onViewResults }) => {
  const getScoreColor = (score) => {
    if (score >= 90) return "success";
    if (score >= 70) return "warning";
    return "error";
  };

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Recent Quizzes
        </Typography>
        <Button endIcon={<History size={16} />} sx={{ color: "text.secondary" }}>
          View All
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {recentQuizzes.map((quiz) => (
          <Grid item xs={12} md={4} key={quiz.id}>
            <RecentActivityCard>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        {quiz.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        {new Date(quiz.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Typography>
                    </Box>

                    <Chip
                      label={`${quiz.score}%`}
                      size="small"
                      color={getScoreColor(quiz.score)}
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>

                  <Box>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{ mb: 1 }}
                    >
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Progress
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {quiz.questions} questions
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={quiz.score}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: "grey.200",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 3,
                          background:
                            quiz.score >= 90
                              ? "linear-gradient(90deg, #10B981 0%, #059669 100%)"
                              : quiz.score >= 70
                              ? "linear-gradient(90deg, #F59E0B 0%, #D97706 100%)"
                              : "linear-gradient(90deg, #EF4444 0%, #DC2626 100%)",
                        },
                      }}
                    />
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ flex: 1 }}
                      onClick={() => onViewResults(quiz)}
                    >
                      View Results
                    </Button>
                    <IconButton size="small" color="primary">
                      <ArrowRight size={16} />
                    </IconButton>
                  </Stack>
                </Stack>
              </CardContent>
            </RecentActivityCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RecentQuizzes;
