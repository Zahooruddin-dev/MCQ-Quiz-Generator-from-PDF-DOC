import mammoth from 'mammoth';

export const parseDocx = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

// utils/formatMCQ.js - Fallback parser for existing formatted questions
export const extractQuestionsFromText = (text) => {
  const questions = [];
  const questionBlocks = text.split(/\n\s*\n/).filter(block => block.trim());
  
  for (const block of questionBlocks) {
    const lines = block.split('\n').filter(line => line.trim());
    
    if (lines.length < 5) continue; // Need at least question + 4 options
    
    const questionLine = lines.find(line => /^\d+\./.test(line.trim()));
    if (!questionLine) continue;
    
    const question = questionLine.replace(/^\d+\.\s*/, '').trim();
    const options = [];
    let correctAnswer = -1;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      const optionMatch = line.match(/^[a-d]\)\s*(.+)/i);
      
      if (optionMatch) {
        options.push(optionMatch[1]);
        
        // Check if this is marked as correct (simple heuristic)
        if (line.includes('*') || line.includes('✓')) {
          correctAnswer = options.length - 1;
        }
      }
    }
    
    if (options.length === 4) {
      questions.push({
        question,
        options,
        correctAnswer: correctAnswer >= 0 ? correctAnswer : 0, // Default to first if not found
        explanation: "Answer determined from source material"
      });
    }
  }
  
  return questions;
};
