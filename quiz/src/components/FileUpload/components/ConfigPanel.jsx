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
  Tooltip,
  Divider,
} from "@mui/material";
import { Settings, Zap, Clock, CheckCircle } from "lucide-react";

const ConfigPanel = ({
  hasAI,
  apiKey,
  loading = false,
  initialOptions = { 
    numQuestions: 10, 
    difficulty: "medium", 
    questionType: "mixed",
    fastMode: true // Default to fast mode
  },
  onOptionsChange,
  onReconfigure,
}) => {
  const [useAI, setUseAI] = useState(hasAI);
  const [aiOptions, setAiOptions] = useState(initialOptions);

  // Toggle AI
  const handleToggleAI = useCallback(
    (e) => {
      const checked = e.target.checked;
      setUseAI(checked);
      onOptionsChange?.({ ...aiOptions, useAI: checked });
    },
    [aiOptions, onOptionsChange]
  );

  // Toggle Fast Mode
  const handleToggleFastMode = useCallback(
    (e) => {
      const checked = e.target.checked;
      const newOptions = { ...aiOptions, fastMode: checked };
      setAiOptions(newOptions);
      onOptionsChange?.(newOptions);
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
        <Stack direction="row" alignItems="center" spacing={2}>
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
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            AI Generation Settings
          </Typography>
        </Stack>

        {/* Enable AI */}
        <FormControlLabel
          control={
            <Switch
              checked={useAI}
              onChange={handleToggleAI}
              disabled={loading}
            />
          }
          label="Enable AI-powered question generation"
        />

        {/* AI Options */}
        <Collapse in={useAI}>
          <Stack spacing={3}>
            {/* Fast Mode Toggle */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={aiOptions.fastMode}
                    onChange={handleToggleFastMode}
                    disabled={loading}
                    color="success"
                  />
                }
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography>Fast Generation Mode</Typography>
                    {aiOptions.fastMode && (
                      <Chip
                        icon={<Zap size={14} />}
                        label="ACTIVE"
                        size="small"
                        color="success"
                        variant="filled"
                        sx={{ 
                          height: 20, 
                          fontSize: '0.7rem',
                          fontWeight: 600
                        }}
                      />
                    )}
                  </Stack>
                }
              />

              {/* Mode Description */}
              <Box sx={{ ml: 5, mt: 1 }}>
                {aiOptions.fastMode ? (
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Zap size={16} color="#22c55e" />
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                      Quick results with good quality (Recommended)
                    </Typography>
                  </Stack>
                ) : (
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Clock size={16} color="#f59e0b" />
                    <Typography variant="body2" color="warning.main" sx={{ fontWeight: 500 }}>
                      Slower processing with maximum quality
                    </Typography>
                  </Stack>
                )}

                {/* Feature Comparison */}
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: aiOptions.fastMode ? 'success.50' : 'warning.50',
                  border: 1,
                  borderColor: aiOptions.fastMode ? 'success.200' : 'warning.200'
                }}>
                  <Stack spacing={1}>
                    {aiOptions.fastMode ? (
                      <>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CheckCircle size={14} color="#22c55e" />
                          <Typography variant="caption">~50% faster processing</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CheckCircle size={14} color="#22c55e" />
                          <Typography variant="caption">Essential quality checks</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CheckCircle size={14} color="#22c55e" />
                          <Typography variant="caption">Self-contained questions</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CheckCircle size={14} color="#22c55e" />
                          <Typography variant="caption">Good for most content types</Typography>
                        </Stack>
                      </>
                    ) : (
                      <>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CheckCircle size={14} color="#f59e0b" />
                          <Typography variant="caption">Deep content analysis</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CheckCircle size={14} color="#f59e0b" />
                          <Typography variant="caption">Comprehensive quality validation</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CheckCircle size={14} color="#f59e0b" />
                          <Typography variant="caption">Educational standards compliance</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CheckCircle size={14} color="#f59e0b" />
                          <Typography variant="caption">Best for complex academic content</Typography>
                        </Stack>
                      </>
                    )}
                  </Stack>
                </Box>
              </Box>
            </Box>

            <Divider />

            {/* Number of Questions */}
            <TextField
              label="Number of Questions"
              type="number"
              value={aiOptions.numQuestions}
              onChange={handleNumQuestionsChange}
              onBlur={handleNumQuestionsBlur}
              inputProps={{ min: 5, max: 50 }}
              disabled={loading}
              helperText="Generate between 5-50 questions"
              sx={{ flex: 1 }}
            />

            {/* Performance Tip */}
            {!(aiOptions.fastMode || false) && (aiOptions.numQuestions || 0) > 15 && (
              <Alert 
                severity="info" 
                icon={<Clock size={20} />}
                sx={{ 
                  bgcolor: 'info.50',
                  border: 1,
                  borderColor: 'info.200'
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2">
                    Large requests in enhanced mode may take several minutes
                  </Typography>
                  <Tooltip title="Switch to fast mode for quicker results">
                    <Button 
                      size="small" 
                      variant="outlined" 
                      startIcon={<Zap size={14} />}
                      onClick={() => handleToggleFastMode({ target: { checked: true } })}
                      sx={{ ml: 1, minWidth: 'auto' }}
                    >
                      Use Fast Mode
                    </Button>
                  </Tooltip>
                </Stack>
              </Alert>
            )}

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