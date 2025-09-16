import React from 'react';
import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import { Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
const Footer = () => {
	const theme = useTheme();
	const year = new Date().getFullYear();

	return (
		<Box sx={{ py: 6, background: theme.palette.grey[100] }}>
			<Container maxWidth='lg'>
				<Grid container spacing={4}>
					{/* Logo & Description */}
					<Grid item xs={12} md={6}>
						<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
							<Box
								sx={{
									width: 40,
									height: 40,
									borderRadius: theme.shape.borderRadius,
									background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: 'white',
									mr: 2,
								}}
							>
								<Brain size={24} />
							</Box>
							<Typography variant='h6' sx={{ fontWeight: 800 }}>
								QuizAI
							</Typography>
						</Box>
						<Typography
							variant='body2'
							sx={{ color: 'text.secondary', maxWidth: 400, mb: 3 }}
						>
							The next generation AI-powered quiz generator that helps educators
							create engaging assessments in seconds.
						</Typography>
					</Grid>

					{/* Footer Links */}
					<Grid item xs={6} md={2}>
						<Typography variant='body2' sx={{ fontWeight: 600, mb: 2 }}>
							Product
						</Typography>
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
							<Typography variant='body2' sx={{ color: 'text.secondary' }}>
								Features
							</Typography>
							<Typography variant='body2' sx={{ color: 'text.secondary' }}>
								Pricing
							</Typography>
							<Typography variant='body2' sx={{ color: 'text.secondary' }}>
								Use Cases
							</Typography>
						</Box>
					</Grid>

					<Grid item xs={6} md={2}>
						<Typography variant='body2' sx={{ fontWeight: 600, mb: 2 }}>
							Resources
						</Typography>
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
							<Typography variant='body2' sx={{ color: 'text.secondary' }}>
								Blog
							</Typography>
							<Typography variant='body2' sx={{ color: 'text.secondary' }}>
								Documentation
							</Typography>
							<Typography variant='body2' sx={{ color: 'text.secondary' }}>
								Support
							</Typography>
						</Box>
					</Grid>

					<Grid item xs={6} md={2}>
						<Typography variant='body2' sx={{ fontWeight: 600, mb: 2 }}>
							Company
						</Typography>
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
							<Typography variant='body2' sx={{ color: 'text.secondary' }}>
								About
							</Typography>
							<Typography
								variant='body2'
								component={Link} // 👈 turns it into a <Link>
								to='/terms' // 👈 navigate to terms route
								sx={{
									color: 'text.secondary',
									cursor: 'pointer',
									textDecoration: 'none',
								}}
							>
								Terms and Conditions
							</Typography>{' '}
							<Typography variant='body2' sx={{ color: 'text.secondary' }}>
								Contact
							</Typography>
						</Box>
					</Grid>
				</Grid>

				{/* Copyright */}
				<Box
					sx={{
						mt: 6,
						pt: 4,
						borderTop: '1px solid',
						borderColor: 'divider',
						textAlign: 'center',
					}}
				>
					<Typography variant='body2' sx={{ color: 'text.secondary' }}>
						© {year} QuizAI. All rights reserved.
					</Typography>
				</Box>
			</Container>
		</Box>
	);
};

export default Footer;
