import React from "react";
import { CardContent, Stack, Box, Typography, Avatar, IconButton } from "@mui/material";
import { Eye, UserCheck, UserX, Trash2 } from "lucide-react";
import { RequestCard as StyledRequestCard } from "./styles";
import StatusChip from "./StatusChip";

const RequestCard = ({ request, setSelectedRequest, handleAction, actionLoading }) => {
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

  return (
    <StyledRequestCard>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={3} alignItems="center" sx={{ flex: 1 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                fontWeight: 600,
              }}
            >
              {request.name?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {request.name || "Unknown User"}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                {request.email}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Requested: {formatDate(request.createdAt)}
              </Typography>
            </Box>
            <StatusChip status={request.status} />
          </Stack>
          <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }}>
            <IconButton size="small" onClick={() => setSelectedRequest(request)} sx={{ color: "primary.main" }} aria-label="View details">
              <Eye size={16} />
            </IconButton>
            {request.status === "pending" && (
              <>
                <IconButton
                  size="small"
                  onClick={() => handleAction("approve", request.id, request.uid)}
                  disabled={actionLoading}
                  sx={{ color: "success.main" }}
                  aria-label="Approve"
                >
                  <UserCheck size={16} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleAction("reject", request.id, request.uid)}
                  disabled={actionLoading}
                  sx={{ color: "error.main" }}
                  aria-label="Reject"
                >
                  <UserX size={16} />
                </IconButton>
              </>
            )}
            {request.status === "approved" && (
              <IconButton
                size="small"
                onClick={() => handleAction("terminate", request.id, request.uid)}
                disabled={actionLoading}
                sx={{ color: "error.main" }}
                aria-label="Terminate"
              >
                <Trash2 size={16} />
              </IconButton>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </StyledRequestCard>
  );
};

export default RequestCard;
