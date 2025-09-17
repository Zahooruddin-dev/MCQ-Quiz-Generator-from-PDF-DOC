// src/components/ConfigPanel.jsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
	useTheme,
	useMediaQuery,
	Fade,
	Zoom,
} from '@mui/material';

import {
	Settings,
	Coins,
	Crown,
	MessageSquare,
	ChevronDown,
	Info,
	Sparkles,
	Zap,
	CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
// Import separated constants
import examplePrompts from './ConfigPanel/examplePrompts';
import difficultyOptions from './ConfigPanel/difficultyOptions';
import qualityOptions from './ConfigPanel/qualityOptions';

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
	const defaultOptions = useMemo(() => ({
		numQuestions: 10,
		difficulty: 'medium',
		quality: 'normal',
		questionType: 'mixed',
		useAI: false,
		customInstructions: '',
		...initialOptions,
	}), [initialOptions]);

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
		if (isPremium) return { type: 'premium', label: 'Premium - Unlimited', color: '#FFD700' };
		if (isAdmin) return { type: 'admin', label: 'Admin - Unlimited', color: '#EF4444' };
		return { 
			type: 'free', 
			label: `${credits} Credits - 1 per quiz`, 
			color: credits > 0 ? '#10B981' : '#EF4444' 
		};
	}, [isPremium, isAdmin, credits]);

	// Memoized AI availability
	const canUseAI = useMemo(() => 
		isPremium || isAdmin || credits > 0
	, [isPremium, isAdmin, credits]);

	// Validation function
	const validateOptions = useCallback((options) => {
		const errors = {};
		
		if (!options.numQuestions || options.numQuestions < 5 || options.numQuestions > 50) {
			errors.numQuestions = 'Must be between 5 and 50 questions';
		}
		
		if (options.customInstructions && options.customInstructions.length > 1000) {
			errors.customInstructions = 'Custom instructions must be under 1000 characters';
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	}, []);

	// Optimized option change handler
	const handleOptionChange = useCallback((newOptions) => {
		setAiOptions(newOptions);
		if (validateOptions(newOptions)) {
			onOptionsChange?.(newOptions);
		}
	}, [onOptionsChange, validateOptions]);

	// Toggle AI handler
	const handleToggleAI = useCallback((e) => {
		const checked = e.target.checked;
		setUseAI(checked);
		const newOptions = { ...aiOptions, useAI: checked };
		handleOptionChange(newOptions);
	}, [aiOptions, handleOptionChange]);

	// Number of questions handlers
	const handleNumQuestionsChange = useCallback((e) => {
		const value = e.target.value === '' ? '' : Number(e.target.value);
		const newOptions = { ...aiOptions, numQuestions: value };
		handleOptionChange(newOptions);
	}, [aiOptions, handleOptionChange]);

	const handleNumQuestionsBlur = useCallback((e) => {
		let val = Number(e.target.value) || 10;
		val = Math.max(5, Math.min(50, val));
		const newOptions = { ...aiOptions, numQuestions: val };
		handleOptionChange(newOptions);
	}, [aiOptions, handleOptionChange]);

	// Select handlers
	const handleDifficultyChange = useCallback((e) => {
		const newOptions = { ...aiOptions, difficulty: e.target.value };
		handleOptionChange(newOptions);
	}, [aiOptions, handleOptionChange]);

	const handleQualityChange = useCallback((e) => {
		const newOptions = { ...aiOptions, quality: e.target.value };
		handleOptionChange(newOptions);
	}, [aiOptions, handleOptionChange]);

	// Custom instructions handler with debouncing
	const handleCustomInstructionsChange = useCallback((e) => {
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
	}, [aiOptions, onOptionsChange, validateOptions]);

	// Add example prompt handler
	const addExamplePrompt = useCallback((prompt) => {
		const currentInstructions = aiOptions.customInstructions.trim();
		const newInstructions = currentInstructions
			? `${currentInstructions}\n${prompt}`
			: prompt;
		const newOptions = { ...aiOptions, customInstructions: newInstructions };
		handleOptionChange(newOptions);
	}, [aiOptions, handleOptionChange]);

	// Memoized selected options
	const selectedDifficulty = useMemo(() => 
		difficultyOptions.find(d => d.value === aiOptions.difficulty),
		[aiOptions.difficulty]
	);

	const selectedQuality = useMemo(() => 
		qualityOptions.find(q => q.value === aiOptions.quality),
		[aiOptions.quality]
	);

	// Memoized estimated time
	const estimatedTime = useMemo(() => {
		const baseTime = selectedQuality?.estimatedTime || '~1-2min';
		const questionMultiplier = aiOptions.numQuestions > 20 ? ' (longer for 20+ questions)' : '';
		return baseTime + questionMultiplier;
	}, [selectedQuality, aiOptions.numQuestions]);

	return (
		<Box
			sx={{
				borderRadius: isMobile ? 2 : 3,
				border: '1px solid',
				borderColor: 'divider',
				overflow: 'hidden',
				background: isMobile ? 
					'rgba(255, 255, 255, 0.95)' : 
					'rgba(255, 255, 255, 0.6)',
				backdropFilter: 'blur(12px)',
				p: isMobile ? 2 : 3,
				position: 'relative',
			}}
		>
			<Stack spacing={isMobile ? 2 : 3}>
				{/* Enhanced Header */}
				<Stack 
					direction={isMobile ? 'column' : 'row'} 
					alignItems={isMobile ? 'stretch' : 'center'} 
					spacing={2} 
					sx={{ mb: isMobile ? 1 : 2 }}
				>
					<Stack 
						direction="row" 
						alignItems="center" 
						spacing={2}
						sx={{ flex: 1 }}
					>
						<Zoom in={true} timeout={600}>
							<Box
								sx={{
									width: isMobile ? 36 : 40,
									height: isMobile ? 36 : 40,
									borderRadius: 1,
									background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: 'white',
									boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
								}}
							>
								<Settings size={isMobile ? 18 : 20} />
							</Box>
						</Zoom>
						
						<Box sx={{ flex: 1 }}>
							<Typography 
								variant={isMobile ? 'subtitle1' : 'h6'} 
								sx={{ 
									fontWeight: 600,
									fontSize: isMobile ? '1.1rem' : '1.25rem',
									lineHeight: 1.2,
								}}
							>
								{isMobile ? 'AI Quiz Settings' : 'AI Quiz Generation Settings'}
							</Typography>
							
							{/* Enhanced Credit Status */}
							<Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
								<Fade in={true} timeout={800}>
									<Chip
										icon={creditStatus.type === 'free' ? 
											<Coins size={12} /> : 
											<Crown size={12} />
										}
										label={creditStatus.label}
										size="small"
										sx={{
											height: isMobile ? 18 : 20,
											fontSize: isMobile ? '0.65rem' : '0.7rem',
											background: `linear-gradient(135deg, ${creditStatus.color} 0%, ${creditStatus.color}AA 100%)`,
											color: 'white',
											fontWeight: 600,
											'& .MuiChip-icon': {
												fontSize: isMobile ? 10 : 12,
											},
										}}
									/>
								</Fade>
							</Stack>
						</Box>
					</Stack>
				</Stack>

				{/* Enhanced AI Toggle */}
				<Paper
					sx={{
						p: isMobile ? 1.5 : 2,
						borderRadius: 2,
						bgcolor: useAI ? 'rgba(99, 102, 241, 0.05)' : 'rgba(0, 0, 0, 0.02)',
						border: useAI ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid',
						borderColor: useAI ? 'rgba(99, 102, 241, 0.2)' : 'divider',
						transition: 'all 0.3s ease',
					}}
				>
					<FormControlLabel
						control={
							<Switch
								checked={useAI || false}
								onChange={handleToggleAI}
								disabled={loading || !canUseAI}
								sx={{
									'& .MuiSwitch-thumb': {
										boxShadow: useAI ? '0 2px 8px rgba(99, 102, 241, 0.4)' : 'default',
									},
								}}
							/>
						}
						label={
							<Box>
								<Stack direction="row" alignItems="center" spacing={1}>
									<Typography 
										component="span"
										sx={{ 
											fontSize: isMobile ? '0.9rem' : '1rem',
											fontWeight: 500,
										}}
									>
										Enable AI-powered question generation
									</Typography>
									{useAI && <Zap size={16} color="#6366F1" />}
								</Stack>
								{!canUseAI && (
									<Typography 
										variant="caption" 
										color="error" 
										display="block"
										sx={{ fontSize: isMobile ? '0.75rem' : '0.8rem' }}
									>
										{credits <= 0 ? 
											'No credits remaining - upgrade to Premium or wait for daily reset' :
											'AI features require credits or Premium subscription'
										}
									</Typography>
								)}
							</Box>
						}
						sx={{
							margin: 0,
							width: '100%',
							alignItems: 'flex-start',
						}}
					/>
				</Paper>

				{/* Enhanced AI Options */}
				<Collapse in={useAI} timeout={400}>
					<Stack spacing={isMobile ? 2 : 3}>
						{/* Number of Questions with Validation */}
						<TextField
							label="Number of Questions"
							type="number"
							value={aiOptions.numQuestions || ''}
							onChange={handleNumQuestionsChange}
							onBlur={handleNumQuestionsBlur}
							inputProps={{ 
								min: 5, 
								max: 50,
								style: { fontSize: isMobile ? '0.9rem' : '1rem' }
							}}
							disabled={loading}
							error={!!validationErrors.numQuestions}
							helperText={validationErrors.numQuestions || 'Generate between 5-50 questions'}
							sx={{ 
								flex: 1,
								'& .MuiInputLabel-root': {
									fontSize: isMobile ? '0.875rem' : '1rem',
								},
							}}
							size={isMobile ? "small" : "medium"}
						/>

						{/* Enhanced Difficulty and Quality Selection */}
						<Grid container spacing={isMobile ? 1 : 2}>
							{/* Difficulty Selection */}
							<Grid item xs={12} sm={6}>
								<FormControl fullWidth disabled={loading} size={isMobile ? "small" : "medium"}>
									<InputLabel 
										sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
									>
										Difficulty Level
									</InputLabel>
									<Select
										value={aiOptions.difficulty}
										label="Difficulty Level"
										onChange={handleDifficultyChange}
										sx={{
											'& .MuiSelect-select': {
												fontSize: isMobile ? '0.875rem' : '1rem',
											},
										}}
									>
										{difficultyOptions.map((option) => (
											<MenuItem key={option.value} value={option.value}>
												<Box
													sx={{ 
														display: 'flex', 
														alignItems: 'center', 
														gap: 1,
														width: '100%',
													}}
												>
													{React.cloneElement(option.icon, { 
														size: isMobile ? 16 : 18 
													})}
													<Box sx={{ flex: 1 }}>
														<Typography
															variant="body2"
															sx={{ 
																fontWeight: 500,
																fontSize: isMobile ? '0.85rem' : '0.875rem',
															}}
														>
															{option.label}
														</Typography>
														<Typography
															variant="caption"
															color="text.secondary"
															sx={{ 
																fontSize: isMobile ? '0.7rem' : '0.75rem',
																lineHeight: 1.2,
															}}
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
								<FormControl fullWidth disabled={loading} size={isMobile ? "small" : "medium"}>
									<InputLabel
										sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
									>
										Generation Quality
									</InputLabel>
									<Select
										value={aiOptions.quality}
										label="Generation Quality"
										onChange={handleQualityChange}
										sx={{
											'& .MuiSelect-select': {
												fontSize: isMobile ? '0.875rem' : '1rem',
											},
										}}
									>
										{qualityOptions.map((option) => (
											<MenuItem key={option.value} value={option.value}>
												<Box
													sx={{ 
														display: 'flex', 
														alignItems: 'center', 
														gap: 1,
														width: '100%',
													}}
												>
													{React.cloneElement(option.icon, { 
														size: isMobile ? 16 : 18 
													})}
													<Box sx={{ flex: 1 }}>
														<Typography
															variant="body2"
															sx={{ 
																fontWeight: 500,
																fontSize: isMobile ? '0.85rem' : '0.875rem',
															}}
														>
															{option.label}
														</Typography>
														<Typography
															variant="caption"
															color="text.secondary"
															sx={{ 
																fontSize: isMobile ? '0.7rem' : '0.75rem',
																lineHeight: 1.2,
															}}
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

						{/* Enhanced Custom Instructions Section */}
						<Accordion
							expanded={showCustomInstructions}
							onChange={() => setShowCustomInstructions(!showCustomInstructions)}
							sx={{
								backgroundColor: 'rgba(139, 92, 246, 0.05)',
								border: '1px solid rgba(139, 92, 246, 0.2)',
								borderRadius: 2,
								'&:before': { display: 'none' },
								boxShadow: 'none',
								'& .MuiAccordionSummary-root': {
									minHeight: isMobile ? 44 : 48,
									'&.Mui-expanded': { minHeight: isMobile ? 44 : 48 },
								},
							}}
						>
							<AccordionSummary
								expandIcon={<ChevronDown size={isMobile ? 18 : 20} />}
							>
								<Stack direction="row" spacing={1} alignItems="center">
									<Sparkles size={isMobile ? 16 : 18} color="#8B5CF6" />
									<Typography
										variant={isMobile ? 'body1' : 'subtitle1'}
										sx={{ 
											fontWeight: 600, 
											color: '#6B46C1',
											fontSize: isMobile ? '0.9rem' : '1rem',
										}}
									>
										Custom Instructions {!isMobile && '(Optional)'}
									</Typography>
									<Tooltip title="Add specific requirements for your quiz questions">
										<Info size={isMobile ? 14 : 16} color="#9CA3AF" />
									</Tooltip>
								</Stack>
							</AccordionSummary>
							
							<AccordionDetails sx={{ px: isMobile ? 1 : 2 }}>
								<Stack spacing={2}>
									<TextField
										multiline
										rows={isMobile ? 3 : 4}
										placeholder={isMobile ? 
											"e.g., 'Focus on Chapter 3', 'Include calculations'..." :
											"Add your custom instructions here... (e.g., 'Focus on Chapter 3', 'Include calculation problems', 'Test understanding of key concepts')"
										}
										value={aiOptions.customInstructions}
										onChange={handleCustomInstructionsChange}
										disabled={loading}
										error={!!validationErrors.customInstructions}
										helperText={validationErrors.customInstructions || 
											`${aiOptions.customInstructions.length}/1000 characters`}
										sx={{
											'& .MuiOutlinedInput-root': {
												fontSize: isMobile ? '0.85rem' : '1rem',
											},
										}}
										InputProps={{
											startAdornment: (
												<MessageSquare
													size={isMobile ? 16 : 18}
													color="#9CA3AF"
													style={{ 
														marginRight: 8, 
														marginTop: isMobile ? 8 : 12,
														flexShrink: 0,
													}}
												/>
											),
										}}
										size={isMobile ? "small" : "medium"}
									/>

									{/* Enhanced Example prompts */}
									<Box>
										<Typography
											variant="caption"
											color="text.secondary"
											sx={{ 
												mb: 1, 
												display: 'block',
												fontSize: isMobile ? '0.7rem' : '0.75rem',
											}}
										>
											Quick examples (tap to add):
										</Typography>
										<Box sx={{ 
											display: 'flex', 
											flexWrap: 'wrap', 
											gap: isMobile ? 0.5 : 1 
										}}>
											{examplePrompts.map((prompt, index) => (
												<Chip
													key={index}
													label={prompt}
													size="small"
													onClick={() => addExamplePrompt(prompt)}
													sx={{
														cursor: 'pointer',
														fontSize: isMobile ? '0.7rem' : '0.8125rem',
														height: isMobile ? 24 : 28,
														'&:hover': {
															backgroundColor: 'rgba(139, 92, 246, 0.15)',
															transform: isMobile ? 'none' : 'scale(1.05)',
															transition: 'all 0.2s',
														},
														'&:active': {
															transform: 'scale(0.95)',
														},
													}}
												/>
											))}
										</Box>
									</Box>

									{aiOptions.customInstructions && (
										<Fade in={true} timeout={500}>
											<Alert
												severity="info"
												icon={<CheckCircle size={16} />}
												sx={{
													fontSize: isMobile ? '0.75rem' : '0.875rem',
													'& .MuiAlert-icon': {
														fontSize: isMobile ? '1rem' : '1.25rem',
													},
												}}
											>
												Your custom instructions will guide the AI while
												maintaining question quality and format standards.
											</Alert>
										</Fade>
									)}
								</Stack>
							</AccordionDetails>
						</Accordion>

						{/* Enhanced Current Configuration Summary */}
						<Paper
							sx={{
								p: isMobile ? 1.5 : 2,
								backgroundColor: 'rgba(99, 102, 241, 0.05)',
								border: '1px solid rgba(99, 102, 241, 0.2)',
								borderRadius: 2,
								position: 'relative',
								overflow: 'hidden',
							}}
						>
							<Typography
								variant="subtitle2"
								sx={{ 
									fontWeight: 600, 
									mb: 1, 
									color: '#4F46E5',
									fontSize: isMobile ? '0.85rem' : '0.875rem',
								}}
							>
								Current Configuration
							</Typography>
							
							<Grid container spacing={1}>
								<Grid item xs={12} sm={6}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										{selectedDifficulty?.icon && 
											React.cloneElement(selectedDifficulty.icon, { 
												size: isMobile ? 14 : 16 
											})
										}
										<Typography 
											variant="body2"
											sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
										>
											<strong>Difficulty:</strong> {selectedDifficulty?.label}
										</Typography>
									</Box>
								</Grid>
								
								<Grid item xs={12} sm={6}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										{selectedQuality?.icon && 
											React.cloneElement(selectedQuality.icon, { 
												size: isMobile ? 14 : 16 
											})
										}
										<Typography 
											variant="body2"
											sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
										>
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
												size={isMobile ? 14 : 16}
												color="#8B5CF6"
												style={{ marginTop: 2, flexShrink: 0 }}
											/>
											<Box sx={{ flex: 1 }}>
												<Typography 
													variant="body2" 
													sx={{ 
														fontWeight: 500,
														fontSize: isMobile ? '0.8rem' : '0.875rem',
													}}
												>
													Custom Instructions:
												</Typography>
												<Typography
													variant="caption"
													color="text.secondary"
													sx={{
														display: 'block',
														whiteSpace: 'pre-wrap',
														wordBreak: 'break-word',
														maxHeight: isMobile ? 40 : 60,
														overflow: 'auto',
														fontSize: isMobile ? '0.65rem' : '0.75rem',
														lineHeight: 1.3,
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
										variant="caption"
										color="text.secondary"
										sx={{
											display: 'flex',
											alignItems: 'center',
											gap: 1,
											lineHeight: 1.4,
											fontSize: isMobile ? '0.65rem' : '0.75rem',
											mt: 0.5,
										}}
									>
										⏱️ Estimated time: {estimatedTime}
									</Typography>
								</Grid>
							</Grid>
						</Paper>

						{/* Premium Quality Notice */}
						{aiOptions.quality === 'premium' && !isPremium && !isAdmin && (
							<Fade in={true} timeout={600}>
								<Alert 
									severity="info" 
									sx={{ 
										fontSize: isMobile ? '0.8rem' : '0.875rem',
										'& .MuiAlert-message': {
											padding: isMobile ? '4px 0' : '8px 0',
										},
									}}
								>
									<Typography 
										variant="body2"
										sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
									>
										<strong>Premium Quality selected:</strong> This will use
										advanced validation and multiple quality passes, providing the
										highest quality questions but taking longer to generate.
									</Typography>
								</Alert>
							</Fade>
						)}

						{/* API Key Warning */}
						{!apiKey && (
							<Alert 
								severity="warning" 
								sx={{ 
									fontSize: isMobile ? '0.8rem' : '0.875rem',
									'& .MuiAlert-action': {
										paddingTop: 0,
									},
								}}
								action={
									<Button 
										size="small" 
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