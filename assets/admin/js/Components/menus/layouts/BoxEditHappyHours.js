import React, { useEffect, useState } from "react";
import { Box, Button, Grid2, IconButton, Typography } from "@mui/material";
import { format, parse, isValid as isDateValid } from "date-fns";
import TimeSlot from "./TimeSlot";
import { createDateWithHourStr } from "../../../utils/dateHelper";

const BoxEditHappyHours = ({ happyHours, setHappyHours }) => {
  const [happyHoursWithIds, setHappyHoursWithIds] = useState(happyHours);

  const addIdsForHappyHours = () => {
    const withIds = happyHours.map((item) => ({
      ...item,
      id: crypto.randomUUID(),
    }));
    setHappyHoursWithIds(withIds);
  };

  const handleChangeTime = (value, type, index) => {
    setHappyHours((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [type === "start" ? "start_time" : "end_time"]: value
          ? format(value, "HH:mm")
          : "",
      };
      return updated;
    });
  };

  const handleAddHappyHour = () => {
    setHappyHours((prev) => [...prev, { start_time: "", end_time: "" }]);
  };

  const handleDeleteHappyHour = (indexToRemove) => {
    if (window.confirm("Are you sure you want to remove this time slot?")) {
      setHappyHours((prev) => {
        const newList = prev.filter((_, i) => i !== indexToRemove);
        return newList;
      });
    }
  };

  useEffect(() => {
    addIdsForHappyHours();
  }, [happyHours]);

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={600}>
        Happy Hours
      </Typography>

      {happyHoursWithIds.map((item, index) => (
        <TimeSlot
          key={item?.id || index}
          startDate={createDateWithHourStr(item.start_time)}
          endDate={createDateWithHourStr(item.end_time)}
          index={index}
          handleChangeTime={handleChangeTime}
          handleDeleteHappyHour={handleDeleteHappyHour}
        />
      ))}

      <Box sx={{ mt: 2 }}>
        <Button variant="outlined" onClick={handleAddHappyHour}>
          Add Time Slot
        </Button>
      </Box>
    </Box>
  );
};

export default BoxEditHappyHours;
