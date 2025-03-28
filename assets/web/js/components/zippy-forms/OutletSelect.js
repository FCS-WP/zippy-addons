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
import { convertTime24to12 } from "../../../../admin/js/utils/dateHelper";

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

const OutletSelect = ({
  type = "delivery",
  onChangeData,
  selectedLocation = null,
}) => {
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [mapRoute, setMapRoute] = useState(null);
  const [times, setTimes] = useState();

  const handleTimes = () => {
    if (!selectedDate || selectedOutlet?.operating_hours.length <= 0) return false();
    let configTime = [];

    const openingHours = selectedOutlet?.operating_hours.find((item) => {
      return parseInt(item.week_day) === selectedDate.getDay();
    });

    switch (type) {
      case "delivery":
        if (!openingHours.delivery || openingHours.delivery.enable === 'F') return false();
        configTime = openingHours.delivery.delivery_hours;
        break;
      case "takeaway":
        if (!selectedOutlet.takeaway) return false();
        configTime = generateTimeSlots(
          openingHours?.open_at,
          openingHours?.close_at,
          selectedOutlet?.takeaway.timeslot_duration
        );
      default:
        break;
    }
    setSelectedTime("");
    setTimes(configTime);
  };

  const clearOldData = () => {
    setSelectedOutlet("");
    setSelectedTime("");
    onChangeData(null);
  };

  const handleChangeOutlet = (e) => {
    setSelectedOutlet(e.target.value);
  };

  const handleDistance = async () => {
    try {
      const params = {
        from: {
          lat: selectedOutlet.outlet_address.coordinates.lat,
          lng: selectedOutlet.outlet_address.coordinates.lng,
        },
        to: {
          lat: selectedLocation.LATITUDE,
          lng: selectedLocation.LONGITUDE,
        }
      };

      const { data: response } = await webApi.searchRoute(params);
      setMapRoute(response.data);
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
      const { data: response } = await webApi.getStores();
      if (response) {
        setOutlets(response.data);
      }
    } catch (error) {
      toast.error("Failed to get outlet.");
    }
  };

  useEffect(() => {
    if (selectedOutlet && selectedDate && selectedTime) {
      onChangeData({
        outlet: selectedOutlet.id,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedTime,
        mapRoute: mapRoute ?? '',
      });
    }
  }, [selectedOutlet, selectedDate, selectedTime]);

  useEffect(() => {
    if (selectedLocation && selectedOutlet) {
      handleDistance();
    }
  }, [selectedLocation, selectedOutlet]);

  useEffect(() => {
    if (selectedDate) {
      handleTimes();
      onChangeData(null);
    }
  }, [selectedDate]);

  useEffect(() => {
    getConfigOutlet();

    return () => {
      clearOldData();
    };
  }, []);

  return (
    <Box className="outlet-selects" mt={2}>
      <FormControl variant="outlined" fullWidth>
        <h5>
          Select an outlet: <span style={{ color: "red" }}>(*)</span>
        </h5>
        <CustomSelect
          sx={{mb: 1}}
          variant="outlined"
          id="outlet-id"
          size="small"
          value={selectedOutlet}
          onChange={handleChangeOutlet}
          displayEmpty
          startAdornment={
            <InputAdornment position="start" sx={{ paddingLeft: "11px" }}>
              <StoreIcon sx={{ color: "#ec7265" }} />
            </InputAdornment>
          }
        >
          <MenuItem value={""} disabled>
              <Typography sx={{ textWrap: "wrap" }} color="#ccc" fontSize={14}>
                SELECT AN OUTLET
              </Typography>
            </MenuItem>
          {/* Multi outlets */}
          {outlets.length > 0 &&
            outlets.map((outlet, index) => (
              <MenuItem key={index} value={outlet}>
                <Typography sx={{ textWrap: "wrap" }} fontSize={14}>
                  {outlet.outlet_address.address}
                </Typography>
              </MenuItem>
            ))}
        </CustomSelect>
        {mapRoute && (
          <Typography fontWeight={600} fontSize={13}>Distance: {formatMetersToKm(mapRoute.total_distance)}</Typography>
        )}
      </FormControl>

      {selectedOutlet && (
        <Box>
          {/* Select Date */}
          <Box my={3}>
            <OutletDate onChangeDate={handleChangeDate} closedDates={selectedOutlet?.closed_dates} />
          </Box>

          {/* Select Time */}
          <FormControl variant="outlined" fullWidth>
            <h5>
              Select time: <span style={{ color: "red" }}>(*)</span>{" "}
              {selectedTime
                ? convertTime24to12(selectedTime.from) +
                  " - " +
                  convertTime24to12(selectedTime.to)
                : ""}
            </h5>
            <CustomSelect
              id="delivery-time"
              size="small"
              value={selectedTime}
              onChange={handleChangeTime}
              displayEmpty
              startAdornment={
                <InputAdornment position="start" sx={{ paddingLeft: "11px" }}>
                  <WatchLaterIcon sx={{ color: "#ec7265" }} />
                </InputAdornment>
              }
            >
              <MenuItem value="" disabled>
                <Typography fontSize={14} color="#ccc">SELECT TIME</Typography>
              </MenuItem>
              {times &&
                times.map((time, index) => (
                  <MenuItem key={index} value={time}>
                    <Typography fontSize={14}>
                      {convertTime24to12(time.from) +
                        " - " +
                        convertTime24to12(time.to)}
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
