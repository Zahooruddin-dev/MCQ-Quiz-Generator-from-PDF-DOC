import {
  Card,
  CardContent,
  Stack,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { Brain } from "lucide-react";

const TextModeInput = ({
  showTextMode,
  pastedText,
  setPastedText,
  SAMPLE_TEXT,
  handleTextSubmit,
  effectiveLoading,
}) => (
  <>
    {showTextMode && (
      <Card sx={{ mt: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Paste Your Text Content
            </Typography>

            <TextField
              multiline
              rows={8}
              placeholder="Paste your text content here... (minimum 10 words)"
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              disabled={effectiveLoading}
              fullWidth
            />

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => setPastedText(SAMPLE_TEXT)}
                disabled={effectiveLoading}
                size="small"
              >
                Use Sample Text
              </Button>
              <Button
                variant="contained"
                startIcon={<Brain size={16} />}
                onClick={() => handleTextSubmit(pastedText)}
                disabled={effectiveLoading || !pastedText.trim()}
              >
                Generate Quiz
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    )}
  </>
);

export default TextModeInput;
