import React, { memo, forwardRef } from "react";
import { Chip, useTheme, useMediaQuery, alpha } from "@mui/material";

const FeatureChip = memo(forwardRef(({ 
  icon, 
  label, 
  onClick,
  disabled = false,
  variant = "outlined",
  color = "default",
  size,
  sx = {},
  ...props 
}, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Determine size based on screen size if not explicitly provided
  const effectiveSize = size || (isMobile ? "medium" : "small");

  // Enhanced styling with better mobile support
  const chipSx = {
    // Base styles
    fontWeight: 500,
    letterSpacing: '0.01em',
    borderRadius: { xs: 2, sm: 1.5 },
    
    // Responsive sizing
    ...(effectiveSize === "medium" && {
      height: { xs: 40, sm: 36 },
      fontSize: { xs: '0.875rem', sm: '0.8125rem' },
      '& .MuiChip-icon': {
        width: { xs: 18, sm: 16 },
        height: { xs: 18, sm: 16 },
        marginLeft: { xs: 1, sm: 0.75 }
      },
      '& .MuiChip-label': {
        px: { xs: 1.5, sm: 1.25 },
        py: { xs: 1, sm: 0.75 }
      }
    }),

    // Color and theme variants
    ...(variant === "outlined" && {
      borderColor: alpha(theme.palette.primary.main, 0.3),
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
      color: theme.palette.primary.main,
      
      '&:hover': {
        borderColor: alpha(theme.palette.primary.main, 0.5),
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
        transform: 'translateY(-1px)',
        boxShadow: theme.shadows[2]
      },
      
      '&:active': {
        transform: 'translateY(0px)',
        boxShadow: theme.shadows[1]
      }
    }),

    ...(variant === "filled" && {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
        transform: 'translateY(-1px)',
        boxShadow: theme.shadows[3]
      }
    }),

    // Enhanced interaction states
    cursor: onClick ? 'pointer' : 'default',
    transition: theme.transitions.create([
      'background-color',
      'border-color', 
      'transform',
      'box-shadow',
      'color'
    ], {
      duration: theme.transitions.duration.short,
      easing: theme.transitions.easing.easeInOut
    }),

    // Accessibility improvements
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2,
      backgroundColor: alpha(theme.palette.primary.main, 0.12)
    },

    // Disabled state
    ...(disabled && {
      opacity: 0.6,
      cursor: 'not-allowed',
      '&:hover': {
        transform: 'none',
        boxShadow: 'none'
      }
    }),

    // Mobile-specific optimizations
    ...(isMobile && {
      minWidth: 120,
      justifyContent: 'center',
      
      // Better touch target
      minHeight: 44,
      
      // Improved typography for mobile
      '& .MuiChip-label': {
        fontSize: '0.875rem',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }),

    // High contrast mode support
    '@media (prefers-contrast: high)': {
      borderWidth: 2,
      fontWeight: 600
    },

    // Reduced motion support
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
      '&:hover': {
        transform: 'none'
      }
    },

    // Dark mode adaptations
    ...(theme.palette.mode === 'dark' && {
      borderColor: alpha(theme.palette.primary.light, 0.4),
      backgroundColor: alpha(theme.palette.primary.light, 0.08),
      color: theme.palette.primary.light,
      
      '&:hover': {
        borderColor: alpha(theme.palette.primary.light, 0.6),
        backgroundColor: alpha(theme.palette.primary.light, 0.12)
      }
    }),

    // Merge custom styles
    ...sx
  };

  return (
    <Chip
      ref={ref}
      icon={icon}
      label={label}
      variant={variant}
      color={color}
      size={effectiveSize}
      onClick={onClick}
      disabled={disabled}
      sx={chipSx}
      // Enhanced accessibility
      role={onClick ? "button" : "img"}
      tabIndex={onClick && !disabled ? 0 : -1}
      // Keyboard navigation support
      onKeyDown={onClick ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick(event);
        }
      } : undefined}
      {...props}
    />
  );
}));

// Add display name for better debugging
FeatureChip.displayName = 'FeatureChip';

export default FeatureChip;