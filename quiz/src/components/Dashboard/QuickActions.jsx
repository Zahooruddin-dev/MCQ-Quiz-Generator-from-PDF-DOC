import React from "react";
import { Grid, CardContent, Typography, Stack, Box } from "@mui/material";
import { ActionCard } from "./StyledCards";

const getActionColor = (color) => {
  switch (color) {
    case "primary":
      return {
        main: "#3b82f6",
        light: "#dbeafe",
        dark: "#1e40af",
        contrast: "#ffffff"
      };
    case "secondary":
      return {
        main: "#8b5cf6",
        light: "#e9d5ff",
        dark: "#5b21b6",
        contrast: "#ffffff"
      };
    case "success":
      return {
        main: "#10b981",
        light: "#d1fae5",
        dark: "#047857",
        contrast: "#ffffff"
      };
    case "warning":
      return {
        main: "#f59e0b",
        light: "#fef3c7",
        dark: "#d97706",
        contrast: "#111827"
      };
    case "info":
      return {
        main: "#0ea5e9",
        light: "#e0f2fe",
        dark: "#0369a1",
        contrast: "#ffffff"
      };
    default:
      return {
        main: "#6b7280",
        light: "#f3f4f6",
        dark: "#374151",
        contrast: "#ffffff"
      };
  }
};

const QuickActions = ({ quickActions }) => {
  return (
    <Box>
      <Typography 
        variant="h4" 
        component="h2"
        sx={{ 
          mb: { xs: 3, sm: 4 }, 
          fontWeight: 700,
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
          color: '#111827',
          letterSpacing: '-0.025em',
        }}
      >
        Quick Actions
      </Typography>
      
      <Grid container spacing={{ xs: 2, sm: 3, md: 3 }}>
        {quickActions.map((action, index) => {
          const colors = getActionColor(action.color);
          
          return (
            <Grid item xs={12} sm={6} lg={4} key={index}>
              <ActionCard 
                onClick={action.action}
                sx={{
                  height: '100%',
                  minHeight: { xs: '140px', sm: '160px' },
                }}
              >
                <CardContent 
                  sx={{ 
                    p: { xs: 2.5, sm: 3 },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Stack spacing={{ xs: 2, sm: 2.5 }} alignItems="flex-start">
                    <Box
                      className="action-icon"
                      sx={{
                        width: { xs: 56, sm: 64 },
                        height: { xs: 56, sm: 64 },
                        borderRadius: 3,
                        background: colors.light,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: colors.main,
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow: `0 4px 12px ${colors.main}15`,
                        '&:hover': {
                          background: colors.main,
                          color: colors.contrast,
                          transform: 'scale(1.05)',
                          boxShadow: `0 8px 24px ${colors.main}25`,
                        }
                      }}
                    >
                      {action.icon}
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="h6" 
                        component="h3"
                        sx={{ 
                          fontWeight: 700, 
                          mb: 0.5,
                          fontSize: { xs: '1rem', sm: '1.125rem' },
                          lineHeight: 1.3,
                          color: '#111827',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {action.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ 
                          color: '#6b7280', 
                          lineHeight: 1.5,
                          fontSize: { xs: '0.875rem', sm: '0.9rem' },
                          fontWeight: 400,
                        }}
                      >
                        {action.description}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </ActionCard>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default QuickActions;