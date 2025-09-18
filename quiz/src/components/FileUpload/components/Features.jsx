import React, { memo, useMemo } from "react";
import { Stack, Box, useTheme, useMediaQuery } from "@mui/material";
import { Brain, Zap, FileText } from "lucide-react";
import FeatureChip from "./FeatureChip";

const Features = memo(() => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Memoized feature data to prevent re-creation on each render
  const featuresData = useMemo(() => [
    {
      id: 'ai-powered',
      icon: <Brain size={isMobile ? 14 : 16} />,
      label: "AI-Powered Generation",
      description: "Advanced AI generates relevant questions"
    },
    {
      id: 'fast-efficient', 
      icon: <Zap size={isMobile ? 14 : 16} />,
      label: "Fast & Efficient",
      description: "Quick processing and instant results"
    },
    {
      id: 'multiple-formats',
      icon: <FileText size={isMobile ? 14 : 16} />,
      label: "Multiple Formats", 
      description: "Supports various document types"
    }
  ], [isMobile]);

  // Responsive configuration
  const config = useMemo(() => ({
    mobile: {
      direction: 'column',
      spacing: 1.5,
      alignItems: 'center',
      maxWidth: '100%',
      px: 2
    },
    tablet: {
      direction: 'row',
      spacing: 2,
      alignItems: 'center', 
      maxWidth: 600,
      px: 3,
      flexWrap: 'wrap'
    },
    desktop: {
      direction: 'row',
      spacing: 2.5,
      alignItems: 'center',
      maxWidth: 700,
      px: 0,
      flexWrap: 'nowrap'
    }
  }), []);

  const currentConfig = isMobile ? config.mobile : isTablet ? config.tablet : config.desktop;

  return (
    <Box
      component="section"
      role="region"
      aria-label="Key features"
      sx={{
        width: '100%',
        maxWidth: currentConfig.maxWidth,
        mx: 'auto',
        px: currentConfig.px,
        // Prevent horizontal overflow
        overflow: 'hidden'
      }}
    >
      <Stack
        direction={currentConfig.direction}
        spacing={currentConfig.spacing}
        alignItems={currentConfig.alignItems}
        justifyContent="center"
        flexWrap={currentConfig.flexWrap}
        useFlexGap
        sx={{
          width: '100%',
          // Improved mobile layout
          ...(isMobile && {
            '& > *': {
              width: '100%',
              maxWidth: 280
            }
          }),
          // Tablet optimizations
          ...(isTablet && !isMobile && {
            '& > *': {
              flex: '1 1 auto',
              minWidth: 0, // Prevent flex item overflow
              maxWidth: { xs: '100%', sm: 200 }
            }
          }),
          // Desktop optimizations
          ...(!isTablet && {
            '& > *': {
              flex: '0 1 auto'
            }
          })
        }}
      >
        {featuresData.map((feature) => (
          <FeatureChip
            key={feature.id}
            icon={feature.icon}
            label={feature.label}
            // Pass additional props for better accessibility
            aria-label={feature.description}
            title={feature.description}
            // Performance optimization: prevent unnecessary re-renders
            sx={{
              // Ensure consistent sizing across devices
              minHeight: { xs: 40, sm: 36 },
              // Better touch targets on mobile
              ...(isMobile && {
                py: 1.5,
                px: 2,
                fontSize: '0.875rem'
              }),
              // Improved hover states
              transition: theme.transitions.create([
                'background-color',
                'transform',
                'box-shadow'
              ], {
                duration: theme.transitions.duration.short
              }),
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4]
              },
              // Focus states for accessibility
              '&:focus-visible': {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: 2
              }
            }}
          />
        ))}
      </Stack>

   
    </Box>
  );
});

// Add display name for better debugging
Features.displayName = 'Features';

export default Features;