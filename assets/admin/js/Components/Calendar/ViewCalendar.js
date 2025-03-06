import React, { useEffect, useRef, useState } from "react";
import { Scheduler } from "@aldabil/react-scheduler";


import { Bookings } from "../../api/bookings";
import { format } from "date-fns";
import { toast } from "react-toastify";
import EventView from "./EventView";
import EditEventView from "./EditEventView";
import { getEventColors } from "../../utils/bookingHelper";
import { Box } from "@mui/material";

const ViewCalendar = ({ configs }) => {
  const [events, setEvents] = useState([]);
  const timeRef = useRef([]);
  const [scheduleTimes, setScheduleTimes] = useState();

  const convertBookingsToEvents = (bookings = []) => {
  
    const results = bookings.map((booking, item) => {
      const newEvent = {
        event_id: booking.ID,
        title: `Booking ${booking.ID}`,
        start: new Date(
          `${booking.booking_start_date} ${booking.booking_start_time}`
        ),
        end: new Date(
          `${booking.booking_end_date} ${booking.booking_end_time}`
        ),
        booking_data: booking,
        draggable: false,
        color: getEventColors(booking.booking_status),
      };
      return newEvent;
    });
    return results;
  };

  const getEventsByTime = async (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const params = {
      booking_start_date: format(startDate, "yyyy-MM-dd"),
      booking_end_date: format(endDate, "yyyy-MM-dd"),
    };

    const { data: response } = await Bookings.getBookings(params);
    if (response.status !== "success") {
      toast.error("Get bookings failed");
    }
    const newEvents = convertBookingsToEvents(response.data.bookings);
    setEvents(newEvents);
  };
  

  const getScheduleEvent = (props) => {
    const { start, end, view } = props;
    setScheduleTimes(props);
    getEventsByTime(start, end);
  };  


  const updateEvents = () => {
    getScheduleEvent(timeRef.current);
  }
  
  useEffect(()=>{
    timeRef.current = scheduleTimes;
  }, [scheduleTimes])


  return (
    <Box className="custom-calendar custom-mui">
      <Scheduler
        view="month"
        events={events}
        customViewer={(event, close) => (
          <EventView updateEvents={updateEvents} event={event} close={close} />
        )}
        disableViewNavigator
        editable={true}
        customEditor={(scheduler) => <EditEventView configs={configs} scheduler={scheduler} />}
        getRemoteEvents={getScheduleEvent}
      />
    </Box>
  );
};

export default ViewCalendar;
