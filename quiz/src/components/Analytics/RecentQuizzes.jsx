import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  LinearProgress,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Skeleton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  HistoryOutlined as HistoryIcon,
  FilterAltOutlined as FilterIcon,
  ArrowForward as ArrowRightIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { LLMService } from '../../utils/llmService';
import { mockRecentQuizzes, formatDate, formatTime, getPerformanceLabel } from './quizAnalyticsMockData';

const RecentQuizzesCard = styled(Card)(({ theme }) => ({
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const QuizCard = ({ quiz, onQuizClick }) => {
  const getScoreColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  return (
    <RecentQuizzesCard onClick={() => onQuizClick?.(quiz)}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {quiz.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {formatDate(quiz.date)} • {quiz.topic}
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={`${quiz.score}%`}
                size="small"
                color={getScoreColor(quiz.score)}
                sx={{ fontWeight: 600 }}
              />
              <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
          
          <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Progress ({quiz.correctAnswers}/{quiz.totalQuestions})
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {formatTime(quiz.timeTaken)}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={quiz.score}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  background: quiz.score >= 90
                    ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                    : quiz.score >= 70
                    ? 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)'
                    : 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)',
                },
              }}
            />
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Chip
              label={getPerformanceLabel(quiz.score)}
              size="small"
              variant="outlined"
              color={getScoreColor(quiz.score)}
            />
            <Chip
              label={quiz.difficulty}
              size="small"
              variant="outlined"
              sx={{ textTransform: 'capitalize' }}
            />
          </Stack>
        </Stack>
      </CardContent>
    </RecentQuizzesCard>
  );
};

const RecentQuizzes = ({ limit = 5, onQuizClick, onViewAll, showFilters = true }) => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Try to fetch real data from Firebase
        const llmService = new LLMService('dummy-key', 'dummy-url');
        const dashboardData = await llmService.getDashboardData();
        
        if (dashboardData && dashboardData.recentQuizzes) {
          setQuizzes(dashboardData.recentQuizzes.slice(0, limit));
        } else {
          // Fallback to mock data
          setQuizzes(mockRecentQuizzes.slice(0, limit));
        }
      } catch (error) {
        console.error('Failed to fetch recent quizzes:', error);
        // Use mock data as fallback
        setQuizzes(mockRecentQuizzes.slice(0, limit));
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [user, limit]);

  const filteredAndSortedQuizzes = React.useMemo(() => {
    let filtered = [...quizzes];
    
    // Apply filters
    if (filter !== 'all') {
      filtered = filtered.filter(quiz => {
        switch (filter) {
          case 'excellent':
            return quiz.score >= 90;
          case 'good':
            return quiz.score >= 70 && quiz.score < 90;
          case 'needs_improvement':
            return quiz.score < 70;
          default:
            return true;
        }
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'date':
          return new Date(b.date) - new Date(a.date);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [quizzes, filter, sortBy]);

  if (loading) {
    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <HistoryIcon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Recent Quizzes
            </Typography>
          </Stack>
        </Stack>
        
        <Stack spacing={2}>
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <HistoryIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Recent Quizzes
          </Typography>
        </Stack>
        
        {onViewAll && (
          <Button
            endIcon={<ArrowRightIcon />}
            onClick={onViewAll}
            sx={{ color: 'text.secondary' }}
          >
            View All
          </Button>
        )}
      </Stack>
      
      {showFilters && (
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Filter</InputLabel>
            <Select
              value={filter}
              label="Filter"
              onChange={(e) => setFilter(e.target.value)}
              startAdornment={<FilterIcon sx={{ mr: 1, color: 'action.active' }} />}
            >
              <MenuItem value="all">All Quizzes</MenuItem>
              <MenuItem value="excellent">Excellent (90%+)</MenuItem>
              <MenuItem value="good">Good (70-89%)</MenuItem>
              <MenuItem value="needs_improvement">Needs Work (&lt;70%)</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              label="Sort by"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="score">Score</MenuItem>
              <MenuItem value="title">Title</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      )}
      
      <Stack spacing={2}>
        {filteredAndSortedQuizzes.length > 0 ? (
          filteredAndSortedQuizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onQuizClick={onQuizClick}
            />
          ))
        ) : (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No quizzes found matching your criteria
              </Typography>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
};

export default RecentQuizzes;