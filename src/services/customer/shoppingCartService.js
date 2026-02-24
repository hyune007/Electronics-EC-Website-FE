import api from "../api";

const API = "/api/shopping-cart";

export const getCartByCustomer = (customerId) =>
  api.get(`${API}/customer/${customerId}`);

export const createCartItem = (data) => api.post(`${API}/save`, data);

export const updateCartItem = (id, data) =>
  api.put(`${API}/update/${id}`, data);

export const deleteCartItem = (id) => api.delete(`${API}/delete/${id}`);
