import api, { apiGetCached, invalidateApiCache } from "./api";

export const getReviewsByProductId = async (productId) => {
  const data = await apiGetCached(`/api/review/product/${productId}`, {}, {
    cacheKey: `cache:api:review:product:${productId}`,
    ttlMs: 15000,
  });
  return { data };
};

export const createReview = async (payload) => {
  const response = await api.post("/api/review/save", payload);
  invalidateApiCache("cache:api:review:");
  return response;
};
