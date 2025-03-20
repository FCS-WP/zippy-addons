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
  const [deliveryTimeSlots, setdeliveryTimeSlots] = useState(
    daysOfWeek.map((day) => ({ day, slots: [] }))
  );

  const [duration, setDuration] = useState(15);
  const [storeEmail, setStoreEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [deliveryTimeEnabled, setDeliveryTimeEnabled] = useState({});

  const [holidayEnabled, setHolidayEnabled] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      try {
        const storesResponse = await Api.getStore();
        const storesData = storesResponse.data.data || [];
        setStores(storesData);
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  useEffect(() => {
    if (!selectedStore) return;
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const store = stores.find((s) => s.id === selectedStore);
        if (!store) return;

        const storeWorkingTime = store.operating_hours || [];
        const storeHolidays = store.closed_dates || [];
        const storeDuration = store.takeaway?.timeslot_duration || 15;

        const formattedHolidays = Array.isArray(storeHolidays)
          ? storeHolidays.map((date) => ({
              label: date.label,
              date: date.value,
            }))
          : [];

        const deliveryEnabledByDay = {};
        const deliverySlotsByDay = daysOfWeek.map((day, index) => {
          const dayData = storeWorkingTime.find(
            (time) => parseInt(time.week_day) === index
          );

          const isDeliveryEnabled = dayData?.delivery?.enabled === "T";
          deliveryEnabledByDay[day] = isDeliveryEnabled;

          return {
            day,
            enabled: isDeliveryEnabled,
            slots: isDeliveryEnabled
              ? dayData?.delivery?.delivery_hours || []
              : [],
          };
        });

        setDeliveryTimeEnabled(deliveryEnabledByDay);
        setdeliveryTimeSlots(deliverySlotsByDay);

        const fetchedSchedule = daysOfWeek.map((day, index) => {
          const daySchedule = storeWorkingTime.find(
            (time) => parseInt(time.week_day) === index
          );

          return {
            day,
            slots: daySchedule
              ? [
                  {
                    from: daySchedule.open_at || "",
                    to: daySchedule.close_at || "",
                  },
                ]
              : [],
            duration: parseInt(daySchedule?.duration) || 15,
          };
        });

        setSchedule(fetchedSchedule);
        setDuration(storeDuration);
        setHolidays(formattedHolidays);
        setHolidayEnabled(formattedHolidays.length > 0);
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [selectedStore, stores]);

  const handleDeliveryToggle = (day) => {
    setDeliveryTimeEnabled((prevState) => {
      const newState = { ...prevState, [day]: !prevState[day] };

      setdeliveryTimeSlots((prev) =>
        prev.map((item) =>
          item.day === day
            ? {
                ...item,
                slots: newState[day] ? [{ from: "", to: "" }] : [],
              }
            : item
        )
      );

      return newState;
    });
  };

  const handleRemoveTimeSlot = (day, slotIndex) => {
    setSchedule((prev) => {
      const updatedSchedule = prev.map((item) =>
        item.day === day
          ? {
              ...item,
              slots: item.slots.filter((_, index) => index !== slotIndex),
            }
          : item
      );

      const daySchedule = updatedSchedule.find((item) => item.day === day);

      if (daySchedule && daySchedule.slots.length === 0) {
        setDeliveryTimeEnabled((prev) => ({ ...prev, [day]: false }));

        setdeliveryTimeSlots((prev) =>
          prev.map((item) => (item.day === day ? { ...item, slots: [] } : item))
        );
      }

      return updatedSchedule;
    });
  };

  const handleAddTimeSlot = (day) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.day === day
          ? { ...item, slots: [...item.slots, { from: "", to: "" }] }
          : item
      )
    );
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
                  return { ...slot, [field]: formattedValue };
                }
                return slot;
              }),
            }
          : item
      )
    );
  };

  const handleRemoveHoliday = (index) => {
    setHolidays((prevHolidays) => prevHolidays.filter((_, i) => i !== index));
  };
  const handleAddHoliday = () => {
    setHolidays((prevHolidays) => [...prevHolidays, { label: "", date: "" }]);
  };
  const handleHolidayChange = (index, key, value) => {
    setHolidays((prevHolidays) =>
      prevHolidays.map((holiday, i) =>
        i === index ? { ...holiday, [key]: value } : holiday
      )
    );
  };
  const handleRemoveDeliveryTimeSlot = (day, slotIndex) => {
    setdeliveryTimeSlots((prev) => {
      const updatedSlots = prev.map((item) =>
        item.day === day
          ? {
              ...item,
              slots: item.slots.filter((_, index) => index !== slotIndex),
            }
          : item
      );

      const updatedState = updatedSlots.find((item) => item.day === day);
      if (updatedState && updatedState.slots.length === 0) {
        setDeliveryTimeEnabled((prev) => ({ ...prev, [day]: false }));
      }

      return updatedSlots;
    });
  };

  const handleDeliveryTimeChange = (day, slotIndex, field, value) => {
    const formattedValue = value
      ? `${value.getHours().toString().padStart(2, "0")}:${value
          .getMinutes()
          .toString()
          .padStart(2, "0")}:00`
      : "";

    setdeliveryTimeSlots((prev) =>
      prev.map((item) =>
        item.day === day
          ? {
              ...item,
              slots: item.slots.map((slot, index) =>
                index === slotIndex
                  ? { ...slot, [field]: formattedValue }
                  : slot
              ),
            }
          : item
      )
    );
  };
  const handleAddDeliveryTimeSlot = (day) => {
    setdeliveryTimeSlots((prev) =>
      prev.map((item) =>
        item.day === day
          ? { ...item, slots: [...item.slots, { from: "", to: "" }] }
          : item
      )
    );
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const payload = {
        outlet_id: selectedStore,
        operating_hours: schedule.map((item, index) => ({
          week_day: index.toString(),
          open_at: item.slots[0]?.from || "",
          close_at: item.slots[0]?.to || "",
          delivery: {
            enabled: deliveryTimeEnabled[item.day] ? "T" : "F",
            delivery_hours: deliveryTimeEnabled
              ? deliveryTimeSlots.find((slot) => slot.day === item.day)
                  ?.slots || []
              : [],
          },
        })),
        closed_dates: holidays.map((holiday) => ({
          label: holiday.label,
          value: holiday.date,
        })),
        takeaway: {
          enabled: "F",
          timeslot_duration: duration,
        },
      };

      const response = await Api.addStoreConfig(payload);
      if (response?.data.status === "success") {
        toast.success("Settings saved successfully!");
      } else {
        toast.error("Failed to save settings.");
      }
    } catch (error) {
      console.error("Error saving settings:", error);

      if (error.response?.data?.status === "error") {
        toast.error(error.response.data.message || "Failed to save settings.");
      } else {
        toast.error("An unexpected error occurred.");
      }
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
                duration={duration}
                setDuration={setDuration}
                storeEmail={storeEmail}
                setStoreEmail={setStoreEmail}
                holidayEnabled={holidayEnabled}
                setHolidayEnabled={setHolidayEnabled}
                setHolidays={setHolidays}
                loading={loading}
                handleSaveChanges={handleSaveChanges}
                stores={stores}
                selectedStore={selectedStore}
                setSelectedStore={setSelectedStore}
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
                    deliveryTimeSlots={deliveryTimeSlots}
                    deliveryTimeEnabled={deliveryTimeEnabled}
                    handleDeliveryToggle={handleDeliveryToggle}
                    handleRemoveTimeSlot={handleRemoveTimeSlot}
                    handleAddTimeSlot={handleAddTimeSlot}
                    handleTimeChange={handleTimeChange}
                    handleRemoveDeliveryTimeSlot={handleRemoveDeliveryTimeSlot}
                    handleDeliveryTimeChange={handleDeliveryTimeChange}
                    handleAddDeliveryTimeSlot={handleAddDeliveryTimeSlot}
                    duration={duration}
                  />
                  {holidayEnabled && (
                    <HolidayTable
                      holidays={holidays}
                      handleAddHoliday={handleAddHoliday}
                      handleRemoveHoliday={handleRemoveHoliday}
                      handleHolidayChange={handleHolidayChange}
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
