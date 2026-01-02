import React from "react";
import { Typography, CircularProgress, Box } from "@mui/material";

const Loading = ({ message, ...props }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        direction: "column",
        height: "100vh",
      }}
    >
      {message && <Typography>{message}</Typography>}

      <CircularProgress />
    </Box>
  );
};

export default Loading;
