import React from "react";
import {
  CardContent,
  Stack,
  Box,
  Typography,
  Paper,
  Chip,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Fade,
  Grow,
} from "@mui/material";
import { QuestionCard, OptionCard } from "./QuizStyles";
import { BookOpen, HelpCircle } from "lucide-react";

const QuizContent = ({
  currentQ,
  currentQuestion,
  userAnswers,
  handleAnswerSelect,
  isTransitioning = false,
}) => (
  <CardContent 
    sx={{ 
      p: { xs: 3, sm: 4, md: 5 },
      // CRITICAL: Mobile layout fixes to prevent spacing collapse
      '@media (max-width: 600px)': {
        // Prevent layout shifts during option selection
        contain: 'layout style',
        // Ensure stable bottom margin
        paddingBottom: '2rem !important',
        // Force stable container height
        minHeight: 'fit-content',
        // Prevent content reflow
        '& *': {
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
        },
      },
    }}
  >
 

    {/* Question Card */}
    <QuestionCard 
      elevation={0}
      sx={{
        opacity: isTransitioning ? 0.7 : 1,
        transform: isTransitioning ? 'translateY(10px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Stack spacing={{ xs: 3, sm: 4 }}>
        {/* Question Header */}
        <Box>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Chip
              icon={<HelpCircle size={14} />}
              label={`Question ${currentQuestion + 1}`}
              color="primary"
              size="medium"
              sx={{
                fontWeight: 600,
                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                color: 'white',
                border: 'none',
                px: 1,
                '& .MuiChip-icon': {
                  color: 'white',
                },
              }}
            />
            
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 500,
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Choose the best answer
            </Typography>
          </Stack>

          <Typography 
            variant="h4" 
            component="h2"
            sx={{ 
              fontWeight: 700, 
              lineHeight: 1.3,
              color: '#111827',
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
              letterSpacing: '-0.01em',
              mb: 1,
            }}
          >
            {currentQ?.question || "Question data missing."}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '0.85rem', sm: '0.9rem' },
              display: { xs: 'block', sm: 'none' }
            }}
          >
            Select your answer below
          </Typography>
        </Box>

        {/* Answer Options */}
        <FormControl 
          component="fieldset" 
          sx={{ 
            width: '100%',
            // CRITICAL: Prevent option selection from causing layout shifts
            '@media (max-width: 600px)': {
              // Stable container for options
              '& .MuiRadioGroup-root': {
                // Consistent spacing that doesn't collapse
                '& > div': {
                  marginBottom: '16px !important',
                },
                '& > div:last-child': {
                  marginBottom: '0 !important',
                },
              },
            },
          }}
        >
          <RadioGroup
            value={userAnswers[currentQuestion] ?? ""}
            onChange={(e) => handleAnswerSelect(parseInt(e.target.value))}
            aria-labelledby={`question-${currentQuestion}-label`}
          >
            <Stack 
              spacing={{ xs: 2, sm: 2.5 }}
              sx={{
                // MOBILE: Prevent spacing collapse during interactions
                '@media (max-width: 600px)': {
                  '& > *': {
                    marginBottom: '16px !important',
                  },
                  '& > *:last-child': {
                    marginBottom: '0 !important',
                  },
                },
              }}
            >
              {currentQ?.options?.map((option, index) => (
                <Grow
                  key={index}
                  in={!isTransitioning}
                  timeout={300 + (index * 100)}
                >
                  <Box>
                    <OptionCard
                      isSelected={userAnswers[currentQuestion] === index}
                      onClick={() => handleAnswerSelect(index)}
                      sx={{
                        cursor: 'pointer',
                        minHeight: { xs: 56, sm: 64 },
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:focus-visible': {
                          outline: '2px solid #3b82f6',
                          outlineOffset: '2px',
                        },
                        '&:active': {
                          transform: 'scale(0.98)',
                        },
                        // CRITICAL: Mobile-specific fixes to prevent layout shift
                        '@media (max-width: 600px)': {
                          // Disable problematic transforms on mobile
                          '&:hover': {
                            transform: 'none !important',
                          },
                          '&:active': {
                            transform: 'scale(0.95)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          },
                          // Force GPU compositing to prevent reflow
                          transform: 'translateZ(0)',
                          willChange: 'background-color, border-color',
                          // Prevent layout calculations
                          contain: 'layout style',
                        },
                        // Enhanced mobile touch targets for non-hover devices
                        '@media (hover: none)': {
                          '&:hover': {
                            transform: 'none',
                          },
                          '&:active': {
                            transform: 'scale(0.95)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          },
                        },
                      }}
                      tabIndex={0}
                      role="button"
                      aria-pressed={userAnswers[currentQuestion] === index}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleAnswerSelect(index);
                        }
                      }}
                    >
                      <FormControlLabel
                        value={index}
                        control={
                          <Radio 
                            sx={{ 
                              display: "none" 
                            }} 
                          />
                        }
                        label={
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', py: 1 }}>
                            {/* Option Letter */}
                            <Box
                              sx={{
                                width: { xs: 28, sm: 32 },
                                height: { xs: 28, sm: 32 },
                                borderRadius: '50%',
                                background: userAnswers[currentQuestion] === index
                                  ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)'
                                  : '#f3f4f6',
                                color: userAnswers[currentQuestion] === index ? 'white' : '#6b7280',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                flexShrink: 0,
                                transition: 'all 0.2s ease',
                                // Mobile: Force compositing to prevent reflow
                                '@media (max-width: 600px)': {
                                  transform: 'translateZ(0)',
                                },
                              }}
                            >
                              {String.fromCharCode(65 + index)}
                            </Box>
                            
                            {/* Option Text */}
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: 500,
                                fontSize: { xs: '0.95rem', sm: '1rem' },
                                lineHeight: 1.4,
                                color: userAnswers[currentQuestion] === index ? '#111827' : '#374151',
                                flex: 1,
                              }}
                            >
                              {option}
                            </Typography>
                          </Stack>
                        }
                        sx={{
                          margin: 0,
                          width: "100%",
                          "& .MuiFormControlLabel-label": {
                            width: "100%",
                          },
                        }}
                      />
                    </OptionCard>
                  </Box>
                </Grow>
              ))}
            </Stack>
          </RadioGroup>

          {/* Help Text */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.8rem',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Use keyboard shortcuts: 1, 2, 3, 4 or arrow keys to navigate
            </Typography>
          </Box>
        </FormControl>
      </Stack>
    </QuestionCard>
  </CardContent>
);

export default QuizContent;