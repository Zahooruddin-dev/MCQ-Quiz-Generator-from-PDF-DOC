import React from 'react';
import { Dialog, Slide } from '@mui/material';
import FinishDialogActions from './FinishDialog/FinishDialog';
import FinishDialogContent from './FinishDialog/FinishDialogContent';
import QuizDialogHeader from './FinishDialog/QuizDialogHeader';
const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction='up' ref={ref} {...props} />;
});

const FinishDialog = ({
	open,
	unansweredCount,
	cancelFinish,
	submitQuiz,
	isSubmitting,
	timeRemaining = null,
	showTimer = false,
}) => {
	const hasUnanswered = unansweredCount > 0;
	const isTimeExpiring =
		showTimer && timeRemaining !== null && timeRemaining < 30;

	return (
		<Dialog
			open={open}
			onClose={!isSubmitting && !isTimeExpiring ? cancelFinish : undefined}
			maxWidth='sm'
			fullWidth
			TransitionComponent={Transition}
			PaperProps={{
				sx: {
					borderRadius: { xs: 2, sm: 3 },
					boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.25)',
					border: '1px solid #e2e8f0',
					maxWidth: { xs: '90vw', sm: '500px' },
					m: { xs: 2, sm: 3 },
				},
			}}
			BackdropProps={{
				sx: {
					backdropFilter: 'blur(8px)',
					backgroundColor: 'rgba(0, 0, 0, 0.6)',
				},
			}}
		>
			{/* Header */}
			<QuizDialogHeader
				isTimeExpiring={isTimeExpiring}
				hasUnanswered={hasUnanswered}
			/>

			{/* Content */}
			<FinishDialogContent
				isTimeExpiring={isTimeExpiring}
				hasUnanswered={hasUnanswered}
				unansweredCount={unansweredCount}
			/>

			{/* Actions */}
			<FinishDialogActions
				cancelFinish={cancelFinish}
				submitQuiz={submitQuiz}
				isSubmitting={isSubmitting}
				hasUnanswered={hasUnanswered}
			/>

			<style jsx>{`
				@keyframes spin {
					0% {
						transform: rotate(0deg);
					}
					100% {
						transform: rotate(360deg);
					}
				}
			`}</style>
		</Dialog>
	);
};

export default FinishDialog;
