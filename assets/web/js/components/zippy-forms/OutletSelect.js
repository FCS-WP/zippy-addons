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
import { generateTimeSlots } from "../../helper/datetime";

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

const OutletSelect = ({ type = "delivery", onChangeData, selectedLocation }) => {
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState('');
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [mapRoute, setMapRoute] = useState(null);
  const [times, setTimes] = useState();

  const handleTimes = () => {
    if (!selectedDate) return false();
    let configTime = [];
    switch (type) {
      case "delivery":
        if (!selectedOutlet.delivery) return false();
        configTime = selectedOutlet?.delivery.delivery_hours;
        break;
      case "takeaway":
        if (!selectedOutlet.takeaway) return false();
        const openingHours = selectedOutlet?.operating_hours.find((item)=>{
          return parseInt(item.week_day) === selectedDate.getDay();
        }) 
        configTime = generateTimeSlots(openingHours?.open_at, openingHours?.close_at, selectedOutlet?.takeaway.timeslot_duration);
      default:
        break;
    }
    setSelectedTime('');
    setTimes(configTime); 
  };

  const handleChangeOutlet = (e) => {
    setSelectedOutlet(e.target.value);
  };

  const handleDistance = async () => {
    try {
      const startPoint = selectedLocation.LATITUDE + "," + selectedLocation.LONGITUDE;
      const endPoint = selectedOutlet.outlet_address.coordinates.lat + "," + selectedOutlet.outlet_address.coordinates.lng;
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

  const formatMetersToKm = (meters) => {
    const value = parseFloat(meters);
    if (isNaN(value)) return "Invalid input";
  
    return value >= 1000 ? (value / 1000).toFixed(2) + " km" : value + " m";
  };

  const getConfigOutlet = async () => {
    try {
      const { data : response } = await webApi.getStores();
      if (response) {
        setOutlets(response.data);
      }
    } catch (error) {
      toast.error("Failed to get outlet.")
    }
  }

  useEffect(() => {
    if (selectedOutlet && selectedDate && selectedTime) {
      onChangeData({
        outlet: selectedOutlet,
        date: selectedDate,
        time: selectedTime,
      });
    }
  }, [selectedOutlet, selectedDate, selectedTime]);

  useEffect(() => {
    if (selectedLocation && selectedOutlet) {
      handleDistance();
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (selectedDate) {
      handleTimes();
    }
  }, [selectedDate]);

  useEffect(() => {
    getConfigOutlet();
  }, [])

  return (
    <Box className="outlet-selects" mt={2}>
      <FormControl variant="outlined" fullWidth>
        <h5>Select an outlet</h5>
        <CustomSelect
          variant="outlined"
          id="outlet-id"
          size="small"
          value={selectedOutlet}
          onChange={handleChangeOutlet}
          startAdornment={
            <InputAdornment position="start" sx={{ paddingLeft: "11px" }}>
              <StoreIcon sx={{ color: "#ec7265" }} />
            </InputAdornment>
          }
        >
          {/* Multi outlets */}
          {outlets.length > 0 &&
            outlets.map((outlet, index) => (
              <MenuItem key={index} value={outlet}>
                <Typography sx={{ textWrap: 'wrap' }} fontSize={14}>{outlet.outlet_address.address} <strong> {mapRoute ? '| ' + formatMetersToKm(mapRoute.total_distance) : ''} </strong></Typography>
              </MenuItem>
            ))}
           
        </CustomSelect>
      </FormControl>

      {selectedOutlet && (
        <Box>
          {/* Select Date */}
          <Box my={3}>
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
