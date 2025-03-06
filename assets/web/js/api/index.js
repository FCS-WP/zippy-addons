import axios from "axios";
import { makeLocalRequest, makeRequest, makeWooRequest } from "./axios";

export const webApi = {
  async getCategories(params) {
    return await makeRequest("/wc-analytics/products/categories", params);
  },

  async getBookings (params) {
    return await makeRequest("/bookings", params);
  },

  async createBooking (params) {
    return await makeRequest("/booking", params, 'POST');
  },

  async getConfigs (params) {
    return await makeRequest("/configs", params);
  },

  async getSupportCategories (params) {
    return await makeRequest("/support-booking/categories", params);
  },

  async getBookingSupports (params) {
    return await makeRequest("/support-booking", params);
  },

  async signIn (params) {
    return await makeRequest("/zippy-signin", params, 'POST');
  },

  async registerAccount (params) {
    return await makeRequest("/zippy-register", params, 'POST');
  },

  async mappingProduct (params) {
    return await makeRequest("/mapping-product", params, 'GET');
  },


  // async getWooCategories (params) {
  //   return await makeLocalRequest("/wc/v3/products/categories", params);
  // },
  // async getWooProductsByCategoryID (params) {
  //   return await makeLocalRequest('/wc/v3/products', params);
  // }

};
