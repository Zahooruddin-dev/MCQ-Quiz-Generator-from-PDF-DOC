import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import { Flag, RotateCcw } from "lucide-react";

const FinishDialog = ({
  open,
  unansweredCount,
  cancelFinish,
  submitQuiz,
  isSubmitting,
}) => (
  <Dialog open={open} onClose={cancelFinish} maxWidth="sm" fullWidth>
    <DialogTitle>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          <Flag size={20} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Finish Quiz?
        </Typography>
      </Stack>
    </DialogTitle>

    <DialogContent>
      <Typography variant="body1" sx={{ mb: 2 }}>
        You have <strong>{unansweredCount}</strong> unanswered question
        {unansweredCount !== 1 ? "s" : ""}. Are you sure you want to finish the
        quiz?
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        Unanswered questions will be marked as incorrect.
      </Typography>
    </DialogContent>

    <DialogActions sx={{ p: 3, pt: 0 }}>
      <Button
        variant="outlined"
        onClick={cancelFinish}
        startIcon={<RotateCcw size={16} />}
      >
        Continue Quiz
      </Button>
      <Button
        variant="contained"
        onClick={submitQuiz}
        disabled={isSubmitting}
        endIcon={<Flag size={16} />}
        sx={{
          background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
        }}
      >
        {isSubmitting ? "Submitting..." : "Finish Quiz"}
      </Button>
    </DialogActions>
  </Dialog>
);

export default FinishDialog;
