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
  async categoriesInCatalog(params) {
    return await makeRequest("/categories-in-catalog", params, "GET");
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
  async getCatalogCategory() {
    return await makeRequest("/catalog-category", null, "GET");
  },
  async updateCatalogCategory(params) {
    return await makeRequest("/catalog-category", params, "POST");
  },
  async deleteCatalogCategory(params) {
    return await makeRequest("/catalog-category", params, "DELETE");
  },
};
