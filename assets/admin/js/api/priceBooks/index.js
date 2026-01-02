// src/api/priceBooksAPI.js

import { makeRequest } from "../axios"; // Assuming this handles the base URL and headers

export const priceBooksAPI = {
  async getPriceBooks(params) {
    return await makeRequest("/price_books", params, "GET");
  },
  async getAllProducts(params) {
    return await makeRequest("/price_books/products", params, "GET");
  },

  /**
   * Fetches a single Price Book container by ID (for the Edit Details page).
   * @param {number|string} id - The ID of the Price Book or 'new'.
   */
  async getPriceBook(id) {
    // If we're creating a new one, we might not need an API call,
    // but this endpoint is for fetching an existing ID.
    return await makeRequest(`/price_books/${id}`, null, "GET");
  },

  /**
   * Creates a new Price Book container.
   * @param {object} data - { name, role, startDate, endDate, ... }
   */
  async createPriceBook(data) {
    return await makeRequest("/price_books", data, "POST");
  },

  /**
   * Updates an existing Price Book container.
   * Maps to: PUT /price_books/{id}
   * @param {number} id - The ID of the Price Book to update.
   * @param {object} data - Updated container data.
   */
  async updatePriceBook(id, data) {
    return await makeRequest(`/price_books/${id}`, data, "PUT");
  },

  /**
   * Deletes a Price Book container and all associated rules.
   *
   * @param {number} id - The ID of the Price Book to delete.
   */
  async deletePriceBook(id) {
    return await makeRequest(`/price_books/${id}`, null, "DELETE");
  },

  /**
   * Get Price Book Todays Active.
   *
   */

  async getTodaysActive() {
    return await makeRequest("/price_books/today", null, "GET");
  },

  /**
   * Fetches all product rules associated with a specific Price Book.
   * @param {number} pricebookId - The ID of the parent Price Book.
   */
  async getProductRules(pricebookId) {
    return await makeRequest(`/price_books/${pricebookId}/rules`, null, "GET");
  },

  /**
   * Creates a new product rule for a Price Book (from the modal).
   * @param {number} pricebookId - The ID of the parent Price Book.
   * @param {object} data - { productId, priceType, priceValue, visibility, ... }
   */
  async createProductRule(pricebookId, data) {
    return await makeRequest(`/price_books/${pricebookId}/rules`, data, "POST");
  },

  /**
   * Updates an existing product rule.
   * @param {number} pricebookId - The ID of the parent Price Book.
   * @param {number} ruleId - The ID of the specific rule to update.
   * @param {object} data - Updated rule data.
   */
  async updateProductRule(pricebookId, ruleId, data) {
    return await makeRequest(
      `/price_books/${pricebookId}/rules/${ruleId}`,
      data,
      "PUT"
    );
  },

  /**
   * Deletes a specific product rule.
   * @param {number} pricebookId - The ID of the parent Price Book.
   * @param {number} ruleId - The ID of the specific rule to delete.
   */
  async deleteProductRule(pricebookId, ruleId) {
    return await makeRequest(
      `/price_books/${pricebookId}/rules/${ruleId}`,
      null,
      "DELETE"
    );
  },

   /**
   * Bulk Import a specific PriceBook.
   * @param {number} pricebookId - The ID of the parent Price Book.
   */
  async bulkImport(formData) {
    return await makeRequest(`/price_books/rules/import`, formData, "POST");
  },
};
