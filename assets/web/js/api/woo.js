import { makeWooRequest } from "./axios";

export const Woocommerce = {
  async getProducts(params) {
    return await makeWooRequest("/wc/v3/products", params);
  },

};
