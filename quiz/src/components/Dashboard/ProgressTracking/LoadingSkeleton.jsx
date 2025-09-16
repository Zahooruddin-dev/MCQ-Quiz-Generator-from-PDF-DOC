import React from 'react';
import { Box, Skeleton, Stack, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUpOutlined';

const LoadingSkeleton = ({ showCharts }) => (
	<Box>
		<Stack direction='row' spacing={2} alignItems='center' sx={{ mb: 3 }}>
			<TrendingUpIcon color='primary' />
			<Typography variant='h5' sx={{ fontWeight: 600 }}>
				Your Progress
			</Typography>
		</Stack>
		<Stack spacing={3}>
			<Stack direction='row' spacing={2}>
				{[...Array(4)].map((_, i) => (
					<Skeleton
						key={i}
						variant='rectangular'
						height={120}
						sx={{ flex: 1, borderRadius: 2 }}
					/>
				))}
			</Stack>
			{showCharts && (
				<Skeleton variant='rectangular' height={300} sx={{ borderRadius: 2 }} />
			)}
		</Stack>
	</Box>
);

export default LoadingSkeleton;
