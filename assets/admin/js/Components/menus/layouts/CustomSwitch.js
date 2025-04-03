import { Box, Switch } from "@mui/material";
import React, { useState } from "react";

const CustomSwitch = ({ day, onChange }) => {
  const [checked, setChecked] = useState(day.is_available === 1 ? true : false);
  const handleChange = (e) => {
    setChecked(e.target.checked);
    onChange(e.target.checked, day);
  };
  return (
    <Box className="custom-switch">
      <Switch
        sx={{ marginLeft: "-16px" }}
        checked={checked}
        onChange={handleChange}
      />
    </Box>
  );
};

export default CustomSwitch;
