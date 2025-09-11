import React, { useState } from "react";
import {
  CardContent,
  Stack,
  Typography,
  TextField,
  Button,
  Collapse,
} from "@mui/material";
import { Play, Type } from "lucide-react";
import { TextModeCard } from "../ModernFileUpload.styles";

const TextModeInput = ({ effectiveLoading, handleTextSubmit }) => {
  const [showTextMode, setShowTextMode] = useState(false);
  const [pastedText, setPastedText] = useState("");

  const onSubmit = () => {
    if (pastedText.trim()) {
      handleTextSubmit(pastedText);
      setPastedText("");
      setShowTextMode(false);
    }
  };

  return (
    <>
      {/* Toggle button */}
      <Stack alignItems="center" sx={{ my: 3 }}>
        <Button
          variant="outlined"
          startIcon={<Type />}
          onClick={() => setShowTextMode((prev) => !prev)}
          sx={{ borderRadius: 2 }}
          disabled={effectiveLoading}
        >
          {showTextMode ? "Cancel Text Mode" : "Paste Text Instead"}
        </Button>
      </Stack>

      {/* Collapsible input */}
      <Collapse in={showTextMode} mountOnEnter unmountOnExit>
        <TextModeCard>
          <CardContent>
            <Stack spacing={3}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Paste Text Content
              </Typography>
              <TextField
                multiline
                rows={8}
                fullWidth
                placeholder="Paste your study material here..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                disabled={effectiveLoading}
                inputProps={{
                  style: { fontFamily: "monospace", fontSize: "0.9rem" },
                }}
              />
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="contained"
                  onClick={onSubmit}
                  disabled={effectiveLoading}
                  startIcon={<Play />}
                  sx={{ borderRadius: 2 }}
                >
                  Generate Quiz
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </TextModeCard>
      </Collapse>
    </>
  );
};

export default TextModeInput;
