import React from "react";
import { Box, Typography, Button } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Top bar with left-aligned back button and centered content */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 40,
          mb: { xs: 1.5, sm: 2 },
        }}
      >
        <Button
          onClick={() => navigate("/dashboard")}
          variant="text"
          size="small"
          startIcon={<ArrowBackIosNewIcon fontSize="small" />}
          sx={{
            position: "absolute",
            left: 0,
            color: "text.secondary",
            px: { xs: 0.5, sm: 1 },
            minWidth: { xs: 36, sm: "auto" },
            borderRadius: 2,
            textTransform: "none",
            '& .MuiButton-startIcon': { mr: { xs: 0, sm: 0.75 } },
            '&:hover': { backgroundColor: "action.hover" },
          }}
        >
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
            Back to Dashboard
          </Box>
        </Button>
      </Box>

      {/* Centered title and subtitle */}
      <Box sx={{ textAlign: "center" }}>
        <Typography
          variant="h3"
          sx={{
            mb: { xs: 1, sm: 2 },
            fontWeight: 700,
            fontSize: { xs: "1.6rem", sm: "2rem", md: "2.4rem" },
            lineHeight: 1.2,
          }}
        >
          Upload Your Content
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: "text.secondary",
            fontWeight: 400,
            fontSize: { xs: "0.95rem", sm: "1.05rem" },
            maxWidth: 640,
            mx: "auto",
          }}
        >
          Upload documents or paste text to generate AI-powered quiz questions instantly
        </Typography>
      </Box>
    </Box>
  );
};

export default Header;