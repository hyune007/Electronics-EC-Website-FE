import api from "./api";

const API = "/api/bill";

export const getAllBills = () =>
  api.get(`${API}/all`);

export const getBillsByCustomer = (customerId) =>
  api.get(`${API}/customer/${customerId}`);

export const createBill = (data) =>
  api.post(`${API}/create`, data);   

export const updateBill = (id, status) =>
  api.put(`${API}/update-status/${id}?status=${encodeURIComponent(status)}`);
