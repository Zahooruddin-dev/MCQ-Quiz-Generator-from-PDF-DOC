
import { useState } from 'react';

const APIConfig = ({ onConfigSave }) => {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent');
  const [provider, setProvider] = useState('gemini');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      alert('Please enter your API key');
      return;
    }
    onConfigSave(apiKey.trim(), baseUrl);
  };

  const handleProviderChange = (selectedProvider) => {
    setProvider(selectedProvider);
    switch (selectedProvider) {
      case 'gemini':
        setBaseUrl('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent');
        break;
      case 'openai':
        setBaseUrl('https://api.openai.com/v1/chat/completions');
        break;
      default:
        setBaseUrl('');
    }
  };

  return (
    <div className="api-config">
      <div className="config-card">
        <h2>Configure AI Service</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="provider">AI Provider:</label>
            <select 
              id="provider"
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value)}
            >
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI GPT</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="apiKey">API Key:</label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key here"
              required
            />
            <small>Your API key is stored locally and never sent to our servers</small>
          </div>

          <div className="form-group">
            <label htmlFor="baseUrl">API Endpoint:</label>
            <input
              type="url"
              id="baseUrl"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="API endpoint URL"
              required
            />
          </div>

          <button type="submit" className="config-button">
            Save Configuration
          </button>
        </form>

        <div className="api-info">
          <h3>Getting Started:</h3>
          <ul>
            <li><strong>Gemini:</strong> Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank">Google AI Studio</a></li>
            <li><strong>OpenAI:</strong> Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI Platform</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default APIConfig;