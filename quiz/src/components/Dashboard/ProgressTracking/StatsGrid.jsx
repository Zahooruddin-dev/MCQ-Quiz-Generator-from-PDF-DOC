import React from 'react';
import { Stack, Box } from '@mui/material';
import QuizIcon from '@mui/icons-material/PollOutlined';
import TargetIcon from '@mui/icons-material/GpsFixedOutlined';
import TimerIcon from '@mui/icons-material/TimerOutlined';
import StreakIcon from '@mui/icons-material/WhatshotOutlined';
import StatCard from './StatCard';
import { formatTime, formatStreak } from './helpers';

const StatsGrid = ({ data }) => {
  const stats = [
    { label: 'Total Quizzes', value: data.totalQuizzes, icon: <QuizIcon />, color: 'primary', subtitle: `${data.completionRate}% completion rate` },
    { label: 'Average Score', value: `${Math.round(data.averageScore)}%`, icon: <TargetIcon />, color: 'success', subtitle: `Best: ${data.bestScore}%` },
    { label: 'Time Spent', value: formatTime(data.totalTimeSpent), icon: <TimerIcon />, color: 'info', subtitle: `${data.topicsStudied} topics studied` },
    { label: 'Current Streak', value: formatStreak(data.currentStreak), icon: <StreakIcon />, color: 'warning', subtitle: 'Keep it up! 🔥' },
  ];
  return (
    <Stack direction="row" spacing={2}>
      {stats.map((s, i) => <Box key={i} sx={{ flex: 1 }}><StatCard {...s} /></Box>)}
    </Stack>
  );
};

export default StatsGrid;
