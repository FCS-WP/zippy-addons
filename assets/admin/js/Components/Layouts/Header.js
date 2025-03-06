import { Typography } from "@mui/material";
import React from "react";
Typography;
const Header = ({ title, ...props }) => {
  return (
    <Typography variant="h1" className="booking-page-title">
   {title}
    </Typography>
  );
};
export default Header;
