import { makeOneMapRequest, makeRequest } from "./axios";

export const webApi = {
  async getConfigs(params) {
    return await makeRequest("/configs", params);
  },
  async getStores(params) {
    return await makeRequest("/stores", params);
  },
  async searchLocation(params) {
    return await makeRequest("/location", params);
  },
  async searchRoute(params) {
    return await makeRequest("/shipping-calculate", params);
  },
  async submitOrderForm(params) {
    return await makeRequest('/search-location', params);
  }
};
