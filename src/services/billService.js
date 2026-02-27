import api from "./api";

const API = "/api/bill";

export const getAllBills = () =>
  api.get(`${API}/all`);

export const getBillsByCustomer = (customerId) =>
  api.get(`${API}/customer/${customerId}`);

export const createBill = ({ customerId, employeeId, addressId, paymentMethod }) =>
  api.post(`${API}/create`, null, {
    params: { customerId, employeeId, addressId, paymentMethod },
  });

export const updateBill = (id, status) =>
  api.put(`${API}/update-status/${id}`, null, {
    params: { status },
  });
