// src/api/priceBooksAPI.js

import { makeRequest } from "../axios"; // Assuming this handles the base URL and headers

export const shippingRoleConfigAPI = {
  async getShippingRoleConfigs(params) {
    return await makeRequest("/shipping-role-config", params, "GET");
  },
  async updateShippingRoleConfig(params) {
    return await makeRequest("/shipping-role-config", params, "PUT");
  },
  async createShippingRoleConfig(params) {
    return await makeRequest("/shipping-role-config", params, "POST");
  },
  async getShippingRoleConfigByUser(params) {
    return await makeRequest(
      "/get-shipping-role-config-by-user",
      params,
      "GET"
    );
  },
  async deleteShippingRoleConfig(params) {
    return await makeRequest(`/shipping-role-config`, params, "DELETE");
  },
};
