import api from "../api";

const API = "/api/address";

export const getAddresses = (customerId) =>
  api.get(`${API}/customer/${customerId}`);

export const createAddress = (data) =>
  api.post(`${API}/save`, data);   

export const updateAddress = (id, data) =>
  api.put(`${API}/update/${id}`, data);

export const deleteAddress = (id) =>
  api.delete(`${API}/delete/${id}`); 



