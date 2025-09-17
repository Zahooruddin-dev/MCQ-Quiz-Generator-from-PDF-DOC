import React, { useState } from 'react';
import {
	Button,
	CircularProgress,
	Snackbar,
	Alert,
	Menu,
	MenuItem,
	ListItemIcon,
	ListItemText,
	Divider,
	Fade,
	Zoom,
} from '@mui/material';
import {
	GetAppOutlined as DownloadIcon,
	PictureAsPdfOutlined as PdfIcon,
	ArticleOutlined as DocxIcon,
} from '@mui/icons-material';

// Import the separate generator components
import CombinedPDFGenerator from './CombinedPDFGenerator';
import DOCXDownloadComponent from './DOCXDownloadComponent';

const DownloadQuizButton = ({
	quizData,
	questions = [],
	variant = 'outlined',
	size = 'large',
	fullWidth = false,
}) => {
	const [loading, setLoading] = useState(false);
	const [loadingFormat, setLoadingFormat] = useState(null);
	const [snackbar, setSnackbar] = useState({
		open: false,
		message: '',
		severity: 'success',
	});
	const [anchorEl, setAnchorEl] = useState(null);

	const showSnackbar = (message, severity = 'success') => {
		setSnackbar({ open: true, message, severity });
	};

	const handleMenuOpen = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	// Handle PDF Download (Combined Quiz + Answer Key)
	const handlePDFDownload = async () => {
		setLoadingFormat('pdf');
		handleMenuClose();

		try {
			await CombinedPDFGenerator.generate(quizData, questions);
			showSnackbar(
				'PDF generated! Quiz sheet with answer key ready for download.'
			);
			setLoadingFormat(null);
		} catch (error) {
			console.error('PDF generation failed:', error);
			showSnackbar('Failed to generate PDF file', 'error');
			setLoadingFormat(null);
		}
	};

	// Handle DOCX Download (Separate Quiz Sheet + Answer Key)
	const handleDOCXDownload = async () => {
		setLoadingFormat('docx');
		handleMenuClose();

		try {
			await DOCXDownloadComponent.generate(quizData, questions, showSnackbar);
			setLoadingFormat(null);
		} catch (error) {
			console.error('DOCX generation failed:', error);
			showSnackbar('Failed to generate DOCX files', 'error');
			setLoadingFormat(null);
		}
	};

	// Get loading state for specific format
	const isLoading = (format) => loadingFormat === format;

	return (
		<>
			<Zoom in={true} style={{ transitionDelay: '100ms' }}>
				<Button
					variant={variant}
					size={size}
					fullWidth={fullWidth}
					startIcon={
						loading ? <CircularProgress size={20} /> : <DownloadIcon />
					}
					onClick={handleMenuOpen}
					disabled={loading || questions.length === 0}
					sx={{
						px: 4,
						py: 1.5,
						background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
						color: 'white',
						boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
						'&:hover': {
							background: 'linear-gradient(45deg, #1976D2 30%, #03A9F4 90%)',
						},
					}}
				>
					{loading ? 'Generating...' : 'Download Quiz'}
				</Button>
			</Zoom>

			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleMenuClose}
				PaperProps={{
					sx: {
						borderRadius: 2,
						minWidth: 280,
						boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
						mt: 1,
					},
				}}
				TransitionComponent={Fade}
			>
				<MenuItem onClick={handlePDFDownload} disabled={isLoading('pdf')}>
					<ListItemIcon>
						{isLoading('pdf') ? (
							<CircularProgress size={20} />
						) : (
							<PdfIcon color='error' />
						)}
					</ListItemIcon>
					<ListItemText
						primary='Download as PDF'
						secondary='Quiz + Answer Key (Combined)'
					/>
				</MenuItem>

				<Divider />

				<MenuItem onClick={handleDOCXDownload} disabled={isLoading('docx')}>
					<ListItemIcon>
						{isLoading('docx') ? (
							<CircularProgress size={20} />
						) : (
							<DocxIcon color='primary' />
						)}
					</ListItemIcon>
					<ListItemText
						primary='Download as DOCX'
						secondary='Quiz + Answer Key (Separate)'
						primaryTypographyProps={{ fontWeight: 'bold' }}
					/>
				</MenuItem>
			</Menu>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={() => setSnackbar({ ...snackbar, open: false })}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
				TransitionComponent={Fade}
			>
				<Alert
					onClose={() => setSnackbar({ ...snackbar, open: false })}
					severity={snackbar.severity}
					variant='filled'
					sx={{ width: '100%' }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</>
	);
};

export default DownloadQuizButton;
