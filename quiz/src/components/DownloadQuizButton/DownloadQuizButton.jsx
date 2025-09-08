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
  TableChartOutlined as CsvIcon,
  DescriptionOutlined as TxtIcon,
  QuizOutlined as QuizIcon,
} from '@mui/icons-material';

const DownloadQuizButton = ({ 
  quizData, 
  questions = [], 
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

  // Generate Quiz Sheet (Questions Only)
  const generateQuizSheet = (format) => {
    const quizTitle = quizData?.title || 'Quiz Sheet';
    const date = new Date().toLocaleDateString();
    
    if (format === 'pdf') {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${quizTitle}</title>
          <style>
            @media print { @page { margin: 1in; } }
            body { 
              font-family: 'Times New Roman', serif; 
              line-height: 1.8; 
              color: #000; 
              max-width: 100%; 
              margin: 0; 
              padding: 20px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #000;
              padding-bottom: 15px;
            }
            .title { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 10px;
              text-transform: uppercase;
            }
            .info { 
              font-size: 14px; 
              margin: 5px 0;
            }
            .instructions {
              background: #f5f5f5;
              border: 1px solid #ccc;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .question { 
              margin: 25px 0; 
              page-break-inside: avoid;
              clear: both;
            }
            .question-header { 
              font-weight: bold; 
              margin-bottom: 10px; 
              font-size: 16px;
            }
            .context {
              font-style: italic;
              color: #666;
              margin-bottom: 10px;
              padding: 10px;
              background: #f9f9f9;
              border-left: 3px solid #ddd;
            }
            .options { 
              margin-left: 20px;
              line-height: 2;
            }
            .option { 
              margin: 8px 0;
              display: block;
            }
            .answer-line {
              margin-top: 15px;
              border-bottom: 1px solid #000;
              min-height: 20px;
            }
            .footer { 
              margin-top: 40px; 
              text-align: center; 
              font-size: 12px;
              border-top: 1px solid #ccc;
              padding-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${quizTitle}</div>
            <div class="info">Date: ${date}</div>
            <div class="info">Total Questions: ${questions.length}</div>
            <div class="info">Name: _________________________ Class: _________</div>
          </div>
          
          <div class="instructions">
            <strong>Instructions:</strong>
            <ul>
              <li>Read each question carefully</li>
              <li>Choose the best answer for each multiple choice question</li>
              <li>Mark your answer clearly</li>
              <li>Use the answer line provided for each question</li>
            </ul>
          </div>
          
          ${questions.map((question, index) => `
            <div class="question">
              <div class="question-header">
                ${index + 1}. ${question.question}
              </div>
              ${question.context ? `<div class="context">Context: ${question.context}</div>` : ''}
              <div class="options">
                ${question.options?.map((option, optionIndex) => 
                  `<div class="option">
                    ${String.fromCharCode(65 + optionIndex)}. ${option}
                  </div>`
                ).join('') || ''}
              </div>
              <div class="answer-line">
                <strong>Answer: _______</strong>
              </div>
            </div>
          `).join('')}
          
          <div class="footer">
            Quiz Generated on ${new Date().toLocaleString()}
          </div>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
      }, 500);

    } else if (format === 'txt') {
      let content = `${quizTitle.toUpperCase()}\n`;
      content += `${'='.repeat(quizTitle.length)}\n\n`;
      content += `Date: ${date}\n`;
      content += `Total Questions: ${questions.length}\n`;
      content += `Name: _________________________ Class: _________\n\n`;
      
      content += `INSTRUCTIONS:\n`;
      content += `- Read each question carefully\n`;
      content += `- Choose the best answer for each multiple choice question\n`;
      content += `- Write your answer clearly in the space provided\n\n`;
      
      questions.forEach((question, index) => {
        content += `${index + 1}. ${question.question}\n`;
        if (question.context) {
          content += `   Context: ${question.context}\n`;
        }
        question.options?.forEach((option, optionIndex) => {
          content += `   ${String.fromCharCode(65 + optionIndex)}. ${option}\n`;
        });
        content += `   Answer: _______\n\n`;
      });
      
      content += `\nGenerated on ${new Date().toLocaleString()}`;
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${quizData?.title || 'quiz'}-sheet.txt`;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  // Generate Answer Key
  const generateAnswerKey = (format) => {
    const quizTitle = quizData?.title || 'Quiz';
    const date = new Date().toLocaleDateString();
    
    if (format === 'pdf') {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${quizTitle} - Answer Key</title>
          <style>
            @media print { @page { margin: 1in; } }
            body { 
              font-family: 'Times New Roman', serif; 
              line-height: 1.6; 
              color: #000; 
              max-width: 100%; 
              margin: 0; 
              padding: 20px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #000;
              padding-bottom: 15px;
            }
            .title { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 10px;
              text-transform: uppercase;
              color: #d32f2f;
            }
            .info { 
              font-size: 14px; 
              margin: 5px 0;
            }
            .answer-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
              margin: 20px 0;
              padding: 15px;
              border: 2px solid #000;
            }
            .answer-item {
              text-align: center;
              font-weight: bold;
              padding: 8px;
              border: 1px solid #ccc;
            }
            .detailed-answers {
              margin-top: 30px;
            }
            .question-answer { 
              margin: 15px 0; 
              padding: 10px;
              border-left: 4px solid #4caf50;
              background: #f8f9fa;
            }
            .question-text { 
              font-weight: bold; 
              margin-bottom: 5px; 
            }
            .correct-answer { 
              color: #2e7d32; 
              font-weight: bold;
            }
            .explanation { 
              margin-top: 8px; 
              font-style: italic; 
              color: #666;
            }
            .footer { 
              margin-top: 40px; 
              text-align: center; 
              font-size: 12px;
              border-top: 1px solid #ccc;
              padding-top: 15px;
              color: #d32f2f;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${quizTitle} - Answer Key</div>
            <div class="info">Date: ${date}</div>
            <div class="info">Total Questions: ${questions.length}</div>
          </div>
          
          <div class="answer-grid">
            ${questions.map((question, index) => `
              <div class="answer-item">
                ${index + 1}. ${String.fromCharCode(65 + question.correctAnswer)}
              </div>
            `).join('')}
          </div>
          
          <div class="detailed-answers">
            <h3>Detailed Answers & Explanations</h3>
            ${questions.map((question, index) => `
              <div class="question-answer">
                <div class="question-text">
                  ${index + 1}. ${question.question}
                </div>
                <div class="correct-answer">
                  Correct Answer: ${String.fromCharCode(65 + question.correctAnswer)}. ${question.options[question.correctAnswer]}
                </div>
                ${question.explanation ? `
                  <div class="explanation">
                    Explanation: ${question.explanation}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            ⚠️ TEACHER'S ANSWER KEY - DO NOT DISTRIBUTE TO STUDENTS ⚠️<br>
            Generated on ${new Date().toLocaleString()}
          </div>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
      }, 500);

    } else if (format === 'txt') {
      let content = `${quizTitle.toUpperCase()} - ANSWER KEY\n`;
      content += `${'='.repeat(quizTitle.length + 12)}\n\n`;
      content += `⚠️ TEACHER'S ANSWER KEY - DO NOT DISTRIBUTE TO STUDENTS ⚠️\n\n`;
      content += `Date: ${date}\n`;
      content += `Total Questions: ${questions.length}\n\n`;
      
      content += `QUICK REFERENCE:\n`;
      content += `-`.repeat(50) + `\n`;
      questions.forEach((question, index) => {
        if (index % 10 === 0 && index > 0) content += `\n`;
        content += `${index + 1}. ${String.fromCharCode(65 + question.correctAnswer)}  `;
      });
      content += `\n\n`;
      
      content += `DETAILED ANSWERS & EXPLANATIONS:\n`;
      content += `=`.repeat(50) + `\n\n`;
      
      questions.forEach((question, index) => {
        content += `${index + 1}. ${question.question}\n`;
        content += `   Correct Answer: ${String.fromCharCode(65 + question.correctAnswer)}. ${question.options[question.correctAnswer]}\n`;
        if (question.explanation) {
          content += `   Explanation: ${question.explanation}\n`;
        }
        content += `\n`;
      });
      
      content += `\n⚠️ CONFIDENTIAL - FOR TEACHER USE ONLY ⚠️\n`;
      content += `Generated on ${new Date().toLocaleString()}`;
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${quizData?.title || 'quiz'}-answer-key.txt`;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  // Generate CSV format
  const generateCSV = () => {
    handleMenuClose();
    
    try {
      // Quiz Sheet CSV
      const quizCsvData = [
        ['Question Number', 'Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Context'],
        ...questions.map((question, index) => [
          index + 1,
          question.question,
          question.options[0] || '',
          question.options[1] || '',
          question.options[2] || '',
          question.options[3] || ''
        ])
      ];
      
      // Answer Key CSV
      const answerCsvData = [
        ['Question Number', 'Question', 'Correct Answer', 'Correct Option', 'Explanation'],
        ...questions.map((question, index) => [
          index + 1,
          question.question,
          String.fromCharCode(65 + question.correctAnswer),
          question.options[question.correctAnswer],
          question.explanation || ''
        ])
      ];
      
      // Download Quiz Sheet CSV
      const quizCsvContent = quizCsvData.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      
      const quizBlob = new Blob([quizCsvContent], { type: 'text/csv;charset=utf-8;' });
      const quizLink = document.createElement('a');
      quizLink.href = URL.createObjectURL(quizBlob);
      quizLink.download = `${quizData?.title || 'quiz'}-sheet.csv`;
      quizLink.click();
      URL.revokeObjectURL(quizLink.href);
      
      // Download Answer Key CSV (with delay)
      setTimeout(() => {
        const answerCsvContent = answerCsvData.map(row => 
          row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        const answerBlob = new Blob([answerCsvContent], { type: 'text/csv;charset=utf-8;' });
        const answerLink = document.createElement('a');
        answerLink.href = URL.createObjectURL(answerBlob);
        answerLink.download = `${quizData?.title || 'quiz'}-answer-key.csv`;
        answerLink.click();
        URL.revokeObjectURL(answerLink.href);
      }, 1000);
      
      showSnackbar('CSV files downloaded! Quiz sheet and answer key saved separately.');
    } catch (error) {
      console.error('CSV generation failed:', error);
      showSnackbar('Failed to generate CSV files', 'error');
    }
  };

  const handlePDFDownload = async () => {
    setLoading(true);
    handleMenuClose();
    
    try {
      generateCombinedPDF();
      showSnackbar('PDF generated! Quiz sheet with answer key ready for download.');
    } catch (error) {
      console.error('PDF generation failed:', error);
      showSnackbar('Failed to generate PDF file', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Generate Combined PDF (Quiz + Answer Key)
  const generateCombinedPDF = () => {
    const quizTitle = quizData?.title || 'Quiz Sheet';
    const date = new Date().toLocaleDateString();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${quizTitle} - Complete</title>
        <style>
          @media print { 
            @page { margin: 1in; }
            .page-break { page-break-before: always; }
          }
          body { 
            font-family: 'Times New Roman', serif; 
            line-height: 1.8; 
            color: #000; 
            max-width: 100%; 
            margin: 0; 
            padding: 20px;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
          }
          .title { 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          .answer-key-title {
            color: #d32f2f;
          }
          .info { 
            font-size: 14px; 
            margin: 5px 0;
          }
          .instructions {
            background: #f5f5f5;
            border: 1px solid #ccc;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .question { 
            margin: 25px 0; 
            page-break-inside: avoid;
            clear: both;
          }
          .question-header { 
            font-weight: bold; 
            margin-bottom: 10px; 
            font-size: 16px;
          }
          .options { 
            margin-left: 20px;
            line-height: 2;
          }
          .option { 
            margin: 8px 0;
            display: block;
          }
          .answer-line {
            margin-top: 15px;
            border-bottom: 1px solid #000;
            min-height: 20px;
          }
          .answer-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin: 20px 0;
            padding: 15px;
            border: 2px solid #000;
          }
          .answer-item {
            text-align: center;
            font-weight: bold;
            padding: 8px;
            border: 1px solid #ccc;
          }
          .detailed-answers {
            margin-top: 30px;
          }
          .question-answer { 
            margin: 15px 0; 
            padding: 10px;
            border-left: 4px solid #4caf50;
            background: #f8f9fa;
          }
          .question-text { 
            font-weight: bold; 
            margin-bottom: 5px; 
          }
          .correct-answer { 
            color: #2e7d32; 
            font-weight: bold;
          }
          .explanation { 
            margin-top: 8px; 
            font-style: italic; 
            color: #666;
          }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            font-size: 12px;
            border-top: 1px solid #ccc;
            padding-top: 15px;
          }
          .warning {
            color: #d32f2f;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <!-- QUIZ SHEET SECTION -->
        <div class="header">
          <div class="title">${quizTitle}</div>
          <div class="info">Date: ${date}</div>
          <div class="info">Total Questions: ${questions.length}</div>
          <div class="info">Name: _________________________ Class: _________</div>
        </div>
        
        <div class="instructions">
          <strong>Instructions:</strong>
          <ul>
            <li>Read each question carefully</li>
            <li>Choose the best answer for each multiple choice question</li>
            <li>Mark your answer clearly</li>
            <li>Use the answer line provided for each question</li>
          </ul>
        </div>
        
        ${questions.map((question, index) => `
          <div class="question">
            <div class="question-header">
              ${index + 1}. ${question.question}
            </div>
            <div class="options">
              ${question.options?.map((option, optionIndex) => 
                `<div class="option">
                  ${String.fromCharCode(65 + optionIndex)}. ${option}
                </div>`
              ).join('') || ''}
            </div>
            <div class="answer-line">
              <strong>Answer: _______</strong>
            </div>
          </div>
        `).join('')}
        
        <!-- ANSWER KEY SECTION -->
        <div class="page-break">
          <div class="header">
            <div class="title answer-key-title">${quizTitle} - Answer Key</div>
            <div class="info">Date: ${date}</div>
            <div class="info">Total Questions: ${questions.length}</div>
            <div class="info warning">⚠️ TEACHER'S ANSWER KEY - DO NOT DISTRIBUTE TO STUDENTS ⚠️</div>
          </div>
          
          <div class="answer-grid">
            ${questions.map((question, index) => `
              <div class="answer-item">
                ${index + 1}. ${String.fromCharCode(65 + question.correctAnswer)}
              </div>
            `).join('')}
          </div>
          
          <div class="detailed-answers">
            <h3>Detailed Answers & Explanations</h3>
            ${questions.map((question, index) => `
              <div class="question-answer">
                <div class="question-text">
                  ${index + 1}. ${question.question}
                </div>
                <div class="correct-answer">
                  Correct Answer: ${String.fromCharCode(65 + question.correctAnswer)}. ${question.options[question.correctAnswer]}
                </div>
                ${question.explanation ? `
                  <div class="explanation">
                    Explanation: ${question.explanation}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
          
          <div class="footer warning">
            ⚠️ TEACHER'S ANSWER KEY - DO NOT DISTRIBUTE TO STUDENTS ⚠️<br>
            Generated on ${new Date().toLocaleString()}
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleTXTDownload = () => {
    handleMenuClose();
    
    try {
      generateQuizSheet('txt');
      setTimeout(() => {
        generateAnswerKey('txt');
      }, 1000);
      
      showSnackbar('Text files downloaded! Quiz sheet and answer key saved separately.');
    } catch (error) {
      console.error('TXT generation failed:', error);
      showSnackbar('Failed to generate text files', 'error');
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
        disabled={loading || questions.length === 0}
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
            minWidth: 220,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }
        }}
      >
        <MenuItem onClick={handlePDFDownload}>
          <ListItemIcon>
            <PdfIcon color="error" />
          </ListItemIcon>
          <ListItemText 
            primary="Download as PDF" 
            secondary="Quiz + Answer Key"
          />
        </MenuItem>
        
        <MenuItem onClick={handleTXTDownload}>
          <ListItemIcon>
            <TxtIcon color="info" />
          </ListItemIcon>
          <ListItemText 
            primary="Download as Text" 
            secondary="Quiz + Answer Key"
          />
        </MenuItem>

        <MenuItem onClick={generateCSV}>
          <ListItemIcon>
            <CsvIcon color="success" />
          </ListItemIcon>
          <ListItemText 
            primary="Download as CSV" 
            secondary="Quiz + Answer Key"
          />
        </MenuItem>
      </Menu>

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