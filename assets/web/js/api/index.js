import { makeOneMapRequest, makeRequest } from "./axios";

export const webApi = {
  async getConfigs(params) {
    return await makeRequest("/configs", params);
  },
  async getStores(params) {
    return await makeRequest("/stores", params);
  },
  async getStoresByType(params) {
    return await makeRequest("/stores-by-type", params);
  },
  async searchLocation(params) {
    return await makeRequest("/location", params);
  },
  async searchRoute(params) {
    return await makeRequest("/distance", params);
  },
  async addToCart(params) {
    return await makeRequest("/add-to-cart", params, "POST");
  },
  async checkBeforeAddToCart(params) {
    return await makeRequest("/check-before-add-to-cart", params, "GET");
  },
  async checkProduct(params) {
    return await makeRequest("/product-checking", params);
  },
  async registerAccount(params) {
    return await makeRequest("/zippy-register", params, "POST");
  },
  async login(params) {
    return await makeRequest("/zippy-signin", params, "POST");
  },
  async checkSlotDelivery(params) {
    return await makeRequest("/slot", params);
  },
  async checkRemainOrder(params) {
    return await makeRequest("/check-remain-order", params);
  },
};
