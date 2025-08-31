
import { useState } from 'react';

const APIConfig = ({ onConfigSave }) => {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      alert('Please enter your API key');
      return;
    }
    onConfigSave(apiKey.trim(), baseUrl);
  };

  return (
    <div className="api-config">
      <div className="config-card">
        <h2>Configure AI Service</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="apiKey">Gemini API Key:</label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key here"
              required
            />
            <small>Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank">Google AI Studio</a></small>
          </div>

          <button type="submit" className="config-button">
            Start Using AI Quiz Generator
          </button>
        </form>
      </div>
    </div>
  );
};

export default APIConfig;