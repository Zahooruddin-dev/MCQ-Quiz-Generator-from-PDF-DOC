
// App.jsx
import { useState } from 'react';
import QuizEngine from './components/QuizEngine';
import ResultPage from './components/ResultPage';
import FileUpload from './components/FileUpload';
import APIConfig from './components/APIConfig';
import { extractQuestionsFromText } from './utils/formatMCQ';
import { parseFile } from './utils/fileParser';
import { LLMService } from './utils/llmService';
import './App.css';

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentView, setCurrentView] = useState('config');
  const [userAnswers, setUserAnswers] = useState([]);
  const [fileName, setFileName] = useState('');
  const [llmService, setLLMService] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAPIConfig = (apiKey, baseUrl) => {
    const service = new LLMService(apiKey, baseUrl);
    setLLMService(service);
    setCurrentView('upload');
  };

  const handleFileUpload = async (file, useAI = true, options = {}) => {
    try {
      setLoading(true);
      setFileName(file.name);
      
      // Parse the file content
      const text = await parseFile(file);
      
      let extractedQuestions = [];
      
      if (useAI && llmService) {
        try {
          extractedQuestions = await llmService.generateQuizQuestions(text, options);
        } catch (error) {
          console.error('AI generation failed, falling back to text parsing:', error);
          extractedQuestions = extractQuestionsFromText(text);
        }
      } else {
        extractedQuestions = extractQuestionsFromText(text);
      }
      
      if (extractedQuestions.length === 0) {
        alert('No questions could be generated from this file. Please check the content format.');
        return;
      }
      
      setQuestions(extractedQuestions);
      setUserAnswers(new Array(extractedQuestions.length).fill(null));
      setCurrentView('quiz');
      
    } catch (error) {
      console.error('Error processing file:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizFinish = (answers) => {
    setUserAnswers(answers);
    setCurrentView('results');
  };

  const handleNewQuiz = () => {
    setQuestions([]);
    setUserAnswers([]);
    setCurrentView('upload');
    setFileName('');
  };

  const handleReconfigure = () => {
    setCurrentView('config');
    setLLMService(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI-Powered MCQ Quiz Generator</h1>
        <p>Upload documents and generate intelligent quizzes using AI</p>
      </header>
      
      <main className="app-main">
        {currentView === 'config' && (
          <APIConfig onConfigSave={handleAPIConfig} />
        )}
        
        {currentView === 'upload' && (
          <FileUpload 
            onFileUpload={handleFileUpload}
            hasAI={!!llmService}
            loading={loading}
            onReconfigure={handleReconfigure}
          />
        )}
        
        {currentView === 'quiz' && questions.length > 0 && (
          <QuizEngine 
            questions={questions} 
            onFinish={handleQuizFinish}
          />
        )}
        
        {currentView === 'results' && questions.length > 0 && (
          <ResultPage 
            questions={questions}
            userAnswers={userAnswers}
            onNewQuiz={handleNewQuiz}
            fileName={fileName}
          />
        )}
      </main>
    </div>
  );
}

export default App;
