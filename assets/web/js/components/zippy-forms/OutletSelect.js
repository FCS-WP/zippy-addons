import {
  Box,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  styled,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import OutletDate from "./OutletDate";
import StoreIcon from "@mui/icons-material/Store";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import { format } from "date-fns";
import { webApi } from "../../api";
import { toast } from "react-toastify";

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

const defaultOutlet = 
  {
    id: "0781bc8d-d7ea-452b-9926-96f073e8c56d",
    outlet_name: "EPOS VN",
    display: "T",
    outlet_phone: "0986679999",
    outlet_address: {
      postal_code: "159086",
      address: "2 LENG KEE ROAD THYE HONG INDUSTRIAL CENTRE SINGAPORE 159086",
      coordinates: {
        lat: "1.29098485842066",
        lng: "103.814878244797",
      },
    },
    operating_hours: [
      {
        week_day: "0",
        open_at: "08:00",
        close_at: "20:00",
      },
      {
        week_day: "1",
        open_at: "08:00",
        close_at: "20:00",
      },
      {
        week_day: "2",
        open_at: "08:00",
        close_at: "20:00",
      },
      {
        week_day: "3",
        open_at: "08:00",
        close_at: "20:00",
      },
      {
        week_day: "4",
        open_at: "08:00",
        close_at: "21:00",
      },
      {
        week_day: "5",
        open_at: "09:00",
        close_at: "21:00",
      },
      {
        week_day: "6",
        open_at: "09:00",
        close_at: "18:00",
      },
    ],
    closed_dates: ["2025-01-01", "2025-02-01"],
    delivery: {
      enabled: "T",
      delivery_hours: [
        {
          from: "10:00",
          to: "11:00",
        },
        {
          from: "13:00",
          to: "14:00",
        },
      ],
    },
    takeaway: {
      enabled: "F",
      timeslot_duration: 1,
    },
  };

const OutletSelect = ({ type = "delivery", onChangeData, selectedLocation }) => {
  const [outlet, setOutlet] = useState(defaultOutlet);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [mapRoute, setMapRoute] = useState(null);
  const times = type == "delivery" ? outlet.delivery.delivery_hours : outlet.operating_hours; 

  const handleChangeOutlet = (e) => {
    setOutlet(e.target.value);
  };

  const handleDistance = async () => {
    try {
      const startPoint = selectedLocation.LATITUDE + "," + selectedLocation.LONGITUDE;
      const endPoint = outlet.outlet_address.coordinates.lat + "," + outlet.outlet_address.coordinates.lng;
      const moveTime = '00:00:00';

      const params = {
        start: startPoint,
        end:endPoint,
        routeType: "drive",
        date: format(new Date(), 'MM-dd-yyyy'),
        time: moveTime,
        mode: "TRANSIT",
        maxWalkDistance: 1000,
        numItineraries: 3,
      };

      const calcDistance = await webApi.searchRoute(params);
      setMapRoute(calcDistance.data.route_summary);

    } catch (error) {
      toast.error("failed to get distance");
    }
  };

  const handleChangeDate = (date) => {
    setSelectedDate(date);
  };

  const handleChangeTime = (e) => {
    setSelectedTime(e.target.value);
  };

  useEffect(() => {
    if (outlet && selectedDate && selectedTime) {
      onChangeData({
        outlet: outlet,
        date: selectedDate,
        time: selectedTime,
      });
    }
  }, [outlet, selectedDate, selectedTime]);

  useEffect(()=>{
    if (selectedLocation && outlet) {
      handleDistance();
    }
  }, [selectedLocation])

  function formatMetersToKm(meters) {
    const value = parseFloat(meters);
    if (isNaN(value)) return "Invalid input";
  
    return value >= 1000 ? (value / 1000).toFixed(2) + " km" : value + " m";
  }
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
          {/* Multi outlets */}
          {/* {outlets &&
            outlets.map((outlet, index) => (
              <MenuItem key={index} value={outlet} selected={ index == 0 ? true : false}>
                <Typography fontSize={14}>{outlet.ADDRESS}</Typography>
              </MenuItem>
            ))} */}
            <MenuItem value={outlet}>
              <Typography sx={{ textWrap: 'wrap' }} fontSize={14}>{outlet.outlet_address.address} <strong> {mapRoute ? '| ' + formatMetersToKm(mapRoute.total_distance) : ''} </strong></Typography>
            </MenuItem>
        </CustomSelect>
      </FormControl>

      {outlet && selectedLocation && (
        <Box>
          {/* Select Date */}
          <Box my={2}>
            <OutletDate onChangeDate={handleChangeDate} />
          </Box>

          {/* Select Time */}
          <FormControl variant="outlined" fullWidth>
            <h5>Select time: {selectedTime ? selectedTime.from + ' - ' + selectedTime.to : ''}</h5>
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
              {times &&
                times.map((time, index) => (
                  <MenuItem key={index} value={time}>
                    <Typography fontSize={14}>
                      {time.from + " - " + time.to}
                    </Typography>
                  </MenuItem>
                ))}
            </CustomSelect>
          </FormControl>
        </Box>
      )}
    </Box>
  );
};

export default OutletSelect;
