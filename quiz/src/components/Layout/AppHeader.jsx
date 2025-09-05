import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import ApiConfigModal from "../APIconfig/APIConfig";
import "./AppHeader.css";

const AppHeader = ({ onProfileClick, onApiConfigUpdate }) => {
  const { logout, credits, isPremium, user } = useAuth();
  const ADMIN_EMAIL = "mizuka886@gmail.com";
  const [showApiConfigModal, setShowApiConfigModal] = useState(false);

  return (
    <>
      <header className="app-header">
        <h1>AI Quiz Generator</h1>

        <div className="header-info">
          <span className="user-name">{user?.displayName || "User"}</span>
          <span className="credits">
            {isPremium ? "🌟 Premium" : ` Credits: ${credits}`}
          </span>
        </div>

        <div className="header-actions">
          <button className="btn small-btn" onClick={onProfileClick}>
            👤 Profile
          </button>

          {/* Admin button for API Config */}
          {user?.email === ADMIN_EMAIL && (
            <button
              className="btn small-btn"
              onClick={() => setShowApiConfigModal(true)}
            >
              ⚙️ Configure API
            </button>
          )}

          <button className="btn small-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* API Configuration Modal */}
      {showApiConfigModal && (
        <ApiConfigModal
          onConfigSave={onApiConfigUpdate}
          onClose={() => setShowApiConfigModal(false)}
        />
      )}
    </>
  );
};

export default AppHeader;