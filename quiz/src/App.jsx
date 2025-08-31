// App.jsx
import { useState } from 'react'
import QuizEngine from './components/QuizEngine'
import ResultPage from './components/ResultPage'
import FileUpload from './components/FileUpload'
import { extractQuestionsFromText } from './utils/formatMCQ'
import { parsePdf } from './utils/parsePdf'
import { parseDocx } from './utils/parseDocx'
import './App.css'

function App() {
  const [questions, setQuestions] = useState([])
  const [currentView, setCurrentView] = useState('upload') // upload, quiz, results
  const [userAnswers, setUserAnswers] = useState([])
  const [fileName, setFileName] = useState('')

  const handleFileUpload = async (file) => {
    try {
      let text = ''
      setFileName(file.name)
      
      if (file.type === 'application/pdf') {
        text = await parsePdf(file)
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        text = await parseDocx(file)
      } else {
        alert('Unsupported file type. Please upload a PDF or DOCX file.')
        return
      }
      
      const extractedQuestions = extractQuestionsFromText(text)
      setQuestions(extractedQuestions)
      setUserAnswers(new Array(extractedQuestions.length).fill(null))
      setCurrentView('quiz')
    } catch (error) {
      console.error('Error parsing file:', error)
      alert('Error parsing file. Please make sure it contains properly formatted MCQs.')
    }
  }

  const handleQuizFinish = (answers) => {
    setUserAnswers(answers)
    setCurrentView('results')
  }

  const handleNewQuiz = () => {
    setQuestions([])
    setUserAnswers([])
    setCurrentView('upload')
    setFileName('')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>MCQ Quiz Generator</h1>
        <p>Upload a PDF or DOCX file to generate an interactive quiz</p>
      </header>
      
      <main className="app-main">
        {currentView === 'upload' && (
          <FileUpload onFileUpload={handleFileUpload} />
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
  )
}

export default App