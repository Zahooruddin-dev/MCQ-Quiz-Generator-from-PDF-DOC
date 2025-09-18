import React from 'react';
import { Backdrop, Box, CircularProgress, Typography } from '@mui/material';

const LoadingBackdrop = ({ isSubmitting, submitStatus }) => {
	return (
		<Backdrop
			sx={{
				color: '#fff',
				zIndex: (theme) => theme.zIndex.drawer + 1,
				backdropFilter: 'blur(8px)',
				backgroundColor: 'rgba(0, 0, 0, 0.8)',
			}}
			open={isSubmitting}
		>
			<Box
				sx={{
					textAlign: 'center',
					maxWidth: 400,
					px: 3,
				}}
			>
				{/* Loader + Success Check */}
				<Box sx={{ position: 'relative', mb: 4 }}>
					<CircularProgress
						color="primary"
						size={72}
						thickness={3}
						sx={{
							filter: 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.4))',
						}}
					/>
					{submitStatus === 'complete' && (
						<Box
							sx={{
								position: 'absolute',
								top: '50%',
								left: '50%',
								transform: 'translate(-50%, -50%)',
								color: '#10b981',
								fontSize: '2rem',
							}}
						>
							✓
						</Box>
					)}
				</Box>

				{/* Heading */}
				<Typography
					variant="h5"
					sx={{
						mb: 2,
						fontWeight: 700,
						letterSpacing: '-0.01em',
					}}
				>
					{submitStatus === 'processing' && 'Processing Your Answers...'}
					{submitStatus === 'saving' && 'Calculating Results...'}
					{submitStatus === 'complete' && 'Quiz Complete!'}
					{submitStatus === 'error' && 'Almost There...'}
				</Typography>

				{/* Subtext */}
				<Typography
					variant="body1"
					sx={{
						opacity: 0.9,
						lineHeight: 1.6,
						fontSize: '1.1rem',
					}}
				>
					{submitStatus === 'processing' &&
						"We're reviewing your responses and preparing your personalized results."}
					{submitStatus === 'saving' &&
						'Generating your score and performance insights...'}
					{submitStatus === 'complete' &&
						'Your results are ready! Redirecting you now...'}
					{submitStatus === 'error' &&
						'Finalizing your results. This will just take a moment longer.'}
				</Typography>
			</Box>
		</Backdrop>
	);
};

export default LoadingBackdrop;
