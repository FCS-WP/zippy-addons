import { makeRequest } from "./axios";

export const webApi = {
  async getConfigs (params) {
    return await makeRequest("/configs", params);
  },
};
