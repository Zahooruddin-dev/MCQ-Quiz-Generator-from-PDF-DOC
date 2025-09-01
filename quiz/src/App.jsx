// App.jsx
import { useState } from 'react';
import FileUpload from './components/FileUpload';
import APIConfig from './components/APIConfig';
import './App.css';

const App = () => {
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(false);

  const handleReconfigure = () => {
    setShowApiConfig(true);
  };

  const handleConfigSave = (apiKey, baseUrl) => {
    setApiConfigured(true);
    setShowApiConfig(false);
    // Additional logic for handling API configuration
  };

  return (
    <div className="app">
      {showApiConfig ? (
        <APIConfig onConfigSave={handleConfigSave} />
      ) : (
        <FileUpload
          hasAI={true}
          loading={false}
          onReconfigure={handleReconfigure}
          onFileUpload={(file, useAI, options) => {
            // Your file upload logic
          }}
        />
      )}
    </div>
  );
};

export default App;
