import React from "react";
import { Box, CircularProgress } from "@mui/material";

const LoadingBox = ({ height = "60vh", ...props }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: height,
        width: "100%",
        ...props.sx,
      }}
    >
      <CircularProgress color="primary" />
    </Box>
  );
};

export default LoadingBox;
