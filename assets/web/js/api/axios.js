import axios from "axios";

export const makeRequest = async (
  endpoint,
  params = {},
  method = "GET",
  token = "FEhI30q7ySHtMfzvSDo6RkxZUDVaQ1BBU3lBcGhYS3BrQStIUT09"
) => {
  const baseURL = "/wp-json";
  const api = axios.create({
    baseURL: baseURL,
  });
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const config = {
    url: "zippy-addons/v1" + endpoint,
    params: params,
    method: method,
    headers: headers,
  };
  try {
    let res = null;

    res = await api.request(config);
    const data = res.data;
    return { data };
  } catch {
    (error) => {
      if (!error?.response) {
        console.error("❗Error", error.message);
        return { ...error, catchedError: error };
      }

      console.error(error.response.statusText);
      return error;
    };
  }
};

export const makeWooRequest = async (endpoint, params = {}, method = "GET") => {
  const baseURL = "/wp-json";
  const newEndpoint = "wp-json" + endpoint;
  const params_api = { endpoint: newEndpoint, ...params };
  const api = axios.create({
    baseURL: baseURL,
  });

  const config = {
    url: "/zippy-core/v1/call",
    params: params_api,
    method: method,
  };
  try {
    let res = null;

    res = await api.request(config);
    const data = res.data;
    return { data };
  } catch {
    (error) => {
      if (!error?.response) {
        console.error("❗Error", error.message);
        return { ...error, catchedError: error };
      }

      console.error(error.response.statusText);
      return error;
    };
  }
};

export const fetchCredentials = async () => {
  try {
    const response = await axios.get("/wp-json/zippy-core/v1/credentials");
    const { data } = response.data;
    // Use these credentials as needed
  } catch (error) {
    console.error("Error fetching credentials:", error);
  }
};

// Fetch woo
export const makeLocalRequest = async (
  endpoint,
  params = {},
  method = "GET"
) => {
  const baseURL = "/wp-json";
  const api = axios.create({
    baseURL: baseURL,
  });

  const config = {
    url: endpoint,
    params: params,
    method: method,
  };
  try {
    let res = null;

    res = await api.request(config);
    const data = res.data;
    return { data };
  } catch {
    (error) => {
      if (!error?.response) {
        console.error("❗Error", error.message);
        return { ...error, catchedError: error };
      }

      console.error(error.response.statusText);
      return error;
    };
  }
};

// Onemap Request 
export const makeOneMapRequest = async (
  endpoint,
  params = {},
  method = "GET",
  token = ""
) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const config = {
    url: "https://www.onemap.gov.sg/api" + endpoint,
    params: params,
    method: method,
    headers: headers,
  };
  try {
    let res = null;

    res = await axios.request(config);
    const data = res.data;
    return { data };
  } catch {
    (error) => {
      if (!error?.response) {
        console.error("❗Error", error.message);
        return { ...error, catchedError: error };
      }

      console.error(error.response.statusText);
      return error;
    };
  }
};