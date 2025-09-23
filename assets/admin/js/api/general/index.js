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
  async getItems(params) {
    return await makeRequest("/get-items-order", params, "GET");
  },
  async update_items_order(params) {
    return await makeRequest("/save-items-order", params, "POST");
  },
  async addProductsToOrder(params) {
    return await makeRequest("/add-items-order", params, "POST");
  },
};
