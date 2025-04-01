import { makeRequest } from "./axios";
export const Api = {
  async checkKeyExits(params) {
    return await makeRequest("/check_option", params);
  },
  async createSettings(params) {
    return await makeRequest("/configs", params, "POST");
  },
  async updateSettings(params) {
    return await makeRequest("/configs", params, "PUT");
  },
  async getSettings(params) {
    return await makeRequest("/store-config", params, "GET");
  },
  async searchByKeyword(params) {
    return await makeRequest("/prodegories", params);
  },
  async addSupportCategories(params) {
    return await makeRequest("/support-booking/categories", params, "POST");
  },
  async addSupportProducts(params) {
    return await makeRequest("/support-booking/products", params, "POST");
  },
  async getMappingData(params) {
    return await makeRequest("/support-booking", params);
  },
  async deleteMappingItems(params) {
    return await makeRequest("/support-booking/delete", params, "DELETE");
  },
  async getProductsByCategory(params) {
    return await makeRequest("/support-booking/categories", params);
  },
  async updateBookingProductPrices(params) {
    return await makeRequest(
      "/support-booking/products/update-price",
      params,
      "POST"
    );
  },
  async createOptions(params) {
    return await makeRequest("/zippy-options", params, "POST");
  },
  async searchMappingProducts(params) {
    return await makeRequest(
      "/support-booking/search-mapping-products",
      params
    );
  },
  async addStore(params) {
    return await makeRequest("/stores", params, "POST");
  },
  async getStore(params) {
    return await makeRequest("/stores", params);
  },
  async updateStore(params) {
    return await makeRequest("/stores", params, "PUT");
  },
  async deleteStore(params) {
    return await makeRequest("/stores", params, "DELETE");
  },
  async addStoreConfig(params) {
    return await makeRequest("/store-config", params, "POST");
  },
  async addShipping(params) {
    return await makeRequest("/shipping", params, "POST");
  },
  async getShipping(params) {
    return await makeRequest("/shipping", params);
  },
  async getMenus(params) {
    return await makeRequest("/menus", params, "GET");
  },
  async createMenu(params) {
    return await makeRequest("/menus", params, "POST");
  },
  async updateMenu(params) {
    return await makeRequest("/menus", params, "PUT");
  },
  async deleteMenuItems(params) {
    return await makeRequest("/menus", params, "DELETE");
  },
  async searchProducts(params) {
    return await makeRequest("/search-products", params);
  },
};
