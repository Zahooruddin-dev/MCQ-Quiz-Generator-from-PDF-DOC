// src/components/auth/GoogleLoginButton.jsx
import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import { useAuth } from "../../context/AuthContext";

const GoogleLoginButton = ({ onSuccess, onError, disabled = false }) => {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      onSuccess?.("Successfully signed in with Google!");
    } catch (err) {
      onError?.("Failed to sign in with Google. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      fullWidth
      size="large"
      onClick={handleLogin}
      disabled={disabled || loading}
      startIcon={
        <Box
          component="img"
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google"
          sx={{ width: 20, height: 20 }}
        />
      }
    >
      {loading ? "Please wait..." : "Continue with Google"}
    </Button>
  );
};

export default GoogleLoginButton;
