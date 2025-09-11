import React from "react";
import { Chip } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledChip = styled(Chip)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
  border: "1px solid",
  borderColor: theme.palette.primary.light + "30",
  fontWeight: 500,
  "& .MuiChip-icon": {
    color: theme.palette.primary.main,
  },
}));

const FeatureChip = (props) => {
  return <StyledChip {...props} />;
};

export default FeatureChip;
