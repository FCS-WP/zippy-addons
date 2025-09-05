import React, { useEffect, useState } from "react";
import { useOrderProvider } from "../../providers/OrderProvider";
import {
  Box,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Select,
  styled,
  Typography,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import { Api } from "../../api";
import { format } from "date-fns";
import { convertTime24to12 } from "../../utils/dateHelper";

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

const ShippingTime = ({ type }) => {
  const {
    selectedDate,
    selectedOutlet,
    orderModeData,
    selectedTime,
    updateState,
  } = useOrderProvider();
  const [isLoading, setIsLoading] = useState(false);
  const [times, setTimes] = useState([]);

  const getSlotsFromTime = (responseTime) => {
    if (!responseTime) {
      return [];
    }
    const filteredItem = responseTime.filter(
      (item) => parseInt(item.delivery_slot) > 0
    );

    if (!filteredItem) {
      return [];
    }
    const results = filteredItem.map((item) => {
      return {
        from: item.time_from,
        to: item.time_to,
      };
    });

    return results;
  };

  const setSelectedTime = (value) => {
    updateState({ selectedTime: value });
  };

  const handleCheckSlot = async () => {
    const params = {
      billing_date: format(selectedDate, "yyyy-MM-dd"),
      outlet_id: selectedOutlet.id,
      delivery_type: type,
    };

    const { data: response } = await Api.checkSlotDelivery(params);
    if (!response || response.status !== "success") {
      return [];
    }

    return response.data.time.time_slot;
  };

  const handleTimes = async () => {
    setIsLoading(true);
    let configTime = [];
    if (!selectedDate || !orderModeData) {
      setSelectedTime("");
      setTimes(configTime);
      setIsLoading(false);
      return false;
    }

    const openingHours = orderModeData?.time.find((item) => {
      return parseInt(item.week_day) === selectedDate.getDay();
    });

    if (!openingHours || openingHours.time_slot.length == 0) {
      setSelectedTime("");
      setTimes(configTime);
      setIsLoading(false);
      return false;
    }
    // Handle show slot here
    const slots = await handleCheckSlot();
    configTime = getSlotsFromTime(slots);
    setSelectedTime("");
    setIsLoading(false);
    setTimes(configTime);
  };

  const handleChangeTime = (e) => {
    updateState({ selectedTime: e.target.value });
  };

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

  useEffect(() => {
    handleTimes();
    return () => {};
  }, [selectedDate, orderModeData, selectedOutlet]);

  return (
    <div>
      {!isLoading ? (
        <>
          {times.length > 0 ? (
            <CustomSelect
              id="delivery-time"
              size="small"
              fullWidth
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
            <>
              {selectedDate && (
                <Box
                  display={"flex"}
                  my={2}
                  alignItems={"center"}
                  justifyContent={"center"}
                >
                  <WarningAmberIcon color="warning" sx={{ mr: 2 }} />
                  <Typography fontWeight={600} fontSize={14}>
                    Selected date is fully booked. Please select another date.
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
    </div>
  );
};

export default ShippingTime;
