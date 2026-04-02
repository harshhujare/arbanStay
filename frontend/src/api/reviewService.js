import apiClient from "./config";

const BASE = "/reviews";

/**
 * Get all reviews for a property
 */
export const getReviews = (propertyId) =>
  apiClient.get(`${BASE}/${propertyId}`);

/**
 * Create a review for a property
 */
export const createReview = (propertyId, { rating, comment }) =>
  apiClient.post(`${BASE}/${propertyId}`, { rating, comment });

/**
 * Delete a review (own review or admin)
 */
export const deleteReview = (reviewId) =>
  apiClient.delete(`${BASE}/${reviewId}`);

export default { getReviews, createReview, deleteReview };
