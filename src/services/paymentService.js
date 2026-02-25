import api from "./api";

const API = "/api/payment/sepay";

export const createSePaySession = (billId) =>
  api.post(`${API}/session`, { billId });

export const getSePayStatus = (billId) =>
  api.get(`${API}/status/${billId}`);
