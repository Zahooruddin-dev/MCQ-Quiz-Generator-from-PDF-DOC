import React, { useState } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Box,
	Typography,
	Button,
	TextField,
	Stack,
	Avatar,
	Chip,
	IconButton,
	Divider,
	Paper,
	Snackbar,
	Alert,
	Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
	ShareOutlined as ShareIcon,
	EmailOutlined as EmailIcon,
	LinkOutlined as LinkIcon,
	ContentCopyOutlined as CopyIcon,
	CloseOutlined as CloseIcon,
	FacebookOutlined as FacebookIcon,
	Instagram as Instagramicon, // <-- ✅ just instagram
	WhatsApp as WhatsAppIcon, // <-- ✅ WhatsApp instead of WhatsAppOutlined
} from '@mui/icons-material';

import { useAuth } from '../../context/AuthContext';
import DownloadQuizButton from './DownloadQuizButton/DownloadQuizButton';

const ShareDialog = styled(Dialog)(({ theme }) => ({
	'& .MuiDialog-paper': {
		borderRadius: theme.shape.borderRadius * 2,
		maxWidth: 500,
		width: '100%',
	},
}));

const ShareOption = styled(Paper)(({ theme }) => ({
	padding: theme.spacing(2),
	cursor: 'pointer',
	transition: 'all 0.2s ease',
	border: '1px solid',
	borderColor: theme.palette.grey[200],
	'&:hover': {
		transform: 'translateY(-2px)',
		boxShadow: theme.shadows[4],
		borderColor: theme.palette.primary.main,
	},
}));

const UserInfoCard = styled(Paper)(({ theme }) => ({
	padding: theme.spacing(2),
	background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`,
	border: '1px solid',
	borderColor: theme.palette.primary.light + '20',
}));

const ShareQuizModal = ({ open, onClose, quizData, userResults }) => {
	const { user } = useAuth();
	const [shareMessage, setShareMessage] = useState('');
	const [snackbar, setSnackbar] = useState({
		open: false,
		message: '',
		severity: 'success',
	});
	const [shareUrl] = useState(
		`${window.location.origin}/shared-quiz/${Date.now()}`
	);

	const handleClose = () => {
		setShareMessage('');
		onClose();
	};

	const showSnackbar = (message, severity = 'success') => {
		setSnackbar({ open: true, message, severity });
	};

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(shareUrl);
			showSnackbar('Link copied to clipboard!');
		} catch (error) {
			showSnackbar('Failed to copy link', 'error');
		}
	};

	const handleEmailShare = () => {
		const subject = `Quiz Results: ${quizData?.title || 'Quiz'}`;
		const body = `Hi there!\n\nI just completed a quiz and wanted to share my results with you!\n\n${
			shareMessage || `I scored ${userResults?.score}% on "${quizData?.title}"`
		}\n\nView the quiz: ${shareUrl}\n\nBest regards,\n${
			user?.displayName || 'Quiz Taker'
		}`;

		window.open(
			`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
				body
			)}`
		);
		showSnackbar('Email client opened!');
	};

	const handleSocialShare = (platform) => {
		const text =
			shareMessage ||
			`I just scored ${userResults?.score}% on "${quizData?.title}" quiz! 🎯`;
		const url = shareUrl;

		let shareLink = '';
		switch (platform) {
			case 'instagram':
				shareLink = `https://instagram.com/intent/tweet?text=${encodeURIComponent(
					text
				)}&url=${encodeURIComponent(url)}`;
				break;
			case 'facebook':
				shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
					url
				)}&quote=${encodeURIComponent(text)}`;
				break;
			case 'whatsapp':
				shareLink = `https://wa.me/?text=${encodeURIComponent(
					text + ' ' + url
				)}`;
				break;
			default:
				return;
		}

		window.open(shareLink, '_blank', 'width=600,height=400');
		showSnackbar(`Shared on ${platform}!`);
	};

	const getUserInitials = (name) => {
		if (!name) return 'U';
		return name
			.split(' ')
			.map((word) => word[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	const getScoreColor = (score) => {
		if (score >= 90) return 'success';
		if (score >= 70) return 'warning';
		return 'error';
	};

	return (
		<>
			<ShareDialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
				<DialogTitle>
					<Stack
						direction='row'
						justifyContent='space-between'
						alignItems='center'
					>
						<Stack direction='row' spacing={2} alignItems='center'>
							<ShareIcon color='primary' />
							<Typography variant='h6' sx={{ fontWeight: 600 }}>
								Share Quiz Results
							</Typography>
						</Stack>
						<IconButton onClick={handleClose} size='small'>
							<CloseIcon />
						</IconButton>
					</Stack>
				</DialogTitle>

				<DialogContent sx={{ pb: 2 }}>
					<Stack spacing={3}>
						{/* User Info */}
						<UserInfoCard elevation={0}>
							<Stack direction='row' spacing={2} alignItems='center'>
								<Avatar
									sx={{
										width: 48,
										height: 48,
										background:
											'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
										fontWeight: 600,
										fontSize: '1.2rem',
									}}
								>
									{getUserInitials(user?.displayName)}
								</Avatar>
								<Box sx={{ flex: 1 }}>
									<Typography variant='h6' sx={{ fontWeight: 600 }}>
										{user?.displayName || 'Quiz Taker'}
									</Typography>
									<Typography variant='body2' color='text.secondary'>
										{user?.email}
									</Typography>
								</Box>
								<Stack spacing={1} alignItems='flex-end'>
									<Chip
										label={`${userResults?.score}%`}
										color={getScoreColor(userResults?.score)}
										sx={{ fontWeight: 600 }}
									/>
									<Typography variant='caption' color='text.secondary'>
										{userResults?.correct}/{quizData?.totalQuestions} correct
									</Typography>
								</Stack>
							</Stack>
						</UserInfoCard>

						{/* Quiz Info */}
						<Box>
							<Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
								Quiz: {quizData?.title || 'Untitled Quiz'}
							</Typography>
							<Stack direction='row' spacing={1} sx={{ mb: 2 }}>
								<Chip
									label={`${quizData?.totalQuestions || 0} Questions`}
									size='small'
									variant='outlined'
								/>
								<Chip
									label={quizData?.difficulty || 'Medium'}
									size='small'
									variant='outlined'
								/>
								<Chip
									label={new Date().toLocaleDateString()}
									size='small'
									variant='outlined'
								/>
							</Stack>
						</Box>

						{/* Custom Message */}
						<TextField
							fullWidth
							multiline
							rows={3}
							label='Add a personal message (optional)'
							placeholder='Share your thoughts about the quiz...'
							value={shareMessage}
							onChange={(e) => setShareMessage(e.target.value)}
							variant='outlined'
						/>

						{/* Share Link */}
						<Box>
							<Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
								Share Link
							</Typography>
							<Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
								<Stack direction='row' spacing={2} alignItems='center'>
									<Typography
										variant='body2'
										sx={{ flex: 1, wordBreak: 'break-all' }}
									>
										{shareUrl}
									</Typography>
									<Tooltip title='Copy link'>
										<IconButton
											onClick={handleCopyLink}
											size='small'
											color='primary'
										>
											<CopyIcon />
										</IconButton>
									</Tooltip>
								</Stack>
							</Paper>
						</Box>

						<Divider />

						{/* Share Options */}
						<Box>
							<Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2 }}>
								Share via
							</Typography>

							<Stack spacing={2}>
								{/* Email */}
								<ShareOption onClick={handleEmailShare} elevation={0}>
									<Stack direction='row' spacing={2} alignItems='center'>
										<EmailIcon color='primary' />
										<Box>
											<Typography variant='body1' sx={{ fontWeight: 500 }}>
												Email
											</Typography>
											<Typography variant='body2' color='text.secondary'>
												Send via your email client
											</Typography>
										</Box>
									</Stack>
								</ShareOption>

								{/* Social Media */}
								<Stack direction='row' spacing={2}>
									<Tooltip title='Share on instagram'>
										<ShareOption
											onClick={() => handleSocialShare('instagram')}
											elevation={0}
											sx={{ flex: 1, textAlign: 'center' }}
										>
											<Instagramicon sx={{ color: '#791df2ff' }} />
											<Typography
												variant='caption'
												sx={{ display: 'block', mt: 1 }}
											>
												Instagram
											</Typography>
										</ShareOption>
									</Tooltip>

									<Tooltip title='Share on Facebook'>
										<ShareOption
											onClick={() => handleSocialShare('facebook')}
											elevation={0}
											sx={{ flex: 1, textAlign: 'center' }}
										>
											<FacebookIcon sx={{ color: '#4267B2' }} />
											<Typography
												variant='caption'
												sx={{ display: 'block', mt: 1 }}
											>
												Facebook
											</Typography>
										</ShareOption>
									</Tooltip>

								

									<Tooltip title='Share on WhatsApp'>
										<ShareOption
											onClick={() => handleSocialShare('whatsapp')}
											elevation={0}
											sx={{ flex: 1, textAlign: 'center' }}
										>
											<WhatsAppIcon sx={{ color: '#25D366' }} />
											<Typography
												variant='caption'
												sx={{ display: 'block', mt: 1 }}
											>
												WhatsApp
											</Typography>
										</ShareOption>
									</Tooltip>
								</Stack>
								{/* ⬇️ Download Option */}
								<ShareOption elevation={0}>
									<DownloadQuizButton
										quizData={quizData}
										userResults={userResults}
										questions={quizData?.questions || []}
										userAnswers={userResults?.answers || []}
										variant='outlined'
										size='large'
										fullWidth
									/>
								</ShareOption>
							</Stack>
						</Box>
					</Stack>
				</DialogContent>

				<DialogActions sx={{ p: 3, pt: 0 }}>
					<Button onClick={handleClose} color='inherit'>
						Cancel
					</Button>
					<Button
						onClick={handleCopyLink}
						variant='contained'
						startIcon={<LinkIcon />}
						sx={{
							background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
							'&:hover': {
								background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
							},
						}}
					>
						Copy Link
					</Button>
				</DialogActions>
			</ShareDialog>

			{/* Snackbar for notifications */}
			<Snackbar
				open={snackbar.open}
				autoHideDuration={3000}
				onClose={() => setSnackbar({ ...snackbar, open: false })}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
				<Alert
					onClose={() => setSnackbar({ ...snackbar, open: false })}
					severity={snackbar.severity}
					variant='filled'
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</>
	);
};

export default ShareQuizModal;
