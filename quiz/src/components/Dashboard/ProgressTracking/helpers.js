export const getEmptyProgressData = () => ({
  totalQuizzes: 0,
  averageScore: 0,
  totalTimeSpent: 0,
  currentStreak: 0,
  bestScore: 0,
  completionRate: 0,
  topicsStudied: 0,
  weeklyProgress: [],
});

export const calculateProgressFromQuizzes = (quizzes) => {
  if (!quizzes.length) return getEmptyProgressData();
  let totalScore = 0, totalTime = 0, streak = 0, bestScore = 0;
  const topics = new Set();
  quizzes.forEach((quiz, index) => {
    const score = quiz.score || 0;
    const time = quiz.timeTaken || 0;
    totalScore += score; totalTime += time; bestScore = Math.max(bestScore, score);
    if (quiz.topic) topics.add(quiz.topic);
    if (index === 0) {
      let s = 0; for (let i = 0; i < quizzes.length; i++) { if ((quizzes[i].score || 0) >= 70) s++; else break; } streak = s;
    }
  });
  return {
    totalQuizzes: quizzes.length,
    averageScore: totalScore / quizzes.length,
    totalTimeSpent: totalTime,
    currentStreak: streak,
    bestScore,
    completionRate: 100,
    topicsStudied: topics.size,
    weeklyProgress: calculateWeeklyProgressFromQuizzes(quizzes),
  };
};

export const calculateWeeklyProgressFromQuizzes = (quizzes) => {
  if (!quizzes.length) return [];
  const weekly = new Map();
  quizzes.forEach(q => {
    const d = q.completedAt?.toDate?.() || new Date();
    const key = getWeekKey(d);
    if (!weekly.has(key)) weekly.set(key, { total: 0, count: 0, date: d });
    const w = weekly.get(key); w.total += q.score || 0; w.count++;
  });
  const arr = Array.from(weekly.entries()).map(([k, d]) => ({ week: k, score: Math.round(d.total/d.count), date: d.date }));
  arr.sort((a,b)=>a.date-b.date);
  return arr.slice(-8);
};

export const getWeekKey = (date) => {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${week}`;
};

export const getWeekNumber = (date) => {
  const start = new Date(date.getFullYear(),0,1);
  const days = Math.floor((date - start) / 86400000);
  return Math.ceil((days + start.getDay() + 1) / 7);
};

export const generateMockWeeklyProgress = (avg) => {
  const weeks = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - (i*7));
    const v = (Math.random() - 0.5) * 20;
    const s = Math.max(0, Math.min(100, avg + v));
    weeks.push({ week: `Week ${8-i}`, score: Math.round(s), date: d });
  }
  return weeks;
};

export const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
};

export const formatStreak = (s) => `${s} days`;
