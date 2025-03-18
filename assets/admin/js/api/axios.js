import axios from "axios";

export const makeRequest = async (
  endpoint,
  params = {},
  method = "GET", // Default method set to GET
  token = "FEhI30q7ySHtMfzvSDo6RkxZUDVaQ1BBU3lBcGhYS3BrQStIUT09"
) => {
  const baseURL = "/wp-json/zippy-addons/v1";
  const api = axios.create({ baseURL });

  // Build headers
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Validate HTTP method
  const validMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
  if (!validMethods.includes(method.toUpperCase())) {
    console.error(`❗Invalid HTTP method: ${method}`);
    return { error: "Invalid HTTP method provided." };
  }

  // Axios configuration
  const config = {
    url: endpoint,
    method: method.toUpperCase(),
    headers,
    ...(method.toUpperCase() === "GET" ? { params } : { data: params }),
  };

  try {
    const response = await api.request(config);
    return { data: response.data };
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Unknown error occurred";

    console.error("❗API Error:", errorMessage);

    return {
      error: {
        message: errorMessage,
        status: error?.response?.status || 500,
      },
    };
  }
};
