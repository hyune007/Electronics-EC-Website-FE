import api from "../api";

const API = "/api/bill";
export const getBillsByCustomer = (customerId) =>
  api.get(`${API}/customer/${customerId}`);