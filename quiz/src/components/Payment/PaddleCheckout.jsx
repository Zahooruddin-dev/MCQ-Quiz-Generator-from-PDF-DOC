import React, { useEffect, useState } from "react";
import { 
  Button, 
  CircularProgress, 
  Alert, 
  Card, 
  CardContent, 
  Typography, 
  Stack, 
  Chip,
  Box,
  Fade 
} from "@mui/material";
import { 
  Crown, 
  Zap, 
  Award, 
  Shield, 
  Sparkles, 
  Star,
  CheckCircle 
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { doc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import Paddle from "@paddle/paddle-js";

const PaddleCheckout = ({ 
  variant = "default", // "default", "card", "minimal"
  size = "medium", // "small", "medium", "large"
  fullWidth = false,
  showFeatures = true,
  customTitle,
  customPrice = "$9.99/month",
  onSuccess,
  onError
}) => {
  const { user, setIsPremium } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [paddleInitialized, setPaddleInitialized] = useState(false);

  useEffect(() => {
    const initializePaddle = async () => {
      try {
        await Paddle.Setup({ 
          vendor: process.env.REACT_APP_PADDLE_VENDOR_ID || "YOUR_VENDOR_ID" 
        });
        setPaddleInitialized(true);
      } catch (error) {
        console.error("Failed to initialize Paddle:", error);
        setError("Payment system unavailable. Please try again later.");
        if (onError) onError(error);
      }
    };

    initializePaddle();
  }, [onError]);

  const handleCheckout = () => {
    if (!paddleInitialized) {
      setError("Payment system is still loading. Please wait a moment.");
      return;
    }

    setLoading(true);
    setError(null);

    Paddle.Checkout.open({
      product: process.env.REACT_APP_PADDLE_PRODUCT_ID || "YOUR_PRODUCT_ID",
      email: user?.email,
      passthrough: JSON.stringify({
        userId: user?.uid,
        email: user?.email,
        displayName: user?.displayName,
      }),
      successCallback: async (data) => {
        try {
          if (user) {
            // Update user document to set isPremium true
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { 
              isPremium: true,
              premiumUpgradeDate: serverTimestamp(),
              paddleTransactionId: data.checkout.id,
            });
            
            // Log the upgrade for admin tracking
            const upgradeLogRef = doc(db, "premiumUpgrades", `${user.uid}_${Date.now()}`);
            await setDoc(upgradeLogRef, {
              userId: user.uid,
              email: user.email,
              displayName: user.displayName || "N/A",
              paddleTransactionId: data.checkout.id,
              upgradeDate: serverTimestamp(),
              amount: data.checkout.prices.customer.total,
              currency: data.checkout.prices.customer.currency,
            });

            setIsPremium(true);
            setSuccess(true);
            
            if (onSuccess) onSuccess(data);
            
            // Auto-hide success message after 3 seconds
            setTimeout(() => {
              setSuccess(false);
            }, 3000);
          }
        } catch (err) {
          const errorMessage = "Upgrade successful, but there was an issue updating your account. Please contact support if premium features don't activate.";
          setError(errorMessage);
          console.error("Error updating premium status:", err);
          if (onError) onError(err);
        } finally {
          setLoading(false);
        }
      },
      closeCallback: () => {
        setLoading(false);
      },
    });
  };

  const premiumFeatures = [
    { icon: Zap, text: "Unlimited Quiz Generation" },
    { icon: Award, text: "Advanced Analytics & Insights" },
    { icon: Shield, text: "Priority Customer Support" },
    { icon: Sparkles, text: "Exclusive Premium Features" },
  ];

  // Success state
  if (success) {
    return (
      <Fade in={success}>
        <Alert 
          severity="success" 
          sx={{ 
            borderRadius: 2,
            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
            color: "white",
            "& .MuiAlert-icon": { color: "white" }
          }}
          icon={<CheckCircle size={20} />}
        >
          🎉 Welcome to Premium! You now have unlimited access to all features.
        </Alert>
      </Fade>
    );
  }

  // Minimal variant - just button
  if (variant === "minimal") {
    return (
      <Box>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        <Button
          variant="contained"
          size={size}
          fullWidth={fullWidth}
          onClick={handleCheckout}
          disabled={loading || !paddleInitialized}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Crown size={16} />}
          sx={{
            background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
            fontWeight: 600,
            "&:hover": {
              background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
              transform: "translateY(-1px)",
            },
            "&:disabled": {
              background: "rgba(99, 102, 241, 0.5)",
            },
            transition: "all 0.2s ease-in-out",
          }}
        >
          {loading 
            ? "Processing..." 
            : !paddleInitialized 
              ? "Loading..." 
              : `Upgrade to Premium`
          }
        </Button>
      </Box>
    );
  }

  // Card variant - full featured card
  if (variant === "card") {
    return (
      <Card
        sx={{
          background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"50\" cy=\"50\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.1\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg>') repeat",
            opacity: 0.3,
          },
        }}
      >
        <CardContent sx={{ p: 3, position: "relative", zIndex: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Crown size={28} color="#FFD700" />
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {customTitle || "Go Premium"}
              </Typography>
            </Stack>
            <Chip
              icon={<Star size={12} />}
              label="Best Value"
              size="small"
              sx={{
                background: "#FFD700",
                color: "#1E293B",
                fontWeight: 700,
                fontSize: "0.7rem",
              }}
            />
          </Stack>

          <Typography 
            variant="body1" 
            sx={{ mb: 3, opacity: 0.9, lineHeight: 1.6 }}
          >
            Unlock unlimited quiz generation, advanced analytics, priority support, and exclusive features.
          </Typography>

          {/* Premium Features */}
          {showFeatures && (
            <Stack spacing={1.5} sx={{ mb: 3 }}>
              {premiumFeatures.map((feature, index) => (
                <Stack key={index} direction="row" alignItems="center" spacing={2}>
                  <feature.icon size={16} color="#10B981" />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {feature.text}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          )}

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleCheckout}
            disabled={loading || !paddleInitialized}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Crown size={18} />}
            sx={{
              background: "rgba(255, 255, 255, 0.95)",
              color: "#1E293B",
              fontWeight: 700,
              fontSize: "1rem",
              py: 1.5,
              "&:hover": {
                background: "rgba(255, 255, 255, 1)",
                transform: "translateY(-1px)",
              },
              "&:disabled": {
                background: "rgba(255, 255, 255, 0.5)",
                color: "rgba(30, 41, 59, 0.5)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            {loading 
              ? "Processing..." 
              : !paddleInitialized 
                ? "Loading Payment..." 
                : `Upgrade Now - ${customPrice}`
            }
          </Button>

          {!paddleInitialized && (
            <Typography 
              variant="caption" 
              sx={{ 
                display: "block", 
                textAlign: "center", 
                mt: 1, 
                opacity: 0.7 
              }}
            >
              Initializing secure payment system...
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant - button with optional features list
  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
      
      {showFeatures && (
        <Stack spacing={1} sx={{ mb: 2 }}>
          {premiumFeatures.map((feature, index) => (
            <Stack key={index} direction="row" alignItems="center" spacing={2}>
              <feature.icon size={14} color="#6366F1" />
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {feature.text}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}

      <Button
        variant="contained"
        size={size}
        fullWidth={fullWidth}
        onClick={handleCheckout}
        disabled={loading || !paddleInitialized}
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Crown size={16} />}
        sx={{
          background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
          fontWeight: 600,
          py: size === "large" ? 1.5 : size === "small" ? 0.75 : 1,
          "&:hover": {
            background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
            transform: "translateY(-1px)",
          },
          "&:disabled": {
            background: "rgba(99, 102, 241, 0.5)",
          },
          transition: "all 0.2s ease-in-out",
        }}
      >
        {loading 
          ? "Processing..." 
          : !paddleInitialized 
            ? "Loading Payment..." 
            : `${customTitle || "Upgrade to Premium"} - ${customPrice}`
        }
      </Button>

      {!paddleInitialized && (
        <Typography 
          variant="caption" 
          sx={{ 
            display: "block", 
            textAlign: "center", 
            mt: 1, 
            color: "text.secondary" 
          }}
        >
          Initializing secure payment system...
        </Typography>
      )}
    </Box>
  );
};

export default PaddleCheckout;