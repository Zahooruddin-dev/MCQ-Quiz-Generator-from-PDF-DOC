import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material/styles';
import { Box, Container, Typography, Stack, Card, CardContent } from '@mui/material';
import { Brain, Zap, Target, Award } from 'lucide-react';
import theme from './theme';

// Import components for preview
import LandingPage from './components/Landing/LandingPage';
import ModernAuthForm from './components/Auth/ModernAuthForm';
import Dashboard from './components/Dashboard/Dashboard';
import ModernFileUpload from './components/FileUpload/ModernFileUpload';
import ModernQuizEngine from './components/Engine/ModernQuizEngine';
import ModernResultPage from './components/Results/ModernResultPage';
import ModernHeader from './components/Layout/ModernHeader';

// Mock data for preview
const mockQuestions = [
  {
    question: "What is React primarily used for?",
    options: [
      "Server-side programming",
      "Building user interfaces",
      "Database management",
      "Network security"
    ],
    correctAnswer: 1,
    context: "React is a popular JavaScript library developed by Facebook for building modern web applications."
  },
  {
    question: "Which of the following is a React Hook?",
    options: [
      "componentDidMount",
      "useState",
      "render",
      "constructor"
    ],
    correctAnswer: 1
  },
  {
    question: "What does JSX stand for?",
    options: [
      "JavaScript XML",
      "Java Syntax Extension",
      "JSON XML",
      "JavaScript Extension"
    ],
    correctAnswer: 0
  }
];

const mockUserAnswers = [1, 1, 0]; // All correct answers
const mockUser = {
  displayName: "John Doe",
  email: "john@example.com"
};

const PreviewSection = ({ title, children, description }) => (
  <Box sx={{ mb: 8 }}>
    <Container maxWidth="lg">
      <Stack spacing={3}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {description}
            </Typography>
          )}
        </Box>
        <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)', p: 2 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              PREVIEW
            </Typography>
          </Box>
          {children}
        </Card>
      </Stack>
    </Container>
  </Box>
);

const ModernQuizGeneratorPreview = () => {
  const handleGetStarted = () => console.log('Get Started clicked');
  const handleCreateQuiz = () => console.log('Create Quiz clicked');
  const handleViewResults = () => console.log('View Results clicked');
  const handleUploadFile = () => console.log('Upload File clicked');
  const handleFileUpload = (questions) => console.log('File uploaded:', questions);
  const handleQuizFinish = (results) => console.log('Quiz finished:', results);
  const handleNewQuiz = () => console.log('New Quiz clicked');
  const handleProfileClick = () => console.log('Profile clicked');
  const handleApiConfigClick = () => console.log('API Config clicked');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)' }}>
        {/* Header */}
        <Box sx={{ py: 6, textAlign: 'center', background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', color: 'white' }}>
          <Container maxWidth="lg">
            <Stack spacing={3} alignItems="center">
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Brain size={40} />
              </Box>
              <Typography variant="h2" sx={{ fontWeight: 900 }}>
                QuizAI - Modern UI Preview
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600 }}>
                A complete UI/UX transformation of the MCQ Quiz Generator with modern design patterns, 
                stunning animations, and professional aesthetics.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Zap size={20} />
                  <Typography variant="body2">Lightning Fast</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Target size={20} />
                  <Typography variant="body2">AI-Powered</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Award size={20} />
                  <Typography variant="body2">Professional</Typography>
                </Box>
              </Stack>
            </Stack>
          </Container>
        </Box>

        {/* Landing Page Preview */}
        <PreviewSection 
          title="Landing Page" 
          description="Stunning hero section with animated elements and modern glassmorphism design"
        >
          <Box sx={{ maxHeight: '80vh', overflow: 'hidden' }}>
            <LandingPage onGetStarted={handleGetStarted} />
          </Box>
        </PreviewSection>

        {/* Auth Form Preview */}
        <PreviewSection 
          title="Authentication" 
          description="Modern auth form with glassmorphism effects and smooth animations"
        >
          <Box sx={{ maxHeight: '80vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
            <Box sx={{ transform: 'scale(0.8)', transformOrigin: 'center' }}>
              <ModernAuthForm />
            </Box>
          </Box>
        </PreviewSection>

        {/* Header Preview */}
        <PreviewSection 
          title="Modern Header" 
          description="Clean, professional header with user menu and modern styling"
        >
          <ModernHeader
            onProfileClick={handleProfileClick}
            onApiConfigClick={handleApiConfigClick}
            showApiConfig={false}
          />
        </PreviewSection>

        {/* Dashboard Preview */}
        <PreviewSection 
          title="Dashboard" 
          description="Comprehensive dashboard with quick actions, stats, and recent activity"
        >
          <Dashboard
            onCreateQuiz={handleCreateQuiz}
            onViewResults={handleViewResults}
            onUploadFile={handleUploadFile}
          />
        </PreviewSection>

        {/* File Upload Preview */}
        <PreviewSection 
          title="File Upload" 
          description="Intuitive drag-and-drop interface with AI configuration panel"
        >
          <ModernFileUpload
            hasAI={true}
            apiKey="demo-key"
            baseUrl="demo-url"
            onFileUpload={handleFileUpload}
            onReconfigure={() => {}}
          />
        </PreviewSection>

        {/* Quiz Engine Preview */}
        <PreviewSection 
          title="Quiz Engine" 
          description="Interactive quiz interface with progress tracking and smooth transitions"
        >
          <ModernQuizEngine
            questions={mockQuestions}
            onFinish={handleQuizFinish}
            quizTitle="React Fundamentals Quiz"
          />
        </PreviewSection>

        {/* Results Preview */}
        <PreviewSection 
          title="Results Page" 
          description="Comprehensive results with detailed analytics and question review"
        >
          <ModernResultPage
            questions={mockQuestions}
            userAnswers={mockUserAnswers}
            onNewQuiz={handleNewQuiz}
            fileName="React Quiz Results"
          />
        </PreviewSection>

        {/* Footer */}
        <Box sx={{ py: 6, textAlign: 'center', background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)', color: 'white' }}>
          <Container maxWidth="lg">
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              🎉 Modern UI Transformation Complete!
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
              The MCQ Quiz Generator has been completely transformed with modern design patterns, 
              stunning animations, and professional aesthetics that will impress users in 2025.
            </Typography>
            <Stack direction="row" spacing={4} justifyContent="center">
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#10B981' }}>
                  ✅ Landing Page
                </Typography>
                <Typography variant="caption">Modern & Engaging</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#10B981' }}>
                  ✅ Authentication
                </Typography>
                <Typography variant="caption">Secure & Beautiful</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#10B981' }}>
                  ✅ Dashboard
                </Typography>
                <Typography variant="caption">Comprehensive & Intuitive</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#10B981' }}>
                  ✅ Quiz Experience
                </Typography>
                <Typography variant="caption">Interactive & Smooth</Typography>
              </Box>
            </Stack>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ModernQuizGeneratorPreview;