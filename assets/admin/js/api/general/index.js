import { makeRequest } from "../axios";

export const generalAPI = {
  async getZippOptions(params) {
    return await makeRequest("/zippy-options", params, "GET");
  },
  async updateZippOptions(params) {
    return await makeRequest("/zippy-options", params, "POST");
  },
  async fulfilmentReport(params) {
    return await makeRequest("/fulfilment-report", params, "GET");
  },
  async products(params) {
    return await makeRequest("/products", params, "GET");
  },
  async product(params) {
    return await makeRequest("/product", params, "GET");
  },
  async categories(params) {
    return await makeRequest("/categories", params, "GET");
  },
  async addProductsToOrder(order_id, action, params) {
    return await makeRequest(
      `/add-items-order?order_id=${order_id}&action=${action}`,
      params,
      "POST"
    );
  },
  async getAvailableRoles() {
    return await makeRequest("/user-roles", null, "GET");
  },
};
