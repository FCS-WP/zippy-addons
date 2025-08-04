// Optimized Settings Component
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Paper,
  Tab,
  Tabs,
} from "@mui/material";
import { Api } from "../../api";
import { toast, ToastContainer } from "react-toastify";
import HolidayTable from "../../Components/Configs/HolidayTable";
import BookingSettings from "../../Components/Configs/BookingSettings";
import WeekdayTable from "../../Components/Configs/WeekdayTable/WeekdayTable";

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
  const [deliveryTimeSlots, setDeliveryTimeSlots] = useState(
    daysOfWeek.map((day) => ({ day, slots: [] }))
  );
  const [duration, setDuration] = useState(15);
  const [loading, setLoading] = useState(true);
  const [holidays, setHolidays] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [dayLimited, setDayLimited] = useState(
    window?.admin_data?.day_limited ?? ""
  );
  const [activeTab, setActiveTab] = useState("takeaway");
  const [deletedHolidays, setDeletedHolidays] = useState([]);
  const [deletedTakeawaySlots, setDeletedTakeawaySlots] = useState([]);
  const [deletedDeliverySlots, setDeletedDeliverySlots] = useState([]);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const res = await Api.getStore();
        const data = res.data.data || [];
        setStores(data);
        if (data.length > 0) setSelectedStore(data[0].id);
      } catch (e) {
        console.error("Error fetching stores", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  const fetchSettings = async (store, type) => {
    try {
      const res = await Api.getDeliveryConfig({
        outlet_id: store.id,
        delivery_type: type,
      });
      const data = res?.data?.data;
      const setTarget =
        type === "delivery" ? setDeliveryTimeSlots : setSchedule;
      if (!data) return;

      const slots = daysOfWeek.map((day, index) => {
        const dayData = data.time.find(
          (item) => parseInt(item.week_day) === index
        );
        return {
          day,
          slots: Array.isArray(dayData?.time_slot)
            ? dayData.time_slot.map((slot) => ({
                id: slot.id,
                from: slot.time_from,
                to: slot.time_to,
                delivery_slot: slot.delivery_slot,
              }))
            : [],
          id: dayData?.id,
        };
      });

      setTarget(slots);
      setDuration(data?.timeslot_duration || 15);
    } catch (e) {
      console.error(`Failed to fetch ${type} config`, e);
    }
  };

  const fetchHolidaySettings = async (store) => {
    try {
      const res = await Api.getHolidayConfig({ outlet_id: store.id });
      const data = res?.data?.data;
      if (!Array.isArray(data)) return setHolidays([]);
      setHolidays(
        data.map((item) => ({
          id: item.id,
          label: item.name || "",
          date: item.date || "",
          delivery: item.is_active_delivery === "T",
          takeaway: item.is_active_take_away === "T",
        }))
      );
    } catch (e) {
      console.error("Failed to fetch holidays", e);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!selectedStore) return;
      const store = stores.find((s) => s.id === selectedStore);
      if (!store) return;
      setLoading(true);
      try {
        if (activeTab === "holiday") await fetchHolidaySettings(store);
        else await fetchSettings(store, activeTab);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedStore, stores, activeTab]);

  const handleSlotAction = (day, slotIndex, action) => {
    const isDelivery = activeTab === "delivery";
    const updater = isDelivery ? setDeliveryTimeSlots : setSchedule;
    const state = isDelivery ? deliveryTimeSlots : schedule;
    const setter = isDelivery
      ? setDeletedDeliverySlots
      : setDeletedTakeawaySlots;
    const removed = state.find((d) => d.day === day)?.slots?.[slotIndex];
    if (removed?.id) {
      setter((prev) => [
        ...prev,
        {
          slot_id: removed.id,
          from: removed.from,
          to: removed.to,
          delivery_slot: removed.delivery_slot,
          week_day: daysOfWeek.indexOf(day),
          action: "delete",
        },
      ]);
    }
    updater((prev) =>
      prev.map((d) =>
        d.day === day
          ? { ...d, slots: d.slots.filter((_, i) => i !== slotIndex) }
          : d
      )
    );
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    const hasEmptySlots = (
      activeTab === "delivery" ? deliveryTimeSlots : schedule
    ).some((day) =>
      day.slots.some(
        (s) =>
          !s.from || !s.to || s.delivery_slot === "" || s.delivery_slot == null
      )
    );

    if (hasEmptySlots) {
      toast.error("Please complete all time slots before saving.");
      setLoading(false);
      return;
    }
    try {
      if (activeTab === "holiday") {
        const payload = {
          outlet_id: selectedStore,
          date: [
            ...holidays.map((h) => ({
              id: h.id,
              name: h.label,
              date: h.date,
              is_active_delivery: h.delivery ? "T" : "F",
              is_active_take_away: h.takeaway ? "T" : "F",
              action: h.id ? "update" : "",
            })),
            ...deletedHolidays,
          ],
        };
        const res = await Api.addHolidayConfig(payload);
        res?.data?.status === "success"
          ? toast.success("Holiday saved")
          : toast.error("Failed to save holiday");
      } else {
        const slots = (
          activeTab === "delivery" ? deliveryTimeSlots : schedule
        ).map((d, i) => ({
          id: d.id,
          week_day: i.toString(),
          is_active: "T",
          time_slot: [
            ...d.slots
              .filter(
                (s) =>
                  s.from &&
                  s.to &&
                  s.delivery_slot !== "" &&
                  s.delivery_slot !== null &&
                  s.delivery_slot !== undefined
              )
              .map((s) => ({
                slot_id: s.id,
                from: s.from,
                to: s.to,
                delivery_slot: s.delivery_slot.toString(),
                action: s.id ? "update" : "",
              })),
            ...((activeTab === "delivery"
              ? deletedDeliverySlots
              : deletedTakeawaySlots
            ).filter((del) => del.week_day === i) || []),
          ],
        }));

        const res = await Api.addDeliveryConfig({
          outlet_id: selectedStore,
          delivery_type: activeTab,
          time: slots,
        });
        res?.data?.status === "success"
          ? toast.success("Settings saved")
          : toast.error("Failed to save settings");
      }
    } catch (e) {
      console.error("Save error", e);
      toast.error("Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    if (loading)
      return (
        <Box display="flex" justifyContent="center" pt={4}>
          <CircularProgress />
        </Box>
      );

    const tableProps = {
      handleRemoveTimeSlot: handleSlotAction,
      handleAddTimeSlot: (day) => {
        const updater =
          activeTab === "delivery" ? setDeliveryTimeSlots : setSchedule;
        updater((prev) =>
          prev.map((d) =>
            d.day === day
              ? {
                  ...d,
                  slots: [
                    ...d.slots,
                    {
                      id: undefined,
                      from: "",
                      to: "",
                      delivery_slot: "",
                    },
                  ],
                }
              : d
          )
        );
      },
      handleTimeChange: (day, index, key, value) => {
        const formatted =
          (key === "from" || key === "to") && value instanceof Date
            ? `${value.getHours().toString().padStart(2, "0")}:${value
                .getMinutes()
                .toString()
                .padStart(2, "0")}`
            : value;

        const updater =
          activeTab === "delivery" ? setDeliveryTimeSlots : setSchedule;

        updater((prev) =>
          prev.map((d) =>
            d.day === day
              ? {
                  ...d,
                  slots: d.slots.map((s, i) =>
                    i === index ? { ...s, [key]: formatted } : s
                  ),
                }
              : d
          )
        );
      },

      duration,
      disabled: stores.length === 0,
    };

    if (activeTab === "holiday") {
      return (
        <HolidayTable
          holidays={holidays}
          handleAddHoliday={() =>
            setHolidays([
              ...holidays,
              { label: "", date: "", delivery: false, takeaway: false },
            ])
          }
          handleRemoveHoliday={(i) => {
            const h = holidays[i];
            if (h?.id)
              setDeletedHolidays([
                ...deletedHolidays,
                { ...h, action: "delete" },
              ]);
            setHolidays(holidays.filter((_, idx) => idx !== i));
          }}
          handleHolidayChange={(i, k, v) => {
            const val =
              k === "date" && v ? new Date(v).toISOString().split("T")[0] : v;
            setHolidays(
              holidays.map((h, idx) => (i === idx ? { ...h, [k]: val } : h))
            );
          }}
          handleDeliveryToggle={(i, checked) => {
            setHolidays((prev) =>
              prev.map((h, idx) =>
                i === idx
                  ? {
                      ...h,
                      delivery: checked,
                      takeaway: checked ? false : h.takeaway,
                    }
                  : h
              )
            );
          }}
          handleTakeawayToggle={(i, checked) => {
            setHolidays((prev) =>
              prev.map((h, idx) =>
                i === idx
                  ? {
                      ...h,
                      takeaway: checked,
                      delivery: checked ? false : h.delivery,
                    }
                  : h
              )
            );
          }}
          disabled={stores.length === 0}
        />
      );
    }
    return (
      <WeekdayTable
        schedule={activeTab === "delivery" ? deliveryTimeSlots : schedule}
        {...tableProps}
      />
    );
  };

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Settings
      </Typography>
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        sx={{ mb: 2 }}
      >
        <Tab value="takeaway" label="Takeaway" />
        <Tab value="delivery" label="Delivery" />
        <Tab value="holiday" label="Holiday" />
      </Tabs>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <BookingSettings
            loading={loading}
            handleSaveChanges={handleSaveChanges}
            stores={stores}
            selectedStore={selectedStore}
            setSelectedStore={setSelectedStore}
            disabled={stores.length === 0}
            dayLimited={dayLimited}
            onChangeDayLimited={(val) => setDayLimited(parseInt(val))}
          />
          {stores.length === 0 && (
            <Paper sx={{ p: 2, mt: 2, bgcolor: "#eccdcda1" }}>
              <Typography color="error" fontWeight="bold">
                ⚠️ Please add a store first to configure settings.
              </Typography>
            </Paper>
          )}
        </Grid>
        <Grid item xs={12} md={8}>
          {renderTabContent()}
        </Grid>
      </Grid>
      <ToastContainer />
    </Box>
  );
};

export default Settings;
