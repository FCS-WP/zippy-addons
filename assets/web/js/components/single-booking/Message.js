import { Stack } from "@mui/material";
import React from "react";

const Message = ({ message, className = "" }) => {
  return (
    <Stack
      direction={"row"}
      sx={{ justifyContent: "center", alignItems: "center", py: 4, gridColumn: "span 12" }}
    >
      <div className={className}>
        <h4>{message}</h4>
      </div>
    </Stack>
  );
};

export default Message;
