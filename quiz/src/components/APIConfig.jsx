import { useState, useEffect } from 'react';
import APIKeyInput from './APIconfig/APIconfigComponent';
import APIConfigButton from './APIconfig/APIConfigButton';

const APIConfig = ({ onConfigSave }) => {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
  );
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (savedApiKey && isInitialLoad) {
      setApiKey(savedApiKey);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      alert('Please enter your API key');
      return;
    }
    localStorage.setItem('geminiApiKey', apiKey.trim());
    onConfigSave(apiKey.trim(), baseUrl);
  };

  return (
    <div className="api-config">
      <div className="config-card">
        <h2>Configure AI Service</h2>
        <form onSubmit={handleSubmit}>
          <APIKeyInput apiKey={apiKey} setApiKey={setApiKey} />
          <APIConfigButton />
        </form>
      </div>
    </div>
  );
};

export default APIConfig;
