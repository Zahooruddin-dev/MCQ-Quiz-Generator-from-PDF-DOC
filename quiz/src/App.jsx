// App.jsx
import { useState } from 'react';
import FileUpload from './components/FileUpload';
import APIConfig from './components/APIConfig';
import QuizEngine from './components/QuizEngine';
import './App.css';

const App = () => {
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showApiConfig, setShowApiConfig] = useState(false);

  const handleFileUpload = async (data, useAI, options) => {
    setLoading(true);
    try {
      if (useAI && Array.isArray(data)) {
        // If AI was used, data is already the questions array
        setQuestions(data);
      } else {
        // Handle non-AI case if needed
        // ... your existing logic ...
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle error (show to user)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      {showApiConfig ? (
        <APIConfig onConfigSave={(apiKey) => {
          localStorage.setItem('geminiApiKey', apiKey);
          setShowApiConfig(false);
        }} />
      ) : questions ? (
        <QuizEngine 
          questions={questions} 
          onFinish={(answers) => {
            // Handle quiz completion
          }} 
        />
      ) : (
        <FileUpload
          hasAI={!!localStorage.getItem('geminiApiKey')}
          loading={loading}
          onReconfigure={() => setShowApiConfig(true)}
          onFileUpload={handleFileUpload}
        />
      )}
    </div>
  );
};

export default App;
