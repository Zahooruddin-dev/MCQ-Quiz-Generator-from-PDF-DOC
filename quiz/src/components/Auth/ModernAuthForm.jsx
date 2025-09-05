import React, { useState } from 'react';
import {
	Box,
	Card,
	CardContent,
	Typography,
	TextField,
	Button,
	Stack,
	Divider,
	Alert,
	IconButton,
	InputAdornment,
	Chip,
	Paper,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
	Eye,
	EyeOff,
	Mail,
	Lock,
	User,
	ArrowRight,
	Brain,
	Shield,
	Zap,
	CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { auth, db } from '../../firebaseConfig';
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	sendPasswordResetEmail,
	updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

// Styled Components
const AuthContainer = styled(Box)(({ theme }) => ({
	minHeight: '100vh',
	background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	padding: theme.spacing(2),
	position: 'relative',
	overflow: 'hidden',
	'&::before': {
		content: '""',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		background:
			'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
		pointerEvents: 'none',
	},
}));

const FloatingElement = styled(Box)(({ delay = 0 }) => ({
	position: 'absolute',
	animation: `${float} 6s ease-in-out infinite`,
	animationDelay: `${delay}s`,
	opacity: 0.1,
	pointerEvents: 'none',
}));

const AuthCard = styled(Card)(({ theme }) => ({
	maxWidth: 480,
	width: '100%',
	background: 'rgba(255, 255, 255, 0.95)',
	backdropFilter: 'blur(20px)',
	border: '1px solid rgba(255, 255, 255, 0.2)',
	borderRadius: theme.shape.borderRadius * 3,
	boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
	animation: `${slideInUp} 0.6s ease-out`,
}));

const BrandSection = styled(Box)(({ theme }) => ({
	textAlign: 'center',
	marginBottom: theme.spacing(4),
}));

const LogoIcon = styled(Box)(({ theme }) => ({
	width: 64,
	height: 64,
	borderRadius: theme.shape.borderRadius * 2,
	background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	color: 'white',
	margin: '0 auto',
	marginBottom: theme.spacing(2),
	animation: `${pulse} 2s infinite`,
}));

const FeatureChip = styled(Chip)(({ theme }) => ({
	background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
	border: '1px solid',
	borderColor: theme.palette.primary.light + '30',
	fontWeight: 500,
	'& .MuiChip-icon': {
		color: theme.palette.primary.main,
	},
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
	'& .MuiOutlinedInput-root': {
		borderRadius: theme.shape.borderRadius * 1.5,
		transition: 'all 0.3s ease',
		'&:hover': {
			'& .MuiOutlinedInput-notchedOutline': {
				borderColor: theme.palette.primary.main,
			},
		},
		'&.Mui-focused': {
			'& .MuiOutlinedInput-notchedOutline': {
				borderWidth: '2px',
				borderColor: theme.palette.primary.main,
			},
		},
	},
}));

const GradientButton = styled(Button)(({ theme }) => ({
	background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
	borderRadius: theme.shape.borderRadius * 1.5,
	padding: theme.spacing(1.5, 3),
	fontWeight: 600,
	fontSize: '1rem',
	textTransform: 'none',
	boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
	transition: 'all 0.3s ease',
	'&:hover': {
		background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
		transform: 'translateY(-2px)',
		boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
	},
	'&:active': {
		transform: 'translateY(0)',
	},
}));

const GoogleButton = styled(Button)(({ theme }) => ({
	borderRadius: theme.shape.borderRadius * 1.5,
	padding: theme.spacing(1.5, 3),
	fontWeight: 600,
	fontSize: '1rem',
	textTransform: 'none',
	border: '2px solid',
	borderColor: theme.palette.grey[300],
	color: theme.palette.text.primary,
	transition: 'all 0.3s ease',
	'&:hover': {
		borderColor: theme.palette.primary.main,
		background: `${theme.palette.primary.main}08`,
		transform: 'translateY(-1px)',
	},
}));

// Firebase error mapping
const getFriendlyError = (code) => {
	const errors = {
		'auth/email-already-in-use': 'This email is already registered.',
		'auth/invalid-email': 'Please enter a valid email address.',
		'auth/weak-password': 'Password must be at least 6 characters.',
		'auth/user-not-found': 'No account found with this email.',
		'auth/wrong-password': 'Incorrect password.',
		'auth/missing-password': 'Please enter your password.',
		'auth/too-many-requests':
			'Too many failed attempts. Please try again later.',
	};
	return errors[code] || 'Something went wrong. Please try again.';
};

const ModernAuthForm = () => {
	const { loginWithGoogle } = useAuth();
	const [isSignup, setIsSignup] = useState(false);
	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');
	const [successMsg, setSuccessMsg] = useState('');
	const [loading, setLoading] = useState(false);

	const features = [
		{ icon: <Brain size={16} />, label: 'AI-Powered' },
		{ icon: <Zap size={16} />, label: 'Lightning Fast' },
		{ icon: <Shield size={16} />, label: 'Secure' },
	];

	// Handle signup
	const handleSignup = async () => {
		const userCred = await createUserWithEmailAndPassword(
			auth,
			email,
			password
		);

		// Update profile with username
		await updateProfile(userCred.user, { displayName: username });

		// Save user record in Firestore
		await setDoc(doc(db, 'users', userCred.user.uid), {
			displayName: username,
			email: email,
			credits: 5,
			createdAt: serverTimestamp(),
		});

		setSuccessMsg('Account created successfully! Welcome to QuizAI!');
	};

	// Handle login
	const handleLogin = async () => {
		await signInWithEmailAndPassword(auth, email, password);
		setSuccessMsg('Welcome back! Redirecting to your dashboard...');
	};

	// Form submit wrapper
	const handleAuth = async (e) => {
		e.preventDefault();
		setError('');
		setSuccessMsg('');
		setLoading(true);

		try {
			if (isSignup) {
				await handleSignup();
			} else {
				await handleLogin();
			}
		} catch (err) {
			setError(getFriendlyError(err.code));
		} finally {
			setLoading(false);
		}
	};

	// Forgot password
	const handleForgotPassword = async () => {
		if (!email) {
			setError('Please enter your email first.');
			return;
		}

		try {
			await sendPasswordResetEmail(auth, email);
			setSuccessMsg('Password reset email sent! Check your inbox.');
		} catch (err) {
			setError(getFriendlyError(err.code));
		}
	};

	const handleGoogleLogin = async () => {
		setLoading(true);
		try {
			await loginWithGoogle();
			setSuccessMsg('Successfully signed in with Google!');
		} catch (err) {
			setError('Failed to sign in with Google. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthContainer>
			{/* Floating Elements */}
			<FloatingElement sx={{ top: '10%', left: '10%' }} delay={0}>
				<Brain size={40} />
			</FloatingElement>
			<FloatingElement sx={{ top: '20%', right: '15%' }} delay={2}>
				<Zap size={50} />
			</FloatingElement>
			<FloatingElement sx={{ bottom: '30%', left: '20%' }} delay={4}>
				<Shield size={35} />
			</FloatingElement>
			<FloatingElement sx={{ bottom: '20%', right: '10%' }} delay={1}>
				<CheckCircle size={45} />
			</FloatingElement>

			<AuthCard>
				<CardContent sx={{ p: 4 }}>
					{/* Brand Section */}
					<BrandSection>
						<LogoIcon>
							<Brain size={32} />
						</LogoIcon>

						<Typography
							variant='h4'
							sx={{
								fontWeight: 800,
								background: 'linear-gradient(45deg, #6366F1 30%, #8B5CF6 90%)',
								WebkitBackgroundClip: 'text',
								WebkitTextFillColor: 'transparent',
								backgroundClip: 'text',
								mb: 1,
							}}
						>
							QuizAI
						</Typography>

						<Typography variant='body1' sx={{ color: 'text.secondary', mb: 3 }}>
							{isSignup
								? 'Create your account and start generating quizzes with AI'
								: 'Welcome back! Sign in to continue your learning journey'}
						</Typography>

						<Stack
							direction='row'
							spacing={1}
							justifyContent='center'
							sx={{ mb: 2 }}
						>
							{features.map((feature, index) => (
								<FeatureChip
									key={index}
									icon={feature.icon}
									label={feature.label}
									size='small'
								/>
							))}
              
						</Stack>
					</BrandSection>

					{/* Error/Success Messages */}
					{error && (
						<Alert severity='error' sx={{ mb: 3, borderRadius: 2 }}>
							{error}
						</Alert>
					)}

					{successMsg && (
						<Alert severity='success' sx={{ mb: 3, borderRadius: 2 }}>
							{successMsg}
						</Alert>
					)}

					{/* Auth Form */}
					<Box component='form' onSubmit={handleAuth}>
						<Stack spacing={3}>
							{isSignup && (
								<StyledTextField
									fullWidth
									label='Full Name'
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									required
									placeholder='Enter your full name'
									InputProps={{
										startAdornment: (
											<InputAdornment position='start'>
												<User size={20} color='#6366F1' />
											</InputAdornment>
										),
									}}
								/>
							)}

							<StyledTextField
								fullWidth
								type='email'
								label='Email Address'
								value={email}
								autoComplete='email'
								onChange={(e) => setEmail(e.target.value)}
								required
								placeholder='you@example.com'
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<Mail size={20} color='#6366F1' />
										</InputAdornment>
									),
								}}
							/>

							<StyledTextField
								fullWidth
								type={showPassword ? 'text' : 'password'}
								label='Password'
								autoComplete={isSignup ? 'new-password' : 'current-password'}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								placeholder='••••••••'
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<Lock size={20} color='#6366F1' />
										</InputAdornment>
									),
									endAdornment: (
										<InputAdornment position='end'>
											<IconButton
												onClick={() => setShowPassword(!showPassword)}
												edge='end'
												size='small'
											>
												{showPassword ? (
													<EyeOff size={20} />
												) : (
													<Eye size={20} />
												)}
											</IconButton>
										</InputAdornment>
									),
								}}
							/>

							<GradientButton
								type='submit'
								fullWidth
								size='large'
								disabled={loading}
								endIcon={loading ? null : <ArrowRight size={20} />}
							>
								{loading
									? 'Please wait...'
									: isSignup
									? 'Create Account'
									: 'Sign In'}
							</GradientButton>
						</Stack>
					</Box>

					{/* Forgot Password */}
					{!isSignup && (
						<Box sx={{ textAlign: 'center', mt: 2 }}>
							<Button
								variant='text'
								onClick={handleForgotPassword}
								sx={{
									color: 'primary.main',
									fontWeight: 500,
									textTransform: 'none',
									'&:hover': {
										background: 'primary.main',
										color: 'white',
									},
								}}
							>
								Forgot your password?
							</Button>
						</Box>
					)}

					{/* Divider */}
					<Box sx={{ my: 3 }}>
						<Divider>
							<Typography
								variant='body2'
								sx={{ color: 'text.secondary', px: 2 }}
							>
								OR
							</Typography>
						</Divider>
					</Box>

					{/* Google Sign In */}
					<GoogleButton
						fullWidth
						size='large'
						onClick={handleGoogleLogin}
						disabled={loading}
						startIcon={
							<Box
								component='img'
								src='https://developers.google.com/identity/images/g-logo.png'
								alt='Google'
								sx={{ width: 20, height: 20 }}
							/>
						}
					>
						Continue with Google
					</GoogleButton>

					{/* Toggle Auth Mode */}
					<Box sx={{ textAlign: 'center', mt: 3 }}>
						<Typography variant='body2' sx={{ color: 'text.secondary' }}>
							{isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
							<Button
								variant='text'
								onClick={() => {
									setIsSignup(!isSignup);
									setError('');
									setSuccessMsg('');
								}}
								sx={{
									color: 'primary.main',
									fontWeight: 600,
									textTransform: 'none',
									p: 0,
									minWidth: 'auto',
									'&:hover': {
										background: 'transparent',
										textDecoration: 'underline',
									},
								}}
							>
								{isSignup ? 'Sign In' : 'Sign Up'}
							</Button>
						</Typography>
					</Box>

					{/* Terms */}
					{isSignup && (
						<Typography
							variant='caption'
							sx={{
								color: 'text.secondary',
								textAlign: 'center',
								display: 'block',
								mt: 2,
								lineHeight: 1.4,
							}}
						>
							By creating an account, you agree to our{' '}
							<Button
								variant='text'
								sx={{
									color: 'primary.main',
									p: 0,
									minWidth: 'auto',
									fontSize: 'inherit',
									textTransform: 'none',
									textDecoration: 'underline',
								}}
							>
								Terms of Service
							</Button>{' '}
							and{' '}
							<Button
								variant='text'
								sx={{
									color: 'primary.main',
									p: 0,
									minWidth: 'auto',
									fontSize: 'inherit',
									textTransform: 'none',
									textDecoration: 'underline',
								}}
							>
								Privacy Policy
							</Button>
						</Typography>
					)}
				</CardContent>
			</AuthCard>
		</AuthContainer>
	);
};

export default ModernAuthForm;
