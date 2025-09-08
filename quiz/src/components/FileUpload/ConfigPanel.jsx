import {
  CardContent,
  Stack,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  MenuItem,
  Alert,
  Button,
  Collapse,
} from "@mui/material";
import { Settings } from "lucide-react";
import { ConfigPanel as StyledConfigPanel } from "./styles";

const ConfigPanel = ({ useAI, setUseAI, aiOptions, setAiOptions, apiKey, loading, onReconfigure }) => {
  return (
    <StyledConfigPanel>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={3}>
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

          <FormControlLabel
            control={
              <Switch
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                disabled={loading}
              />
            }
            label="Enable AI-powered question generation"
          />

          <Collapse in={useAI}>
            <Stack spacing={3}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                <TextField
                  label="Number of Questions"
                  type="number"
                  value={aiOptions.numQuestions}
                  onChange={(e) =>
                    setAiOptions((prev) => ({
                      ...prev,
                      numQuestions: Math.max(5, Math.min(50, Number(e.target.value || 10))),
                    }))
                  }
                  inputProps={{ min: 5, max: 50 }}
                  disabled={loading}
                  sx={{ flex: 1 }}
                />

                <TextField
                  select
                  label="Difficulty Level"
                  value={aiOptions.difficulty}
                  onChange={(e) => setAiOptions((prev) => ({ ...prev, difficulty: e.target.value }))}
                  disabled={loading}
                  sx={{ flex: 1 }}
                >
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                </TextField>
              </Stack>

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
      </CardContent>
    </StyledConfigPanel>
  );
};

export default ConfigPanel;
