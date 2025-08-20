import { parse, format, addMinutes, isBefore, getDay, isAfter } from "date-fns";
import { toast } from "react-toastify";
export const generateTimeSlots = (startTime, endTime, gapTime) => {
  const timeSlots = [];
  try {
    let current = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    while (current < end) {
      const slotStart = new Date(current);
      const slotEnd = new Date(current);
      slotEnd.setMinutes(slotEnd.getMinutes() + parseInt(gapTime));

      if (slotEnd > end) break;

      timeSlots.push({
        from: format(slotStart, "HH:mm"),
        to: format(slotEnd, "HH:mm"),
      });

      current.setMinutes(current.getMinutes() + parseInt(gapTime));
    }
  } catch (error) {
    toast.error("Generate time slots failed");
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

export const getDisabledDays = (orderModeData) => {
  let results = [];
  if (!orderModeData) {
    return [];
  }

  orderModeData.time.map((timeItem, index) => {
    if (timeItem.is_active !== "T" || timeItem.time_slot.length == 0) {
      results.push(timeItem.week_day);
    }
  });

  return results;
};

export const isCloseDate = (date, closedDays, closedDates) => {
  const checkDate = new Date(date);
  const isDisabledDay = closedDays.find(
    (item) => parseInt(item) === checkDate.getDay()
  );

  if (isDisabledDay) {
    return true;
  }

  if (closedDates && closedDates.length > 0) {
    const check = closedDates.find(
      (closeDate) => closeDate === format(checkDate, "yyyy-MM-dd")
    );

    if (check) {
      return true;
    }
  }

  return false;
};

export const getAvailableDeliveryTimes = (deliveryHours) => {
  const availableTimes = deliveryHours.filter((item) => {
    if (parseInt(item.remaining_slot) !== 0) {
      return item.from && item.to;
    }
  });
  return availableTimes;
};

const isInRange = (check, start, end) => {
  const startDate = format(new Date(start), "yyyy-MM-dd");
  const endDate = format(new Date(end), "yyyy-MM-dd");
  const checkDate = format(new Date(check), "yyyy-MM-dd");
  return startDate <= checkDate && checkDate <= endDate;
};

const isHappyDate = (date, happyHours) => {
  const check = happyHours.find((happyHour) => {
    const happyStartDate = new Date(happyHour.start_time);
    const happyEndDate = new Date(happyHour.end_time);
    return isInRange(date, happyStartDate, happyEndDate);
  });

  if (check) {
    return true;
  }
  return false;
};

const isMenuDayAvailable = (day, daysOfWeek) => {
  const dayData = daysOfWeek.find((item) => item.weekday == day);
  if (!dayData || dayData.is_available == 0) {
    return false;
  }
  return true;
};

export const getHolidayCloseDates = (holidays, type) => {
  if (!holidays || holidays.length == 0) {
    return [];
  }

  let closedDates = [];
  switch (type) {
    case "takeaway":
      const takeawayHandle = holidays.map((holidayItem, index) => {
        if (holidayItem.is_active_take_away == "F") {
          closedDates.push(holidayItem.date);
        }
      });
      break;
    case "delivery":
      const handleDates = holidays.map((holidayItem, index) => {
        if (holidayItem.is_active_delivery == "F") {
          closedDates.push(holidayItem.date);
        }
      });
      break;
    default:
      break;
  }
  return closedDates;
};

export const isDisabledDate = (
  date,
  orderModeData,
  currentMenu,
  type,
  holidays,
  menusConfig
) => {
  const checkDate = new Date(date);
  const checkDay = checkDate.getDay();
  const disabledDays = getDisabledDays(orderModeData);
  // Check limited date
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + parseInt(orderModeData.day_limited) - 1);
  if (checkDate > maxDate) {
    return true;
  }

  // Check holidays
  const holidayCloseDates = getHolidayCloseDates(holidays, type);
  const checkCloseDate = isCloseDate(date, disabledDays, holidayCloseDates);

  if (checkCloseDate) {
    return true;
  }

  if (!currentMenu) {
    return false;
  }

  const endDate = new Date(currentMenu.end_date);
  if (checkDate > endDate) {
    return true;
  }

  if (!menusConfig || menusConfig.length == 0) {
    return false;
  }

  const checkMenu = menusConfig.find((menu) =>
    isInRange(date, menu.start_date, menu.end_date)
  );

  if (!checkMenu) {
    return false;
  }

  if (checkMenu.happy_hours?.length > 0) {
    const checkHappyDate = isHappyDate(date, checkMenu.happy_hours);
    if (checkHappyDate) {
      return false;
    }
  }

  const checkMenuDay = isMenuDayAvailable(checkDay, checkMenu.days_of_week);
  if (!checkMenuDay) {
    return true;
  }

  return false;
};

export const getActiveMenuByDate = (date, menus) => {
  if (!menus) return undefined;
  const checkMenu = menus.find((menu) =>
    isInRange(date, menu.start_date, menu.end_date)
  );
  return checkMenu;
};
