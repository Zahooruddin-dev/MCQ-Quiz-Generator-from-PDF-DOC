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
} from "@mui/material";
import { Settings } from "lucide-react";

const ConfigPanel = ({
  hasAI,
  apiKey,
  loading = false,
  initialOptions = { numQuestions: 10, difficulty: "medium", questionType: "mixed" },
  onOptionsChange,
  onReconfigure,
}) => {
  const [useAI, setUseAI] = useState(hasAI);
  const [aiOptions, setAiOptions] = useState(initialOptions);

  // toggle AI
  const handleToggleAI = useCallback(
    (e) => {
      const checked = e.target.checked;
      setUseAI(checked);
      onOptionsChange?.({ ...aiOptions, useAI: checked });
    },
    [aiOptions, onOptionsChange]
  );

  // number of questions
  const handleNumQuestionsChange = useCallback(
    (e) => {
      const num = e.target.value === "" ? "" : Number(e.target.value);
      setAiOptions((prev) => ({ ...prev, numQuestions: num }));
      onOptionsChange?.({ ...aiOptions, numQuestions: num });
    },
    [aiOptions, onOptionsChange]
  );

  const handleNumQuestionsBlur = useCallback(
    (e) => {
      let val = Number(e.target.value);
      if (!val || val < 5) val = 5;
      if (val > 50) val = 50;
      setAiOptions((prev) => ({ ...prev, numQuestions: val }));
      onOptionsChange?.({ ...aiOptions, numQuestions: val });
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
            <TextField
              label="Number of Questions"
              type="number"
              value={aiOptions.numQuestions}
              onChange={handleNumQuestionsChange}
              onBlur={handleNumQuestionsBlur}
              inputProps={{ min: 5, max: 50 }}
              disabled={loading}
              sx={{ flex: 1 }}
            />

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
