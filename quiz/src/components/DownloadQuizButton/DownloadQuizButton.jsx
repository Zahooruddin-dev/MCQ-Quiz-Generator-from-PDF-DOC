import React, { useState } from 'react';
import {
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  GetAppOutlined as DownloadIcon,
  PictureAsPdfOutlined as PdfIcon,
  ImageOutlined as ImageIcon,
  TableChartOutlined as CsvIcon,
  DescriptionOutlined as TxtIcon,
} from '@mui/icons-material';

const DownloadQuizButton = ({ 
  quizData, 
  userResults, 
  questions, 
  userAnswers,
  variant = 'outlined',
  size = 'large',
  fullWidth = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const generatePDF = async () => {
    setLoading(true);
    handleMenuClose();
    
    try {
      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Quiz Results - ${quizData?.title || 'Quiz'}</title>
          <style>
            body { 
              font-family: 'Inter', Arial, sans-serif; 
              line-height: 1.6; 
              color: #1e293b; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              padding: 20px; 
              background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); 
              color: white; 
              border-radius: 12px; 
            }
            .score-circle { 
              display: inline-block; 
              width: 80px; 
              height: 80px; 
              border-radius: 50%; 
              background: rgba(255,255,255,0.2); 
              line-height: 80px; 
              font-size: 24px; 
              font-weight: bold; 
              margin: 10px; 
            }
            .stats { 
              display: flex; 
              justify-content: space-around; 
              margin: 20px 0; 
              padding: 15px; 
              background: #f8fafc; 
              border-radius: 8px; 
            }
            .stat { text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #6366F1; }
            .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; }
            .question { 
              margin: 20px 0; 
              padding: 15px; 
              border: 1px solid #e2e8f0; 
              border-radius: 8px; 
            }
            .question-header { 
              font-weight: 600; 
              margin-bottom: 10px; 
              color: #1e293b; 
            }
            .option { 
              padding: 8px 12px; 
              margin: 5px 0; 
              border-radius: 6px; 
              border: 1px solid #e2e8f0; 
            }
            .correct { background: #dcfce7; border-color: #10b981; }
            .wrong { background: #fef2f2; border-color: #ef4444; }
            .explanation { 
              margin-top: 10px; 
              padding: 10px; 
              background: #f0f9ff; 
              border-left: 4px solid #3b82f6; 
              font-style: italic; 
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              padding: 15px; 
              border-top: 1px solid #e2e8f0; 
              color: #64748b; 
              font-size: 12px; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${quizData?.title || 'Quiz Results'}</h1>
            <div class="score-circle">${userResults?.score}%</div>
            <p>Quiz completed on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="stats">
            <div class="stat">
              <div class="stat-value">${userResults?.correct || 0}</div>
              <div class="stat-label">Correct</div>
            </div>
            <div class="stat">
              <div class="stat-value">${userResults?.wrong || 0}</div>
              <div class="stat-label">Wrong</div>
            </div>
            <div class="stat">
              <div class="stat-value">${userResults?.unattempted || 0}</div>
              <div class="stat-label">Unattempted</div>
            </div>
            <div class="stat">
              <div class="stat-value">${questions?.length || 0}</div>
              <div class="stat-label">Total Questions</div>
            </div>
          </div>
          
          <h2>Question Review</h2>
          ${questions?.map((question, index) => {
            const userAnswer = userAnswers?.[index];
            const isCorrect = userAnswer === question.correctAnswer;
            const isAttempted = userAnswer !== null && userAnswer !== undefined;
            
            return `
              <div class="question">
                <div class="question-header">
                  Question ${index + 1}: ${question.question}
                </div>
                ${question.context ? `<p><em>Context: ${question.context}</em></p>` : ''}
                ${question.options?.map((option, optionIndex) => {
                  const isCorrectOption = optionIndex === question.correctAnswer;
                  const isUserSelection = optionIndex === userAnswer;
                  const classes = isCorrectOption ? 'option correct' : 
                                 (isUserSelection && !isCorrectOption) ? 'option wrong' : 'option';
                  
                  return `<div class="${classes}">
                    ${String.fromCharCode(65 + optionIndex)}. ${option}
                    ${isCorrectOption ? ' ✓' : ''}
                    ${isUserSelection && !isCorrectOption ? ' ✗' : ''}
                  </div>`;
                }).join('') || ''}
                ${question.explanation ? `<div class="explanation">💡 ${question.explanation}</div>` : ''}
              </div>
            `;
          }).join('') || ''}
          
          <div class="footer">
            Generated by QuizAI - ${new Date().toLocaleString()}
          </div>
        </body>
        </html>
      `;

      // Create and download PDF using browser's print functionality
      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load then trigger print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      
      showSnackbar('PDF download initiated! Use your browser\'s print dialog to save as PDF.');
    } catch (error) {
      console.error('PDF generation failed:', error);
      showSnackbar('Failed to generate PDF', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateCSV = () => {
    handleMenuClose();
    
    try {
      const csvData = [
        ['Question', 'Your Answer', 'Correct Answer', 'Result', 'Explanation'],
        ...questions.map((question, index) => {
          const userAnswer = userAnswers[index];
          const userAnswerText = userAnswer !== null && userAnswer !== undefined 
            ? question.options[userAnswer] 
            : 'Not Answered';
          const correctAnswerText = question.options[question.correctAnswer];
          const result = userAnswer === null || userAnswer === undefined 
            ? 'Unattempted' 
            : userAnswer === question.correctAnswer 
            ? 'Correct' 
            : 'Wrong';
          
          return [
            question.question,
            userAnswerText,
            correctAnswerText,
            result,
            question.explanation || ''
          ];
        })
      ];
      
      const csvContent = csvData.map(row => 
        row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${quizData?.title || 'quiz'}-results.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      
      showSnackbar('CSV file downloaded successfully!');
    } catch (error) {
      console.error('CSV generation failed:', error);
      showSnackbar('Failed to generate CSV', 'error');
    }
  };

  const generateTXT = () => {
    handleMenuClose();
    
    try {
      let txtContent = `QUIZ RESULTS\n`;
      txtContent += `=============\n\n`;
      txtContent += `Quiz: ${quizData?.title || 'Untitled Quiz'}\n`;
      txtContent += `Date: ${new Date().toLocaleDateString()}\n`;
      txtContent += `Score: ${userResults?.score}% (${userResults?.correct}/${questions?.length})\n\n`;
      
      txtContent += `DETAILED RESULTS\n`;
      txtContent += `================\n\n`;
      
      questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const userAnswerText = userAnswer !== null && userAnswer !== undefined 
          ? question.options[userAnswer] 
          : 'Not Answered';
        const correctAnswerText = question.options[question.correctAnswer];
        const result = userAnswer === null || userAnswer === undefined 
          ? 'UNATTEMPTED' 
          : userAnswer === question.correctAnswer 
          ? 'CORRECT' 
          : 'WRONG';
        
        txtContent += `Question ${index + 1}: ${question.question}\n`;
        if (question.context) {
          txtContent += `Context: ${question.context}\n`;
        }
        txtContent += `Your Answer: ${userAnswerText}\n`;
        txtContent += `Correct Answer: ${correctAnswerText}\n`;
        txtContent += `Result: ${result}\n`;
        if (question.explanation) {
          txtContent += `Explanation: ${question.explanation}\n`;
        }
        txtContent += `\n`;
      });
      
      txtContent += `Generated by QuizAI on ${new Date().toLocaleString()}`;
      
      const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${quizData?.title || 'quiz'}-results.txt`;
      link.click();
      URL.revokeObjectURL(link.href);
      
      showSnackbar('Text file downloaded successfully!');
    } catch (error) {
      console.error('TXT generation failed:', error);
      showSnackbar('Failed to generate text file', 'error');
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
        onClick={handleMenuOpen}
        disabled={loading}
        sx={{ px: 4, py: 1.5 }}
      >
        {loading ? 'Generating...' : 'Download Quiz'}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 200,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }
        }}
      >
        <MenuItem onClick={generatePDF}>
          <ListItemIcon>
            <PdfIcon color="error" />
          </ListItemIcon>
          <ListItemText 
            primary="Download as PDF" 
            secondary="Formatted document"
          />
        </MenuItem>
        
        <MenuItem onClick={generateCSV}>
          <ListItemIcon>
            <CsvIcon color="success" />
          </ListItemIcon>
          <ListItemText 
            primary="Download as CSV" 
            secondary="Spreadsheet format"
          />
        </MenuItem>
        
        <MenuItem onClick={generateTXT}>
          <ListItemIcon>
            <TxtIcon color="info" />
          </ListItemIcon>
          <ListItemText 
            primary="Download as Text" 
            secondary="Plain text format"
          />
        </MenuItem>
      </Menu>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DownloadQuizButton;