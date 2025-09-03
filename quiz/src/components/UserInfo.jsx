// src/components/UserInfo/UserInfo.jsx
import { motion, AnimatePresence } from "framer-motion";
import "./UserInfo.css";

const UserInfo = ({ user, onClose }) => {
  if (!user) return null;

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

          <button className="btn small-btn" onClick={onClose}>
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserInfo;
