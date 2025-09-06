import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Avatar,
  Typography,
  Box,
  Button,
} from "@mui/material";
import { UserCheck, UserX, Trash2 } from "lucide-react";
import StatusChip from "./StatusChip";

const RequestDialog = ({ selectedRequest, onClose, handleAction, actionLoading }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!selectedRequest) return null;

  return (
    <Dialog open={!!selectedRequest} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
              fontWeight: 600,
            }}
          >
            {selectedRequest.name?.charAt(0)?.toUpperCase() || "U"}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {selectedRequest.name || "Unknown User"}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Premium Request Details
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 0.5 }}>
              Email Address
            </Typography>
            <Typography variant="body1">{selectedRequest.email}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 0.5 }}>
              Request Date
            </Typography>
            <Typography variant="body1">{formatDate(selectedRequest.createdAt)}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 0.5 }}>
              Current Status
            </Typography>
            <StatusChip status={selectedRequest.status} />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>Close</Button>
        {selectedRequest.status === "pending" && (
          <>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleAction("reject", selectedRequest.id, selectedRequest.uid)}
              disabled={actionLoading}
              startIcon={<UserX size={16} />}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleAction("approve", selectedRequest.id, selectedRequest.uid)}
              disabled={actionLoading}
              startIcon={<UserCheck size={16} />}
            >
              Approve
            </Button>
          </>
        )}
        {selectedRequest.status === "approved" && (
          <Button
            variant="contained"
            color="error"
            onClick={() => handleAction("terminate", selectedRequest.id, selectedRequest.uid)}
            disabled={actionLoading}
            startIcon={<Trash2 size={16} />}
          >
            Terminate Premium
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default RequestDialog;
