import React, { useState, useEffect } from "react";
import Header from "../../Components/Layouts/Header";
import AdminLoader from "../../Components/AdminLoader";
import { toast, ToastContainer } from "react-toastify";
import ViewCalendar from "../../Components/Calendar/ViewCalendar";
import { Box } from "@mui/material";
import { Api } from "../../api";
const Calendar = () => {
  const [isLoading, setIsLoading] = useState(false);
  const title = "Bookings Canlander";
  const [configs, setConfigs] = useState(null);

  const getConfigs = async () => {
    setIsLoading(true);
    const { data: response } = await Api.getSettings();
    if (response.status !== "success") {
      toast.error("Can not get settings!!!");
    } else {
      setConfigs(response.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getConfigs();
  }, []);

  return (
    <>
      <Header title={title}></Header>
      <Box className="calendar-page">
        {isLoading ? (
          <Box sx={{ position: "relative", marginRight: "3rem" }}>
            <AdminLoader />
          </Box>
        ) : (
          <ViewCalendar configs={configs} />
        )}
        <ToastContainer />
      </Box>
    </>
  );
};

export default Calendar;
