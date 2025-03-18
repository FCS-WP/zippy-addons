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
  const [deliveryTimeEnabled, setDeliveryTimeEnabled] = useState(false);
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
        const storeDelivery = store.delivery || {
          enabled: "F",
          delivery_hours: [],
        };

        const formattedHolidays = Array.isArray(storeHolidays)
          ? storeHolidays.map((date) => ({ label: `Holiday ${date}`, date }))
          : [];

        const isDeliveryEnabled = storeDelivery.enabled === "T";
        const deliverySlotsByDay = daysOfWeek.map((day, index) => {
          const slots =
            storeDelivery.delivery_hours?.filter(
              (slot) => parseInt(slot.week_day) === index
            ) || [];

          return {
            day,
            slots:
              slots.length > 0
                ? slots
                : isDeliveryEnabled
                ? [{ from: "", to: "" }]
                : [],
          };
        });

        setDeliveryTimeEnabled(isDeliveryEnabled);
        setdeliveryTimeSlots(deliverySlotsByDay);

        if (storeWorkingTime.length > 0) {
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
          setDuration(parseInt(storeWorkingTime[0]?.duration) || 15);
          setHolidays(formattedHolidays);
          setHolidayEnabled(formattedHolidays.length > 0);
        } else {
          setSchedule(daysOfWeek.map((day) => ({ day, slots: [] })));
          setHolidays([]);
          setHolidayEnabled(false);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [selectedStore, stores]);

  const handleDeliveryToggle = (event) => {
    const enabled = event.target.checked;
    setDeliveryTimeEnabled(enabled);

    setdeliveryTimeSlots((prev) =>
      prev.map((item) => ({
        ...item,
        slots: enabled ? [{ from: "", to: "" }] : [],
      }))
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
    setdeliveryTimeSlots((prev) =>
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

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const payload = {
        request: {
          outlet_id: selectedStore,
          operating_hours: schedule.map((item, index) => ({
            week_day: index.toString(),
            open_at: item.slots[0]?.from || "",
            close_at: item.slots[0]?.to || "",
          })),
          closed_dates: holidays.map((holiday) => holiday.date),

          delivery: {
            enabled: deliveryTimeEnabled ? "T" : "F",
            delivery_hours: deliveryTimeEnabled
              ? deliveryTimeSlots.flatMap((item) => item.slots)
              : [],
          },
          takeaway: {
            enabled: "F",
            timeslot_duration: duration,
          },
        },
      };

      const response = await Api.addStoreConfig(payload);
      if (response?.data.status == "success") {
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
