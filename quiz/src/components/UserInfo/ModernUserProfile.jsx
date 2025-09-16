import React, { useState, useEffect } from "react";
import {
  DialogContent,
  Box,
  Stack,
  Divider,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import { StyledDialog } from "./ProfileStyles";

// Import sub-components
import ProfileHeader from "./ProfileHeader";
import ProfileAccountInfo from "./ProfileAccountInfo";
import ProfileStats from "./ProfileStats";
import ProfilePremiumCard from "./ProfilePremiumCard";
import ProfileActions from "./ProfileActions";

const ModernUserProfile = ({ user, onClose, isAdmin }) => {
  const { credits, isPremium, setCredits, setIsPremium } = useAuth();
  const [userStats, setUserStats] = useState({
    quizzesCompleted: 0,
    totalQuestions: 0,
    averageScore: 0,
    streak: 0,
  });

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

  if (!user) return null;

  return (
    <StyledDialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <ProfileHeader
        user={user}
        isPremium={isPremium}
        credits={credits}
        isAdmin={isAdmin}
        onClose={onClose}
      />

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          <Stack spacing={3}>
            <ProfileAccountInfo user={user} />
            
            <Divider />
            
            <ProfileStats userStats={userStats} />
            
            <ProfilePremiumCard user={user} isPremium={isPremium} />
          </Stack>
        </Box>
      </DialogContent>

      <ProfileActions isAdmin={isAdmin} onClose={onClose} />
    </StyledDialog>
  );
};

export default ModernUserProfile;