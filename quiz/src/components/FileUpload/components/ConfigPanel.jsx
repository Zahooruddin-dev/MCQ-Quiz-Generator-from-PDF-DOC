// src/components/ConfigPanel.jsx
import React, { useState, useCallback } from "react";
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
} from "@mui/material";
import { Settings, Coins, Crown } from "lucide-react";
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
    difficulty: "medium",
    questionType: "mixed",
    useAI: false,
    ...initialOptions // Allow overrides
  };

  const [useAI, setUseAI] = useState(hasAI || false);
  const [aiOptions, setAiOptions] = useState(defaultOptions);

  // Toggle AI
  const handleToggleAI = useCallback(
    (e) => {
      const checked = e.target.checked;
      setUseAI(checked);
      onOptionsChange?.({ ...aiOptions, useAI: checked });
    },
    [aiOptions, onOptionsChange]
  );

  // Number of questions
  const handleNumQuestionsChange = useCallback(
    (e) => {
      const num = e.target.value === "" ? "" : Number(e.target.value);
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

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        background: "rgba(255, 255, 255, 0.6)",
        backdropFilter: "blur(12px)",
        p: 3,
      }}
    >
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <Settings size={20} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              MCQs Generation Settings
            </Typography>
            {/* Credit status */}
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              {isPremium ? (
                <Chip
                  icon={<Crown size={12} />}
                  label="Premium - Unlimited"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              ) : isAdmin ? (
                <Chip
                  icon={<Crown size={12} />}
                  label="Admin - Unlimited"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              ) : (
                <Chip
                  icon={<Coins size={12} />}
                  label={`${credits} Credits - 1 per quiz`}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    background: credits > 0 
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
              <Typography component="span">Enable AI-powered custom question generation</Typography>
              {!isPremium && !isAdmin && credits <= 0 && (
                <Typography variant="caption" color="error" display="block">
                  No credits remaining - upgrade to Premium or wait for daily reset
                </Typography>
              )}
            </Box>
          }
        />

        {/* AI Options */}
        <Collapse in={useAI}>
          <Stack spacing={3}>
            {/* Number of Questions */}
            <TextField
              label="Number of Questions"
              type="number"
              value={aiOptions.numQuestions || 10}
              onChange={handleNumQuestionsChange}
              onBlur={handleNumQuestionsBlur}
              inputProps={{ min: 5, max: 50 }}
              disabled={loading}
              helperText="Generate between 5-50 questions"
              sx={{ flex: 1 }}
            />

            {/* API Key Warning */}
            {!apiKey && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                API key not configured.
                <Button size="small" onClick={onReconfigure} sx={{ ml: 1 }}>
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