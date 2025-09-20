import React from 'react';
import {
	Box,
	Container,
	Grid,
	Card,
	CardContent,
	Typography,
	Chip,
	useTheme,
	alpha,
	useMediaQuery,
} from '@mui/material';
import {
	Bolt,
	Shield,
	BarChart3,
	Globe,
	Smartphone,
	Award,
} from 'lucide-react';

const features = [
	{
		icon: <Bolt size={28} />,
		title: 'Lightning Fast',
		description: 'Generate quizzes in seconds with our optimized AI engine',
	},
	{
		icon: <Shield size={28} />,
		title: 'Secure & Private',
		description:
			'Your documents are processed securely with end-to-end encryption',
	},
	{
		icon: <BarChart3 size={28} />,
		title: 'Advanced Analytics',
		description:
			'Track performance and identify knowledge gaps with detailed insights',
	},
	{
		icon: <Globe size={28} />,
		title: 'Multi-language Support',
		description:
			'Generate quizzes in multiple languages with accurate translations',
	},
	{
		icon: <Smartphone size={28} />,
		title: 'Mobile Optimized',
		description: 'Perfect experience on any device, anywhere you go at any time',
	},
	{
		icon: <Award size={28} />,
		title: 'Premium Content',
		description:
			'Access high-quality question templates and learning materials',
	},
];

const FeaturesSection = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

	return (
		<Box sx={{ py: { xs: 6, sm: 8, md: 12 } }}>
			<Container maxWidth='lg'>
				{/* Section Header - Mobile optimized */}
				<Box
					sx={{
						textAlign: 'center',
						maxWidth: { xs: '100%', md: 600 },
						mx: 'auto',
						mb: { xs: 5, sm: 6, md: 8 },
						px: { xs: 2, sm: 0 },
					}}
				>
					<Chip
						label='Powerful Features'
						color='primary'
						sx={{
							mb: { xs: 1.5, md: 2 },
							fontWeight: 600,
							fontSize: { xs: '0.8rem', md: '0.875rem' },
						}}
					/>
					<Typography
						variant={isSmallMobile ? 'h4' : isMobile ? 'h3' : 'h2'}
						sx={{
							mb: { xs: 2, md: 3 },
							fontWeight: { xs: 600, md: 700 },
							fontSize: {
								xs: '1.75rem',
								sm: '2.1rem',
								md: '2.5rem',
							},
							lineHeight: { xs: 1.3, md: 1.2 },
						}}
					>
						Why Educators Love QuizAI
					</Typography>
					<Typography
						variant={isMobile ? 'body1' : 'h6'}
						sx={{
							color: 'text.secondary',
							fontWeight: 400,
							fontSize: {
								xs: '1rem',
								sm: '1.1rem',
								md: '1.25rem',
							},
							lineHeight: { xs: 1.5, md: 1.4 },
						}}
					>
						Our advanced AI technology makes quiz creation effortless and
						effective for educators, trainers, and students alike.
					</Typography>
				</Box>

				{/* Features Grid - Better mobile layout */}
				<Grid container spacing={{ xs: 3, sm: 3, md: 4 }}>
					{features.map((feature, index) => (
						<Grid
							item
							xs={12}
							sm={6}
							md={4}
							key={index}
							sx={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'stretch',
								width: { xs: '100%', md: 'auto' }, // 100% on xs, auto from md (>=960px) onwards
							}}
						>
							<Card
								sx={{
									height: '100%',
									border: '1px solid',
									borderColor: alpha(theme.palette.divider, 0.5),
									boxShadow: 'none',
									borderRadius: { xs: 2, md: 2.5 },
									transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
									'&:hover': {
										transform: 'translateY(-3px)',
										boxShadow: theme.shadows[6],
										borderColor: alpha(theme.palette.primary.main, 0.3),
										'& .feature-icon': {
											transform: 'scale(1.05)',
										},
									},
								}}
							>
								<CardContent
									sx={{
										p: { xs: 2.5, sm: 3, md: 3.5 },
										textAlign: 'center',
										height: '100%',
										display: 'flex',
										flexDirection: 'column',
									}}
								>
									{/* Icon with better mobile sizing */}
									<Box
										className='feature-icon'
										sx={{
											display: 'inline-flex',
											p: { xs: 1.5, md: 2 },
											borderRadius: { xs: 2, md: 2.5 },
											background: alpha(theme.palette.primary.main, 0.08),
											color: theme.palette.primary.main,
											mb: { xs: 2, md: 2.5 },
											transition: 'transform 0.2s ease',
											alignSelf: 'center',
										}}
									>
										{React.cloneElement(feature.icon, {
											size: isMobile ? 24 : 28,
										})}
									</Box>

									{/* Title with responsive sizing */}
									<Typography
										variant={isMobile ? 'h6' : 'h6'}
										gutterBottom
										sx={{
											fontWeight: { xs: 600, md: 600 },
											mb: { xs: 1, md: 1.5 },
											fontSize: {
												xs: '1.1rem',
												sm: '1.15rem',
												md: '1.25rem',
											},
										}}
									>
										{feature.title}
									</Typography>

									{/* Description with better mobile readability */}
									<Typography
										variant='body2'
										sx={{
											color: 'text.secondary',
											fontSize: {
												xs: '0.9rem',
												md: '0.95rem',
											},
											lineHeight: { xs: 1.5, md: 1.6 },
											flex: 1,
										}}
									>
										{feature.description}
									</Typography>
								</CardContent>
							</Card>
						</Grid>
					))}
				</Grid>
			</Container>
		</Box>
	);
};

export default FeaturesSection;
