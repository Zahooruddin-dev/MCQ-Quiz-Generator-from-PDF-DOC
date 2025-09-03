import React from 'react';

const APIKeyInput = ({ apiKey, setApiKey }) => {
  return (
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
      <small>
        Get your API key from{' '}
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google AI Studio
        </a>
      </small>
    </div>
  );
};

export default APIKeyInput;
