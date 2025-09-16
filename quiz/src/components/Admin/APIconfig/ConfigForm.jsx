import React from "react";
import { Box, Stack, TextField, InputAdornment, IconButton, Alert, Typography, Fade } from "@mui/material";
import { Key, Eye, EyeOff, Link, CheckCircle, X, AlertTriangle } from "lucide-react";
import FeatureCard from "./FeatureCard";

const ConfigForm = ({
  apiKey,
  setApiKey,
  baseUrl,
  setBaseUrl,
  showApiKey,
  setShowApiKey,
  validationStatus,
  setValidationStatus,
}) => {
  const features = [
    { icon: "brain", title: "AI-Powered Generation", description: "Advanced question generation" },
    { icon: "zap", title: "Lightning Fast", description: "Instant quiz creation" },
    { icon: "shield", title: "Secure & Private", description: "Your data stays protected" },
  ];

  const validateApiKey = (key) => {
    if (!key.trim()) return setValidationStatus(null);
    if (key.length < 20) return setValidationStatus("invalid");
    if (key.startsWith("AIza") || key.includes("google")) return setValidationStatus("valid");
    return setValidationStatus("warning");
  };

  const getValidation = () => {
    switch (validationStatus) {
      case "valid":
        return { icon: <CheckCircle size={20} color="#10B981" />, msg: "API key looks valid!", sev: "success" };
      case "invalid":
        return { icon: <X size={20} color="#EF4444" />, msg: "API key too short", sev: "error" };
      case "warning":
        return { icon: <AlertTriangle size={20} color="#F59E0B" />, msg: "Unusual format, may work", sev: "warning" };
      case "error":
        return { icon: <X size={20} color="#EF4444" />, msg: "Failed to validate API key", sev: "error" };
      default:
        return {};
    }
  };

  const { icon, msg, sev } = getValidation();

  return (
    <Box sx={{ p: 4 }}>
      <Stack spacing={4}>
        {/* Features */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            What You'll Get
          </Typography>
          <Stack direction="row" spacing={2}>
            {features.map((f, i) => (
              <FeatureCard key={i} feature={f} />
            ))}
          </Stack>
        </Box>

        {/* Form */}
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="API Key"
            type={showApiKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              validateApiKey(e.target.value);
            }}
            placeholder="Enter your Gemini API key"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Key size={20} color="#6366F1" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Stack direction="row" spacing={1} alignItems="center">
                    {icon}
                    <IconButton onClick={() => setShowApiKey(!showApiKey)} edge="end" size="small">
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </IconButton>
                  </Stack>
                </InputAdornment>
              ),
            }}
          />
          {validationStatus && (
            <Fade in>
              <Alert severity={sev} sx={{ borderRadius: 2 }}>
                {msg}
              </Alert>
            </Fade>
          )}

          <TextField
            fullWidth
            label="Base URL"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="Enter API Base URL"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Link size={20} color="#6366F1" />
                </InputAdornment>
              ),
            }}
          />

          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Need an API key?</strong> Get one from{" "}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#6366F1", textDecoration: "none" }}
              >
                Google AI Studio
              </a>
            </Typography>
          </Alert>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ConfigForm;
