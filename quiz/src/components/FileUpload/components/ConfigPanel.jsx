// src/components/ConfigPanel.jsx
import React, { useState, useCallback } from 'react';
import {
	Box,
	Typography,
	Stack,
	Switch,
	FormControlLabel,
	TextField,
	Alert,
	Button,
	Collapse,
	Chip,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Grid,
	Paper,
	IconButton,
	Tooltip,
	Accordion,
	AccordionSummary,
	AccordionDetails,
} from '@mui/material';
import {
	Settings,
	Coins,
	Crown,
	Zap,
	Clock,
	Target,
	MessageSquare,
	ChevronDown,
	Info,
	Sparkles,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const ConfigPanel = ({
	hasAI = false,
	apiKey,
	loading = false,
	initialOptions = {},
	onOptionsChange,
	onReconfigure,
}) => {
	// Get credit information
	const { credits, isPremium, isAdmin } = useAuth();

	// Ensure all values are defined to prevent controlled/uncontrolled issues
	const defaultOptions = {
		numQuestions: 10,
		difficulty: 'medium',
		quality: 'normal',
		questionType: 'mixed',
		useAI: false,
		useOCR: false, // 👈 new option

		customInstructions: '', // New field for custom instructions
		...initialOptions, // Allow overrides
	};

	const [useAI, setUseAI] = useState(hasAI || false);
	const [aiOptions, setAiOptions] = useState(defaultOptions);
	const [showCustomInstructions, setShowCustomInstructions] = useState(false);

	// Example prompts for custom instructions
	const examplePrompts = [
		'Focus on practical application questions',
		'Include real-world scenarios and examples',
		'Test critical thinking and analysis skills',
		'Make questions suitable for beginners',
		'Include questions about key terminology',
		'Focus on problem-solving abilities',
	];

	// Difficulty options with descriptions
	const difficultyOptions = [
		{
			value: 'easy',
			label: 'Easy',
			description: 'Basic recall and simple comprehension questions',
			icon: <Target size={16} color='#10B981' />,
		},
		{
			value: 'medium',
			label: 'Normal',
			description: 'Balanced mix of comprehension and application questions',
			icon: <Target size={16} color='#F59E0B' />,
		},
		{
			value: 'hard',
			label: 'Hard',
			description: 'Advanced analysis and critical thinking questions',
			icon: <Target size={16} color='#EF4444' />,
		},
	];

	// Quality options with descriptions
	const qualityOptions = [
		{
			value: 'quick',
			label: 'Quick',
			description: 'Fast generation with basic quality checks',
			icon: <Zap size={16} color='#8B5CF6' />,
			estimatedTime: '~30s',
		},
		{
			value: 'normal',
			label: 'Normal',
			description: 'Balanced quality and speed with good validation',
			icon: <Clock size={16} color='#3B82F6' />,
			estimatedTime: '~1-2min',
		},
		{
			value: 'premium',
			label: 'Premium',
			description: 'Highest quality with multiple validation passes',
			icon: <Crown size={16} color='#F59E0B' />,
			estimatedTime: '~2-4min',
		},
	];

	// Toggle AI
	const handleToggleAI = useCallback(
		(e) => {
			const checked = e.target.checked;
			setUseAI(checked);
			onOptionsChange?.({ ...aiOptions, useAI: checked });
		},
		[aiOptions, onOptionsChange]
	);
	const handleChange = (field, value) => {
		const newOptions = { ...aiOptions, [field]: value };
		setAiOptions(newOptions);
		onOptionsChange?.(newOptions);
	};
	// Number of questions
	const handleNumQuestionsChange = useCallback(
		(e) => {
			const num = e.target.value === '' ? '' : Number(e.target.value);
			const newOptions = { ...aiOptions, numQuestions: num };
			setAiOptions(newOptions);
			onOptionsChange?.(newOptions);
		},
		[aiOptions, onOptionsChange]
	);

	const handleNumQuestionsBlur = useCallback(
		(e) => {
			let val = Number(e.target.value);
			if (!val || val < 5) val = 5;
			if (val > 50) val = 50;
			const newOptions = { ...aiOptions, numQuestions: val };
			setAiOptions(newOptions);
			onOptionsChange?.(newOptions);
		},
		[aiOptions, onOptionsChange]
	);

	// Difficulty change handler
	const handleDifficultyChange = useCallback(
		(e) => {
			const newOptions = { ...aiOptions, difficulty: e.target.value };
			setAiOptions(newOptions);
			onOptionsChange?.(newOptions);
		},
		[aiOptions, onOptionsChange]
	);

	// Quality change handler
	const handleQualityChange = useCallback(
		(e) => {
			const newOptions = { ...aiOptions, quality: e.target.value };
			setAiOptions(newOptions);
			onOptionsChange?.(newOptions);
		},
		[aiOptions, onOptionsChange]
	);

	// Custom instructions handler
	const handleCustomInstructionsChange = useCallback(
		(e) => {
			const newOptions = { ...aiOptions, customInstructions: e.target.value };
			setAiOptions(newOptions);
			onOptionsChange?.(newOptions);
		},
		[aiOptions, onOptionsChange]
	);

	// Add example prompt to custom instructions
	const addExamplePrompt = useCallback(
		(prompt) => {
			const currentInstructions = aiOptions.customInstructions.trim();
			const newInstructions = currentInstructions
				? `${currentInstructions}\n${prompt}`
				: prompt;
			const newOptions = { ...aiOptions, customInstructions: newInstructions };
			setAiOptions(newOptions);
			onOptionsChange?.(newOptions);
		},
		[aiOptions, onOptionsChange]
	);

	const selectedDifficulty = difficultyOptions.find(
		(d) => d.value === aiOptions.difficulty
	);
	const selectedQuality = qualityOptions.find(
		(q) => q.value === aiOptions.quality
	);

	return (
		<Box
			sx={{
				borderRadius: 3,
				border: '1px solid',
				borderColor: 'divider',
				overflow: 'hidden',
				background: 'rgba(255, 255, 255, 0.6)',
				backdropFilter: 'blur(12px)',
				p: 3,
			}}
		>
			<Stack spacing={3}>
				{/* Header */}
				<Stack direction='row' alignItems='center' spacing={2} sx={{ mb: 2 }}>
					<Box
						sx={{
							width: 40,
							height: 40,
							borderRadius: 1,
							background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: 'white',
						}}
					>
						<Settings size={20} />
					</Box>
					<Box sx={{ flex: 1 }}>
						<Typography variant='h6' sx={{ fontWeight: 600 }}>
							AI Quiz Generation Settings
						</Typography>
						{/* Credit status */}
						<Stack direction='row' spacing={1} sx={{ mt: 0.5 }}>
							{isPremium ? (
								<Chip
									icon={<Crown size={12} />}
									label='Premium - Unlimited'
									size='small'
									sx={{
										height: 20,
										fontSize: '0.7rem',
										background:
											'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
										color: 'white',
										fontWeight: 600,
									}}
								/>
							) : isAdmin ? (
								<Chip
									icon={<Crown size={12} />}
									label='Admin - Unlimited'
									size='small'
									sx={{
										height: 20,
										fontSize: '0.7rem',
										background:
											'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
										color: 'white',
										fontWeight: 600,
									}}
								/>
							) : (
								<Chip
									icon={<Coins size={12} />}
									label={`${credits} Credits - 1 per quiz`}
									size='small'
									sx={{
										height: 20,
										fontSize: '0.7rem',
										background:
											credits > 0
												? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
												: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
										color: 'white',
										fontWeight: 600,
									}}
								/>
							)}
						</Stack>
					</Box>
				</Stack>

				{/* Enable AI */}
				<FormControlLabel
					control={
						<Switch
							checked={useAI || false}
							onChange={handleToggleAI}
							disabled={loading || (!isPremium && !isAdmin && credits <= 0)}
						/>
					}
					label={
						<Box>
							<Typography component='span'>
								Enable AI-powered custom question generation
							</Typography>
							{!isPremium && !isAdmin && credits <= 0 && (
								<Typography variant='caption' color='error' display='block'>
									No credits remaining - upgrade to Premium or wait for daily
									reset
								</Typography>
							)}
						</Box>
					}
				/>
				<FormControlLabel
					control={
						<Switch
							checked={aiOptions.useOCR}
							onChange={(e) => handleChange('useOCR', e.target.checked)}
							disabled={loading}
						/>
					}
					label={
						<Box>
							<Typography component='span'>
								Enable OCR (for scanned PDFs / images)
							</Typography>
							<Typography
								variant='caption'
								color='text.secondary'
								display='block'
							>
								Uses optical character recognition if text extraction fails
							</Typography>
						</Box>
					}
				/>
				{/* AI Options */}
				<Collapse in={useAI}>
					<Stack spacing={3}>
						{/* Number of Questions */}
						<TextField
							label='Number of Questions'
							type='number'
							value={aiOptions.numQuestions || 10}
							onChange={handleNumQuestionsChange}
							onBlur={handleNumQuestionsBlur}
							inputProps={{ min: 5, max: 50 }}
							disabled={loading}
							helperText='Generate between 5-50 questions'
							sx={{ flex: 1 }}
						/>

						{/* Difficulty and Quality Selection */}
						<Grid container spacing={2}>
							{/* Difficulty Selection */}
							<Grid item xs={12} sm={6}>
								<FormControl fullWidth disabled={loading}>
									<InputLabel>Difficulty Level</InputLabel>
									<Select
										value={aiOptions.difficulty}
										label='Difficulty Level'
										onChange={handleDifficultyChange}
									>
										{difficultyOptions.map((option) => (
											<MenuItem key={option.value} value={option.value}>
												<Box
													sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
												>
													{option.icon}
													<Box>
														<Typography
															variant='body2'
															sx={{ fontWeight: 500 }}
														>
															{option.label}
														</Typography>
														<Typography
															variant='caption'
															color='text.secondary'
														>
															{option.description}
														</Typography>
													</Box>
												</Box>
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Grid>

							{/* Quality Selection */}
							<Grid item xs={12} sm={6}>
								<FormControl fullWidth disabled={loading}>
									<InputLabel>Generation Quality</InputLabel>
									<Select
										value={aiOptions.quality}
										label='Generation Quality'
										onChange={handleQualityChange}
									>
										{qualityOptions.map((option) => (
											<MenuItem key={option.value} value={option.value}>
												<Box
													sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
												>
													{option.icon}
													<Box>
														<Typography
															variant='body2'
															sx={{ fontWeight: 500 }}
														>
															{option.label}
														</Typography>
														<Typography
															variant='caption'
															color='text.secondary'
														>
															{option.description}
														</Typography>
													</Box>
												</Box>
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Grid>
						</Grid>

						{/* Custom Instructions Section */}
						<Accordion
							expanded={showCustomInstructions}
							onChange={() =>
								setShowCustomInstructions(!showCustomInstructions)
							}
							sx={{
								backgroundColor: 'rgba(139, 92, 246, 0.05)',
								border: '1px solid rgba(139, 92, 246, 0.2)',
								borderRadius: 2,
								'&:before': { display: 'none' },
								boxShadow: 'none',
							}}
						>
							<AccordionSummary
								expandIcon={<ChevronDown size={20} />}
								sx={{ minHeight: 48, '&.Mui-expanded': { minHeight: 48 } }}
							>
								<Stack direction='row' spacing={1} alignItems='center'>
									<Sparkles size={18} color='#8B5CF6' />
									<Typography
										variant='subtitle1'
										sx={{ fontWeight: 600, color: '#6B46C1' }}
									>
										Custom Instructions (Optional)
									</Typography>
									<Tooltip title='Add specific requirements for your quiz questions'>
										<Info size={16} color='#9CA3AF' />
									</Tooltip>
								</Stack>
							</AccordionSummary>
							<AccordionDetails>
								<Stack spacing={2}>
									<TextField
										multiline
										rows={4}
										placeholder="Add your custom instructions here... (e.g., 'Focus on Chapter 3', 'Include calculation problems', 'Test understanding of key concepts')"
										value={aiOptions.customInstructions}
										onChange={handleCustomInstructionsChange}
										disabled={loading}
										sx={{
											'& .MuiOutlinedInput-root': {
												fontSize: { xs: '0.875rem', sm: '1rem' },
											},
										}}
										InputProps={{
											startAdornment: (
												<MessageSquare
													size={18}
													color='#9CA3AF'
													style={{ marginRight: 8, marginTop: 12 }}
												/>
											),
										}}
									/>

									{/* Example prompts */}
									<Box>
										<Typography
											variant='caption'
											color='text.secondary'
											sx={{ mb: 1, display: 'block' }}
										>
											Quick examples (click to add):
										</Typography>
										<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
											{examplePrompts.map((prompt, index) => (
												<Chip
													key={index}
													label={prompt}
													size='small'
													onClick={() => addExamplePrompt(prompt)}
													sx={{
														cursor: 'pointer',
														fontSize: { xs: '0.75rem', sm: '0.8125rem' },
														'&:hover': {
															backgroundColor: 'rgba(139, 92, 246, 0.15)',
															transform: 'scale(1.05)',
															transition: 'all 0.2s',
														},
													}}
												/>
											))}
										</Box>
									</Box>

									{aiOptions.customInstructions && (
										<Alert
											severity='info'
											sx={{
												fontSize: { xs: '0.75rem', sm: '0.875rem' },
												'& .MuiAlert-icon': {
													fontSize: { xs: '1rem', sm: '1.25rem' },
												},
											}}
										>
											Your custom instructions will guide the AI while
											maintaining question quality and format standards.
										</Alert>
									)}
								</Stack>
							</AccordionDetails>
						</Accordion>

						{/* Current Selection Summary */}
						<Paper
							sx={{
								p: 2,
								backgroundColor: 'rgba(99, 102, 241, 0.05)',
								border: '1px solid rgba(99, 102, 241, 0.2)',
								borderRadius: 2,
							}}
						>
							<Typography
								variant='subtitle2'
								sx={{ fontWeight: 600, mb: 1, color: '#4F46E5' }}
							>
								Current Configuration
							</Typography>
							<Grid container spacing={1}>
								<Grid item xs={12} sm={6}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										{selectedDifficulty?.icon}
										<Typography variant='body2'>
											<strong>Difficulty:</strong> {selectedDifficulty?.label}
										</Typography>
									</Box>
								</Grid>
								<Grid item xs={12} sm={6}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										{selectedQuality?.icon}
										<Typography variant='body2'>
											<strong>Quality:</strong> {selectedQuality?.label}
										</Typography>
									</Box>
								</Grid>
								{aiOptions.customInstructions && (
									<Grid item xs={12}>
										<Box
											sx={{
												display: 'flex',
												alignItems: 'flex-start',
												gap: 1,
												mt: 1,
											}}
										>
											<MessageSquare
												size={16}
												color='#8B5CF6'
												style={{ marginTop: 2 }}
											/>
											<Box>
												<Typography variant='body2' sx={{ fontWeight: 500 }}>
													Custom Instructions:
												</Typography>
												<Typography
													variant='caption'
													color='text.secondary'
													sx={{
														display: 'block',
														whiteSpace: 'pre-wrap',
														wordBreak: 'break-word',
														maxHeight: 60,
														overflow: 'auto',
														fontSize: { xs: '0.7rem', sm: '0.75rem' },
													}}
												>
													{aiOptions.customInstructions}
												</Typography>
											</Box>
										</Box>
									</Grid>
								)}
								<Grid item xs={12}>
									<Typography
										variant='caption'
										color='text.secondary'
										sx={{
											display: 'flex',
											alignItems: 'center',
											gap: 1,
											lineHeight: 1.75,
											padding: '0 4px',
											fontSize: { xs: '0.7rem', sm: '0.75rem' },
										}}
									>
										Estimated generation time:{' '}
										{selectedQuality?.estimatedTime || '~1-2min'}
									</Typography>
								</Grid>
							</Grid>
						</Paper>

						{/* Premium Quality Notice */}
						{aiOptions.quality === 'premium' && !isPremium && !isAdmin && (
							<Alert severity='info' sx={{ mt: 2 }}>
								<Typography variant='body2'>
									<strong>Premium Quality selected:</strong> This will use
									advanced validation and multiple quality passes, providing the
									highest quality questions but taking longer to generate.
								</Typography>
							</Alert>
						)}

						{/* API Key Warning */}
						{!apiKey && (
							<Alert severity='warning' sx={{ mt: 2 }}>
								API key not configured.
								<Button size='small' onClick={onReconfigure} sx={{ ml: 1 }}>
									Configure Now
								</Button>
							</Alert>
						)}
					</Stack>
				</Collapse>
			</Stack>
		</Box>
	);
};

export default ConfigPanel;
