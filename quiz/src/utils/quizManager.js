// utils/quizManager.js - Comprehensive quiz state management with persistence
import { nanoid } from 'nanoid';
import { getAuth } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Quiz storage keys
const STORAGE_KEYS = {
  CURRENT_QUIZ: 'current_quiz_session',
  QUIZ_HISTORY: 'quiz_history',
  QUIZ_RESULTS: 'quiz_results'
};

// Quiz status enum
export const QUIZ_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

// Generate unique quiz ID
export const generateQuizId = () => nanoid(12);

// Quiz class for managing individual quiz sessions
export class QuizSession {
  constructor(data) {
    this.id = data.id || generateQuizId();
    this.questions = data.questions || [];
    this.title = data.title || this.generateTitle();
    this.status = data.status || QUIZ_STATUS.NOT_STARTED;
    this.currentQuestionIndex = data.currentQuestionIndex || 0;
    this.answers = data.answers || [];
    this.startTime = data.startTime || null;
    this.endTime = data.endTime || null;
    this.completedAt = data.completedAt || null;
    this.timeLimit = data.timeLimit || 1800; // 30 minutes default
    this.createdAt = data.createdAt || Date.now();
    this.userId = data.userId || null;
    this.aiGenerated = data.aiGenerated || false;
    this.source = data.source || null; // filename or source info
  }

  generateTitle() {
    if (this.source) {
      // Extract meaningful name from source
      if (typeof this.source === 'string') {
        // Remove file extensions and clean up the name
        const cleanSource = this.source
          .replace(/\.(pdf|docx?|txt)$/i, '')
          .replace(/[_-]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())
          .trim();
        
        if (cleanSource && cleanSource !== 'File Upload' && cleanSource !== 'Legacy Import') {
          return cleanSource;
        }
      }
    }
    
    // Try to generate title from first question
    if (this.questions && this.questions.length > 0 && this.questions[0].question) {
      const firstQuestion = this.questions[0].question;
      // Extract key topic words from the first question
      const words = firstQuestion
        .replace(/[?.,!]/g, '')
        .split(' ')
        .filter(word => word.length > 3)
        .slice(0, 3)
        .join(' ');
      
      if (words) {
        return `${words} Quiz`;
      }
    }
    
    // Fallback with more descriptive names
    const topics = ['Science', 'History', 'Literature', 'Math', 'General Knowledge', 'Geography', 'Technology'];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${randomTopic} Quiz - ${date}`;
  }

  // Start the quiz
  start() {
    this.status = QUIZ_STATUS.IN_PROGRESS;
    this.startTime = Date.now();
    this.save();
  }

  // Answer a question
  answerQuestion(questionIndex, answer) {
    if (questionIndex >= 0 && questionIndex < this.questions.length) {
      this.answers[questionIndex] = answer;
      this.currentQuestionIndex = Math.max(this.currentQuestionIndex, questionIndex + 1);
      this.save();
    }
  }

  // Complete the quiz
  complete() {
    this.status = QUIZ_STATUS.COMPLETED;
    this.endTime = Date.now();
    this.completedAt = Date.now(); // Add completedAt timestamp
    this.save();
    
    // Save to history
    this.saveToHistory();
    
    return this.getResults();
  }

  // Calculate quiz results
  getResults() {
    const results = {
      quizId: this.id,
      totalQuestions: this.questions.length,
      answeredQuestions: this.answers.filter(a => a !== undefined && a !== null).length,
      correctAnswers: 0,
      incorrectAnswers: 0,
      score: 0,
      percentage: 0,
      timeTaken: this.endTime ? this.endTime - this.startTime : 0,
      answers: [...this.answers],
      questions: this.questions,
      title: this.title,
      completedAt: this.endTime,
      details: []
    };

    this.questions.forEach((question, index) => {
      const userAnswer = this.answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        results.correctAnswers++;
      } else if (userAnswer !== undefined && userAnswer !== null) {
        results.incorrectAnswers++;
      }

      results.details.push({
        questionIndex: index,
        question: question.question,
        userAnswer: userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        options: question.options
      });
    });

    results.score = results.correctAnswers;
    results.percentage = results.totalQuestions > 0 ? 
      Math.round((results.correctAnswers / results.totalQuestions) * 100) : 0;

    return results;
  }

  // Save session to localStorage
  save() {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_QUIZ, JSON.stringify(this.toJSON()));
    } catch (error) {
      console.warn('Failed to save quiz session to localStorage:', error);
    }
  }

  // Save to quiz history
  async saveToHistory() {
    try {
      // Save to localStorage history
      const history = QuizManager.getLocalHistory();
      const quizData = {
        ...this.toJSON(),
        results: this.getResults()
      };
      
      history.unshift(quizData);
      
      // Keep only last 50 quizzes in local storage
      if (history.length > 50) {
        history.splice(50);
      }
      
      localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(history));

      // Save to Firebase if user is logged in
      const auth = getAuth();
      if (auth.currentUser) {
        const quizRef = doc(collection(db, 'users', auth.currentUser.uid, 'quizzes'));
        await setDoc(quizRef, {
          ...quizData,
          userId: auth.currentUser.uid
        });
      }
    } catch (error) {
      console.warn('Failed to save quiz to history:', error);
    }
  }

  // Convert to JSON for storage
  toJSON() {
    return {
      id: this.id,
      questions: this.questions,
      title: this.title,
      status: this.status,
      currentQuestionIndex: this.currentQuestionIndex,
      answers: this.answers,
      startTime: this.startTime,
      endTime: this.endTime,
      completedAt: this.completedAt,
      timeLimit: this.timeLimit,
      createdAt: this.createdAt,
      userId: this.userId,
      aiGenerated: this.aiGenerated,
      source: this.source
    };
  }

  // Create from JSON
  static fromJSON(data) {
    return new QuizSession(data);
  }
}

// Quiz manager for handling multiple quizzes and persistence
export class QuizManager {
  // Create a new quiz session
  static createQuiz(questions, options = {}) {
    const quiz = new QuizSession({
      questions,
      title: options.title,
      timeLimit: options.timeLimit,
      aiGenerated: options.aiGenerated || false,
      source: options.source
    });

    quiz.save();
    return quiz;
  }

  // Get current active quiz session
  static getCurrentQuiz() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_QUIZ);
      if (data) {
        return QuizSession.fromJSON(JSON.parse(data));
      }
    } catch (error) {
      console.warn('Failed to load current quiz session:', error);
    }
    return null;
  }

  // Get quiz by ID (from history or current)
  static async getQuizById(quizId) {
    // Check current quiz first
    const currentQuiz = this.getCurrentQuiz();
    if (currentQuiz && currentQuiz.id === quizId) {
      return currentQuiz;
    }

    // Check local history
    const history = this.getLocalHistory();
    const localQuiz = history.find(q => q.id === quizId);
    if (localQuiz) {
      return QuizSession.fromJSON(localQuiz);
    }

    // Check Firebase if user is logged in
    try {
      const auth = getAuth();
      if (auth.currentUser) {
        const quizRef = doc(db, 'users', auth.currentUser.uid, 'quizzes', quizId);
        const quizSnap = await getDoc(quizRef);
        if (quizSnap.exists()) {
          return QuizSession.fromJSON(quizSnap.data());
        }
      }
    } catch (error) {
      console.warn('Failed to load quiz from Firebase:', error);
    }

    return null;
  }

  // Clear current quiz session
  static clearCurrentQuiz() {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_QUIZ);
    } catch (error) {
      console.warn('Failed to clear current quiz session:', error);
    }
  }

  // Get local quiz history
  static getLocalHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn('Failed to load quiz history:', error);
      return [];
    }
  }

  // Get quiz history (combines local and Firebase)
  static async getQuizHistory(limit = 20) {
    const history = [];

    // Get local history
    const localHistory = this.getLocalHistory();
    history.push(...localHistory);

    // Get Firebase history if user is logged in
    try {
      const auth = getAuth();
      if (auth.currentUser) {
        const quizzesRef = collection(db, 'users', auth.currentUser.uid, 'quizzes');
        const q = query(quizzesRef, orderBy('createdAt', 'desc'), limit(limit));
        const snapshot = await getDocs(q);
        
        snapshot.forEach(doc => {
          const data = doc.data();
          // Avoid duplicates
          if (!history.find(h => h.id === data.id)) {
            history.push(data);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load quiz history from Firebase:', error);
    }

    // Sort by creation date (newest first) and limit
    return history
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  // Get quiz results by ID
  static getQuizResults(quizId) {
    const history = this.getLocalHistory();
    const quiz = history.find(q => q.id === quizId);
    return quiz && quiz.results ? quiz.results : null;
  }

  // Clean up old quizzes (keep last 100)
  static cleanupHistory() {
    try {
      const history = this.getLocalHistory();
      if (history.length > 100) {
        const cleaned = history.slice(0, 100);
        localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(cleaned));
      }
    } catch (error) {
      console.warn('Failed to cleanup quiz history:', error);
    }
  }

  // Migrate old quiz data (for backward compatibility)
  static migrateOldQuizData() {
    try {
      // Check for old quiz_questions format
      const oldQuestions = localStorage.getItem('quiz_questions');
      if (oldQuestions && !this.getCurrentQuiz()) {
        const questions = JSON.parse(oldQuestions);
        if (Array.isArray(questions) && questions.length > 0) {
          const quiz = this.createQuiz(questions, {
            title: 'Imported Quiz',
            source: 'Legacy Import'
          });
          
          // Remove old data
          localStorage.removeItem('quiz_questions');
          
          console.log('Migrated old quiz data to new format');
          return quiz;
        }
      }
    } catch (error) {
      console.warn('Failed to migrate old quiz data:', error);
    }
    return null;
  }
}

// Initialize quiz manager (run migration on load)
export const initializeQuizManager = () => {
  QuizManager.migrateOldQuizData();
  QuizManager.cleanupHistory();
};

// Export utilities for components
export const quizUtils = {
  // Generate a shareable quiz URL
  getQuizUrl: (quizId) => `${window.location.origin}/quiz/${quizId}`,
  
  // Generate a results URL
  getResultsUrl: (quizId) => `${window.location.origin}/results/${quizId}`,
  
  // Format time duration
  formatDuration: (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  },
  
  // Get quiz difficulty based on questions
  getDifficulty: (questions) => {
    const avgLength = questions.reduce((sum, q) => sum + q.question.length, 0) / questions.length;
    if (avgLength > 200) return 'Hard';
    if (avgLength > 100) return 'Medium';
    return 'Easy';
  }
};