// src/components/LandingPage/styles.js
import { styled, keyframes } from '@mui/material/styles';
import { Box, Card, Paper } from '@mui/material';

export const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

export const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

export const slideInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const HeroSectionWrapper = styled(Box)(({ theme }) => ({
	minHeight: '100vh',
	background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
	position: 'relative',
	display: 'flex',
	alignItems: 'center',
	overflow: 'hidden',
	'&::before': {
		content: '""',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		background:
			'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
		pointerEvents: 'none',
	},
}));

export const FloatingElement = styled(Box)(({ delay = 0 }) => ({
	position: 'absolute',
	animation: `${float} 6s ease-in-out infinite`,
	animationDelay: `${delay}s`,
	opacity: 0.1,
	pointerEvents: 'none',
}));

export const GlassCard = styled(Card)(({ theme }) => ({
	background: 'rgba(255, 255, 255, 0.1)',
	backdropFilter: 'blur(20px)',
	border: '1px solid rgba(255, 255, 255, 0.2)',
	borderRadius: theme.shape.borderRadius * 2,
	transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
	'&:hover': {
		transform: 'translateY(-8px)',
		background: 'rgba(255, 255, 255, 0.15)',
		boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
	},
}));

export const FeatureCard = styled(Card)(({ theme }) => ({
	height: '100%',
	borderRadius: theme.shape.borderRadius * 2,
	transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
	border: '1px solid',
	borderColor: theme.palette.grey[200],
	'&:hover': {
		transform: 'translateY(-4px)',
		boxShadow: theme.shadows[8],
		borderColor: theme.palette.primary.main,
	},
}));

export const StatsCard = styled(Paper)(({ theme }) => ({
	padding: theme.spacing(3),
	textAlign: 'center',
	borderRadius: theme.shape.borderRadius * 2,
	background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
	border: '1px solid',
	borderColor: theme.palette.primary.light + '30',
	transition: 'all 0.3s ease',
	'&:hover': {
		transform: 'scale(1.05)',
		boxShadow: theme.shadows[4],
	},
}));

export const AnimatedSection = styled(Box)({
	animation: `${slideInUp} 0.8s ease-out`,
});
