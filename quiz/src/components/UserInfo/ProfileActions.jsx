// ProfileActions.jsx
import React from "react";
import { DialogActions, Button, Stack } from "@mui/material";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfileActions = ({ isAdmin, onClose }) => {
  const navigate = useNavigate();

  return (
    <DialogActions sx={{ p: 3, pt: 0 }}>
      <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
        {isAdmin && (
          <Button
            variant="outlined"
            startIcon={<Settings size={16} />}
            onClick={() => {
              navigate("/admin");
              onClose();
            }}
            sx={{ flex: 1 }}
          >
            Admin Dashboard
          </Button>
        )}

        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            flex: 1,
            background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
            },
          }}
        >
          Close
        </Button>
      </Stack>
    </DialogActions>
  );
};

export default ProfileActions;
