import api, { apiGetCached, invalidateApiCache } from "../api";

const API = "/api/shopping-cart";

export const getCartByCustomer = async (customerId) => {
  const data = await apiGetCached(`${API}/customer/${customerId}`, {}, {
    cacheKey: `cache:api:cart:customer:${customerId}`,
    ttlMs: 5000,
  });
  return { data };
};

export const createCartItem = async (data) => {
  const response = await api.post(`${API}/save`, data);
  invalidateApiCache("cache:api:cart:");
  return response;
};

export const updateCartItem = async (id, data) => {
  const response = await api.put(`${API}/update/${id}`, data);
  invalidateApiCache("cache:api:cart:");
  return response;
};

export const deleteCartItem = async (id) => {
  const response = await api.delete(`${API}/delete/${id}`);
  invalidateApiCache("cache:api:cart:");
  return response;
};
