import React, { useState, useEffect } from 'react';
import {
	DialogContent,
	DialogActions,
	Button,
	Box,
	Stack,
	Alert,
	Typography,
	LinearProgress,
} from '@mui/material';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { StyledDialog } from './styles';

import ConfigHeader from './ConfigHeader';
import ConfigForm from './ConfigForm';
import LoadingOverlay from './LoadingOverlay';

const ModernAPIConfig = ({ onConfigSave, onClose }) => {
	const [apiKey, setApiKey] = useState('');
	const [baseUrl, setBaseUrl] = useState(
		'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
	);
	const [showApiKey, setShowApiKey] = useState(false);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [saveProgress, setSaveProgress] = useState(0);
	const [validationStatus, setValidationStatus] = useState(null);

	const features = [
		{
			icon: 'brain',
			title: 'AI-Powered Generation',
			description: 'Advanced question generation',
		},
		{
			icon: 'zap',
			title: 'Lightning Fast',
			description: 'Instant quiz creation',
		},
		{
			icon: 'shield',
			title: 'Secure & Private',
			description: 'Your data stays protected',
		},
	];

	useEffect(() => {
		const fetchApiKey = async () => {
			try {
				const snap = await getDoc(doc(db, 'settings', 'apiKey'));
				if (snap.exists()) {
					setApiKey(snap.data().value || '');
					setValidationStatus('valid');
				}
			} catch (err) {
				console.error('Failed to fetch API key:', err);
				setValidationStatus('error');
			} finally {
				setLoading(false);
			}
		};
		fetchApiKey();
	}, []);

	const handleSave = async () => {
		if (!apiKey.trim()) return;

		setSaving(true);
		setSaveProgress(0);

		const progressInterval = setInterval(() => {
			setSaveProgress((p) => {
				if (p >= 90) {
					clearInterval(progressInterval);
					return p;
				}
				return p + Math.random() * 20;
			});
		}, 100);

		try {
			await setDoc(doc(db, 'settings', 'apiKey'), { value: apiKey.trim() });
			setSaveProgress(100);
			await new Promise((r) => setTimeout(r, 500));
			onConfigSave?.(apiKey.trim(), baseUrl);
			localStorage.setItem('geminiApiKey', apiKey.trim());
			setTimeout(() => onClose?.(), 1000);
		} catch (err) {
			console.error('Failed to save API key:', err);
			setValidationStatus('error');
		} finally {
			clearInterval(progressInterval);
			setSaving(false);
			setSaveProgress(0);
		}
	};

	return (
		<StyledDialog open={true} onClose={onClose} maxWidth='md' fullWidth>
			{saving && <LoadingOverlay saveProgress={saveProgress} />}

			<ConfigHeader features={features} onClose={onClose} />

			<DialogContent sx={{ p: 0 }}>
				{loading ? (
					<Box sx={{ p: 4, textAlign: 'center' }}>
						<LinearProgress sx={{ mb: 2 }} />
						<Typography variant='body2' sx={{ color: 'text.secondary' }}>
							Loading current configuration...
						</Typography>
					</Box>
				) : (
					<ConfigForm
						apiKey={apiKey}
						setApiKey={setApiKey}
						baseUrl={baseUrl}
						setBaseUrl={setBaseUrl}
						showApiKey={showApiKey}
						setShowApiKey={setShowApiKey}
						validationStatus={validationStatus}
						setValidationStatus={setValidationStatus}
					/>
				)}
			</DialogContent>

			<DialogActions sx={{ p: 4, pt: 0 }}>
				<Stack direction='row' spacing={2} sx={{ width: '100%' }}>
					<Button
						variant='outlined'
						onClick={onClose}
						disabled={saving}
						sx={{ flex: 1 }}
					>
						Cancel
					</Button>
					<Button
						variant='contained'
						onClick={handleSave}
						disabled={
							saving || !apiKey.trim() || validationStatus === 'invalid'
						}
						sx={{
							flex: 1,
							background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
							'&:hover': {
								background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
							},
						}}
					>
						{saving ? 'Saving...' : 'Save Configuration'}
					</Button>
				</Stack>
			</DialogActions>
		</StyledDialog>
	);
};

export default ModernAPIConfig;
