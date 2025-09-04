import React from "react";
import { useAuth } from "../../context/AuthContext";
import "./AppHeader.css";

const AppHeader = ({ onProfileClick, showApiConfig, setShowApiConfig }) => {
  const { logout, credits, isPremium, user } = useAuth();
  const ADMIN_EMAIL = "mizuka886@gmail.com";

  return (
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

        {/* Admin toggle for API Config */}
        {user?.email === ADMIN_EMAIL && (
          <button
            className="btn small-btn"
            onClick={() => setShowApiConfig((prev) => !prev)}
          >
            ⚙️ {showApiConfig ? "Close API Config" : "Configure API"}
          </button>
        )}

        <button className="btn small-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
