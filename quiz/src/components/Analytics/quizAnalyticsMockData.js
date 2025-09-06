// Mock data for quiz analytics components
export const QuizStatus = {
  COMPLETED: 'completed',
  IN_PROGRESS: 'in_progress',
  ABANDONED: 'abandoned'
};

export const PerformanceLevel = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  AVERAGE: 'average',
  NEEDS_IMPROVEMENT: 'needs_improvement'
};

export const TimePeriod = {
  ALL_TIME: 'all_time',
  THIS_WEEK: 'this_week',
  THIS_MONTH: 'this_month',
  LAST_30_DAYS: 'last_30_days'
};

export const ChartType = {
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie',
  AREA: 'area'
};

// Date and score formatting functions
export const formatDate = (date) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

export const formatScore = (score) => {
  return `${Math.round(score)}%`;
};

export const formatStreak = (days) => {
  return `${days} day${days !== 1 ? 's' : ''}`;
};

export const getPerformanceLabel = (score) => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 70) return 'Average';
  return 'Needs Improvement';
};

// Mock data for components - will be replaced with Firebase data
export const mockRecentQuizzes = [
  {
    id: "quiz_1",
    title: "JavaScript Fundamentals",
    date: new Date('2024-01-15'),
    score: 85,
    totalQuestions: 10,
    correctAnswers: 8,
    timeTaken: 420,
    status: QuizStatus.COMPLETED,
    difficulty: "medium",
    topic: "Programming"
  },
  {
    id: "quiz_2", 
    title: "React Components",
    date: new Date('2024-01-14'),
    score: 92,
    totalQuestions: 15,
    correctAnswers: 14,
    timeTaken: 680,
    status: QuizStatus.COMPLETED,
    difficulty: "advanced",
    topic: "Frontend"
  },
  {
    id: "quiz_3",
    title: "Database Design",
    date: new Date('2024-01-13'),
    score: 78,
    totalQuestions: 12,
    correctAnswers: 9,
    timeTaken: 520,
    status: QuizStatus.COMPLETED,
    difficulty: "intermediate",
    topic: "Backend"
  },
  {
    id: "quiz_4",
    title: "CSS Grid Layout",
    date: new Date('2024-01-12'),
    score: 88,
    totalQuestions: 8,
    correctAnswers: 7,
    timeTaken: 360,
    status: QuizStatus.COMPLETED,
    difficulty: "medium",
    topic: "Frontend"
  },
  {
    id: "quiz_5",
    title: "Node.js APIs",
    date: new Date('2024-01-11'),
    score: 95,
    totalQuestions: 12,
    correctAnswers: 11,
    timeTaken: 480,
    status: QuizStatus.COMPLETED,
    difficulty: "advanced",
    topic: "Backend"
  }
];

export const mockProgressData = {
  totalQuizzes: 25,
  averageScore: 84.2,
  totalTimeSpent: 12600,
  currentStreak: 7,
  bestScore: 98,
  completionRate: 96,
  topicsStudied: 8,
  weeklyProgress: [
    { week: "Week 1", score: 78 },
    { week: "Week 2", score: 82 },
    { week: "Week 3", score: 85 },
    { week: "Week 4", score: 88 }
  ]
};

export const mockAnalyticsData = {
  scoreDistribution: [
    { range: "90-100%", count: 8 },
    { range: "80-89%", count: 12 },
    { range: "70-79%", count: 4 },
    { range: "60-69%", count: 1 }
  ],
  monthlyStats: [
    { month: "Jan", quizzes: 8, avgScore: 82 },
    { month: "Feb", quizzes: 12, avgScore: 85 },
    { month: "Mar", quizzes: 5, avgScore: 88 }
  ],
  topicPerformance: [
    { topic: "JavaScript", avgScore: 88, quizCount: 8 },
    { topic: "React", avgScore: 85, quizCount: 6 },
    { topic: "Database", avgScore: 82, quizCount: 4 },
    { topic: "CSS", avgScore: 90, quizCount: 3 }
  ]
};