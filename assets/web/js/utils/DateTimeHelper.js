const DateTimeHelper = {
  getToday: (offsetHours = 8) => {
    const now = new Date();

    const targetOffsetInMinutes = -offsetHours * 60;
    const localOffsetInMinutes = now.getTimezoneOffset();

    const diffToGMT8 = localOffsetInMinutes - targetOffsetInMinutes;
    const offsetDate = new Date(now.getTime() + diffToGMT8 * 60 * 1000);

    const year = offsetDate.getFullYear();
    const month = String(offsetDate.getMonth() + 1).padStart(2, "0");
    const day = String(offsetDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  },
  getDateWithOffset: (date, offsetHours = 8) => {
    if (!date) return null;

    const dt = new Date(date);
    const targetOffsetInMinutes = -offsetHours * 60;
    const localOffsetInMinutes = dt.getTimezoneOffset();
    const diffToTarget = localOffsetInMinutes - targetOffsetInMinutes;
    const offsetDate = new Date(dt.getTime() + diffToTarget * 60 * 1000);

    const year = offsetDate.getFullYear();
    const month = String(offsetDate.getMonth() + 1).padStart(2, "0");
    const day = String(offsetDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  },
};

export default DateTimeHelper;
