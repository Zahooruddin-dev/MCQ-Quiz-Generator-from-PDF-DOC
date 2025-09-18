import React from 'react';
import { Box, Container, Typography, useTheme } from '@mui/material';

const TermsAndConditions = () => {
	const theme = useTheme();

	return (
		<Box sx={{ py: 8, background: theme.palette.grey[50], minHeight: '100vh' }}>
			<Container maxWidth='md'>
				<Typography
					variant='h4'
					sx={{ fontWeight: 800, mb: 4, textAlign: 'center' }}
				>
					Terms & Conditions
				</Typography>

				<Typography variant='body2' sx={{ color: 'text.secondary', mb: 3 }}>
					Welcome to <strong>QuizAI</strong>. By accessing or using our
					services, you agree to the following terms and conditions. Please read
					them carefully before continuing.
				</Typography>

				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
					<Box>
						<Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>
							1. Use of Service
						</Typography>
						<Typography variant='body2' sx={{ color: 'text.secondary' }}>
							QuizAI provides AI-powered quiz generation for educators,
							examiners, and students. While we aim for accuracy and
							reliability, all generated content is provided “as is” and may not
							be 100% correct or suitable for every context.
						</Typography>
					</Box>

					<Box>
						<Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>
							2. No Guarantee of Accuracy
						</Typography>
						<Typography variant='body2' sx={{ color: 'text.secondary' }}>
							AI-generated questions and answers may contain mistakes or
							inconsistencies. QuizAI does not guarantee the correctness of
							answers, grading outcomes, or suitability for academic,
							professional, or certification use. Users should verify content
							before relying on it.
						</Typography>
					</Box>

					<Box>
						<Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>
							3. Subscription & Credits
						</Typography>
						<Typography variant='body2' sx={{ color: 'text.secondary' }}>
							QuizAI uses a credit-based system for quiz generation. We reserve
							the right to modify the credit calculation formula, pricing, or
							subscription benefits at any time without prior notice. Credits
							are non-refundable unless required by law.
						</Typography>
					</Box>

					<Box>
						<Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>
							4. Termination of Service
						</Typography>
						<Typography variant='body2' sx={{ color: 'text.secondary' }}>
							We reserve the right to suspend or terminate any user account or
							subscription at our sole discretion, including for misuse, abuse,
							or violation of these terms. Access may be revoked without prior
							notice in such cases.
						</Typography>
					</Box>

					<Box>
						<Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>
							5. Changes to Terms
						</Typography>
						<Typography variant='body2' sx={{ color: 'text.secondary' }}>
							These terms may be updated from time to time. Continued use of
							QuizAI after updates constitutes acceptance of the revised terms.
							It is your responsibility to review this page periodically.
						</Typography>
					</Box>

					<Box>
						<Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>
							6. Payment and Billing
						</Typography>
						<Typography variant='body2' sx={{ color: 'text.secondary' }}>
							All payments are processed securely through Paddle, our authorized
							payment processor. Subscriptions automatically renew unless
							cancelled before the next billing cycle. Failed payments may
							result in service suspension. Applicable taxes will be calculated
							based on your billing location.
						</Typography>
					</Box>

					<Box>
						<Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>
							7. Refunds and Cancellations
						</Typography>
						<Typography variant='body2' sx={{ color: 'text.secondary' }}>
							We offer a 7-day money-back guarantee for new paid subscriptions.
							Refunds are processed within 5-10 business days. Credits are
							non-refundable after the 30-day period. You may cancel your
							subscription at any time from your account settings.
						</Typography>
					</Box>

					<Box>
						<Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>
							8. Contact Information
						</Typography>
						<Typography variant='body2' sx={{ color: 'text.secondary' }}>
							QuizAI
							<br />
							Muhammad Zahooruddin Nizamani
							<br />
							Mizuka.vercel.app
							<br />
							Email: mzkhan886@gmail.com
							<br />
							These terms are governed by the laws of [Your Jurisdiction].
						</Typography>
					</Box>
				</Box>

				<Typography
					variant='body2'
					sx={{ mt: 6, color: 'text.secondary', textAlign: 'center' }}
				>
					© {new Date().getFullYear()} QuizAI. All rights reserved.
				</Typography>
			</Container>
		</Box>
	);
};

export default TermsAndConditions;
