import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Grid2,
  Paper,
  Stack,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
} from "@mui/material";
import DateTimeInput from "../inputs/DateTimeInput";
import { format, isValid as isDateValid } from "date-fns";
import { Api } from "../../../api";
import { toast } from "react-toastify";
import {
  createDateWithHourStr,
  handleDateData,
} from "../../../utils/dateHelper";
import BoxEditHappyHours from "./BoxEditHappyHours";
import { useMenuProvider } from "../../../providers/MenuProvider";

const BoxEditMenu = ({ menu }) => {
  const [daysOfWeek, setDaysOfWeek] = useState(menu.days_of_week ?? []);
  const [startDate, setStartDate] = useState(menu.start_date);
  const [endDate, setEndDate] = useState(menu.end_date);
  const [menuName, setMenuName] = useState(menu.name);
  const [happyHours, setHappyHours] = useState(menu.happy_hours ?? []);
  const { disabledRanges, refetchMenus } = useMenuProvider();
  const [isValidHappyHours, setIsValidHappyHours] = useState(false);

  const handleChangeMenuDate = (date, type) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    const dateSelected = [startDate, endDate];

    if (type === "start") {
      dateSelected[0] = formattedDate;
    } else {
      dateSelected[1] = formattedDate;
    }

    setStartDate(dateSelected[0]);
    setEndDate(dateSelected[1]);
    setHappyHours([]);
  };

  const handleChangeAvailableDate = (value, day) => {
    const valueInt = value ? 1 : 0;
    setDaysOfWeek((prev) => {
      const updated = [...prev];
      const index = updated.findIndex((d) => d.weekday === day.weekday);
      if (index !== -1) updated[index].is_available = valueInt;
      else updated.push({ weekday: day.weekday, is_available: valueInt });
      return updated;
    });
  };

  const validateTimeRange = (start, end) => {
    if (!start || !end) return false;
    try {
      const startDate = createDateWithHourStr(start);
      const endDate = createDateWithHourStr(end);
      return (
        isDateValid(startDate) && isDateValid(endDate) && endDate > startDate
      );
    } catch {
      return false;
    }
  };

  const checkValidHours = () => {
    const checked = happyHours.every(
      (hour) =>
        hour.start_time &&
        hour.end_time &&
        validateTimeRange(hour.start_time, hour.end_time)
    );
    setIsValidHappyHours(checked);
    return checked;
  };

  useEffect(() => {
    checkValidHours();
  }, [happyHours]);

  const handleUpdateMenu = async () => {
    if (!isValidHappyHours) {
      toast.error("Please fix invalid happy hour time ranges before saving.");
      return;
    }

    const data = {
      id: parseInt(menu.id),
      name: menuName,
      happy_hours: happyHours,
      days_of_week: daysOfWeek,
      start_date: handleDateData(startDate),
      end_date: handleDateData(endDate),
    };

    try {
      const response = await Api.updateMenu(data);
      if (response?.error)
        throw new Error(response.error.message || "Update failed");
      toast.success("Menu has been updated");
      refetchMenus?.(); //Shin new knowledge =)))
    } catch (error) {
      toast.error(error.message);
    }
  };

  const dayMap = [
    { label: "Sunday", value: 0 },
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
  ];

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h6" fontWeight={600}>
          Menu Configuration
        </Typography>

        <Grid2>
          <TextField
            label="Menu Name"
            value={menuName}
            onChange={(e) => setMenuName(e.target.value)}
            fullWidth
            variant="outlined"
          />
        </Grid2>

        <Grid2 container spacing={2}>
          <Grid2>
            <Typography variant="subtitle1">Start Date</Typography>
            <DateTimeInput
              label="Start Date"
              onChange={(date) => handleChangeMenuDate(date, "start")}
              disabledRanges={disabledRanges}
              minDate={new Date()}
              value={menu.start_date}
              fullWidth
            />
          </Grid2>
          <Grid2>
            <Typography variant="subtitle1">End Date</Typography>
            <DateTimeInput
              label="End Date"
              onChange={(date) => handleChangeMenuDate(date, "end")}
              disabledRanges={disabledRanges}
              minDate={startDate}
              value={menu.end_date}
              fullWidth
            />
          </Grid2>
        </Grid2>

        {/* Days of Week */}
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Available Days
          </Typography>
          <Grid2 container spacing={1}>
            {dayMap.map((day) => {
              const config = daysOfWeek.find(
                (d) => d.weekday === day.value
              ) || {
                weekday: day.value,
                is_available: 0,
              };
              return (
                <Grid2 key={day.value}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!config.is_available}
                        onChange={(e) =>
                          handleChangeAvailableDate(e.target.checked, config)
                        }
                        color="primary"
                      />
                    }
                    label={day.label}
                  />
                </Grid2>
              );
            })}
          </Grid2>
        </Box>

        {/* Happy Hours Section */}
        <Divider />
        <BoxEditHappyHours
          happyHours={happyHours}
          setHappyHours={setHappyHours}
          minDate={startDate}
          maxDate={endDate}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            onClick={handleUpdateMenu}
            size="large"
            disabled={!isValidHappyHours}
          >
            Save Changes
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};

export default BoxEditMenu;
