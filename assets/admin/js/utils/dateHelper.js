import { format, parseISO, isValid } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export const formatDate = (dateString, formatPattern = "MMMM d, yyyy") => {
  const date = parseISO(dateString); // Parse the string to a Date object

  if (!isValid(date)) {
    return null; // Return null if the date is invalid
  }

  return format(date, formatPattern); // Format the valid date
};

export const parseTime = (timeString) => {
  if (!timeString) return null;
  const [hours, minutes] = timeString.split(":").map(Number);
  const now = new Date();
  now.setHours(hours, minutes, 0);
  return now;
};

export const convertTime24to12 = (time24) => {
  return new Date("1970-01-01T" + time24).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatYMD = (date) => {
  const getDate = new Date(date);
  return format(getDate, "yyyy-MM-dd");
};
export const isInDisabledRange = (date, disabledRanges) => {
  if (disabledRanges.length == 0) {
    return false;
  }

  const check = disabledRanges.find((item) => {
    return (
      formatYMD(item.start_date) <= formatYMD(date) &&
      formatYMD(date) <= formatYMD(item.end_date)
    );
  });

  if (check) {
    return true;
  }
};

export const handleDateData = (val) => {
  const result =
    val === "0000-00-00" ? "" : format(new Date(val), "yyyy-MM-dd");
  return result;
};

export const calcExpiredDate = (today, endDate) => {
  const todayDate = new Date(today).setHours(0, 0, 0, 0);
  const endDateOnly = new Date(endDate).setHours(0, 0, 0, 0);

  if (endDateOnly < todayDate) return 0;

  const diffTime = endDateOnly - todayDate;
  return diffTime / (1000 * 60 * 60 * 24);
};

export const getDateExpired = (start, end) => {
  const startDate = handleDateData(start);
  const endDate = handleDateData(end);
  if (!startDate || !endDate) {
    return {
      status: "danger",
      message: "Missing config",
    };
  }
  const today = handleDateData(new Date());

  if (startDate <= today && today <= endDate) {
    const validityPeriod = calcExpiredDate(today, endDate);
    return validityPeriod == 0
      ? { status: "warning", message: "Expires today" }
      : {
          status: "warning",
          message: `${validityPeriod} day(s) left until expiration.`,
        };
  }

  if (today > endDate) {
    return { status: "danger", message: "Expired" };
  }

  if (today < startDate) {
    return { status: "info", message: "incoming" };
  }
};
const isValidTimeFormat = (time) => {
  return /^([0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
};

export const createDateWithHourStr = (hourStr) => {
  const today = new Date();
  const dateStr = format(today, "yyyy-MM-dd") + " " + hourStr;
  let result = isValidTimeFormat(hourStr) ? new Date(dateStr) : null;
  return result;
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

export const dateToSGT = (value, format = "MMM dd, yyyy") => {
  if (!value) return "";

  const timeZone = "Asia/Singapore";
  return formatInTimeZone(new Date(value), timeZone, format);

};
