import { makeRequest } from "../axios";

export const generalAPI = {
  async getZippOptions(params) {
    return await makeRequest("/zippy-options", params, "GET");
  },
  async updateZippOptions(params) {
    return await makeRequest("/zippy-options", params, "POST");
  },
};
