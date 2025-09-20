import React from 'react';
import {
	Box,
	Container,
	Grid,
	Card,
	Typography,
	Chip,
	useTheme,
	useMediaQuery,
	alpha,
} from '@mui/material';

const testimonials = [
	{
		name: 'Sarah Johnson',
		role: 'High School Teacher',
		content:
			'QuizAI has transformed how I create assessments. It saves me hours each week and my students love the engaging format.',
		avatar: 'SJ',
	},
	{
		name: 'Michael Chen',
		role: 'Corporate Trainer',
		content:
			"The accuracy of content extraction from our training materials is impressive. It understands context better than any tool we've tried.",
		avatar: 'MC',
	},
	{
		name: 'Emma Rodriguez',
		role: 'University Professor',
		content:
			'The multi-language support is exceptional. I can now create quizzes in Spanish and English for my diverse student body with ease.',
		avatar: 'ER',
	},
];

const Testimonials = () => {
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
						label='Testimonials'
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
						Trusted by Educators Worldwide
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
						Join thousands of educators who are transforming their teaching with
						QuizAI.
					</Typography>
				</Box>

				{/* Testimonials Grid - Better mobile spacing */}
				<Grid container spacing={{ xs: 3, sm: 3, md: 4 }}>
					{testimonials.map((testimonial, index) => (
						<Grid item xs={12} sm={6} md={4} key={index}>
							<Card
								sx={{
									height: '100%',
									background: alpha(theme.palette.grey[50], 0.8),
									border: '1px solid',
									borderColor: alpha(theme.palette.divider, 0.5),
									boxShadow: 'none',
									p: { xs: 2.5, sm: 3, md: 3.5 },
									borderRadius: { xs: 2, md: 2.5 },
									transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
									'&:hover': {
										transform: 'translateY(-3px)',
										boxShadow: theme.shadows[8],
										borderColor: alpha(theme.palette.primary.main, 0.3),
										'& .testimonial-avatar': {
											transform: 'scale(1.05)',
										},
									},
								}}
							>
								{/* User info with improved mobile layout */}
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										mb: { xs: 2.5, md: 3 },
									}}
								>
									<Box
										className='testimonial-avatar'
										sx={{
											width: { xs: 44, md: 48 },
											height: { xs: 44, md: 48 },
											borderRadius: '50%',
											background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
											color: 'white',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											fontWeight: 700,
											fontSize: { xs: '0.9rem', md: '1rem' },
											mr: { xs: 2, md: 2.5 },
											transition: 'transform 0.2s ease',
											boxShadow: `0 3px 8px ${alpha(
												theme.palette.primary.main,
												0.3
											)}`,
										}}
									>
										{testimonial.avatar}
									</Box>
									<Box sx={{ flex: 1 }}>
										<Typography
											variant='subtitle1'
											sx={{
												fontWeight: 600,
												fontSize: { xs: '1rem', md: '1.1rem' },
												lineHeight: 1.3,
											}}
										>
											{testimonial.name}
										</Typography>
										<Typography
											variant='body2'
											sx={{
												color: 'text.secondary',
												fontSize: { xs: '0.85rem', md: '0.9rem' },
											}}
										>
											{testimonial.role}
										</Typography>
									</Box>
								</Box>

								{/* Testimonial content with better mobile typography */}
								<Typography
									variant='body1'
									sx={{
										fontStyle: 'italic',
										color: 'text.secondary',
										fontSize: { xs: '0.95rem', md: '1rem' },
										lineHeight: { xs: 1.6, md: 1.7 },
									}}
								>
									{testimonial.content}
								</Typography>
							</Card>
						</Grid>
					))}
				</Grid>
			</Container>
		</Box>
	);
};

export default Testimonials;
