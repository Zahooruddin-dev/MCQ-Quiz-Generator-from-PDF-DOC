import React from "react";
import {
  Box,
  Typography,
  Stack,
} from "@mui/material";
import {
  Mail,
  Calendar,
  Clock,
} from "lucide-react";

const ProfileAccountInfo = ({ user }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Account Information
      </Typography>

      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Mail size={20} color="#6366F1" />
          <Box>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Email Address
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {user.email}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          <Calendar size={20} color="#6366F1" />
          <Box>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Last Login
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {formatDate(user.metadata?.lastSignInTime)}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          <Clock size={20} color="#6366F1" />
          <Box>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Member Since
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {formatDate(user.metadata?.creationTime)}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ProfileAccountInfo;