import React, { memo, useCallback } from "react";
import { Box, Typography, Button, useTheme, useMediaQuery } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useNavigate } from "react-router-dom";

const Header = memo(() => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Memoized navigation handler for better performance
  const handleBackClick = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  // Responsive configuration
  const config = {
    mobile: {
      titleVariant: "h4",
      titleSize: "1.5rem",
      subtitleSize: "0.875rem",
      spacing: 1,
      iconSize: "small",
      buttonPadding: { x: 0.5, y: 0.5 }
    },
    tablet: {
      titleVariant: "h3", 
      titleSize: "1.875rem",
      subtitleSize: "1rem",
      spacing: 1.5,
      iconSize: "small",
      buttonPadding: { x: 1, y: 0.75 }
    },
    desktop: {
      titleVariant: "h3",
      titleSize: "2.25rem", 
      subtitleSize: "1.125rem",
      spacing: 2,
      iconSize: "medium",
      buttonPadding: { x: 1.5, y: 1 }
    }
  };

  const currentConfig = isMobile ? config.mobile : isTablet ? config.tablet : config.desktop;

  return (
    <Box
      component="header"
      role="banner"
      sx={{
        width: '100%',
        maxWidth: '100%',
        // Prevent horizontal overflow
        overflow: 'hidden'
      }}
    >
      {/* Navigation Bar with improved touch targets */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: { xs: 48, sm: 56 }, // Larger touch targets on mobile
          mb: currentConfig.spacing,
          // Ensure proper spacing and prevent overlap
          px: { xs: 1, sm: 2 }
        }}
      >
        <Button
          onClick={handleBackClick}
          variant="text"
          size={isMobile ? "medium" : "small"}
          startIcon={
            <ArrowBackIosNewIcon 
              fontSize={currentConfig.iconSize}
              sx={{
                // Ensure icon is properly sized
                width: { xs: 18, sm: 20 },
                height: { xs: 18, sm: 20 }
              }}
            />
          }
          sx={{
            position: "absolute",
            left: { xs: 0, sm: 0 },
            top: '50%',
            transform: 'translateY(-50%)',
            color: "text.secondary",
            px: currentConfig.buttonPadding.x,
            py: currentConfig.buttonPadding.y,
            minWidth: { xs: 44, sm: "auto" }, // WCAG compliant touch target
            minHeight: { xs: 44, sm: 36 },
            borderRadius: { xs: 2, sm: 1.5 },
            textTransform: "none",
            fontSize: { xs: '0.875rem', sm: '0.875rem' },
            fontWeight: 500,
            // Improved hover/focus states
            '& .MuiButton-startIcon': { 
              mr: { xs: 0, sm: 0.5 },
              ml: { xs: 0, sm: -0.25 }
            },
            '&:hover': { 
              backgroundColor: "action.hover",
              transform: 'translateY(-50%) scale(1.02)'
            },
            '&:focus-visible': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: 2,
              backgroundColor: "action.hover"
            },
            // Smooth transitions
            transition: theme.transitions.create([
              'background-color',
              'transform',
              'box-shadow'
            ], {
              duration: theme.transitions.duration.short
            })
          }}
          // Accessibility improvements
          aria-label="Go back to dashboard"
          tabIndex={0}
        >
          {/* Text only shows on larger screens */}
          <Box 
            component="span" 
            sx={{ 
              display: { xs: "none", sm: "inline" },
              whiteSpace: 'nowrap'
            }}
          >
            Back to Dashboard
          </Box>
        </Button>
      </Box>

      {/* Title Section with better typography scaling */}
      <Box 
        sx={{ 
          textAlign: "center",
          px: { xs: 2, sm: 3, md: 4 }, // Responsive horizontal padding
          // Prevent text from touching edges
          maxWidth: '100%'
        }}
      >
        <Typography
          variant={currentConfig.titleVariant}
          component="h1" // Proper semantic heading
          sx={{
            mb: { xs: 0.75, sm: 1, md: 1.5 },
            fontWeight: { xs: 600, sm: 700 },
            fontSize: currentConfig.titleSize,
            lineHeight: { xs: 1.3, sm: 1.25, md: 1.2 },
            color: 'text.primary',
            // Better text rendering
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            // Prevent text overflow
            wordBreak: 'break-word',
            hyphens: 'auto',
            // Responsive letter spacing
            letterSpacing: { xs: '-0.01em', sm: '-0.02em' }
          }}
        >
          Upload Your Content
        </Typography>
        
        <Typography
          variant="subtitle1"
          component="p" // Proper semantic element
          sx={{
            color: "text.secondary",
            fontWeight: { xs: 400, sm: 400 },
            fontSize: currentConfig.subtitleSize,
            lineHeight: { xs: 1.4, sm: 1.5 },
            maxWidth: { xs: '100%', sm: 560, md: 640 },
            mx: "auto",
            // Better text rendering and readability
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            // Prevent orphaned words on mobile
            wordBreak: 'break-word',
            hyphens: 'auto',
            // Responsive padding for better mobile readability
            px: { xs: 1, sm: 0 }
          }}
        >
          Upload documents or paste text to generate AI-powered quiz questions instantly
        </Typography>
      </Box>
    </Box>
  );
});

// Add display name for better debugging
Header.displayName = 'Header';

export default Header;