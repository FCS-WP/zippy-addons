import { makeOneMapRequest, makeRequest } from "./axios";

export const webApi = {
  async getConfigs (params) {
    return await makeRequest("/configs", params);
  },
  async searchLocation(params) {
    return await makeOneMapRequest("/common/elastic/search", params);
  },
  async searchRoute(params) {
    return await makeOneMapRequest("/public/routingsvc/route", params);
  }
};
