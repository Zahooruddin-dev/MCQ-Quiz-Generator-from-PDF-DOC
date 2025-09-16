// ProfilePremiumCard.jsx
import React, { useState } from "react";
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  Button,
  Alert,
  Divider,
} from "@mui/material";
import { Crown, Award } from "lucide-react";
import { db } from "../../firebaseConfig";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

const ProfilePremiumCard = ({ user }) => {
  const [requestSent, setRequestSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequestPremium = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const requestRef = doc(db, "premiumRequests", user.uid);
      const existing = await getDoc(requestRef);

      if (existing.exists() && existing.data().status === "pending") {
        setRequestSent(true);
        return;
      }

      await setDoc(
        requestRef,
        {
          uid: user.uid,
          email: user.email,
          name: user.displayName || "N/A",
          createdAt: serverTimestamp(),
          status: "pending",
        },
        { merge: true }
      );

      setRequestSent(true);
    } catch (err) {
      console.error("Failed to send premium request:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Divider sx={{ mb: 2 }} />

      <Card
        sx={{
          background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
          color: "#1E293B",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Crown size={24} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Upgrade to Premium
            </Typography>
          </Stack>

          <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
            Get unlimited quiz generation, advanced analytics, and priority
            support.
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            <Chip
              label="Unlimited Credits"
              size="small"
              sx={{ background: "rgba(30, 41, 59, 0.1)" }}
            />
            <Chip
              label="Advanced Analytics"
              size="small"
              sx={{ background: "rgba(30, 41, 59, 0.1)" }}
            />
            <Chip
              label="Priority Support"
              size="small"
              sx={{ background: "rgba(30, 41, 59, 0.1)" }}
            />
          </Stack>

          {!requestSent ? (
            <Button
              variant="contained"
              fullWidth
              onClick={handleRequestPremium}
              disabled={loading}
              startIcon={<Award size={16} />}
              sx={{
                background: "#1E293B",
                color: "white",
                fontWeight: 600,
                "&:hover": {
                  background: "#334155",
                },
              }}
            >
              {loading ? "Sending Request..." : "Request Premium Upgrade"}
            </Button>
          ) : (
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              Premium request submitted! Waiting for admin approval.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePremiumCard;
