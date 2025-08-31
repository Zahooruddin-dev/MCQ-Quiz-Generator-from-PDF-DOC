// utils/formatMCQ.js
export const extractQuestionsFromText = (text) => {
  // Split text into lines and remove empty lines
  const lines = text.split('\n').filter(line => line.trim() !== '')
  const questions = []
  let currentQuestion = null
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Detect question (supports multiple formats)
    if (line.match(/^Q\d+\.|^Question \d+:|^\d+\./)) {
      if (currentQuestion) {
        questions.push(currentQuestion)
      }
      
      currentQuestion = {
        q: line.replace(/^Q\d+\.|^Question \d+:|^\d+\./, '').trim(),
        options: [],
        answer: ''
      }
    } 
    // Detect options (a), b), c), d)
    else if (line.match(/^[a-d]\)/)) {
      if (currentQuestion) {
        currentQuestion.options.push(line.replace(/^[a-d]\)/, '').trim())
      }
    }
    // Detect answer
    else if (line.match(/^Answer:/i)) {
      if (currentQuestion) {
        currentQuestion.answer = line.replace(/^Answer:/i, '').trim()
      }
    }
    // Handle case where question continues on next line
    else if (currentQuestion && currentQuestion.options.length === 0) {
      currentQuestion.q += ' ' + line
    }
  }
  
  // Add the last question
  if (currentQuestion) {
    questions.push(currentQuestion)
  }
  
  return questions
}