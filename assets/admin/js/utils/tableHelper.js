export const menuListColumns = [
  "ID",
  "NAME",
  "Start Date",
  "End Date",
  "STATUS",
  "ACTIONS",
];

export const detailMenuColumn = [
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
  "SUN",
  "Start Date",
  "End Date",
  "ACTIONS",
];

export const productListColumns = ["ID", "NAME", "ACTIONS"];
export const productListOrder = ["IMAGE", "ID", "NAME", "INVENTORY", "ACTIONS"];

export const happyHoursColumns = ["START TIME", "END TIME", "ACTIONS"];
export const addProducts = ["IMAGE", "NAME", "ADDON ACTIONS"];

export const roundUp2dp = (num) => (Math.round(num * 10) / 10).toFixed(2);
