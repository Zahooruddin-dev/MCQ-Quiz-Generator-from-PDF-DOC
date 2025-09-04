import { useState, useEffect } from "react";
import APIKeyInput from "./APIKeyInput";
import APIConfigButton from "./APIConfigButton";
import { db } from "../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

const APIConfig = ({ onConfigSave, onClose }) => {
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
  );
  const [loading, setLoading] = useState(true);

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
    if (!apiKey.trim()) return alert("Enter API key");

    try {
      // Save to Firestore
      await setDoc(doc(db, "settings", "apiKey"), { value: apiKey.trim() });

      // Also update app state immediately
      onConfigSave?.(apiKey.trim(), baseUrl);

      // Save to localStorage as fallback
      localStorage.setItem("geminiApiKey", apiKey.trim());

      alert("API key saved ✅");
      onClose?.();
    } catch (err) {
      console.error("Failed to save API key:", err);
      alert("Failed to save API key");
    }
  };

  if (loading) return <div>Loading config…</div>;

  return (
    <div className="api-config">
      <div className="config-card card">
        <h2>Configure AI Service (Admin Only)</h2>
        <form onSubmit={handleSubmit}>
          <label>
            API Key:
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter Gemini API key"
              className="api-input"
              required
            />
          </label>
          <label>
            Base URL:
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="Enter API Base URL"
              className="api-input"
              required
            />
          </label>
          <APIConfigButton />
        </form>
        {onClose && (
          <button className="btn-close" onClick={onClose}>
            ✖ Close
          </button>
        )}
      </div>
    </div>
  );
};

export default APIConfig;
