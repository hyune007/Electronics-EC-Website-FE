import api from "../api";

const API = "/api/bill";
export const getBillsByCustomer = (customerId) =>
  api.get(`${API}/customer/${customerId}`);

export const requestReturnBill = (data) => 
  api.put(`${API}/request-return`, data);
