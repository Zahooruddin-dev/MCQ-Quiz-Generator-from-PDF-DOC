import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Container,
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
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  HistoryOutlined as HistoryIcon,
  FilterAltOutlined as FilterIcon,
  ArrowForward as ArrowRightIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

// Firebase imports
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit as firestoreLimit,
} from 'firebase/firestore';

const db = getFirestore();

const RecentQuizzesCard = styled(Card)(({ theme }) => ({
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

// Utility functions
const formatDate = (date) => {
  if (!date) return 'Unknown date';
  
  const dateObj = date?.toDate ? date.toDate() : new Date(date);
  
  if (isNaN(dateObj.getTime())) return 'Unknown date';
  
  const now = new Date();
  const diffTime = Math.abs(now - dateObj);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays - 1} days ago`;
  
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: dateObj.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

const formatTime = (seconds) => {
  if (!seconds) return '0m';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) return `${remainingSeconds}s`;
  if (remainingSeconds === 0) return `${minutes}m`;
  return `${minutes}m ${remainingSeconds}s`;
};

const getPerformanceLabel = (score) => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Great';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Needs Work';
};

const QuizCard = ({ quiz, onQuizClick }) => {
  const getScoreColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const handleCardClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuizClick) {
      onQuizClick(quiz);
    }
  };

  const handleMoreClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Add menu functionality here if needed
    console.log('More options for quiz:', quiz.id);
  };

  return (
    <RecentQuizzesCard onClick={handleCardClick}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {quiz.quizTitle || quiz.title || 'Quiz'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {formatDate(quiz.completedAt || quiz.timestamp)} • {quiz.topic || 'General'}
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={`${Math.round(quiz.score || 0)}%`}
                size="small"
                color={getScoreColor(quiz.score || 0)}
                sx={{ fontWeight: 600 }}
              />
              <IconButton size="small" onClick={handleMoreClick}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
          
          <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Progress ({quiz.correctAnswers || 0}/{quiz.totalQuestions || 0})
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {formatTime(quiz.timeTaken || 0)}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(quiz.score || 0, 100)}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  background: (quiz.score || 0) >= 90
                    ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                    : (quiz.score || 0) >= 70
                    ? 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)'
                    : 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)',
                },
              }}
            />
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Chip
              label={getPerformanceLabel(quiz.score || 0)}
              size="small"
              variant="outlined"
              color={getScoreColor(quiz.score || 0)}
            />
            <Chip
              label={quiz.difficulty || 'medium'}
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

const RecentQuizzes = ({ 
  limit = 5, 
  onQuizClick, 
  onViewAll, 
  showFilters = true,
  isFullPage = false // Add this prop
}) => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch user's quizzes from Firestore
        const quizQuery = query(
          collection(db, 'quizzes'),
          where('userId', '==', user.uid)
        );

        const querySnapshot = await getDocs(quizQuery);
        const fetchedQuizzes = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedQuizzes.push({
            id: doc.id,
            ...data,
          });
        });

        // Sort by date (most recent first) in JavaScript since we can't use orderBy with where without index
        fetchedQuizzes.sort((a, b) => {
          const dateA = a.completedAt?.toDate ? a.completedAt.toDate() : new Date(a.completedAt || a.timestamp);
          const dateB = b.completedAt?.toDate ? b.completedAt.toDate() : new Date(b.completedAt || b.timestamp);
          return dateB - dateA;
        });

        // Limit the results
        const limitedQuizzes = fetchedQuizzes.slice(0, limit);
        setQuizzes(limitedQuizzes);

      } catch (error) {
        console.error('Failed to fetch recent quizzes:', error);
        setError('Failed to load recent quizzes. Please try again.');
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
        const score = quiz.score || 0;
        switch (filter) {
          case 'excellent':
            return score >= 90;
          case 'good':
            return score >= 70 && score < 90;
          case 'needs_improvement':
            return score < 70;
          default:
            return true;
        }
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.score || 0) - (a.score || 0);
        case 'date':
          const dateA = a.completedAt?.toDate ? a.completedAt.toDate() : new Date(a.completedAt || a.timestamp);
          const dateB = b.completedAt?.toDate ? b.completedAt.toDate() : new Date(b.completedAt || b.timestamp);
          return dateB - dateA;
        case 'title':
          const titleA = a.quizTitle || a.title || '';
          const titleB = b.quizTitle || b.title || '';
          return titleA.localeCompare(titleB);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [quizzes, filter, sortBy]);

  const handleViewAll = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onViewAll) {
      onViewAll();
    }
  };

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

  if (error) {
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
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <HistoryIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {isFullPage ? 'Quiz History' : 'Recent Quizzes'}
          </Typography>
        </Stack>
        
        {!isFullPage && onViewAll && quizzes.length > 0 && (
          <Button
            endIcon={<ArrowRightIcon />}
            onClick={handleViewAll}
            sx={{ color: 'text.secondary' }}
          >
            View All
          </Button>
        )}
      </Stack>
      
      {showFilters && quizzes.length > 0 && (
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
        {quizzes.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No Quiz History Yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Complete some quizzes to see your recent activity here.
              </Typography>
            </CardContent>
          </Card>
        ) : filteredAndSortedQuizzes.length > 0 ? (
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