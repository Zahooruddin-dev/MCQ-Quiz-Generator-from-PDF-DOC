import React, { useState } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { GoogleButton } from "./AuthStyles";

const GoogleLoginButton = ({ 
  onSuccess, 
  onError, 
  disabled = false, 
  isMobile = false 
}) => {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      onSuccess?.("Successfully signed in with Google!");
    } catch (err) {
      console.error("Google login error:", err);
      onError?.(
        err.code === 'auth/popup-closed-by-user'
          ? "Sign-in was cancelled. Please try again."
          : "Failed to sign in with Google. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleButton
      fullWidth
      size="large"
      onClick={handleLogin}
      disabled={disabled || loading}
      sx={{
        minHeight: { xs: 48, sm: 56 },
        fontSize: { xs: '1rem', sm: '1.1rem' },
        // Enhanced mobile touch targets
        py: { xs: 1.5, sm: 2 },
        // Better loading state
        position: 'relative',
        // Enhanced accessibility
        '&:focus-visible': {
          outline: '2px solid #3b82f6',
          outlineOffset: '2px',
        },
      }}
      startIcon={
        loading ? (
          <CircularProgress 
            size={20} 
            sx={{ color: '#4285f4' }}
          />
        ) : (
          <Box
            component="img"
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            sx={{ 
              width: isMobile ? 18 : 20, 
              height: isMobile ? 18 : 20,
              // Fallback for when image doesn't load
              backgroundColor: '#f1f3f4',
              borderRadius: '2px',
            }}
            onError={(e) => {
              // Fallback to a simple "G" if image fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        )
      }
      aria-label={loading ? "Signing in with Google..." : "Sign in with Google"}
    >
      {/* Fallback icon if Google image fails */}
      <Box
        sx={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          width: isMobile ? 18 : 20,
          height: isMobile ? 18 : 20,
          backgroundColor: '#4285f4',
          borderRadius: '2px',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          marginRight: 1,
          position: 'absolute',
          left: 16,
        }}
      >
        G
      </Box>
      
      {loading 
        ? "Please wait..." 
        : "Continue with Google"
      }
    </GoogleButton>
  );
};

export default GoogleLoginButton;