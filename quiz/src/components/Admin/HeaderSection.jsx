import React from "react";
import { CardContent, Stack, Box, Typography, Button } from "@mui/material";
import { Shield, ArrowLeft } from "lucide-react";
import { HeaderCard } from "./styles";

const HeaderSection = ({ onBack, isMobile = false }) => (
  <HeaderCard>
    <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 2, sm: 3 }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
      >
        {/* Left side: Icon + Title */}
        <Stack direction="row" spacing={{ xs: 2, sm: 3 }} alignItems="center" sx={{ flex: 1 }}>
          <Box
            sx={{
              width: { xs: 48, sm: 56, md: 60 },
              height: { xs: 48, sm: 56, md: 60 },
              borderRadius: 2,
              background: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              flexShrink: 0,
            }}
          >
            <Shield size={isMobile ? 22 : 28} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{
                fontWeight: 800,
                mb: { xs: 0.5, sm: 1 },
                lineHeight: 1.2,
                fontSize: { xs: "1.4rem", sm: "1.75rem", md: "2rem" },
              }}
            >
              Admin Dashboard
            </Typography>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.9,
                fontSize: { xs: "0.9rem", sm: "1rem" },
              }}
            >
              Manage premium requests and user accounts
            </Typography>
          </Box>
        </Stack>

        {/* Right side: Back button */}
        <Button
          type="button"
          variant="outlined"
          size={isMobile ? "small" : "medium"}
          startIcon={<ArrowLeft size={16} />}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onBack?.();
          }}
          sx={{
            borderColor: "rgba(255, 255, 255, 0.5)",
            color: "white",
            alignSelf: { xs: "stretch", sm: "auto" },
            '&:hover': {
              borderColor: "white",
              background: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          Back to App
        </Button>
      </Stack>
    </CardContent>
  </HeaderCard>
);

export default HeaderSection;