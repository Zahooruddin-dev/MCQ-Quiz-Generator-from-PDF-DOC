import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";

const PageLoading = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "400px",
    }}
  >
    <CircularProgress />
  </Box>
);

const LazyWrapper = ({ children }) => {
  return <Suspense fallback={<PageLoading />}>{children}</Suspense>;
};

export default LazyWrapper;
