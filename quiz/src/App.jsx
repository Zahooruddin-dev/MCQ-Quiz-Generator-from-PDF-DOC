
import { useState } from 'react';
import QuizEngine from './components/QuizEngine';
import ResultPage from './components/ResultPage';
import FileUpload from './components/FileUpload';
import APIConfig from './components/APIConfig';
import { extractQuestionsFromText } from './utils/formatMCQ';
import { parsePdf } from './utils/parsePDF';
import { parseDocx } from './utils/parseDocx';
import { LLMService } from './utils/llmService';
import './App.css';

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentView, setCurrentView] = useState('config'); // config, upload, quiz, results
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
      let text = '';
      setFileName(file.name);
      
      // Parse the file content
      if (file.type === 'application/pdf') {
        text = await parsePdf(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        text = await parseDocx(file);
      } else {
        alert('Unsupported file type. Please upload a PDF or DOCX file.');
        return;
      }
      
      let extractedQuestions = [];
      
      if (useAI && llmService) {
        // Use LLM to generate questions
        try {
          extractedQuestions = await llmService.generateQuizQuestions(text, options);
        } catch (error) {
          console.error('AI generation failed, falling back to text parsing:', error);
          extractedQuestions = extractQuestionsFromText(text);
        }
      } else {
        // Use traditional text parsing
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
      alert('Error processing file. Please try again.');
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