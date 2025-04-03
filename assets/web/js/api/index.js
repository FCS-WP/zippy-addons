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
    return await makeRequest("/distance", params);
  },
  async addToCart(params) {
    return await makeRequest("/add-to-cart", params, 'POST');
  },
  async checkProduct(params) {
    return await makeRequest('/product-checking', params);
  }
};
