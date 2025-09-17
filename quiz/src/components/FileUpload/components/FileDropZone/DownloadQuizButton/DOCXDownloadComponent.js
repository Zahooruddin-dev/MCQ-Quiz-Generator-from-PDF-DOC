import React from 'react';
import QuizSheetGenerator from './QuizSheetGenerator';
import AnswerKeyGenerator from './AnswerKeyGenerator';

const DOCXDownloadComponent = {
  // Generate both DOCX files (Quiz Sheet + Answer Key)
  generate: async (quizData, questions, showSnackbar) => {
    try {
      // Generate Quiz Sheet DOCX
      await QuizSheetGenerator.generateDOCX(quizData, questions);
      
      // Add a small delay to prevent file conflicts
      setTimeout(async () => {
        try {
          // Generate Answer Key DOCX
          await AnswerKeyGenerator.generateDOCX(quizData, questions);
          showSnackbar('DOCX files downloaded! Quiz sheet and answer key saved separately.', 'success');
        } catch (error) {
          console.error('Failed to generate answer key DOCX:', error);
          showSnackbar('Quiz sheet downloaded, but failed to generate answer key DOCX', 'warning');
        }
      }, 1000);
      
    } catch (error) {
      console.error('Failed to generate quiz sheet DOCX:', error);
      showSnackbar('Failed to generate DOCX files', 'error');
      throw error;
    }
  }
};

export default DOCXDownloadComponent;