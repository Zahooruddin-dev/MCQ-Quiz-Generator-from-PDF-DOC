import { Stack, Button } from '@mui/material';
import { RotateCcw, Share2 } from 'lucide-react';

const ActionsBar = ({ onNewQuiz }) => (
  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
    <Button variant="contained" size="large" startIcon={<RotateCcw size={20} />} onClick={onNewQuiz} sx={{ px: 4, py: 1.5, background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', '&:hover': { background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }}}>Start New Quiz</Button>
    <Button variant="outlined" size="large" startIcon={<Share2 size={20} />} sx={{ px: 4, py: 1.5 }}>Share Quiz</Button>
  </Stack>
);

export default ActionsBar;
