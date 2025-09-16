import React from "react";
import {
  Stack,
  Avatar,
  Box,
  Typography,
  Chip,
  LinearProgress,
  IconButton,
} from "@mui/material";
import {
  Crown,
  Coins,
  Shield,
  X,
} from "lucide-react";
import {
  ProfileHeader as StyledProfileHeader,
  PremiumBadge,
  CreditsMeter,
} from "./ProfileStyles";

const ProfileHeader = ({ 
  user, 
  isPremium, 
  credits, 
  isAdmin, 
  onClose 
}) => {
  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getCreditsColor = () => {
    if (isPremium) return "#FFD700";
    if (credits > 3) return "#10B981";
    if (credits > 1) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <StyledProfileHeader>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Stack direction="row" spacing={3} alignItems="center">
          <Avatar
            sx={{
              width: 80,
              height: 80,
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
              border: "3px solid rgba(255, 255, 255, 0.3)",
              fontSize: "2rem",
              fontWeight: 700,
            }}
          >
            {getUserInitials(user.displayName)}
          </Avatar>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              {user.displayName || "User"}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
              {user.email}
            </Typography>

            <Stack direction="row" spacing={1}>
              {isPremium ? (
                <PremiumBadge>
                  <Crown size={14} />
                  Premium
                </PremiumBadge>
              ) : (
                <Chip
                  icon={<Coins size={14} />}
                  label={`${credits} Credits`}
                  size="small"
                  sx={{
                    background: "rgba(255, 255, 255, 0.2)",
                    color: "white",
                    fontWeight: 600,
                    "& .MuiChip-icon": {
                      color: getCreditsColor(),
                    },
                  }}
                />
              )}

              {isAdmin && (
                <Chip
                  icon={<Shield size={14} />}
                  label="Admin"
                  size="small"
                  sx={{
                    background: "rgba(239, 68, 68, 0.2)",
                    color: "white",
                    fontWeight: 600,
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                  }}
                />
              )}
            </Stack>
          </Box>
        </Stack>

        <IconButton
          onClick={onClose}
          sx={{
            color: "white",
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            "&:hover": {
              background: "rgba(255, 255, 255, 0.2)",
            },
          }}
        >
          <X size={20} />
        </IconButton>
      </Stack>

      {!isPremium && (
        <CreditsMeter sx={{ mt: 3 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Credits Remaining
            </Typography>
            <Typography variant="body2">{credits}/5</Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={(credits / 5) * 100}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              "& .MuiLinearProgress-bar": {
                background: `linear-gradient(90deg, ${getCreditsColor()} 0%, ${getCreditsColor()}CC 100%)`,
                borderRadius: 3,
              },
            }}
          />
        </CreditsMeter>
      )}
    </StyledProfileHeader>
  );
};

export default ProfileHeader;