import { Box, FormControl, InputAdornment, MenuItem, Select, styled, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import OutletDate from "./OutletDate";
import StoreIcon from '@mui/icons-material/Store';
import WatchLaterIcon from '@mui/icons-material/WatchLater';

const CustomSelect = styled(Select)({
  padding: "5px",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#ccc",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#ec7265",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline, &.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
    {
      borderColor: "#ccc",
      borderWidth: "1px",
    },
});

const outlets = [
  {
    ID: 1,
    ADDRESS: "OUTLET 1 123456",
    LATITUDE: "1.30743547948389",
    LONGITUDE: "103.854713903431"
  },
  {
    ID: 2,
    ADDRESS: "OUTLET 2 254654",
    LATITUDE: "1.30743547948389",
    LONGITUDE: "103.854713903431"
  },
  {
    ID: 3,
    ADDRESS: "OUTLET 3 123123",
    LATITUDE: "1.30743547948389",
    LONGITUDE: "103.854713903431"
  }
];

const times = [
  {
    start: "10",
    end: "11",
  },
  {
    start: "10",
    end: "12",
  },
  {
    start: "12",
    end: "13",
  },
  {
    start: "13",
    end: "14",
  },
]

const OutletSelect = ({ onChangeData }) => {
  const [outlet, setOutlet] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const handleChangeOutlet = (e) => {
    setOutlet(e.target.value);
  };

  const handleChangeDate = (date) => {
    setSelectedDate(date);
  };

  const handleChangeTime = (e) => {
    setSelectedTime(e.target.value);
  };

  useEffect(()=>{
    if (outlet && selectedDate && selectedTime) {
      onChangeData({
        outlet: outlet,
        date: selectedDate,
        time: selectedTime,
      })
    }
  }, [outlet, selectedDate, selectedTime])

  return (
    <Box className="outlet-selects" mt={2}>
      <FormControl variant="outlined" fullWidth>
        <h5>Select an outlet</h5>
        <CustomSelect
          variant="outlined"
          id="outlet-id"
          size="small"
          value={outlet}
          onChange={handleChangeOutlet}
          startAdornment={
            <InputAdornment position="start" sx={{ paddingLeft: "11px" }}>
              <StoreIcon sx={{ color: "#ec7265" }} />
            </InputAdornment>
          }
        >
          <MenuItem value="">
            <Typography fontSize={14}>None</Typography>
          </MenuItem>
          {outlets && outlets.map((outlet, index)=>(
            <MenuItem key={index} value={outlet}><Typography fontSize={14}>{outlet.ADDRESS}</Typography></MenuItem>
          ))}
        </CustomSelect>
      </FormControl>
      {/* Select Date */}
      <Box my={2}>
        <OutletDate onChangeDate={handleChangeDate} />
      </Box>

      {/* Select Time */}
      <FormControl variant="outlined" fullWidth>
        <h5>Select time</h5>
        <CustomSelect
          id="delivery-time"
          size="small"
          value={selectedTime}
          onChange={handleChangeTime}
          startAdornment={
            <InputAdornment position="start" sx={{ paddingLeft: "11px" }}>
              <WatchLaterIcon sx={{ color: "#ec7265" }} />
            </InputAdornment>
          }
        >
         <MenuItem value="">
            <Typography fontSize={14}>None</Typography>
          </MenuItem>
          {times && times.map((time, index)=>(
            <MenuItem key={index} value={time}><Typography fontSize={14}>{time.start + " - " + time.end}</Typography></MenuItem>
          ))}
        </CustomSelect>
      </FormControl>
    </Box>
  );
};

export default OutletSelect;
