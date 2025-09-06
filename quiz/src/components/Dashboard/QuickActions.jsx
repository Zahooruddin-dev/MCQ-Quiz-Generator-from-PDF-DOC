import React from "react";
import { Grid, CardContent, Typography, Stack, Box } from "@mui/material";
import { ActionCard } from "./StyledCards";

const QuickActions = ({ quickActions }) => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <ActionCard onClick={action.action}>
              <CardContent sx={{ p: 3, textAlign: "center" }}>
                <Stack spacing={2} alignItems="center">
                  <Box
                    className="action-icon"
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      background: `${action.color === "primary"
                        ? "#6366F1"
                        : action.color === "secondary"
                        ? "#8B5CF6"
                        : action.color === "success"
                        ? "#10B981"
                        : action.color === "warning"
                        ? "#F59E0B"
                        : "#3B82F6"}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color:
                        action.color === "primary"
                          ? "#6366F1"
                          : action.color === "secondary"
                          ? "#8B5CF6"
                          : action.color === "success"
                          ? "#10B981"
                          : action.color === "warning"
                          ? "#F59E0B"
                          : "#3B82F6",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {action.icon}
                  </Box>

                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {action.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", lineHeight: 1.4 }}
                    >
                      {action.description}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </ActionCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default QuickActions;
