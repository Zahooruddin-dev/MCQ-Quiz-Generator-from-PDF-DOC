import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Typography,
  Tooltip,
  TextField,
  Box,
  Chip,
  Fade,
  Alert,
} from '@mui/material';
import {
  ChevronDown,
  Sparkles,
  Info,
  MessageSquare,
  CheckCircle,
} from 'lucide-react';

const CustomInstructionsAccordion = ({
  showCustomInstructions,
  setShowCustomInstructions,
  isMobile,
  aiOptions,
  loading,
  validationErrors,
  handleCustomInstructionsChange,
  examplePrompts,
  addExamplePrompt,
}) => {
  return (
    <Accordion
      expanded={showCustomInstructions}
      onChange={() => setShowCustomInstructions(!showCustomInstructions)}
      sx={{
        backgroundColor: 'rgba(139, 92, 246, 0.05)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: 2,
        '&:before': { display: 'none' },
        boxShadow: 'none',
        '& .MuiAccordionSummary-root': {
          minHeight: isMobile ? 44 : 48,
          '&.Mui-expanded': { minHeight: isMobile ? 44 : 48 },
        },
      }}
    >
      <AccordionSummary expandIcon={<ChevronDown size={isMobile ? 18 : 20} />}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Sparkles size={isMobile ? 16 : 18} color="#8B5CF6" />
          <Typography
            variant={isMobile ? 'body1' : 'subtitle1'}
            sx={{
              fontWeight: 600,
              color: '#6B46C1',
              fontSize: isMobile ? '0.9rem' : '1rem',
            }}
          >
            Custom Instructions {!isMobile && '(Optional)'}
          </Typography>
          <Tooltip title="Add specific requirements for your quiz questions">
            <Info size={isMobile ? 14 : 16} color="#9CA3AF" />
          </Tooltip>
        </Stack>
      </AccordionSummary>

      <AccordionDetails sx={{ px: isMobile ? 1 : 2 }}>
        <Stack spacing={2}>
          <TextField
            multiline
            rows={isMobile ? 3 : 4}
            placeholder={
              isMobile
                ? "e.g., 'Focus on Chapter 3', 'Include calculations'..."
                : "Add your custom instructions here... (e.g., 'Focus on Chapter 3', 'Include calculation problems', 'Test understanding of key concepts')"
            }
            value={aiOptions.customInstructions}
            onChange={handleCustomInstructionsChange}
            disabled={loading}
            error={!!validationErrors.customInstructions}
            helperText={
              validationErrors.customInstructions ||
              `${aiOptions.customInstructions.length}/1000 characters`
            }
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: isMobile ? '0.85rem' : '1rem',
              },
            }}
            InputProps={{
              startAdornment: (
                <MessageSquare
                  size={isMobile ? 16 : 18}
                  color="#9CA3AF"
                  style={{
                    marginRight: 8,
                    marginTop: isMobile ? 8 : 12,
                    flexShrink: 0,
                  }}
                />
              ),
            }}
            size={isMobile ? 'small' : 'medium'}
          />

          {/* Example prompts */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                mb: 1,
                display: 'block',
                fontSize: isMobile ? '0.7rem' : '0.75rem',
              }}
            >
              Quick examples (tap to add):
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: isMobile ? 0.5 : 1,
              }}
            >
              {examplePrompts.map((prompt, index) => (
                <Chip
                  key={index}
                  label={prompt}
                  size="small"
                  onClick={() => addExamplePrompt(prompt)}
                  sx={{
                    cursor: 'pointer',
                    fontSize: isMobile ? '0.7rem' : '0.8125rem',
                    height: isMobile ? 24 : 28,
                    '&:hover': {
                      backgroundColor: 'rgba(139, 92, 246, 0.15)',
                      transform: isMobile ? 'none' : 'scale(1.05)',
                      transition: 'all 0.2s',
                    },
                    '&:active': {
                      transform: 'scale(0.95)',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {aiOptions.customInstructions && (
            <Fade in={true} timeout={500}>
              <Alert
                severity="info"
                icon={<CheckCircle size={16} />}
                sx={{
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                  '& .MuiAlert-icon': {
                    fontSize: isMobile ? '1rem' : '1.25rem',
                  },
                }}
              >
                Your custom instructions will guide the AI while maintaining
                question quality and format standards.
              </Alert>
            </Fade>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default React.memo(CustomInstructionsAccordion);
