import { Box, Card, Container } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// Enhanced animations with better performance and smoother motion
export const pulse = keyframes`
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
  }
  50% { 
    transform: scale(1.02);
    box-shadow: 0 12px 40px rgba(59, 130, 246, 0.22);
  }
`;

export const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

export const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const slideInFromLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const gentleBounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-4px);
  }
  60% {
    transform: translateY(-2px);
  }
`;

export const floatingAnimation = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
`;

// Enhanced container with modern gradients and better mobile optimization
// Upload Container with clean light background
export const UploadContainer = styled(Container)(({ theme }) => ({
	paddingTop: theme.spacing(4),
	paddingBottom: theme.spacing(6),
	minHeight: '100vh',
	background: theme.palette.grey[50], // light grey-white background
	position: 'relative',

	// Optional: subtle texture overlay for depth
	'&::before': {
		content: '""',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		background: `
      radial-gradient(circle at 25% 25%, rgba(0,0,0,0.015) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(0,0,0,0.01) 0%, transparent 50%)
    `,
		pointerEvents: 'none',
	},

	[theme.breakpoints.down('md')]: {
		paddingTop: theme.spacing(3),
		paddingBottom: theme.spacing(4),
	},

	[theme.breakpoints.down('sm')]: {
		paddingTop: theme.spacing(2),
		paddingBottom: theme.spacing(3),
		paddingLeft: theme.spacing(1),
		paddingRight: theme.spacing(1),
	},
}));

// Enhanced main card with glassmorphism and better shadows
export const MainCard = styled(Card)(({ theme }) => ({
	borderRadius: theme.spacing(4),
	background: 'rgba(255, 255, 255, 0.95)',
	backdropFilter: 'blur(20px)',
	border: '1px solid rgba(255, 255, 255, 0.2)',
	boxShadow: `
    0 32px 64px rgba(0, 0, 0, 0.12),
    0 16px 32px rgba(0, 0, 0, 0.08),
    0 8px 16px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6)
  `,
	overflow: 'visible',
	position: 'relative',
	animation: `${fadeInUp} 0.6s cubic-bezier(0.4, 0, 0.2, 1)`,
	transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',

	// Enhanced gradient border
	'&::before': {
		content: '""',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: '5px',
		background: `
      linear-gradient(
        90deg, 
        #ff6b6b 0%, 
        #4ecdc4 25%, 
        #45b7d1 50%, 
        #96ceb4 75%, 
        #ffeaa7 100%
      )
    `,
		borderRadius: `${theme.spacing(4)} ${theme.spacing(4)} 0 0`,
		backgroundSize: '200% 100%',
		animation: 'borderAnimation 3s ease-in-out infinite',
	},

	'@keyframes borderAnimation': {
		'0%, 100%': {
			backgroundPosition: '0% 50%',
		},
		'50%': {
			backgroundPosition: '100% 50%',
		},
	},

	'&:hover': {
		transform: 'translateY(-2px)',
		boxShadow: `
      0 40px 80px rgba(0, 0, 0, 0.15),
      0 20px 40px rgba(0, 0, 0, 0.1),
      0 10px 20px rgba(0, 0, 0, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.8)
    `,
	},

	[theme.breakpoints.down('md')]: {
		borderRadius: theme.spacing(3),

		'&::before': {
			height: '4px',
			borderRadius: `${theme.spacing(3)} ${theme.spacing(3)} 0 0`,
		},

		'&:hover': {
			transform: 'translateY(-1px)',
		},
	},

	[theme.breakpoints.down('sm')]: {
		borderRadius: theme.spacing(2.5),
		margin: theme.spacing(0, 0.5),
		background: 'rgba(255, 255, 255, 0.98)',
		backdropFilter: 'blur(15px)',

		'&::before': {
			height: '3px',
			borderRadius: `${theme.spacing(2.5)} ${theme.spacing(2.5)} 0 0`,
		},

		'&:hover': {
			transform: 'none',
		},
	},
}));

// Completely redesigned drop zone with modern aesthetics
export const DropZone = styled(Box, {
	shouldForwardProp: (prop) =>
		prop !== 'isDragActive' && prop !== 'hasFile' && prop !== 'isLoading',
})(({ theme, isDragActive, hasFile, isLoading }) => ({
	border: '2px dashed',
	borderColor: isDragActive ? '#4facfe' : hasFile ? '#20bf6b' : '#ddd',
	borderRadius: theme.spacing(3),
	padding: theme.spacing(8),
	textAlign: 'center',
	cursor: isLoading ? 'not-allowed' : 'pointer',
	position: 'relative',
	overflow: 'hidden',
	minHeight: '280px',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',

	// Dynamic backgrounds with better visual hierarchy
	background: isDragActive
		? `
        radial-gradient(circle at 30% 30%, rgba(79, 172, 254, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 70% 70%, rgba(79, 172, 254, 0.05) 0%, transparent 50%),
        linear-gradient(135deg, rgba(79, 172, 254, 0.03) 0%, rgba(99, 102, 241, 0.03) 100%)
      `
		: hasFile
		? `
        radial-gradient(circle at 30% 30%, rgba(32, 191, 107, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 70% 70%, rgba(32, 191, 107, 0.05) 0%, transparent 50%),
        linear-gradient(135deg, rgba(32, 191, 107, 0.03) 0%, rgba(16, 185, 129, 0.03) 100%)
      `
		: `
        radial-gradient(circle at 25% 25%, rgba(100, 100, 100, 0.02) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(150, 150, 150, 0.01) 0%, transparent 50%)
      `,

	// Enhanced focus styles with better accessibility
	'&:focus-visible': {
		outline: '3px solid #4facfe',
		outlineOffset: '3px',
		borderColor: '#4facfe',
		background: `
      radial-gradient(circle at 50% 50%, rgba(79, 172, 254, 0.05) 0%, transparent 70%)
    `,
	},

	// Enhanced hover effects with modern micro-interactions
	'&:not([aria-disabled="true"]):hover': {
		borderColor: '#4facfe',
		transform: 'translateY(-4px) scale(1.01)',
		background: `
      radial-gradient(circle at 30% 30%, rgba(79, 172, 254, 0.06) 0%, transparent 60%),
      radial-gradient(circle at 70% 70%, rgba(79, 172, 254, 0.04) 0%, transparent 60%),
      linear-gradient(135deg, rgba(79, 172, 254, 0.02) 0%, rgba(99, 102, 241, 0.02) 100%)
    `,
		boxShadow: `
      0 12px 32px rgba(79, 172, 254, 0.15),
      0 6px 16px rgba(79, 172, 254, 0.1)
    `,

		// Hover animation for child elements
		'& .upload-icon': {
			animation: `${floatingAnimation} 2s ease-in-out infinite`,
		},

		'& .upload-text': {
			color: '#4facfe',
		},
	},

	// Enhanced mobile responsiveness with touch-optimized interactions
	[theme.breakpoints.down('md')]: {
		padding: theme.spacing(6),
		minHeight: '240px',
		borderRadius: theme.spacing(2.5),

		'&:hover': {
			transform: 'translateY(-2px) scale(1.005)',
		},
	},

	[theme.breakpoints.down('sm')]: {
		padding: theme.spacing(4),
		minHeight: '200px',
		borderRadius: theme.spacing(2),

		'&:hover': {
			transform: 'none',
			boxShadow: '0 6px 20px rgba(79, 172, 254, 0.1)',
		},

		// Touch device optimizations
		'@media (hover: none)': {
			'&:hover': {
				transform: 'none',
				boxShadow: 'none',
				background: 'transparent',
			},

			'&:active': {
				transform: 'scale(0.995)',
				borderColor: '#4facfe',
				background: 'rgba(79, 172, 254, 0.02)',
				transition: 'all 0.1s ease-out',
			},
		},
	},

	// Enhanced disabled state with better visual feedback
	'&[aria-disabled="true"]': {
		opacity: 0.5,
		cursor: 'not-allowed',
		background: `
      repeating-linear-gradient(
        45deg,
        rgba(200, 200, 200, 0.1),
        rgba(200, 200, 200, 0.1) 10px,
        transparent 10px,
        transparent 20px
      )
    `,

		'&:hover': {
			transform: 'none',
			borderColor: '#ddd',
			background: `
        repeating-linear-gradient(
          45deg,
          rgba(200, 200, 200, 0.1),
          rgba(200, 200, 200, 0.1) 10px,
          transparent 10px,
          transparent 20px
        )
      `,
			boxShadow: 'none',
		},
	},
}));

// Enhanced file icon with modern design and better animations
export const FileIcon = styled(Box)(({ theme }) => ({
	width: 88,
	height: 88,
	borderRadius: theme.spacing(2.5),
	background: `
    linear-gradient(135deg, #667eea 0%, #764ba2 100%),
    linear-gradient(135deg, #f093fb 0%, #f5576c 100%)
  `,
	backgroundBlendMode: 'soft-light, normal',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	color: 'white',
	margin: '0 auto',
	marginBottom: theme.spacing(3),
	position: 'relative',
	boxShadow: `
    0 16px 40px rgba(102, 126, 234, 0.25),
    0 8px 20px rgba(102, 126, 234, 0.15)
  `,
	animation: `${pulse} 3s ease-in-out infinite`,
	transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',

	// Enhanced glowing border effect
	'&::before': {
		content: '""',
		position: 'absolute',
		top: -2,
		left: -2,
		right: -2,
		bottom: -2,
		background: `
      linear-gradient(45deg, 
        #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #ff6b6b
      )
    `,
		borderRadius: theme.spacing(2.8),
		backgroundSize: '300% 300%',
		animation: 'borderGlow 4s linear infinite',
		zIndex: -1,
	},

	'&::after': {
		content: '""',
		position: 'absolute',
		top: '50%',
		left: '50%',
		width: '130%',
		height: '130%',
		border: '2px solid rgba(255, 255, 255, 0.2)',
		borderRadius: theme.spacing(3),
		transform: 'translate(-50%, -50%)',
		animation: `${pulse} 3s ease-in-out infinite`,
		animationDelay: '1s',
	},

	'@keyframes borderGlow': {
		'0%, 100%': {
			backgroundPosition: '0% 50%',
		},
		'50%': {
			backgroundPosition: '100% 50%',
		},
	},

	[theme.breakpoints.down('md')]: {
		width: 80,
		height: 80,
		marginBottom: theme.spacing(2.5),
		borderRadius: theme.spacing(2.2),

		'&::before': {
			borderRadius: theme.spacing(2.5),
		},

		'&::after': {
			borderRadius: theme.spacing(2.8),
		},
	},

	[theme.breakpoints.down('sm')]: {
		width: 72,
		height: 72,
		marginBottom: theme.spacing(2),
		borderRadius: theme.spacing(2),

		'&::before': {
			borderRadius: theme.spacing(2.3),
		},

		'&::after': {
			borderRadius: theme.spacing(2.5),
		},
	},
}));

// Enhanced config panel with modern glassmorphism
export const ConfigPanel = styled(Card)(({ theme }) => ({
	marginBottom: theme.spacing(3),
	borderRadius: theme.spacing(2.5),
	background: 'rgba(255, 255, 255, 0.9)',
	backdropFilter: 'blur(15px)',
	border: '1px solid rgba(255, 255, 255, 0.3)',
	boxShadow: `
    0 8px 32px rgba(0, 0, 0, 0.06),
    0 4px 16px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6)
  `,
	transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
	position: 'relative',
	overflow: 'hidden',

	'&::before': {
		content: '""',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: '2px',
		background:
			'linear-gradient(90deg, rgba(79, 172, 254, 0.6), rgba(99, 102, 241, 0.6))',
	},

	'&:hover': {
		transform: 'translateY(-2px)',
		boxShadow: `
      0 12px 40px rgba(0, 0, 0, 0.08),
      0 6px 20px rgba(0, 0, 0, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.8)
    `,
		background: 'rgba(255, 255, 255, 0.95)',
	},

	[theme.breakpoints.down('md')]: {
		borderRadius: theme.spacing(2),
		marginBottom: theme.spacing(2.5),

		'&:hover': {
			transform: 'translateY(-1px)',
		},
	},

	[theme.breakpoints.down('sm')]: {
		borderRadius: theme.spacing(1.8),
		marginBottom: theme.spacing(2),

		'&:hover': {
			transform: 'none',
		},
	},
}));

// Enhanced loading overlay with modern blur effects
export const LoadingOverlay = styled(Box)(({ theme }) => ({
	position: 'absolute',
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	background: 'rgba(255, 255, 255, 0.95)',
	backdropFilter: 'blur(20px)',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	borderRadius: theme.spacing(3),
	zIndex: 10,
	animation: `${fadeInUp} 0.3s cubic-bezier(0.4, 0, 0.2, 1)`,

	// Loading shimmer effect
	'&::before': {
		content: '""',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		background: `
      linear-gradient(
        45deg,
        transparent 30%,
        rgba(79, 172, 254, 0.03) 50%,
        transparent 70%
      )
    `,
		backgroundSize: '200% 200%',
		animation: 'loadingShimmer 2s ease-in-out infinite',
	},

	'@keyframes loadingShimmer': {
		'0%, 100%': {
			backgroundPosition: '-200% -200%',
		},
		'50%': {
			backgroundPosition: '200% 200%',
		},
	},

	[theme.breakpoints.down('md')]: {
		borderRadius: theme.spacing(2.5),
		backdropFilter: 'blur(15px)',
	},

	[theme.breakpoints.down('sm')]: {
		borderRadius: theme.spacing(2),
		backdropFilter: 'blur(12px)',
		background: 'rgba(255, 255, 255, 0.98)',
	},
}));

// Enhanced text mode card with modern styling
export const TextModeCard = styled(Card)(({ theme }) => ({
	marginTop: theme.spacing(3),
	borderRadius: theme.spacing(2.5),
	background: 'rgba(255, 255, 255, 0.95)',
	backdropFilter: 'blur(15px)',
	border: '1px solid rgba(255, 255, 255, 0.3)',
	boxShadow: `
    0 8px 32px rgba(0, 0, 0, 0.06),
    0 4px 16px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6)
  `,
	transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
	position: 'relative',
	overflow: 'hidden',

	'&::before': {
		content: '""',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: '2px',
		background:
			'linear-gradient(90deg, rgba(32, 191, 107, 0.6), rgba(16, 185, 129, 0.6))',
	},

	'&:hover': {
		transform: 'translateY(-2px)',
		boxShadow: `
      0 12px 40px rgba(0, 0, 0, 0.08),
      0 6px 20px rgba(0, 0, 0, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.8)
    `,
		background: 'rgba(255, 255, 255, 0.98)',
	},

	[theme.breakpoints.down('md')]: {
		marginTop: theme.spacing(2.5),
		borderRadius: theme.spacing(2),

		'&:hover': {
			transform: 'translateY(-1px)',
		},
	},

	[theme.breakpoints.down('sm')]: {
		marginTop: theme.spacing(2),
		borderRadius: theme.spacing(1.8),

		'&:hover': {
			transform: 'none',
		},
	},
}));

// Enhanced progress bar with modern gradient and animations
export const ProgressBar = styled(Box)(({ theme }) => ({
	width: '100%',
	height: '10px',
	backgroundColor: 'rgba(241, 245, 249, 0.8)',
	borderRadius: '8px',
	overflow: 'hidden',
	position: 'relative',
	boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',

	'& .progress-fill': {
		height: '100%',
		background: `
      linear-gradient(
        90deg, 
        #ff6b6b 0%, 
        #4ecdc4 25%, 
        #45b7d1 50%, 
        #96ceb4 75%, 
        #ffeaa7 100%
      )
    `,
		borderRadius: '8px',
		transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
		position: 'relative',
		backgroundSize: '200% 100%',
		animation: 'progressGradient 2s ease-in-out infinite',

		'&::before': {
			content: '""',
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			background: `
        linear-gradient(
          90deg,
          transparent 0%,
          rgba(255, 255, 255, 0.4) 50%,
          transparent 100%
        )
      `,
			backgroundSize: '50% 100%',
			animation: `${shimmer} 1.5s infinite`,
		},

		'&::after': {
			content: '""',
			position: 'absolute',
			top: 1,
			left: 1,
			right: 1,
			height: '2px',
			background: 'rgba(255, 255, 255, 0.6)',
			borderRadius: '6px',
		},
	},

	'@keyframes progressGradient': {
		'0%, 100%': {
			backgroundPosition: '0% 50%',
		},
		'50%': {
			backgroundPosition: '100% 50%',
		},
	},

	[theme.breakpoints.down('md')]: {
		height: '8px',
		borderRadius: '6px',

		'& .progress-fill': {
			borderRadius: '6px',

			'&::after': {
				borderRadius: '4px',
			},
		},
	},

	[theme.breakpoints.down('sm')]: {
		height: '7px',
		borderRadius: '5px',

		'& .progress-fill': {
			borderRadius: '5px',

			'&::after': {
				borderRadius: '3px',
			},
		},
	},
}));

// Enhanced error container with modern design and better accessibility
export const ErrorContainer = styled(Box)(({ theme }) => ({
	padding: theme.spacing(3),
	background: `
    linear-gradient(135deg, 
      rgba(254, 242, 242, 0.95) 0%, 
      rgba(252, 232, 232, 0.95) 100%
    )
  `,
	backdropFilter: 'blur(10px)',
	border: '1px solid rgba(248, 113, 113, 0.3)',
	borderRadius: theme.spacing(2),
	marginTop: theme.spacing(2),
	animation: `${slideInFromLeft} 0.3s cubic-bezier(0.4, 0, 0.2, 1)`,
	color: '#dc2626',
	position: 'relative',
	boxShadow: '0 4px 16px rgba(220, 38, 38, 0.1)',

	'&::before': {
		content: '""',
		position: 'absolute',
		top: 0,
		left: 0,
		bottom: 0,
		width: '4px',
		background: 'linear-gradient(180deg, #ef4444, #dc2626)',
		borderRadius: '2px 0 0 2px',
	},

	[theme.breakpoints.down('md')]: {
		padding: theme.spacing(2.5),
		borderRadius: theme.spacing(1.5),

		'&::before': {
			width: '3px',
		},
	},

	[theme.breakpoints.down('sm')]: {
		padding: theme.spacing(2),
		borderRadius: theme.spacing(1.2),
		fontSize: '0.875rem',

		'&::before': {
			width: '3px',
		},
	},
}));

// Enhanced success container with modern design and celebration effect
export const SuccessContainer = styled(Box)(({ theme }) => ({
	padding: theme.spacing(3),
	background: `
    linear-gradient(135deg, 
      rgba(240, 253, 244, 0.95) 0%, 
      rgba(220, 252, 231, 0.95) 100%
    )
  `,
	backdropFilter: 'blur(10px)',
	border: '1px solid rgba(34, 197, 94, 0.3)',
	borderRadius: theme.spacing(2),
	marginTop: theme.spacing(2),
	animation: `${slideInFromLeft} 0.3s cubic-bezier(0.4, 0, 0.2, 1)`,
	color: '#059669',
	position: 'relative',
	boxShadow: '0 4px 16px rgba(5, 150, 105, 0.1)',

	'&::before': {
		content: '""',
		position: 'absolute',
		top: 0,
		left: 0,
		bottom: 0,
		width: '4px',
		background: 'linear-gradient(180deg, #22c55e, #059669)',
		borderRadius: '2px 0 0 2px',
	},

	// Celebration particles effect
	'&::after': {
		content: '""',
		position: 'absolute',
		top: '50%',
		right: theme.spacing(2),
		width: '20px',
		height: '20px',
		background: `
      radial-gradient(circle, #22c55e 2px, transparent 2px),
      radial-gradient(circle, #059669 1px, transparent 1px)
    `,
		backgroundSize: '8px 8px, 4px 4px',
		backgroundPosition: '0 0, 4px 4px',
		opacity: 0.3,
		animation: 'celebrate 1.5s ease-in-out infinite',
		transform: 'translateY(-50%)',
	},

	'@keyframes celebrate': {
		'0%, 100%': {
			opacity: 0.3,
			transform: 'translateY(-50%) scale(1)',
		},
		'50%': {
			opacity: 0.6,
			transform: 'translateY(-50%) scale(1.2)',
		},
	},

	[theme.breakpoints.down('md')]: {
		padding: theme.spacing(2.5),
		borderRadius: theme.spacing(1.5),

		'&::before': {
			width: '3px',
		},
	},

	[theme.breakpoints.down('sm')]: {
		padding: theme.spacing(2),
		borderRadius: theme.spacing(1.2),
		fontSize: '0.875rem',

		'&::before': {
			width: '3px',
		},

		'&::after': {
			width: '16px',
			height: '16px',
			backgroundSize: '6px 6px, 3px 3px',
			backgroundPosition: '0 0, 3px 3px',
		},
	},
}));

// Enhanced mobile optimization component
export const MobileOptimized = styled(Box)(({ theme }) => ({
	[theme.breakpoints.down('sm')]: {
		'& .MuiButton-root': {
			minHeight: '48px', // Better touch targets
			fontSize: '0.9rem',
			borderRadius: theme.spacing(1.5),
			fontWeight: 600,
			boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
			transition: 'all 0.15s ease-out',

			'&:active': {
				transform: 'scale(0.98)',
			},
		},

		'& .MuiTextField-root': {
			'& .MuiInputBase-input': {
				fontSize: '16px', // Prevent zoom on iOS
				padding: theme.spacing(1.5),
			},

			'& .MuiOutlinedInput-root': {
				borderRadius: theme.spacing(1.5),
			},
		},

		'& .MuiIconButton-root': {
			minWidth: '48px',
			minHeight: '48px',
			borderRadius: theme.spacing(1.5),
		},

		'& .MuiCard-root': {
			borderRadius: theme.spacing(2),
		},

		'& .MuiCardContent-root': {
			padding: theme.spacing(2),

			'&:last-child': {
				paddingBottom: theme.spacing(2),
			},
		},
	},
}));

// Enhanced responsive typography helper
export const ResponsiveText = styled(Box)(({ theme }) => ({
	fontSize: '1rem',
	lineHeight: 1.6,
	color: '#374151',
	fontWeight: 400,

	[theme.breakpoints.down('md')]: {
		fontSize: '0.95rem',
		lineHeight: 1.55,
	},

	[theme.breakpoints.down('sm')]: {
		fontSize: '0.875rem',
		lineHeight: 1.5,
	},
}));

// New: Enhanced button component with modern styling
export const ModernButton = styled(Box)(({ theme }) => ({
	'& .MuiButton-root': {
		borderRadius: theme.spacing(1.5),
		fontWeight: 600,
		textTransform: 'none',
		boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
		transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
		position: 'relative',
		overflow: 'hidden',

		'&::before': {
			content: '""',
			position: 'absolute',
			top: 0,
			left: '-100%',
			width: '100%',
			height: '100%',
			background:
				'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
			transition: 'left 0.4s ease',
		},

		'&:hover': {
			transform: 'translateY(-2px)',
			boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',

			'&::before': {
				left: '100%',
			},
		},

		'&:active': {
			transform: 'translateY(-1px)',
		},

		[theme.breakpoints.down('sm')]: {
			'&:hover': {
				transform: 'none',
			},

			'&:active': {
				transform: 'scale(0.98)',
			},
		},
	},
}));

// New: Glass card component for future use
export const GlassCard = styled(Card)(({ theme }) => ({
	background: 'rgba(255, 255, 255, 0.1)',
	backdropFilter: 'blur(20px)',
	border: '1px solid rgba(255, 255, 255, 0.2)',
	borderRadius: theme.spacing(2.5),
	boxShadow: `
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.5)
  `,
	transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',

	'&:hover': {
		background: 'rgba(255, 255, 255, 0.15)',
		transform: 'translateY(-2px)',
		boxShadow: `
      0 12px 40px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.6)
    `,
	},

	[theme.breakpoints.down('sm')]: {
		borderRadius: theme.spacing(2),

		'&:hover': {
			transform: 'none',
		},
	},
}));