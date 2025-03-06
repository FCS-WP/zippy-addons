import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, CircularProgress } from "@mui/material";
import { Api } from "../../api";
import { toast, ToastContainer } from "react-toastify";
import HolidayTable from "../../Components/Configs/HolidayTable";
import BookingSettings from "../../Components/Configs/BookingSettings";
import WeekdayTable from "../../Components/Configs/WeekdayTable";

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const Settings = () => {
  const [schedule, setSchedule] = useState(
    daysOfWeek.map((day) => ({ day, slots: [] }))
  );
  const [extraTimeSlots, setExtraTimeSlots] = useState(
    daysOfWeek.map((day) => ({ day, slots: [] }))
  );
  const [duration, setDuration] = useState(5);
  const [storeEmail, setStoreEmail] = useState("");
  const [allowOverlap, setAllowOverlap] = useState(false);
  const [bookingType, setBookingType] = useState("single");
  const [defaultStatus, setDefaultStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [extraTimeEnabled, setExtraTimeEnabled] = useState({});
  const [holidayEnabled, setHolidayEnabled] = useState(false);
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const response = await Api.getSettings();
        const data = response.data.data;
        if (
          data &&
          data.store_working_time &&
          data.store_working_time.length > 0
        ) {
          const fetchedSchedule = daysOfWeek.map((day, index) => {
            const daySchedule = data.store_working_time.find(
              (time) => parseInt(time.weekday) === index
            );
            return {
              day,
              slots:
                daySchedule && daySchedule.is_open === "T"
                  ? [
                      {
                        from: daySchedule.open_at || "00:00",
                        to: daySchedule.close_at || "00:00",
                      },
                    ]
                  : [],
              duration: parseInt(daySchedule?.duration) || 5,
              extraTime: daySchedule?.extra_time || {
                is_active: "F",
                data: [],
              },
            };
          });
          setSchedule(fetchedSchedule);
          setExtraTimeEnabled(
            fetchedSchedule.reduce(
              (acc, item) => ({
                ...acc,
                [item.day]: item.extraTime.is_active === "T",
              }),
              {}
            )
          );
          setExtraTimeSlots(
            fetchedSchedule.map((item) => ({
              day: item.day,
              slots: item.extraTime.data || [],
            }))
          );
          setDuration(parseInt(data.store_working_time[0]?.duration) || 5);
          setStoreEmail(data.store_email || "");
          setAllowOverlap(data.allow_overlap === "T");
          setBookingType(data.booking_type || "single");
          setDefaultStatus(data.default_booking_status || "pending");
          const fetchedHolidays = data.holiday || [];
          setHolidays(fetchedHolidays);
          setHolidayEnabled(fetchedHolidays.length > 0);
        } else {
          setSchedule(daysOfWeek.map((day) => ({ day, slots: [] })));
          setHolidays([]);
          setHolidayEnabled(false);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        setSchedule(daysOfWeek.map((day) => ({ day, slots: [] })));
        setHolidays([]);
        setHolidayEnabled(false);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleExtraTimeToggle = (day, enabled) => {
    setExtraTimeEnabled((prev) => ({
      ...prev,
      [day]: enabled,
    }));

    setExtraTimeSlots((prev) =>
      prev.map((item) =>
        item.day === day
          ? {
              ...item,
              slots: enabled
                ? item.slots.length === 0
                  ? [{ from: "", to: "" }]
                  : item.slots
                : [],
            }
          : item
      )
    );
  };

  const handleAddTimeSlot = (day) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.day === day
          ? {
              ...item,
              slots: [...item.slots, { from: "", to: "", type: "regular" }],
            }
          : item
      )
    );
  };

  const handleRemoveTimeSlot = (day, slotIndex) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.day === day
          ? {
              ...item,
              slots: item.slots.filter((_, index) => index !== slotIndex),
            }
          : item
      )
    );
  };
  const handleAddExtraTimeSlot = (day) => {
    setExtraTimeSlots((prev) =>
      prev.map((item) =>
        item.day === day
          ? {
              ...item,
              slots: [...item.slots, { from: "", to: "" }],
            }
          : item
      )
    );
  };

  const handleRemoveExtraTimeSlot = (day, slotIndex) => {
    setExtraTimeSlots((prev) => {
      const updatedExtraTimeSlots = prev.map((item) => {
        if (item.day === day) {
          const updatedSlots = item.slots.filter(
            (_, index) => index !== slotIndex
          );
          if (updatedSlots.length === 0) {
            setExtraTimeEnabled((prevEnabled) => ({
              ...prevEnabled,
              [day]: false,
            }));
          }
          return {
            ...item,
            slots: updatedSlots,
          };
        }
        return item;
      });
      return updatedExtraTimeSlots;
    });
  };

  const calculateCloseAt = (startTime, duration) => {
    if (!startTime) return "";
    const closeTime = new Date(startTime);
    closeTime.setMinutes(closeTime.getMinutes() + duration);

    const formattedCloseAt = `${closeTime
      .getHours()
      .toString()
      .padStart(2, "0")}:${closeTime
      .getMinutes()
      .toString()
      .padStart(2, "0")}:00`;

    return formattedCloseAt;
  };

  const handleTimeChange = (day, slotIndex, field, value) => {
    const formattedValue = value
      ? `${value.getHours().toString().padStart(2, "0")}:${value
          .getMinutes()
          .toString()
          .padStart(2, "0")}:00`
      : "";

    setSchedule((prev) =>
      prev.map((item) =>
        item.day === day
          ? {
              ...item,
              slots: item.slots.map((slot, index) => {
                if (index === slotIndex) {
                  if (field === "from") {
                    const newCloseAt = calculateCloseAt(value, duration);

                    return { ...slot, from: formattedValue, to: newCloseAt };
                  } else {
                    return { ...slot, [field]: formattedValue };
                  }
                }
                return slot;
              }),
            }
          : item
      )
    );
  };

  const handleExtraTimeChange = (day, slotIndex, field, value) => {
    const formattedValue = value
      ? `${value.getHours().toString().padStart(2, "0")}:${value
          .getMinutes()
          .toString()
          .padStart(2, "0")}:00`
      : "";

    setExtraTimeSlots((prev) =>
      prev.map((item) =>
        item.day === day
          ? {
              ...item,
              slots: item.slots.map((slot, index) => {
                if (index === slotIndex) {
                  return { ...slot, [field]: formattedValue };
                }
                return slot;
              }),
            }
          : item
      )
    );
  };
  const handleBookingTypeChange = (type) => {
    setBookingType(type);
    if (type === "multiple") {
      setExtraTimeEnabled((prev) =>
        Object.keys(prev).reduce((acc, day) => {
          acc[day] = false;
          return acc;
        }, {})
      );
      setExtraTimeSlots((prev) =>
        prev.map((item) => ({
          ...item,
          slots: [],
        }))
      );
    }
  };
  const handleAddHoliday = () => {
    setHolidays([...holidays, { label: "", date: null }]);
  };

  const handleRemoveHoliday = (index) => {
    const updatedHolidays = holidays.filter((_, i) => i !== index);
    setHolidays(updatedHolidays);
  };

  const handleHolidayChange = (index, key, value) => {
    const formattedValue = key === "date" && value ? new Date(value) : value;

    const updatedHolidays = holidays.map((holiday, i) =>
      i === index ? { ...holiday, [key]: formattedValue } : holiday
    );

    setHolidays(updatedHolidays);
  };

  const handleDefaultStatusChange = (newStatus) => {
    setDefaultStatus(newStatus);
  };

  const handleSaveChanges = async () => {
    setLoading(true);

    const storeWorkingTime = schedule.map((item) => {
      const isOpen = item.slots.length > 0;
      const openSlot = item.slots[0] || {};
      const weekdayIndex = daysOfWeek.indexOf(item.day);

      return {
        id: item.id || null,
        is_open: isOpen ? "T" : "F",
        weekday: weekdayIndex.toString(),
        open_at: isOpen ? String(openSlot.from) || "" : "",
        close_at: isOpen ? String(openSlot.to) || "" : "",
        duration: item.duration || 5,
        extra_time: {
          is_active: extraTimeEnabled[item.day] ? "T" : "F",
          data:
            extraTimeSlots.find((extra) => extra.day === item.day)?.slots || [],
        },
      };
    });

    const params = {
      booking_type: bookingType,
      store_email: storeEmail,
      allow_overlap: allowOverlap ? "T" : "F",
      duration: duration,
      default_booking_status: defaultStatus,
      store_working_time: storeWorkingTime,
    };

    try {
      const response = await Api.createSettings(params);

      if (response.data.status === "success") {
        toast.success(response.data.message || "Settings saved successfully!");
      } else {
        toast.error(response.data.message || "Error saving settings.");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Error saving settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4}>
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <Typography variant="h5" gutterBottom>
            Settings
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <BookingSettings
                bookingType={bookingType}
                handleBookingTypeChange={handleBookingTypeChange}
                allowOverlap={allowOverlap}
                setAllowOverlap={setAllowOverlap}
                defaultStatus={defaultStatus}
                handleDefaultStatusChange={handleDefaultStatusChange}
                duration={duration}
                setDuration={setDuration}
                storeEmail={storeEmail}
                setStoreEmail={setStoreEmail}
                holidayEnabled={holidayEnabled}
                setHolidayEnabled={setHolidayEnabled}
                setHolidays={setHolidays}
                loading={loading}
                handleSaveChanges={handleSaveChanges}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              {loading ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="100%"
                >
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <WeekdayTable
                    schedule={schedule}
                    bookingType={bookingType}
                    handleAddTimeSlot={handleAddTimeSlot}
                    handleTimeChange={handleTimeChange}
                    handleRemoveTimeSlot={handleRemoveTimeSlot}
                    handleExtraTimeToggle={handleExtraTimeToggle}
                    extraTimeEnabled={extraTimeEnabled}
                    extraTimeSlots={extraTimeSlots}
                    handleAddExtraTimeSlot={handleAddExtraTimeSlot}
                    handleRemoveExtraTimeSlot={handleRemoveExtraTimeSlot}
                    handleExtraTimeChange={handleExtraTimeChange}
                    duration={duration}
                  />
                  {holidayEnabled && (
                    <HolidayTable
                      holidays={holidays}
                      handleHolidayChange={handleHolidayChange}
                      handleRemoveHoliday={handleRemoveHoliday}
                      handleAddHoliday={handleAddHoliday}
                    />
                  )}
                </>
              )}
            </Grid>
          </Grid>
        </Box>
      )}
      <ToastContainer />
    </Box>
  );
};

export default Settings;
