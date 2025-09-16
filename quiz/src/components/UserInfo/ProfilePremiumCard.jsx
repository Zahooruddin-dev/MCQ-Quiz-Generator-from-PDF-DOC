import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  Fade,
  Divider,
} from "@mui/material";
import { Crown, Award } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const ProfilePremiumCard = ({ user, isPremium }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load Paddle.js SDK
  useEffect(() => {
    if (!window.Paddle) {
      const script = document.createElement("script");
      script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
      script.onload = () => {
        window.Paddle.Setup({
          vendor: Number(import.meta.env.VITE_PADDLE_VENDOR_ID), // set in .env
        });
      };
      document.body.appendChild(script);
    }
  }, []);

  const handleCheckout = async () => {
    if (!window.Paddle) return;

    setLoading(true);

    window.Paddle.Checkout.open({
      product: Number(import.meta.env.VITE_PADDLE_PREMIUM_PRODUCT_ID), // set your Paddle product ID
      email: user.email,
      successCallback: async (data) => {
        try {
          // Update Firestore user document
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, { isPremium: true });
          setSuccess(true);
        } catch (err) {
          console.error("Failed to update premium status:", err);
        } finally {
          setLoading(false);
        }
      },
      closeCallback: () => {
        setLoading(false);
      },
    });
  };

  if (isPremium) return null;

  return (
    <Fade in={!isPremium}>
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

            {!success ? (
              <Button
                variant="contained"
                fullWidth
                onClick={handleCheckout}
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
                {loading ? "Redirecting..." : "Upgrade with Paddle"}
              </Button>
            ) : (
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                🎉 Premium unlocked! Enjoy your new features.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>
    </Fade>
  );
};

export default ProfilePremiumCard;
