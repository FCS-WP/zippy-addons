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
};
