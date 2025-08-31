import mammoth from 'mammoth';

export const parseFile = async (file) => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  try {
    // Text files
    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      return await file.text();
    }
    
    // DOCX files
    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }
    
    // HTML files
    if (fileType === 'text/html' || fileName.endsWith('.html')) {
      const text = await file.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      return doc.body.textContent || '';
    }
    
    // PDF files - use modern browser API
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await handlePdfFile(file);
    }
    
    throw new Error(`Unsupported file type. Please use TXT, DOCX, HTML, or PDF files.`);
    
  } catch (error) {
    throw new Error(`File parsing failed: ${error.message}`);
  }
};

// Modern PDF handling using Browser File System Access API
const handlePdfFile = async (file) => {
  // Check if browser supports modern file handling
  if ('showOpenFilePicker' in window) {
    throw new Error(`PDF detected! Please:
1. Right-click your PDF file
2. Choose "Open with" → "Browser" 
3. Select all text (Ctrl+A)
4. Copy (Ctrl+C)
5. Paste into a new text file
6. Upload that text file instead

Or convert your PDF to text online at: https://tools.pdf24.org/en/pdf-to-text`);
  } else {
    throw new Error(`PDF files need to be converted to text first. 
Please convert at: https://tools.pdf24.org/en/pdf-to-text
Then upload the resulting text file.`);
  }
};