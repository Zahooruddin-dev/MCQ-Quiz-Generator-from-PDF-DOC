import React, { useState } from "react";
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
} from "@mui/material";
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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { auth, db } from "../../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  AuthContainer,
  FloatingElement,
  AuthCard,
  BrandSection,
  LogoIcon,
  FeatureChip,
  StyledTextField,
  GradientButton,
  GoogleButton,
} from "./AuthStyles";
import { getFriendlyError } from "./errorMapping";

const ModernAuthForm = () => {
  const { loginWithGoogle } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const features = [
    { icon: <Brain size={16} />, label: "AI-Powered" },
    { icon: <Zap size={16} />, label: "Lightning Fast" },
    { icon: <Shield size={16} />, label: "Secure" },
  ];

  // Signup
  const handleSignup = async () => {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCred.user, { displayName: username });

    await setDoc(doc(db, "users", userCred.user.uid), {
      displayName: username,
      email,
      credits: 5,
      createdAt: serverTimestamp(),
    });

    setSuccessMsg("Account created successfully! Welcome to QuizAI!");
  };

  // Login
  const handleLogin = async () => {
    await signInWithEmailAndPassword(auth, email, password);
    setSuccessMsg("Welcome back! Redirecting to your dashboard...");
  };

  // Auth form
  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
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
      setError("Please enter your email first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg("Password reset email sent! Check your inbox.");
    } catch (err) {
      setError(getFriendlyError(err.code));
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      setSuccessMsg("Successfully signed in with Google!");
    } catch {
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      {/* Floating Elements */}
      <FloatingElement sx={{ top: "10%", left: "10%" }} delay={0}>
        <Brain size={40} />
      </FloatingElement>
      <FloatingElement sx={{ top: "20%", right: "15%" }} delay={2}>
        <Zap size={50} />
      </FloatingElement>
      <FloatingElement sx={{ bottom: "30%", left: "20%" }} delay={4}>
        <Shield size={35} />
      </FloatingElement>
      <FloatingElement sx={{ bottom: "20%", right: "10%" }} delay={1}>
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
              variant="h4"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(45deg, #6366F1 30%, #8B5CF6 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              QuizAI
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
              {isSignup
                ? "Create your account and start generating quizzes with AI"
                : "Welcome back! Sign in to continue your learning journey"}
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
              {features.map((f, i) => (
                <FeatureChip key={i} icon={f.icon} label={f.label} size="small" />
              ))}
            </Stack>
          </BrandSection>

          {/* Error / Success */}
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
          {successMsg && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{successMsg}</Alert>}

          {/* Form */}
          <Box component="form" onSubmit={handleAuth}>
            <Stack spacing={3}>
              {isSignup && (
                <StyledTextField
                  fullWidth
                  label="Full Name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter your full name"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <User size={20} color="#6366F1" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              <StyledTextField
                fullWidth
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                placeholder="you@example.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={20} color="#6366F1" />
                    </InputAdornment>
                  ),
                }}
              />
              <StyledTextField
                fullWidth
                type={showPassword ? "text" : "password"}
                label="Password"
                autoComplete={isSignup ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={20} color="#6366F1" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <GradientButton
                type="submit"
                fullWidth
                size="large"
                disabled={loading}
                endIcon={loading ? null : <ArrowRight size={20} />}
              >
                {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
              </GradientButton>
            </Stack>
          </Box>

          {/* Forgot Password */}
          {!isSignup && (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Button variant="text" onClick={handleForgotPassword} sx={{ color: "primary.main", fontWeight: 500, textTransform: "none" }}>
                Forgot your password?
              </Button>
            </Box>
          )}

          {/* Divider */}
          <Box sx={{ my: 3 }}>
            <Divider>
              <Typography variant="body2" sx={{ color: "text.secondary", px: 2 }}>
                OR
              </Typography>
            </Divider>
          </Box>

          {/* Google Sign In */}
          <GoogleButton
            fullWidth
            size="large"
            onClick={handleGoogleLogin}
            disabled={loading}
            startIcon={
              <Box component="img" src="https://developers.google.com/identity/images/g-logo.png" alt="Google" sx={{ width: 20, height: 20 }} />
            }
          >
            Continue with Google
          </GoogleButton>

          {/* Switch form mode */}
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <Button
                variant="text"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError("");
                  setSuccessMsg("");
                }}
                sx={{ color: "primary.main", fontWeight: 600, textTransform: "none", p: 0 }}
              >
                {isSignup ? "Sign In" : "Sign Up"}
              </Button>
            </Typography>
          </Box>

          {/* Terms */}
          {isSignup && (
            <Typography variant="caption" sx={{ color: "text.secondary", textAlign: "center", display: "block", mt: 2, lineHeight: 1.4 }}>
              By creating an account, you agree to our{" "}
              <Button variant="text" sx={{ color: "primary.main", p: 0, minWidth: "auto", fontSize: "inherit", textTransform: "none", textDecoration: "underline" }}>
                Terms of Service
              </Button>{" "}
              and{" "}
              <Button variant="text" sx={{ color: "primary.main", p: 0, minWidth: "auto", fontSize: "inherit", textTransform: "none", textDecoration: "underline" }}>
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
