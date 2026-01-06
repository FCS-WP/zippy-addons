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
import { format, parseISO } from "date-fns";
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
import { useOutletProvider } from "../../providers/OutletProvider";
import { productPricingRule } from "../../helper/showAlert";

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
  onChangeDistance,
  isFetching = true,
}) => {
  const {
    outlets,
    selectedOutlet,
    setSelectedOutlet,
    menusConfig,
    orderModeData,
    productId,
  } = useOutletProvider();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [mapRoute, setMapRoute] = useState(null);
  const [times, setTimes] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isGetDistance, setIsGetDistance] = useState(false);

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
      onChangeDistance(true);
      setIsGetDistance(false);
    } catch (error) {
      onChangeDistance(false);
      toast.error("Failed to get distance!");
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
      setIsGetDistance(true);
      setMapRoute(null);
      handleDistance();
    }
  }, [selectedLocation, selectedOutlet]);

  const handleCheckSlot = async () => {
    const params = {
      billing_date: format(selectedDate, "yyyy-MM-dd"),
      outlet_id: selectedOutlet.id,
      delivery_type: type,
      product_id: productId,
    };

    const { data: response } = await webApi.checkSlotDelivery(params);
    if (!response || response.status !== "success") {
      return [];
    }

    if (response.data?.pricing_rule) {
      const confirm = await productPricingRule({
        handleConfirm: handleConfirmPricingRule,
        date: {
          from: format(
            parseISO(response.data?.pricing_rule.price_book.start_date),
            "dd-MMM-yyyy"
          ),
          to: format(parseISO(response.data?.pricing_rule.price_book.end_date), "dd-MMM-yyyy"),
        },
        price: response.data?.pricing_rule?.new_price,
      });
    }

    return response.data.time.time_slot;
  };

  const handleConfirmPricingRule = (result) => {
    if (result.isConfirmed) {
      return true;
    } else {
      return window.location.reload(true);
    }
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
        {selectedLocation && isGetDistance && (
          <Box display={"flex"} alignItems={"center"} gap={2}>
            <Typography fontWeight={600} fontSize={13}>
              Getting distance
            </Typography>
            <CircularProgress size={12} />
          </Box>
        )}
        {mapRoute && (
          <Typography fontWeight={600} fontSize={13}>
            Distance: {formatMetersToKm(mapRoute.total_distance)}
          </Typography>
        )}
      </FormControl>

      {selectedOutlet && (
        <Box>
          {/* Select Date */}
          {isFetching ? (
            <Box my={4} display={"flex"} justifyContent={"center"}>
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <>
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
                              Selected date is fully booked. Please select
                              another date.
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
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default OutletSelect;
