import { format, parseISO, isValid } from "date-fns";

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
  return new Date('1970-01-01T' + time24)
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}