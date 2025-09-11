import React, { useState, useRef } from 'react';
import {
  Box,
  CardContent,
  Typography,
  Stack,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  Button,
  useMediaQuery,
  useTheme,
  Fade,
  Collapse,
} from '@mui/material';
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
  AlertCircle,
  CheckIcon,
} from 'lucide-react';
import { auth, db } from '../../firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  AuthContainer,
  FloatingElement,
  AuthCard,
  BrandSection,
  LogoIcon,
  FeatureChip,
  StyledTextField,
  GradientButton,
} from './AuthStyles';
import { getFriendlyError } from './errorMapping';
import GoogleLoginButton from './GoogleLoginButton';

const ModernAuthForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Refs for focus management
  const emailRef = useRef(null);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const features = [
    { icon: <Brain size={isMobile ? 14 : 16} />, label: 'AI-Powered' },
    { icon: <Zap size={isMobile ? 14 : 16} />, label: 'Lightning Fast' },
    { icon: <Shield size={isMobile ? 14 : 16} />, label: 'Secure' },
  ];

  const validateForm = () => {
    if (!email || (!password && !isSignup)) {
      setError('Please fill in all required fields.');
      return false;
    }
    if (isSignup && !username.trim()) {
      setError('Please enter your full name.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCred.user, { displayName: username.trim() });
    await setDoc(doc(db, 'users', userCred.user.uid), {
      displayName: username.trim(),
      email: email.toLowerCase(),
      credits: 5,
      createdAt: serverTimestamp(),
    });
    setSuccessMsg('Account created successfully! Welcome to QuizAI!');
  };

  const handleLogin = async () => {
    await signInWithEmailAndPassword(auth, email, password);
    setSuccessMsg('Welcome back! Redirecting to your dashboard...');
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (isSignup) {
        await handleSignup();
      } else {
        await handleLogin();
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setSuccessMsg('Password reset email sent! Check your inbox and spam folder.');
    } catch (err) {
      console.error('Password reset error:', err);
      setError(getFriendlyError(err.code));
    }
  };

  const switchMode = () => {
    setIsSignup(!isSignup);
    setError('');
    setSuccessMsg('');
    setResetSent(false);
    if (isSignup) setUsername('');
  };

  return (
    <AuthContainer isMobile={isMobile}>
      {!isMobile && (
        <>
          <FloatingElement sx={{ top: '10%', left: '10%' }} delay={0}>
            <Brain size={isTablet ? 30 : 40} />
          </FloatingElement>
          <FloatingElement sx={{ top: '20%', right: '15%' }} delay={2}>
            <Zap size={isTablet ? 35 : 50} />
          </FloatingElement>
          <FloatingElement sx={{ bottom: '30%', left: '20%' }} delay={4}>
            <Shield size={isTablet ? 25 : 35} />
          </FloatingElement>
          <FloatingElement sx={{ bottom: '20%', right: '10%' }} delay={1}>
            <CheckCircle size={isTablet ? 35 : 45} />
          </FloatingElement>
        </>
      )}

      <AuthCard isMobile={isMobile} isTablet={isTablet}>
        <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
          <BrandSection>
            <LogoIcon isMobile={isMobile}>
              <Brain size={isMobile ? 24 : 32} />
            </LogoIcon>
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(45deg, #3b82f6 20%, #6366f1 50%, #8b5cf6 80%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: 1,
                color: '#3b82f6',
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
              }}
            >
              QuizAI
            </Typography>
            <Typography
              variant='body1'
              sx={{
                color: 'text.secondary',
                mb: { xs: 2, sm: 3 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                lineHeight: 1.5,
                maxWidth: '400px',
                margin: '0 auto',
              }}
            >
              {isSignup
                ? 'Create your account and start generating quizzes with AI'
                : 'Welcome back! Sign in to continue your learning journey'}
            </Typography>
            <Stack
              direction='row'
              spacing={{ xs: 0.5, sm: 1 }}
              justifyContent='center'
              sx={{ mb: { xs: 2, sm: 2 }, flexWrap: 'wrap', gap: { xs: 0.5, sm: 1 } }}
            >
              {features.map((f, i) => (
                <FeatureChip
                  key={i}
                  icon={f.icon}
                  label={f.label}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, height: { xs: 24, sm: 28 } }}
                />
              ))}
            </Stack>
          </BrandSection>

          <Collapse in={!!error}>
            <Alert
              severity='error'
              sx={{ mb: 3, borderRadius: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}
              icon={<AlertCircle size={20} />}
              onClose={() => setError('')}
              id="auth-error"
            >
              {error}
            </Alert>
          </Collapse>

          <Collapse in={!!successMsg}>
            <Alert
              severity='success'
              sx={{ mb: 3, borderRadius: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}
              icon={<CheckIcon size={20} />}
            >
              {successMsg}
            </Alert>
          </Collapse>

          <Box component='form' onSubmit={handleAuth} noValidate>
            <Stack spacing={{ xs: 2.5, sm: 3 }}>
              <Fade in={isSignup} timeout={300}>
                <Box>
                  {isSignup && (
                    <StyledTextField
                      fullWidth
                      label='Full Name'
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder='Enter your full name'
                      autoComplete='name'
                      inputRef={usernameRef}
                      aria-required="true"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          passwordRef.current?.focus();
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start'>
                            <User size={20} color='#3b82f6' />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                </Box>
              </Fade>

              <StyledTextField
                fullWidth
                type='email'
                label='Email Address'
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                autoComplete='email'
                required
                placeholder='you@example.com'
                inputRef={emailRef}
                aria-required="true"
                aria-describedby={error ? 'auth-error' : undefined}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (isSignup) {
                      usernameRef.current?.focus();
                    } else {
                      passwordRef.current?.focus();
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Mail size={20} color='#3b82f6' />
                    </InputAdornment>
                  ),
                }}
              />

              <StyledTextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                label='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder='••••••••'
                inputRef={passwordRef}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                aria-required="true"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAuth(e);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Lock size={20} color='#3b82f6' />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge='end'
                        size='small'
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <GradientButton type='submit' fullWidth size='large' disabled={loading}>
                {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
              </GradientButton>
            </Stack>
          </Box>

          {!isSignup && (
            <Box sx={{ textAlign: 'center', mt: { xs: 2, sm: 2.5 } }}>
              <Button
                variant='text'
                onClick={handleForgotPassword}
                disabled={loading || resetSent}
              >
                {resetSent ? 'Reset email sent!' : 'Forgot your password?'}
              </Button>
            </Box>
          )}

          <Box sx={{ my: { xs: 3, sm: 4 } }}>
            <Divider>
              <Typography variant='body2' sx={{ color: 'text.secondary', px: 2 }}>
                OR
              </Typography>
            </Divider>
          </Box>

          <GoogleLoginButton
            disabled={loading}
            onSuccess={(msg) => setSuccessMsg(msg)}
            onError={(errMsg) => setError(errMsg)}
            isMobile={isMobile}
          />

          <Box sx={{ textAlign: 'center', mt: { xs: 2.5, sm: 3 } }}>
            <Button variant='text' onClick={switchMode}>
              {isSignup
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </Button>
          </Box>
        </CardContent>
      </AuthCard>
    </AuthContainer>
  );
};

export default ModernAuthForm;
