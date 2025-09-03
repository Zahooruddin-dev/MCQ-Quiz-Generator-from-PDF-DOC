// src/components/UserInfo/UserInfo.jsx
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import "./UserInfo.css";

const UserInfo = ({ user, onClose }) => {
  const { credits, isPremium } = useAuth();

  if (!user) return null;

  const lastLogin = user.metadata?.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleString()
    : "Unknown";

  return (
    <AnimatePresence>
      <motion.div
        className="user-info-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="user-info-card"
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

          <button className="btn small-btn" onClick={onClose}>
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserInfo;
