import React from "react";
import { Box, Typography } from "@mui/material";

const Header = () => {
  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
        Upload Your Content
      </Typography>
      <Typography
        variant="h6"
        sx={{
          color: "text.secondary",
          fontWeight: 400,
          maxWidth: 600,
          mx: "auto",
        }}
      >
        Upload documents or paste text to generate AI-powered quiz questions
        instantly
      </Typography>
    </Box>
  );
};

export default Header;
