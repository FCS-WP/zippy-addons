import {
  Box,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  styled,
  Typography,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import OutletDate from "./OutletDate";
import StoreIcon from "@mui/icons-material/Store";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import { format } from "date-fns";
import { webApi } from "../../api";
import { toast } from "react-toastify";
import {
  generateTimeSlots,
  getAvailableDeliveryTimes,
} from "../../helper/datetime";
import { convertTime24to12 } from "../../../../admin/js/utils/dateHelper";
import OutletContext from "../../contexts/OutletContext";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

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
  const { outlets, selectedOutlet, setSelectedOutlet } =
    useContext(OutletContext);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [mapRoute, setMapRoute] = useState(null);
  const [times, setTimes] = useState();

  const handleTimes = async () => {
   
    let configTime = [];
    if (!selectedDate || selectedOutlet?.operating_hours.length <= 0) {
      setSelectedTime("");
      setTimes(configTime);
      return false;
    }

    const openingHours = selectedOutlet?.operating_hours.find((item) => {
      return parseInt(item.week_day) === selectedDate.getDay();
    });

    switch (type) {
      case "delivery":
        if (!openingHours.delivery || openingHours.delivery.enable === "F") {
          setSelectedTime("");
          setTimes(configTime);
          return false;
        }
        // call Api Here
        const deliverySlots = await handleCheckSlot();
        configTime = getAvailableDeliveryTimes(deliverySlots);
        break;
      case "takeaway":
        if (!selectedOutlet.takeaway) {
          setSelectedTime("");
          setTimes(configTime);
          return false;
        }
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

  const handleChangeOutlet = async (e) => {
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
        },
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

  useEffect(() => {
    if (selectedOutlet && selectedDate && selectedTime) {
      onChangeData({
        outlet: selectedOutlet.id,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedTime,
        mapRoute: mapRoute ?? "",
      });
    }
  }, [selectedOutlet, selectedDate, selectedTime]);

  useEffect(() => {
    if (selectedLocation && selectedOutlet) {
      handleDistance();
    }
  }, [selectedLocation, selectedOutlet]);

  const handleCheckSlot = async () => {
    const params = {
      billing_date: format(selectedDate, "yyyy-MM-dd"),
      outlet_id: selectedOutlet.id,
    };
    
    const { data: response } = await webApi.checkSlotDelivery(params);
    if (!response || response.status !== 'success') {
      return [];
    }
    return response.data.delivery_hours;
  };

  useEffect(() => {
    handleTimes();
    onChangeData(null);
    return () => {};
  }, [selectedDate]);

  useEffect(() => {
    if (times && times[0]) {
      setSelectedTime(times[0]);
    }
  }, [times]);

  useEffect(() => {
    setSelectedOutlet(outlets[0]);
    return () => {
      clearOldData();
    };
  }, []);

  const RenderTimeSlot = ({ time, type }) => {
    return (
      <>
        {type == "delivery" ? (
          <>
            <Box
              display={"flex"}
              width={"100%"}
              justifyContent={"space-between"}
            >
              <Typography fontSize={14}>
                {convertTime24to12(time.from) +
                  " - " +
                  convertTime24to12(time.to)}
              </Typography>
              {time.delivery_slot && (
                <Typography fontSize={14} color="warning">
                  {time.delivery_slot} slots remaining
                </Typography>
              )}
            </Box>
          </>
        ) : (
          <Typography fontSize={14}>
            {convertTime24to12(time.from) + " - " + convertTime24to12(time.to)}
          </Typography>
        )}
      </>
    );
  };

  return (
    <Box className="outlet-selects" mt={2}>
      <FormControl variant="outlined" fullWidth>
        <h5>
          Select an outlet: <span style={{ color: "red" }}>(*)</span>
        </h5>
        <CustomSelect
          sx={{ mb: 1 }}
          variant="outlined"
          id="outlet-id"
          size="small"
          value={selectedOutlet ?? ""}
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
          <Typography fontWeight={600} fontSize={13}>
            Distance: {formatMetersToKm(mapRoute.total_distance)}
          </Typography>
        )}
      </FormControl>

      {selectedOutlet && (
        <Box>
          {/* Select Date */}
          <Box my={3}>
            <OutletDate onChangeDate={handleChangeDate} type={type} />
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
            {times.length > 0 ? (  <CustomSelect
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
                <Typography fontSize={14} color="#ccc">
                  SELECT TIME
                </Typography>
              </MenuItem>
              {times &&
                times.map((time, index) => (
                  <MenuItem key={index} value={time}>
                    <RenderTimeSlot time={time} type={type} />
                  </MenuItem>
                ))}
            </CustomSelect>
          ) : (
            <Box display={'flex'} alignItems={'center'} justifyContent={'center'}>
              <WarningAmberIcon color="warning" /> 
              <Typography fontWeight={600} fontSize={14}>
                Today is fully booked. Please select another date.
              </Typography>
            </Box>
          )}
          
          </FormControl>
        </Box>
      )}
    </Box>
  );
};

export default OutletSelect;
