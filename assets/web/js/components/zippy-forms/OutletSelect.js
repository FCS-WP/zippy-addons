import {
  Box,
  CircularProgress,
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
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { getSelectProductId } from "../../helper/booking";

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
  const {
    outlets,
    selectedOutlet,
    setSelectedOutlet,
    menusConfig,
    customOutletData,
    customOutletSelected,
    setCustomOutletSelected,
  } = useContext(OutletContext);

  const defaultTime = [
    {
      from: "10:30",
      to: "11:30",
    },
    {
      from: "11:30",
      to: "12:30",
    },
    {
      from: "12:30",
      to: "13:30",
    },
    {
      from: "13:30",
      to: "14:30",
    },
    {
      from: "14:30",
      to: "15:30",
    },
    {
      from: "15:30",
      to: "16:30",
    },
  ];
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [mapRoute, setMapRoute] = useState(null);
  const [times, setTimes] = useState(defaultTime);
  const [isLoading, setIsLoading] = useState(false);
  const [donaSelectedOutlet, setDonaSelectedOutlet] =
    useState(customOutletSelected);

  const handleTimes = async () => {
    setIsLoading(true);
    let configTime = [];
    if (!selectedDate || selectedOutlet?.operating_hours.length <= 0) {
      setSelectedTime("");
      // setTimes(configTime);
      setIsLoading(false);
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
          setIsLoading(false);
          return false;
        }
        const deliverySlots = await handleCheckSlot();
        configTime = getAvailableDeliveryTimes(deliverySlots);

        break;
      case "takeaway":
        if (!selectedOutlet.takeaway) {
          setSelectedTime("");
          // setTimes(configTime);
          setIsLoading(false);
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
    setIsLoading(false);
    // setTimes(configTime);
  };

  const clearOldData = () => {
    setSelectedOutlet("");
    setSelectedTime("");
    onChangeData(null);
  };

  const handleChangeOutlet = async (e) => {
    setDonaSelectedOutlet(e.target.value);
    setCustomOutletSelected(e.target.value);
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
    if (donaSelectedOutlet && selectedDate && selectedTime) {
      onChangeData({
        outlet: donaSelectedOutlet,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedTime,
        mapRoute: mapRoute ?? "",
      });
    }
  }, [donaSelectedOutlet, selectedDate, selectedTime]);

  useEffect(() => {
    if (selectedLocation && selectedOutlet) {
      handleDistance();
    }
  }, [selectedLocation, selectedOutlet]);

  const handleCheckSlot = async () => {
    const params = {
      billing_date: format(selectedDate, "yyyy-MM-dd"),
      outlet_id: selectedOutlet.id,
      product_id: getSelectProductId(),
    };

    const { data: response } = await webApi.checkSlotDelivery(params);
    if (!response || response.status !== "success") {
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
                  " to " +
                  convertTime24to12(time.to)}
              </Typography>
              {/* {time.remaining_slot && (
                <Typography fontSize={14} color="warning">
                  {time.remaining_slot} slots remaining
                </Typography>
              )} */}
            </Box>
          </>
        ) : (
          <Typography fontSize={14}>
            {convertTime24to12(time.from) + " to " + convertTime24to12(time.to)}
          </Typography>
        )}
      </>
    );
  };

  return (
    <Box className="outlet-selects" mt={2}>
      <FormControl variant="outlined" fullWidth>
        <h5>
          Pickup location: <span style={{ color: "red" }}>(*)</span>
        </h5>
        <CustomSelect
          sx={{ mb: 1 }}
          variant="outlined"
          id="outlet-id"
          size="small"
          value={donaSelectedOutlet ?? ""}
          onChange={handleChangeOutlet}
          displayEmpty
          className="select-stores"
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
          {customOutletData.length > 0 &&
            customOutletData.map((outlet, index) => (
              <MenuItem key={index} value={outlet}>
                <Typography sx={{ textWrap: "wrap" }} fontSize={14}>
                  {outlet.name}
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
                  " to " +
                  convertTime24to12(selectedTime.to)
                : ""}
            </h5>
            {!isLoading ? (
              <>
                {times.length > 0 ? (
                  <CustomSelect
                    id="delivery-time"
                    size="small"
                    value={selectedTime}
                    onChange={handleChangeTime}
                    displayEmpty
                    startAdornment={
                      <InputAdornment
                        position="start"
                        sx={{ paddingLeft: "11px" }}
                      >
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
                  <>
                    {selectedDate && (
                      <Box
                        display={"flex"}
                        my={2}
                        alignItems={"center"}
                        justifyContent={"center"}
                      >
                        <WarningAmberIcon color="warning" />
                        <Typography fontWeight={600} fontSize={14}>
                          Selected date is fully booked. Please select another
                          date.
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
              </>
            ) : (
              <Box mb={2} display={"flex"} justifyContent={"center"}>
                <CircularProgress color="primary" />
              </Box>
            )}
          </FormControl>
        </Box>
      )}
    </Box>
  );
};

export default OutletSelect;
