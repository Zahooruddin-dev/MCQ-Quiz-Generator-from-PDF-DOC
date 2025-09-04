import { useState } from "react";
import APIKeyInput from "./APIKeyInput";
import APIConfigButton from "./APIConfigButton";
import { db } from "../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

const APIConfig = ({ onConfigSave }) => {
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) return alert("Enter API key");

    try {
      await setDoc(doc(db, "settings", "apiKey"), { value: apiKey.trim() });
      onConfigSave(apiKey.trim(), baseUrl);
      alert("API key saved for all users ✅");
    } catch (err) {
      console.error("Failed to save API key:", err);
      alert("Failed to save API key");
    }
  };

  return (
    <div className="api-config">
      <div className="config-card card">
        <h2>Configure AI Service (Admin Only)</h2>
        <form onSubmit={handleSubmit}>
          <APIKeyInput apiKey={apiKey} setApiKey={setApiKey} />
          <APIConfigButton />
        </form>
      </div>
    </div>
  );
};

export default APIConfig;
