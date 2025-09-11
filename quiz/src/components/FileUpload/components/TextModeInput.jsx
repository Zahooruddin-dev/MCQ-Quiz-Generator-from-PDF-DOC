import React, { useState, useCallback } from "react";
import {
  CardContent,
  Stack,
  Typography,
  TextField,
  Button,
  Collapse,
  Alert,
  LinearProgress,
  Box,
} from "@mui/material";
import { Play, Type, Sparkles } from "lucide-react";
import { TextModeCard, pulse, LoadingOverlay } from "../ModernFileUpload.styles";
import { LLMService } from "../../../utils/llmService";

const TextModeInput = ({ apiKey, baseUrl, aiOptions, onQuizGenerated }) => {
  const [showTextMode, setShowTextMode] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const simulateProgress = useCallback(() => {
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
    return interval;
  }, []);

  const handleSubmit = async () => {
    setError(null);

    if (!pastedText.trim()) {
      setError("Please paste some content first.");
      return;
    }

    const wordCount = pastedText.trim().split(/\s+/).length;
    if (wordCount < 10) {
      setError("Please enter at least 10 words of text to generate questions.");
      return;
    }

    const effectiveApiKey = apiKey || localStorage.getItem("geminiApiKey");
    if (!effectiveApiKey || effectiveApiKey.trim().length < 8) {
      setError(
        "Please configure your API key first. Click the settings button to get started."
      );
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    const progressInterval = simulateProgress();

    try {
      const llmService = new LLMService(effectiveApiKey, baseUrl);
      const questions = await llmService.generateQuizQuestions(
        pastedText,
        aiOptions
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        onQuizGenerated(questions, aiOptions);
        setLoading(false);
        setPastedText("");
        setShowTextMode(false);
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      console.error("Error processing text:", err);
      setError(err?.message || "Failed to process text. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle button */}
      <Stack alignItems="center" sx={{ my: 3 }}>
        <Button
          variant="outlined"
          startIcon={<Type />}
          onClick={() => {
            setShowTextMode((prev) => !prev);
            setError(null);
          }}
          sx={{ borderRadius: 2 }}
          disabled={loading}
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

              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                multiline
                rows={8}
                fullWidth
                placeholder="Paste your study material here..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                disabled={loading}
                inputProps={{
                  style: { fontFamily: "monospace", fontSize: "0.9rem" },
                }}
              />

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={<Play />}
                  sx={{ borderRadius: 2 }}
                >
                  Generate Quiz
                </Button>
              </Stack>

              {loading && (
                <LoadingOverlay>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      mb: 2,
                      animation: `${pulse} 1.5s infinite`,
                    }}
                  >
                    <Sparkles size={24} />
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Processing Your Content
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mb: 3 }}
                  >
                    AI is analyzing and generating questions...
                  </Typography>
                  <Box sx={{ width: "100%", maxWidth: 300 }}>
                    <LinearProgress
                      variant="determinate"
                      value={uploadProgress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        "& .MuiLinearProgress-bar": {
                          background:
                            "linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)",
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ mt: 1, display: "block", textAlign: "center" }}
                    >
                      {Math.round(uploadProgress)}%
                    </Typography>
                  </Box>
                </LoadingOverlay>
              )}
            </Stack>
          </CardContent>
        </TextModeCard>
      </Collapse>
    </>
  );
};

export default TextModeInput;
