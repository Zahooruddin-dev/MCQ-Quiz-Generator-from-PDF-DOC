import { Box, Typography, Stack, Chip, CardContent } from '@mui/material';
import { FileText } from 'lucide-react';
import { HeroCard, ScoreCircle } from './styled';

const HeroSection = ({ results, fileName, questions }) => (
  <HeroCard>
    <CardContent sx={{ p: 4 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
        {/* Left side */}
        <Box sx={{ textAlign: { xs: 'center', md: 'left' }, flex: 1 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
            Quiz Complete!
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
            {results.score >= 90 ? 'Excellent! Outstanding performance!' :
             results.score >= 80 ? 'Great job! Well done!' :
             results.score >= 70 ? 'Good work! Keep it up!' :
             results.score >= 60 ? 'Not bad! Room for improvement.' :
             'Keep practicing! You can do better!'}
          </Typography>
          <Stack direction="row" spacing={2} justifyContent={{ xs: 'center', md: 'flex-start' }}>
            <Chip label={fileName || 'Quiz Results'} sx={{ background: 'rgba(255, 255, 255, 0.2)', color: 'white', fontWeight: 600 }}/>
            <Chip icon={<FileText size={16} />} label={`${questions.length} Questions`} sx={{ background: 'rgba(255, 255, 255, 0.2)', color: 'white', fontWeight: 600 }}/>
          </Stack>
        </Box>

        {/* Right side */}
        <Box sx={{ textAlign: 'center' }}>
          <ScoreCircle>
            <Stack alignItems="center" spacing={0.5}>
              <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>{results.score}%</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 500 }}>SCORE</Typography>
            </Stack>
          </ScoreCircle>
          <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
            {results.correct} out of {questions.length} correct
          </Typography>
        </Box>
      </Stack>
    </CardContent>
  </HeroCard>
);

export default HeroSection;
