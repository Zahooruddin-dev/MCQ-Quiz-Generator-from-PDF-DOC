import React from 'react';
import { Alert, AlertTitle, Typography, Button } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const Alerts = ({ indexError, dataSource }) => {
  const handleCreateIndex = () => {
    const url = 'https://console.firebase.google.com/';
    window.open(url, '_blank');
  };

  return (
    <>
      {indexError && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>Optional: Create Index for Better Performance</AlertTitle>
          <Typography variant="body2" sx={{ mb: 2 }}>For better performance, you can create a Firestore index. Optional.</Typography>
          <Button variant="outlined" color="info" size="small" endIcon={<OpenInNewIcon />} onClick={handleCreateIndex}>Create Index</Button>
        </Alert>
      )}
      {dataSource === 'user' && <Alert severity="success" sx={{ mb: 2 }}><Typography variant="body2">✅ Progress loaded from user profile</Typography></Alert>}
      {dataSource === 'quizzes' && <Alert severity="info" sx={{ mb: 2 }}><Typography variant="body2">ℹ️ Progress calculated from quiz history</Typography></Alert>}
    </>
  );
};

export default Alerts;
