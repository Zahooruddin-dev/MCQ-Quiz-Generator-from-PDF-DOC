import React from 'react';
import { Button } from '@mui/material';
import { SaveAltOutlined as ExportIcon } from '@mui/icons-material';

const ExportButton = ({ onExport, data }) => {
  const handleExport = () => {
    if (!data) return;

    // Create CSV data
    const csvData = [
      ['Metric', 'Value'],
      ['Total Quizzes', data.totalQuizzes || 0],
      ['Average Score', `${(data.avgScore || 0).toFixed(1)}%`],
      ['Best Score', `${data.bestScore || 0}%`],
      ['Current Streak', data.streak || 0],
      ...((data.topicPerformance || []).map(topic => [`${topic.topic} Average`, `${topic.avgScore.toFixed(1)}%`])),
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quiz-analytics.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    if (onExport) onExport(data);
  };

  return (
    <Button
      startIcon={<ExportIcon />}
      onClick={handleExport}
      variant="outlined"
      size="small"
      disabled={!data}
    >
      Export Data
    </Button>
  );
};

export default ExportButton;