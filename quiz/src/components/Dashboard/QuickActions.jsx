import React from 'react';
import { Grid, CardContent, Typography, Stack, Box } from '@mui/material';
import { ActionCard } from './StyledCards';

const getActionColor = (color) => {
	switch (color) {
		case 'primary':
			return {
				main: '#3b82f6',
				light: '#dbeafe',
				dark: '#1e40af',
				contrast: '#ffffff',
			};
		case 'secondary':
			return {
				main: '#8b5cf6',
				light: '#e9d5ff',
				dark: '#5b21b6',
				contrast: '#ffffff',
			};
		case 'success':
			return {
				main: '#10b981',
				light: '#d1fae5',
				dark: '#047857',
				contrast: '#ffffff',
			};
		case 'warning':
			return {
				main: '#f59e0b',
				light: '#fef3c7',
				dark: '#d97706',
				contrast: '#111827',
			};
		case 'info':
			return {
				main: '#0ea5e9',
				light: '#e0f2fe',
				dark: '#0369a1',
				contrast: '#ffffff',
			};
		default:
			return {
				main: '#6b7280',
				light: '#f3f4f6',
				dark: '#374151',
				contrast: '#ffffff',
			};
	}
};

const QuickActions = ({ quickActions }) => {
	return (
		<Box>
			<Typography
				variant='h4'
				component='h2'
				sx={{
					mb: { xs: 2.5, sm: 3.5 },
					fontWeight: 700,
					fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
					color: '#111827',
					letterSpacing: '-0.025em',
					textAlign: { xs: 'center', sm: 'left' },
				}}
			>
				Quick Actions
			</Typography>

			<Grid
				container
				spacing={{ xs: 2, sm: 3, md: 3 }}
				justifyContent='center'
				alignItems='stretch'
			>
				{quickActions.map((action, index) => {
					const colors = getActionColor(action.color);

					return (
						<Grid
							item
							xs={12}
							sm={6}
							lg={4}
							key={index}
							sx={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'stretch',
								width: { xs: '100%', md: 'auto' }, // 100% on xs, auto from md (>=960px) onwards
							}}
						>
							<ActionCard
								onClick={action.action}
								sx={{
									width: '100%',
									// Remove maxWidth restriction - let it take full width on mobile
									height: { xs: '180px', sm: '190px', md: '200px' }, // Fixed heights
									display: 'flex',
									flexDirection: 'column',
								}}
							>
								<CardContent
									sx={{
										p: { xs: 2.5, sm: 3 },
										height: '100%',
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										justifyContent: 'center',
										textAlign: 'center',
										flex: 1,
									}}
								>
									<Stack
										spacing={{ xs: 2, sm: 2.5 }}
										alignItems='center'
										justifyContent='center'
										sx={{
											height: '100%',
											width: '100%',
										}}
									>
										{/* Icon Section - Centered */}
										<Box
											className='action-icon'
											sx={{
												width: { xs: 56, sm: 64 },
												height: { xs: 56, sm: 64 },
												borderRadius: 3,
												background: colors.light,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												color: colors.main,
												transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
												boxShadow: `0 4px 12px ${colors.main}15`,
												flexShrink: 0,
												'&:hover': {
													background: colors.main,
													color: colors.contrast,
													transform: 'scale(1.05)',
													boxShadow: `0 8px 24px ${colors.main}25`,
												},
											}}
										>
											{action.icon}
										</Box>

										{/* Text Section - Centered and Equal Height */}
										<Box
											sx={{
												flex: 1,
												display: 'flex',
												flexDirection: 'column',
												justifyContent: 'center',
												alignItems: 'center',
												textAlign: 'center',
												width: '100%',
											}}
										>
											<Typography
												variant='h6'
												component='h3'
												sx={{
													fontWeight: 700,
													mb: 1,
													fontSize: { xs: '1rem', sm: '1.125rem' },
													lineHeight: 1.3,
													color: '#111827',
													letterSpacing: '-0.01em',
													textAlign: 'center',
												}}
											>
												{action.title}
											</Typography>
											<Typography
												variant='body2'
												sx={{
													color: '#6b7280',
													lineHeight: 1.5,
													fontSize: { xs: '0.875rem', sm: '0.9rem' },
													fontWeight: 400,
													textAlign: 'center',
													display: '-webkit-box',
													WebkitLineClamp: 2,
													WebkitBoxOrient: 'vertical',
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													width: '100%',
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
