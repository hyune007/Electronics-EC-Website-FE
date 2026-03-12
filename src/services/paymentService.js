import api, { apiGetCached } from "./api";

const API = "/api/payment/sepay";

export const createSePaySession = (billId) =>
  api.post(`${API}/session`, { billId });

export const getSePayStatus = async (billId) => {
  const data = await apiGetCached(`${API}/status/${billId}`, {}, {
    cacheKey: `cache:api:payment:status:${billId}`,
    ttlMs: 3000,
  });
  return { data };
};
