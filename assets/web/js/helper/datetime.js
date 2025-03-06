import { parse, format, addMinutes, isBefore, getDay, isAfter } from "date-fns";
export const generateTimeSlots = (startTime, endTime, gapTime) => {
  const timeSlots = [];

  let current = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);

  while (current < end) {
    const slotStart = new Date(current);
    const slotEnd = new Date(current);
    slotEnd.setMinutes(slotEnd.getMinutes() + parseInt(gapTime));

    if (slotEnd > end) break;

    timeSlots.push({
      start: format(slotStart, "HH:mm"),
      end: format(slotEnd, "HH:mm"),
    });

    current.setMinutes(current.getMinutes() + parseInt(gapTime));
  }
  return timeSlots;
};

export const getTimeFromBooking = (booking) => {
  const startDateString =
    booking.booking_start_date + "T" + booking.booking_start_time;
  const endDateString =
    booking.booking_end_date + "T" + booking.booking_end_time;

  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);

  return { start: format(startDate, "HH:mm"), end: format(endDate, "HH:mm") };
};

export const parseTime = (timeStr) => parse(timeStr, "HH:mm:ss", new Date());
export const formatTime = (time) => format(time, "HH:mm:ss");

export const getAvailableTimeSlots = (
  configTime,
  bookings = [],
  selectedDate = new Date(),
  duration,
  holidays = []
) => {
  const { open_at, close_at } = configTime;
  // Generate time slots
  let timeSlots = handleTimeSlots(bookings, open_at, close_at, duration);
  let extraSlots = [];
  // Generate Extra time slot:
  if (configTime.extra_time?.is_active == "T") {
    const configExtra = configTime.extra_time.data;
    configExtra.map((extraItem) => {
      const slots = handleTimeSlots(
        bookings,
        extraItem.from,
        extraItem.to,
        duration,
        true
      );
      extraSlots = [...extraSlots, ...slots];
    });
  }

  const filteredSlots = filterExtraSlots(timeSlots, extraSlots);
  const results = handleCheckbookingDate(filteredSlots, selectedDate, holidays);
  return results;
};

const sortSlots = (slots) => {
  return slots.sort((a, b) => {
    const aDate = parseTime(a.start);
    const bDate = parseTime(b.start);
    return aDate.getTime() - bDate.getTime();
  });
};

const filterExtraSlots = (timeSlots, extraSlots) => {
  const filteredSlots = timeSlots.filter((item) => {
    return !extraSlots.find((eSlot) => item.start == eSlot.start);
  });
  const results = [...filteredSlots, ...extraSlots];

  return sortSlots(results);
};

const handleCheckbookingDate = (slots, selectedDate, holidays) => {
  const today = getBookingDate(new Date());
  const compareDate = getBookingDate(selectedDate);
  let results = slots;
  if (holidays?.length > 0) {
    let flag = false;
    try {
      const checkHoliday = holidays.find((holiday) => {
        const holidate = getBookingDate(holiday.date);
        if (holidate) {
          return compareDate == holidate;
        }
      });
      flag = checkHoliday ? true : false;
    } catch (error) {
      return false;
    }

    if (flag) {
      const changeSlots = slots.map((slot) => {
        slot.isExtra = true;
        return slot;
      });
      results = [...changeSlots];
    }
  }
  // Check today
  if (today !== compareDate) {
    return results;
  }

  const now = formatTime(new Date());
  const timeNow = parseTime(now);

  const newResults = results.map((slot) => {
    const startTime = parseTime(slot.start);
    if (startTime <= timeNow) {
      slot.isDisabled = true;
    }
    return slot;
  });

  return newResults;
};

const handleTimeSlots = (
  bookings,
  open_at,
  close_at,
  duration,
  isExtra = false
) => {
  const results = [];
  const startTime = parseTime(open_at);
  let endTime = parseTime(close_at);

  if (endTime < startTime) {
    endTime = new Date(endTime);
    endTime.setDate(endTime.getDate() + 1);
  }

  // Convert bookings to date objects
  const bookingIntervals = bookings.map((booking) => ({
    start: parseTime(booking.booking_start_time),
    end: parseTime(booking.booking_end_time),
  }));
  let currentTime = startTime;

  while (
    currentTime < endTime &&
    addMinutes(currentTime, duration) <= endTime
  ) {
    const slotEnd = addMinutes(currentTime, duration);

    // Check if the slot overlaps or falls entirely within any booking
    const isExcluded = bookingIntervals.some(
      (booking) =>
        (isBefore(currentTime, booking.end) &&
          isAfter(slotEnd, booking.start)) ||
        (isAfter(currentTime, booking.start) && isBefore(slotEnd, booking.end))
    );

    // Add the slot with isDisabled key
    results.push({
      start: formatTime(currentTime),
      end: formatTime(slotEnd),
      isDisabled: isExcluded,
      isExtra: isExtra,
    });

    currentTime = slotEnd;
  }
  return results;
};

export const getBookingTime = (time) => {
  const current = new Date(`1970-01-01T${time}`);
  const date = new Date(current);
  return format(date, "HH:mm aa");
};

export const getBookingDate = (time) => {
  const date = new Date(time);
  return format(date, "yyyy-MM-dd");
};

export const isInFilterDates = (bookingStart, start, end) => {
  if (!start) {
    return false;
  }
  let filterDate = new Date(bookingStart);

  let startDate = new Date(start);
  let endDate = new Date(end);
  filterDate.setHours(0, 0, 0);
  startDate.setHours(0, 0, 0);
  endDate.setHours(0, 0, 0);

  if (startDate.getTime() <= filterDate.getTime()) {
    if (!end) {
      return true;
    }
    if (end && filterDate.getTime() <= endDate.getTime()) {
      return true;
    }
  }
  return false;
};

export const getCustomDayOfWeek = (date) => {
  const inputDate = new Date(date);
  return inputDate.getDay();
};
