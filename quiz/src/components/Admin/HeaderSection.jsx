import React from "react";
import { CardContent, Stack, Box, Typography, Button } from "@mui/material";
import { Shield, ArrowLeft } from "lucide-react";
import { HeaderCard } from "./styles";

const HeaderSection = ({ onBack }) => (
  <HeaderCard>
    <CardContent sx={{ p: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={3} alignItems="center">
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: 2,
              background: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            <Shield size={28} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              Admin Dashboard
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Manage premium requests and user accounts
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={16} />}
          onClick={onBack}
          sx={{
            borderColor: "rgba(255, 255, 255, 0.5)",
            color: "white",
            "&:hover": {
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
