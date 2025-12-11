
export const priceBooksColumns = [
  "NAME",
  "ROLE",
  "START DATE",
  "END DATE",
  "STATUS",
  "", // Action column
];

export const MOCK_API_DATA = [
  {
    id: 101,
    name: "Wholesale Q4 2025",
    role: "wholesale_customer",
    start_date: "2025-10-01T00:00:00Z",
    end_date: "2025-12-31T23:59:59Z",
    status: "active",
  },
  {
    id: 102,
    name: "VIP Discount Group",
    role: "vip_member",
    start_date: "2025-11-15T00:00:00Z",
    end_date: "2026-03-31T23:59:59Z",
    status: "inactive",
  },
  {
    id: 103,
    name: "Partnership Pricing",
    role: "partner",
    start_date: "2024-01-01T00:00:00Z",
    end_date: "2025-12-31T23:59:59Z",
    status: "active",
  },
];

export const MOCK_ROLES = [
  { slug: "wholesale", name: "Wholesale Customer" },
  { slug: "customer", name: "Customer" },
  { slug: "vip", name: "VIP" },
  { slug: "customer", name: "Standard Customer" },
];

export const columnWidths = {
  NAME: "auto",
  ROLE: "20%",
  "START DATE": "15%",
  "END DATE": "15%",
  STATUS: "10%",
  "": "10%",
};

export const rulesColumns = [
  "PRODUCT NAME",
  "PRICING METHOD",
  "PRICE/VALUE",
  "VISIBILITY",
  "ACTIONS",
];
