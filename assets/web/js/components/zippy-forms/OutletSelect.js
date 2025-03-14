import { Box, FormControl, MenuItem, Select, styled } from "@mui/material";
import React, { useState } from "react";

const CustomSelect = styled(Select)({
  padding: "5px",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#ccc", // Default border color
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#ec7265", // Outline color on hover
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline, &.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
    {
      borderColor: "#ccc", // Outline color on focus
      borderWidth: "1px"
    },
}); 

const OutletSelect = () => {
  const [outlet, setOutlet] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');

  const handleChangeOutlet = (e) => {
    setOutlet(e.target.value);
  }

  const handleChangeDate = (e) => {
    setSelectedDate(e.target.value);
  }

  const handleChangeTime = (e) => {
    setDeliveryTime(e.target.value);
  }

  return (
    <Box className="outlet-selects">
      <FormControl variant="outlined" fullWidth>
        <h5>Select an outlet</h5>
        <CustomSelect
          variant="outlined"
          id="outlet-id"
          size="small"
          value={outlet}
          onChange={handleChangeOutlet}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value={"store 1"}>store 1</MenuItem>
          <MenuItem value={"store 2"}>store 2</MenuItem>
          <MenuItem value={"store 3"}>store 3</MenuItem>
        </CustomSelect>
      </FormControl>
      <Box className="box select date"></Box>
      <FormControl variant="outlined" fullWidth>
        <h5>Select delivery time</h5>
        <CustomSelect
          id="delivery-time"
          size="small"
          value={deliveryTime}
          onChange={handleChangeTime}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value={'10 - 12 pm'}>10 - 12 pm</MenuItem>
          <MenuItem value={'1 - 2 pm'}>1 - 2 pm</MenuItem>
          <MenuItem value={'8 - 9 am'}>8 - 9 am</MenuItem>
        </CustomSelect>
      </FormControl>
    </Box>
  );
};

export default OutletSelect;
