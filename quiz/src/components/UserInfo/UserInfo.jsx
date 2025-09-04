import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebaseConfig";
import { doc, setDoc, getDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./UserInfo.css";

const UserInfo = ({ user, onClose, isAdmin }) => {
  const { credits, isPremium, setCredits, setIsPremium } = useAuth();
  const [requestSent, setRequestSent] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  const lastLogin = user.metadata?.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleString()
    : "Unknown";

  // Live snapshot for real-time premium updates
  useEffect(() => {
    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setCredits(data.credits);
        setIsPremium(data.isPremium);
      }
    });
    return unsubscribe;
  }, [user]);

  const handleRequestPremium = async () => {
    try {
      const requestRef = doc(db, "premiumRequests", user.uid);
      const existing = await getDoc(requestRef);

      if (existing.exists() && existing.data().status === "pending") {
        alert("You already have a pending request.");
        setRequestSent(true);
        return;
      }

      // Overwrite or create new request
      await setDoc(
        requestRef,
        {
          uid: user.uid,
          email: user.email,
          name: user.displayName || "N/A",
          createdAt: serverTimestamp(),
          status: "pending",
        },
        { merge: true } // merge ensures old requests are updated
      );
      setRequestSent(true);
      alert("✅ Premium request submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to send request. Try again later.");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="user-info-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="user-info-card card"
          initial={{ y: "-20%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-20%", opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3>User Info</h3>
          <p><strong>Name:</strong> {user.displayName || "N/A"}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Status:</strong> {isPremium ? "🌟 Premium User" : "Free User"}</p>
          <p><strong>Credits:</strong> {isPremium ? "∞" : credits}</p>
          <p><strong>Last Login:</strong> {lastLogin}</p>

          {!isPremium && !requestSent && (
            <button className="btn small-btn" onClick={handleRequestPremium}>
              Request Premium Upgrade
            </button>
          )}
          {!isPremium && requestSent && (
            <p className="success-msg">✅ Request sent! Waiting for admin approval.</p>
          )}

          {isAdmin && (
            <button
              className="btn small-btn admin-btn"
              onClick={() => navigate("/admin")}
            >
              Open Admin Dashboard
            </button>
          )}

          <button className="btn close-btn" onClick={onClose}>
            ❌
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserInfo;
