import React from 'react';
import { DialogTitle, Stack, Box, Typography } from '@mui/material';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const QuizDialogHeader = ({ isTimeExpiring, hasUnanswered }) => {
	return (
		<DialogTitle sx={{ pb: 0 }}>
			<Stack spacing={2}>
				<Stack direction="row" alignItems="center" spacing={2}>
					{/* Status Icon */}
					<Box
						sx={{
							width: { xs: 40, sm: 48 },
							height: { xs: 40, sm: 48 },
							borderRadius: '50%',
							background: isTimeExpiring
								? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
								: hasUnanswered
								? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
								: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: 'white',
							boxShadow: isTimeExpiring
								? '0 4px 12px rgba(220, 38, 38, 0.4)'
								: hasUnanswered
								? '0 4px 12px rgba(245, 158, 11, 0.4)'
								: '0 4px 12px rgba(16, 185, 129, 0.4)',
							animation: isTimeExpiring ? 'pulse 1s infinite' : 'none',
						}}
					>
						{isTimeExpiring ? (
							<Clock size={20} />
						) : hasUnanswered ? (
							<AlertTriangle size={20} />
						) : (
							<CheckCircle size={20} />
						)}
					</Box>

					{/* Title + Subtitle */}
					<Box>
						<Typography
							variant="h5"
							sx={{
								fontWeight: 700,
								color: '#111827',
								fontSize: { xs: '1.25rem', sm: '1.5rem' },
								lineHeight: 1.2,
							}}
						>
							{isTimeExpiring
								? 'Time Almost Up!'
								: hasUnanswered
								? 'Finish Quiz?'
								: 'Complete Quiz?'}
						</Typography>

						<Typography
							variant="body2"
							sx={{
								color: 'text.secondary',
								fontSize: { xs: '0.85rem', sm: '0.9rem' },
								mt: 0.5,
							}}
						>
							{isTimeExpiring
								? 'Quiz will auto-submit very soon.'
								: hasUnanswered
								? 'Some questions are still unanswered.'
								: 'All questions have been answered.'}
						</Typography>
					</Box>
				</Stack>
			</Stack>
		</DialogTitle>
	);
};

export default QuizDialogHeader;
