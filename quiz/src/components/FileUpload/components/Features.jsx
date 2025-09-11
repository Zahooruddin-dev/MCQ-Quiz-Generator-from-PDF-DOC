import React from "react";
import { Stack } from "@mui/material";
import { Brain, Zap, FileText } from "lucide-react";
import FeatureChip from "./FeatureChip";

const Features = () => {
  return (
    <Stack
      direction="row"
      spacing={2}
      justifyContent="center"
      flexWrap="wrap"
      useFlexGap
    >
      <FeatureChip icon={<Brain size={16} />} label="AI-Powered Generation" />
      <FeatureChip icon={<Zap size={16} />} label="Lightning Fast" />
      <FeatureChip icon={<FileText size={16} />} label="Multiple Formats" />
    </Stack>
  );
};

export default Features;
