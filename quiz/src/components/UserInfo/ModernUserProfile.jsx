import React, { useState, useEffect } from "react";
import {
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Avatar,
  Chip,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  Alert,
  Fade,
} from "@mui/material";
import {
  Crown,
  Coins,
  Calendar,
  Mail,
  Settings,
  Award,
  X,
  Clock,
  Shield,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebaseConfig";
import { doc, setDoc, getDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  StyledDialog,
  ProfileHeader,
  StatsCard,
  PremiumBadge,
  CreditsMeter,
} from "./ProfileStyles";

const ModernUserProfile = ({ user, onClose, isAdmin }) => {
  const { credits, isPremium, setCredits, setIsPremium } = useAuth();
  const [requestSent, setRequestSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    quizzesCompleted: 0,
    totalQuestions: 0,
    averageScore: 0,
    streak: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setCredits(data.credits || 0);
        setIsPremium(data.isPremium || false);

        setUserStats({
          quizzesCompleted: data.quizzesTaken || 0,
          totalQuestions: data.totalQuestions || 0,
          averageScore: data.avgScore || 0,
          streak: data.streak || 0,
        });
      }
    });

    return unsubscribe;
  }, [user, setCredits, setIsPremium]);

  const handleRequestPremium = async () => {
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

  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCreditsColor = () => {
    if (isPremium) return "#FFD700";
    if (credits > 3) return "#10B981";
    if (credits > 1) return "#F59E0B";
    return "#EF4444";
  };

  if (!user) return null;

  return (
    <StyledDialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <ProfileHeader>
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
      </ProfileHeader>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Account Info */}
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

            <Divider />

            {/* Stats */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Your Statistics
              </Typography>

              <Stack direction="row" spacing={2}>
                <StatsCard sx={{ flex: 1 }}>
                  <CardContent sx={{ p: 2, textAlign: "center" }}>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 800, color: "primary.main" }}
                    >
                      {userStats.quizzesCompleted}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Quizzes Completed
                    </Typography>
                  </CardContent>
                </StatsCard>

                <StatsCard sx={{ flex: 1 }}>
                  <CardContent sx={{ p: 2, textAlign: "center" }}>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 800, color: "success.main" }}
                    >
                      {Number(userStats.averageScore || 0).toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Average Score
                    </Typography>
                  </CardContent>
                </StatsCard>
              </Stack>
            </Box>

            {/* Premium Section */}
            {!isPremium && (
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
              </Fade>
            )}
          </Stack>
        </Box>
      </DialogContent>

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
    </StyledDialog>
  );
};

export default ModernUserProfile;
