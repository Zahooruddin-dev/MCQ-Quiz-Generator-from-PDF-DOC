import React from 'react';
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import difficultyOptions from './difficultyOptions';
import qualityOptions from './qualityOptions';

const DifficultyQualitySelector = ({
  aiOptions,
  loading,
  isMobile,
  handleDifficultyChange,
  handleQualityChange,
}) => {
  return (
    <Grid container spacing={isMobile ? 1 : 2}>
      {/* Difficulty Selection */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth disabled={loading} size={isMobile ? "small" : "medium"}>
          <InputLabel 
            sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
          >
            Difficulty Level
          </InputLabel>
          <Select
            value={aiOptions.difficulty}
            label="Difficulty Level"
            onChange={handleDifficultyChange}
            sx={{
              '& .MuiSelect-select': {
                fontSize: isMobile ? '0.875rem' : '1rem',
              },
            }}
          >
            {difficultyOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    width: '100%',
                  }}
                >
                  {React.cloneElement(option.icon, { 
                    size: isMobile ? 16 : 18 
                  })}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ 
                        fontWeight: 500,
                        fontSize: isMobile ? '0.85rem' : '0.875rem',
                      }}
                    >
                      {option.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ 
                        fontSize: isMobile ? '0.7rem' : '0.75rem',
                        lineHeight: 1.2,
                      }}
                    >
                      {option.description}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Quality Selection */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth disabled={loading} size={isMobile ? "small" : "medium"}>
          <InputLabel
            sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
          >
            Generation Quality
          </InputLabel>
          <Select
            value={aiOptions.quality}
            label="Generation Quality"
            onChange={handleQualityChange}
            sx={{
              '& .MuiSelect-select': {
                fontSize: isMobile ? '0.875rem' : '1rem',
              },
            }}
          >
            {qualityOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    width: '100%',
                  }}
                >
                  {React.cloneElement(option.icon, { 
                    size: isMobile ? 16 : 18 
                  })}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ 
                        fontWeight: 500,
                        fontSize: isMobile ? '0.85rem' : '0.875rem',
                      }}
                    >
                      {option.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ 
                        fontSize: isMobile ? '0.7rem' : '0.75rem',
                        lineHeight: 1.2,
                      }}
                    >
                      {option.description}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default React.memo(DifficultyQualitySelector);
