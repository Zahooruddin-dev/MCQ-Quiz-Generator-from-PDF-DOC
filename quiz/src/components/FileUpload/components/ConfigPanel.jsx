// src/components/ConfigPanel.jsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
	Box,
	Typography,
	Stack,
	TextField,
	Alert,
	Button,
	Collapse,
	useTheme,
	useMediaQuery,
	Fade,
} from '@mui/material';

import { useAuth } from '../../../context/AuthContext';
import examplePrompts from './ConfigPanel/examplePrompts';
import difficultyOptions from './ConfigPanel/difficultyOptions';
import qualityOptions from './ConfigPanel/qualityOptions';
import DifficultyQualitySelector from './ConfigPanel/DifficultyQualitySelector';
import CustomInstructionsAccordion from './ConfigPanel/CustomInstructions';
import CurrentConfigSummary from './ConfigPanel/CurrentConfigSummary';
import AIToggle from './ConfigPanel/AIToggle';
import ConfigHeader from './ConfigPanel/ConfigHeader';

const ConfigPanel = ({
	hasAI = false,
	apiKey,
	loading = false,
	initialOptions = {},
	onOptionsChange,
	onReconfigure,
}) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const isTablet = useMediaQuery(theme.breakpoints.down('md'));

	// Get credit information
	const { credits, isPremium, isAdmin } = useAuth();

	// Memoized default options to prevent unnecessary re-renders
	const defaultOptions = useMemo(
		() => ({
			numQuestions: 10,
			difficulty: 'medium',
			quality: 'normal',
			questionType: 'mixed',
			useAI: false,
			customInstructions: '',
			...initialOptions,
		}),
		[initialOptions]
	);

	const [useAI, setUseAI] = useState(hasAI || false);
	const [aiOptions, setAiOptions] = useState(defaultOptions);
	const [showCustomInstructions, setShowCustomInstructions] = useState(false);
	const [validationErrors, setValidationErrors] = useState({});

	// Sync with external changes
	useEffect(() => {
		setAiOptions(defaultOptions);
	}, [defaultOptions]);

	// Memoized credit status
	const creditStatus = useMemo(() => {
		if (isPremium)
			return {
				type: 'premium',
				label: 'Premium - Unlimited',
				color: '#FFD700',
			};
		if (isAdmin)
			return { type: 'admin', label: 'Admin - Unlimited', color: '#EF4444' };
		return {
			type: 'free',
			label: `${credits} Credits - 1 per quiz`,
			color: credits > 0 ? '#10B981' : '#EF4444',
		};
	}, [isPremium, isAdmin, credits]);

	// Memoized AI availability
	const canUseAI = useMemo(
		() => isPremium || isAdmin || credits > 0,
		[isPremium, isAdmin, credits]
	);

	// Validation function
	const validateOptions = useCallback((options) => {
		const errors = {};

		if (
			!options.numQuestions ||
			options.numQuestions < 5 ||
			options.numQuestions > 50
		) {
			errors.numQuestions = 'Must be between 5 and 50 questions';
		}

		if (
			options.customInstructions &&
			options.customInstructions.length > 1000
		) {
			errors.customInstructions =
				'Custom instructions must be under 1000 characters';
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	}, []);

	// Optimized option change handler
	const handleOptionChange = useCallback(
		(newOptions) => {
			setAiOptions(newOptions);
			if (validateOptions(newOptions)) {
				onOptionsChange?.(newOptions);
			}
		},
		[onOptionsChange, validateOptions]
	);

	// Toggle AI handler
	const handleToggleAI = useCallback(
		(e) => {
			const checked = e.target.checked;
			setUseAI(checked);
			const newOptions = { ...aiOptions, useAI: checked };
			handleOptionChange(newOptions);
		},
		[aiOptions, handleOptionChange]
	);

	// Number of questions handlers
	const handleNumQuestionsChange = useCallback(
		(e) => {
			const value = e.target.value === '' ? '' : Number(e.target.value);
			const newOptions = { ...aiOptions, numQuestions: value };
			handleOptionChange(newOptions);
		},
		[aiOptions, handleOptionChange]
	);

	const handleNumQuestionsBlur = useCallback(
		(e) => {
			let val = Number(e.target.value) || 10;
			val = Math.max(5, Math.min(50, val));
			const newOptions = { ...aiOptions, numQuestions: val };
			handleOptionChange(newOptions);
		},
		[aiOptions, handleOptionChange]
	);

	// Select handlers
	const handleDifficultyChange = useCallback(
		(e) => {
			const newOptions = { ...aiOptions, difficulty: e.target.value };
			handleOptionChange(newOptions);
		},
		[aiOptions, handleOptionChange]
	);

	const handleQualityChange = useCallback(
		(e) => {
			const newOptions = { ...aiOptions, quality: e.target.value };
			handleOptionChange(newOptions);
		},
		[aiOptions, handleOptionChange]
	);

	// Custom instructions handler with debouncing
	const handleCustomInstructionsChange = useCallback(
		(e) => {
			const value = e.target.value;
			const newOptions = { ...aiOptions, customInstructions: value };
			setAiOptions(newOptions);

			// Simple debouncing
			const timeoutId = setTimeout(() => {
				if (validateOptions(newOptions)) {
					onOptionsChange?.(newOptions);
				}
			}, 500);

			return () => clearTimeout(timeoutId);
		},
		[aiOptions, onOptionsChange, validateOptions]
	);

	// Add example prompt handler
	const addExamplePrompt = useCallback(
		(prompt) => {
			const currentInstructions = aiOptions.customInstructions.trim();
			const newInstructions = currentInstructions
				? `${currentInstructions}\n${prompt}`
				: prompt;
			const newOptions = { ...aiOptions, customInstructions: newInstructions };
			handleOptionChange(newOptions);
		},
		[aiOptions, handleOptionChange]
	);

	// Memoized selected options
	const selectedDifficulty = useMemo(
		() => difficultyOptions.find((d) => d.value === aiOptions.difficulty),
		[aiOptions.difficulty]
	);

	const selectedQuality = useMemo(
		() => qualityOptions.find((q) => q.value === aiOptions.quality),
		[aiOptions.quality]
	);

	// Memoized estimated time
	const estimatedTime = useMemo(() => {
		const baseTime = selectedQuality?.estimatedTime || '~1-2min';
		const questionMultiplier =
			aiOptions.numQuestions > 20 ? ' (longer for 20+ questions)' : '';
		return baseTime + questionMultiplier;
	}, [selectedQuality, aiOptions.numQuestions]);

	return (
		<Box
			sx={{
				borderRadius: isMobile ? 2 : 3,
				border: '1px solid',
				borderColor: 'divider',
				overflow: 'hidden',
				background: isMobile
					? 'rgba(255, 255, 255, 0.95)'
					: 'rgba(255, 255, 255, 0.6)',
				backdropFilter: 'blur(12px)',
				p: isMobile ? 2 : 3,
				position: 'relative',
			}}
		>
			<Stack spacing={isMobile ? 2 : 3}>
				{/* Enhanced Header */}
				<ConfigHeader isMobile={isMobile} creditStatus={creditStatus} />

				{/* Enhanced AI Toggle */}
				<AIToggle
					isMobile={isMobile}
					useAI={useAI}
					handleToggleAI={handleToggleAI}
					loading={loading}
					canUseAI={canUseAI}
					credits={credits}
				/>

				{/* Enhanced AI Options */}
				<Collapse in={useAI} timeout={400}>
					<Stack spacing={isMobile ? 2 : 3}>
						{/* Number of Questions with Validation */}
						<TextField
							label='Number of Questions'
							type='number'
							value={aiOptions.numQuestions || ''}
							onChange={handleNumQuestionsChange}
							onBlur={handleNumQuestionsBlur}
							inputProps={{
								min: 5,
								max: 50,
								style: { fontSize: isMobile ? '0.9rem' : '1rem' },
							}}
							disabled={loading}
							error={!!validationErrors.numQuestions}
							helperText={
								validationErrors.numQuestions ||
								'Generate between 5-50 questions'
							}
							sx={{
								flex: 1,
								'& .MuiInputLabel-root': {
									fontSize: isMobile ? '0.875rem' : '1rem',
								},
							}}
							size={isMobile ? 'small' : 'medium'}
						/>

						<DifficultyQualitySelector
							aiOptions={aiOptions}
							loading={loading}
							isMobile={isMobile}
							handleDifficultyChange={handleDifficultyChange}
							handleQualityChange={handleQualityChange}
						/>

						{/* Enhanced Custom Instructions Section */}
						<CustomInstructionsAccordion
							showCustomInstructions={showCustomInstructions}
							setShowCustomInstructions={setShowCustomInstructions}
							isMobile={isMobile}
							aiOptions={aiOptions}
							loading={loading}
							validationErrors={validationErrors}
							handleCustomInstructionsChange={handleCustomInstructionsChange}
							examplePrompts={examplePrompts}
							addExamplePrompt={addExamplePrompt}
						/>

						{/* Enhanced Current Configuration Summary */}
						<CurrentConfigSummary
							isMobile={isMobile}
							selectedDifficulty={selectedDifficulty}
							selectedQuality={selectedQuality}
							aiOptions={aiOptions}
							estimatedTime={estimatedTime}
						/>

						{/* Premium Quality Notice */}
						{aiOptions.quality === 'premium' && !isPremium && !isAdmin && (
							<Fade in={true} timeout={600}>
								<Alert
									severity='info'
									sx={{
										fontSize: isMobile ? '0.8rem' : '0.875rem',
										'& .MuiAlert-message': {
											padding: isMobile ? '4px 0' : '8px 0',
										},
									}}
								>
									<Typography
										variant='body2'
										sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
									>
										<strong>Premium Quality selected:</strong> This will use
										advanced validation and multiple quality passes, providing
										the highest quality questions but taking longer to generate.
									</Typography>
								</Alert>
							</Fade>
						)}

						{/* API Key Warning */}
						{!apiKey && (
							<Alert
								severity='warning'
								sx={{
									fontSize: isMobile ? '0.8rem' : '0.875rem',
									'& .MuiAlert-action': {
										paddingTop: 0,
									},
								}}
								action={
									<Button
										size='small'
										onClick={onReconfigure}
										sx={{
											fontSize: isMobile ? '0.75rem' : '0.8rem',
											minWidth: isMobile ? 'auto' : 'default',
											px: isMobile ? 1 : 2,
										}}
									>
										{isMobile ? 'Setup' : 'Configure Now'}
									</Button>
								}
							>
								API key not configured.
							</Alert>
						)}
					</Stack>
				</Collapse>
			</Stack>
		</Box>
	);
};

export default React.memo(ConfigPanel);
