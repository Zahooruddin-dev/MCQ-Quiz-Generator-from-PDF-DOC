import React, { useState, useEffect } from 'react';
import { Box, Stack, Typography, Container, Button } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUpOutlined';

import { db } from '../../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import StatsGrid from './StatsGrid';
import ProgressChart from './ProgressChart';
import CompletionCard from './CompletionCard';
import LoadingSkeleton from './LoadingSkeleton';
import Alerts from './Alerts';
import { getEmptyProgressData, calculateProgressFromQuizzes, generateMockWeeklyProgress } from './helpers';
import { useAuth } from '../../../context/AuthContext';

const ProgressTracking = ({ userId, onBack, timePeriod = 'all_time', showCharts = true, compact = false }) => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [indexError, setIndexError] = useState(false);
  const [dataSource, setDataSource] = useState('user');

  useEffect(() => {
    const fetchProgressData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.quizzesTaken > 0) {
            const data = {
              totalQuizzes: userData.quizzesTaken || 0,
              averageScore: userData.avgScore || 0,
              totalTimeSpent: userData.totalTime || 0,
              currentStreak: userData.streak || 0,
              bestScore: userData.bestScore || 0,
              completionRate: userData.completionRate || 0,
              topicsStudied: userData.topicsStudied?.length || 0,
              weeklyProgress: generateMockWeeklyProgress(userData.avgScore || 0),
            };
            setProgressData(data);
            setDataSource('user');
            setIndexError(false);
            setLoading(false);
            return;
          }
        }

        const quizzesRef = collection(db, 'quizzes');
        const simpleQuery = query(quizzesRef, where('userId', '==', user.uid), limit(50));
        const querySnapshot = await getDocs(simpleQuery);

        if (!querySnapshot.empty) {
          const quizzes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          quizzes.sort((a, b) => (b.completedAt?.toDate?.() || new Date(0)) - (a.completedAt?.toDate?.() || new Date(0)));
          setProgressData(calculateProgressFromQuizzes(quizzes));
          setDataSource('quizzes');
        } else {
          setProgressData(getEmptyProgressData());
          setDataSource('empty');
        }
      } catch (error) {
        console.error('Error fetching progress data:', error);
        setProgressData(getEmptyProgressData());
        setIndexError(error.code === 'failed-precondition');
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [user, timePeriod]);

  if (loading) return <LoadingSkeleton showCharts={showCharts} />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <TrendingUpIcon color="primary" />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Your Progress</Typography>
      </Stack>

      <Alerts indexError={indexError} dataSource={dataSource} />

     
      <Stack spacing={3}>
        <StatsGrid data={progressData} />
        {showCharts && !compact && progressData.weeklyProgress.length > 0 && <ProgressChart data={progressData.weeklyProgress} />}
        <CompletionCard data={progressData} />
      </Stack>
    </Container>
  );
};

export default ProgressTracking;
