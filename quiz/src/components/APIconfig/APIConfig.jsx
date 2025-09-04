import { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "../Layout/AppHeader.css";

const ApiConfigModal = ({ onConfigSave, onClose }) => {
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch existing key from Firestore on mount
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const docSnap = await getDoc(doc(db, "settings", "apiKey"));
        if (docSnap.exists()) {
          setApiKey(docSnap.data().value || "");
        }
      } catch (err) {
        console.error("Failed to fetch API key:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApiKey();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    
    setSaving(true);
    try {
      // Save to Firestore
      await setDoc(doc(db, "settings", "apiKey"), { value: apiKey.trim() });

      // Also update app state immediately
      onConfigSave?.(apiKey.trim(), baseUrl);

      // Save to localStorage as fallback
      localStorage.setItem("geminiApiKey", apiKey.trim());

      // Close modal after successful save
      setTimeout(() => {
        onClose?.();
      }, 1000);
    } catch (err) {
      console.error("Failed to save API key:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    // Close modal on Escape key press
    const handleEscape = (e) => {
      if (e.keyCode === 27) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (loading) {
    return (
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="modal-content">
          <div className="loading-spinner"></div>
          <p>Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content api-config-modal">
        <div className="modal-header">
          <h2>Configure AI Service (Admin Only)</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="apiKey">API Key</label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="api-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="baseUrl">Base URL</label>
            <input
              type="text"
              id="baseUrl"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="Enter API Base URL"
              className="api-input"
              required
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn primary"
              disabled={saving || !apiKey.trim()}
            >
              {saving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </form>
        
        {saving && (
          <div className="save-status">
            <div className="loading-spinner small"></div>
            <span>Saving configuration...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiConfigModal;