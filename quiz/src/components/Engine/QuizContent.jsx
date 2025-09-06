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
} from "@mui/material";
import { Fade } from "@mui/material";
import { QuestionCard, OptionCard } from "./QuizStyles";

const QuizContent = ({
  currentQ,
  currentQuestion,
  userAnswers,
  handleAnswerSelect,
}) => (
  <CardContent sx={{ p: 4 }}>
    {currentQ?.context && (
      <Fade in={true}>
        <Paper
          sx={{
            p: 3,
            mb: 3,
            background: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
            border: "1px solid",
            borderColor: "grey.200",
            borderLeft: "4px solid",
            borderLeftColor: "primary.main",
          }}
        >
          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
            {currentQ.context}
          </Typography>
        </Paper>
      </Fade>
    )}

    <QuestionCard elevation={0}>
      <Stack spacing={3}>
        <Box>
          <Chip
            label={`Question ${currentQuestion + 1}`}
            size="small"
            sx={{ mb: 2 }}
            color="primary"
          />
          <Typography variant="h5" sx={{ fontWeight: 600, lineHeight: 1.4 }}>
            {currentQ?.question || "Question data missing."}
          </Typography>
        </Box>

        <FormControl component="fieldset">
          <RadioGroup
            value={userAnswers[currentQuestion] ?? ""}
            onChange={(e) => handleAnswerSelect(parseInt(e.target.value))}
          >
            <Stack spacing={2}>
              {currentQ?.options?.map((option, index) => (
                <OptionCard
                  key={index}
                  isSelected={userAnswers[currentQuestion] === index}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <FormControlLabel
                    value={index}
                    control={<Radio sx={{ display: "none" }} />}
                    label={
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {option}
                      </Typography>
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
              ))}
            </Stack>
          </RadioGroup>
        </FormControl>
      </Stack>
    </QuestionCard>
  </CardContent>
);

export default QuizContent;
