# Quiz Generator Project Documentation

## Project Overview

A modern React-based quiz generation application that converts study materials (PDFs, DOCX, TXT, HTML, images) into interactive multiple-choice quizzes using AI. The application features both file upload and direct text input modes with comprehensive processing capabilities.

## Core Architecture

### Technology Stack
- **Frontend**: React 18 with hooks
- **UI Framework**: Material-UI (MUI) v5
- **Icons**: Lucide React
- **State Management**: React Context (AuthContext)
- **File Processing**: PDF.js, Mammoth.js, OCR.space API
- **AI Integration**: Google Gemini API (via LLMService)
- **Styling**: Material-UI styled components with responsive design

### Project Structure
```
src/
├── components/
│   ├── ModernFileUpload/
│   │   ├── components/
│   │   │   ├── FileDropZone.jsx
│   │   │   ├── MainCard.jsx
│   │   │   ├── ConfigPanel.jsx
│   │   │   ├── TextModeInput.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Features.jsx
│   │   ├── hooks/
│   │   │   └── useFileSelector.js
│   │   ├── ModernFileUpload.jsx
│   │   ├── ModernFileUpload.styles.js
│   │   └── utils.js
├── utils/
│   ├── llmService.js
│   ├── fileReader.js
│   ├── constants.js
│   ├── textUtils.js
│   ├── languageUtils.js
│   ├── retryUtils.js
│   └── quizValidator.js
└── context/
    └── AuthContext.js
```

## Key Features

### 1. Multi-Format File Support
- **PDF Processing**: Text extraction with OCR fallback for image-based PDFs
- **DOCX Support**: Full Word document processing via Mammoth.js
- **Text Files**: Plain text and HTML file support
- **Image Processing**: OCR text extraction from images (JPEG, PNG, GIF, BMP, TIFF, WebP)

### 2. Intelligent File Processing
- **Auto-Read on Upload**: Files are processed immediately upon upload, not when generating quiz
- **Progress Tracking**: Real-time feedback during file reading and AI processing
- **OCR Integration**: Automatic text extraction from image-based documents
- **Language Detection**: Automatic detection of document language for OCR optimization

### 3. AI-Powered Quiz Generation
- **Production-Grade LLMService**: Guarantees exact number of questions requested
- **Multiple Strategies**: Initial generation + retry logic + deterministic synthesis
- **Configurable Options**: Question count (1-100), difficulty levels, question types
- **Quality Assurance**: Validates questions and ensures uniqueness

### 4. Credit System Integration
- **AuthContext Integration**: Premium users, admin privileges, credit tracking
- **Smart Credit Management**: Credits deducted only after successful AI processing
- **Automatic Refunds**: Credits refunded on API failures
- **Credit Validation**: Pre-checks before expensive operations

### 5. Responsive Design
- **Mobile-First**: Optimized for all device sizes
- **Touch-Friendly**: Large touch targets and mobile-specific UI
- **Progressive Enhancement**: Enhanced features on larger screens
- **Accessibility**: WCAG compliant with proper ARIA labels

## Component Architecture

### ModernFileUpload (Main Container)
- **Purpose**: Root component managing file upload workflow
- **State Management**: File info, AI options, loading states, extracted text
- **Key Features**:
  - Auto-read optimization
  - Credit system integration
  - Error handling and recovery
  - Progress tracking

### FileDropZone
- **Purpose**: Drag-and-drop file upload interface
- **Features**:
  - Visual feedback for file status
  - Real-time progress indicators
  - Status chips showing read progress
  - Smart button states

### useFileSelector Hook
- **Purpose**: Encapsulates file validation and auto-read logic
- **Key Functionality**:
  - File type and size validation
  - Immediate file processing for AI mode
  - Progress callbacks and error handling
  - Dynamic LLMService import

### LLMService
- **Purpose**: Production-grade AI quiz generation
- **Architecture**:
  - Singleton pattern with caching
  - Multiple generation strategies
  - Automatic retry logic
  - Deterministic question synthesis
  - Exact count guarantee

### File Processing Pipeline
1. **Upload**: File validation and basic info extraction
2. **Auto-Read**: Immediate content extraction (PDF/DOCX/OCR)
3. **Storage**: Extracted text cached in component state
4. **AI Processing**: On-demand quiz generation using cached text
5. **Delivery**: Formatted questions with metadata

## File Processing Capabilities

### PDF Processing
- **Text Extraction**: Direct text content extraction
- **OCR Fallback**: Automatic OCR for image-based PDFs
- **Progress Tracking**: Page-by-page processing feedback
- **Error Handling**: Password protection and corruption detection

### DOCX Processing
- **Full Document Support**: Text, tables, and basic formatting
- **Mammoth.js Integration**: Reliable Word document parsing
- **Error Recovery**: Handles corrupted documents gracefully

### OCR Processing
- **Multi-Strategy Approach**: Standard, enhanced, and auto-detect modes
- **Language Support**: Automatic language detection and optimization
- **Confidence Scoring**: OCR quality feedback to users
- **Robust Error Handling**: Graceful degradation on OCR failures

### Text Quality Analysis
- **Content Validation**: Minimum length and readability checks
- **Noise Detection**: Identifies and handles OCR artifacts
- **Language Analysis**: Character-based language detection
- **Quality Metrics**: Word ratio and content analysis

## AI Generation System

### Question Generation Pipeline
1. **Content Analysis**: Text preprocessing and key fact extraction
2. **Initial Generation**: Request full question set from AI
3. **Retry Logic**: Generate missing questions if needed
4. **Relaxed Generation**: Fallback mode for difficult content
5. **Synthesis**: Deterministic question creation from content facts
6. **Validation**: Format checking and uniqueness verification

### Question Quality Assurance
- **Format Validation**: Ensures proper question structure
- **Uniqueness Check**: Prevents duplicate questions
- **Option Validation**: Verifies 4 unique answer choices
- **Content Relevance**: Questions tied to source material

### Error Handling and Recovery
- **Credit Protection**: Refunds on API failures
- **Graceful Degradation**: Fallback strategies for poor content
- **User Feedback**: Clear error messages with suggestions
- **Retry Logic**: Automatic recovery from transient failures

## State Management

### File Upload State
```javascript
// File Information
const [fileName, setFileName] = useState('');
const [fileSize, setFileSize] = useState(null);
const [fileType, setFileType] = useState('');
const [selectedFile, setSelectedFile] = useState(null);

// Auto-Read State
const [extractedText, setExtractedText] = useState('');
const [fileReadStatus, setFileReadStatus] = useState('none');
// Status: 'none' | 'reading' | 'ready' | 'error'

// Processing State
const [isLoading, setIsLoading] = useState(false);
const [loadingStage, setLoadingStage] = useState('');
const [uploadProgress, setUploadProgress] = useState(0);
```

### AI Configuration
```javascript
const [aiOptions, setAiOptions] = useState({
  numQuestions: 10,    // 1-100 range
  difficulty: 'medium', // 'easy' | 'medium' | 'hard'
  questionType: 'mixed' // 'mixed' | 'multiple-choice'
});
```

## User Experience Optimizations

### Auto-Read Implementation
- **Immediate Processing**: Files read on upload, not on quiz generation
- **Time Savings**: Eliminates wait time during quiz generation
- **Early Error Detection**: File issues caught before AI processing
- **Smart UI States**: Button states reflect file read status

### Progress Feedback
- **Stage-Specific Icons**: Visual indicators for each processing stage
- **Real-Time Updates**: Progress bars with percentage completion
- **Detailed Messages**: Context-aware status messages
- **Processing Details**: Character counts, OCR confidence, question counts

### Error Handling
- **User-Friendly Messages**: Clear explanations with actionable suggestions
- **Error Classification**: Different handling for different error types
- **Recovery Suggestions**: Specific guidance based on error context
- **Credit Protection**: No credits charged for failed operations

## Mobile Optimization

### Responsive Design
- **Breakpoint Strategy**: xs (mobile), sm (tablet), md+ (desktop)
- **Touch Optimization**: Minimum 44px touch targets
- **Visual Hierarchy**: Clear information architecture on small screens
- **Performance**: Optimized for mobile data connections

### Mobile-Specific Features
- **Landscape Mode Tips**: Guidance for optimal experience
- **Compressed UI**: Efficient use of screen real estate
- **Touch-Friendly Controls**: Large buttons and easy navigation
- **Mobile File Access**: Native file picker integration

## Performance Optimizations

### Component Optimization
- **React.memo**: Prevents unnecessary re-renders
- **useCallback**: Stable function references
- **Selective Re-rendering**: Minimal state update impact

### File Processing
- **Streaming Processing**: Large file handling without memory issues
- **Lazy Loading**: Dynamic imports for heavy libraries
- **Caching**: Response caching for identical requests
- **Abort Signals**: Cancellation support for long operations

### Memory Management
- **File Size Limits**: 50MB maximum file size
- **Content Truncation**: Automatic text limiting for API efficiency
- **Cleanup**: Proper resource disposal on component unmount

## Security Considerations

### Input Validation
- **File Type Checking**: Both MIME type and extension validation
- **Size Limits**: Prevents excessive resource usage
- **Content Scanning**: Basic validation of extracted content

### API Security
- **Key Management**: Secure API key storage and rotation
- **Rate Limiting**: Built-in request throttling
- **Error Sanitization**: Prevents sensitive data exposure

## Configuration

### Supported File Types
```javascript
const SUPPORTED = ['.pdf', '.docx', '.txt', '.html'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_CHARS = 500000; // Character limit for AI processing
```

### AI Configuration
- **Temperature**: 0.15 (consistent results)
- **Max Tokens**: 8192
- **Retry Logic**: 4 total attempts with different strategies
- **Timeout**: 30 seconds per request

## Future Considerations

### Scalability
- **Component Modularity**: Easy feature addition and modification
- **Service Abstraction**: Swappable AI providers
- **State Management**: Ready for complex state requirements

### Extensibility
- **Plugin Architecture**: Easy addition of new file types
- **AI Provider Flexibility**: Multiple AI service support
- **Question Type Expansion**: Framework for new question formats

## Development Guidelines

### Code Organization
- **Single Responsibility**: Each component has clear purpose
- **Composition**: Components built from smaller, reusable parts
- **Error Boundaries**: Graceful error handling at component level

### Testing Considerations
- **Unit Testing**: Individual component and utility testing
- **Integration Testing**: File processing pipeline testing
- **Error Scenario Testing**: Comprehensive error condition coverage

This documentation reflects the current state of the quiz generation application with its sophisticated file processing, AI integration, and user experience optimizations.