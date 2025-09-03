// src/components/Layout/AppHeader.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";
import "./AppHeader.css";

const AppHeader = ({ onProfileClick }) => {
  const { logout } = useAuth();

  return (
    <header className="app-header">
      <h1>AI Quiz Generator</h1>
      <div className="header-actions">
        <button className="btn small-btn" onClick={onProfileClick}>
          👤 Profile
        </button>
        <button className="btn small-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
};


export default AppHeader;
