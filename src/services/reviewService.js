import api from "./api";

export const getReviewsByProductId = (productId) =>
  api.get(`/api/review/product/${productId}`);
export const createReview = (payload) => api.post("/api/review/save", payload);
