import api, { apiGetCached, invalidateApiCache } from "./api";

const API = "/api/bill";

export const getAllBills = async () => {
  const data = await apiGetCached(`${API}/all`, {}, {
    cacheKey: "cache:api:bill:all",
    ttlMs: 10000,
  });
  return { data };
};

export const getBillsByCustomer = async (customerId) => {
  const data = await apiGetCached(`${API}/customer/${customerId}`, {}, {
    cacheKey: `cache:api:bill:customer:${customerId}`,
    ttlMs: 10000,
  });
  return { data };
};

export const getShippingFee = async (customerId, addressId) => {
  const data = await apiGetCached(`${API}/shipping-fee/${customerId}/${addressId}`, {}, {
    cacheKey: `cache:api:bill:shipping:${customerId}:${addressId}`,
    ttlMs: 15000,
  });
  return { data };
};

export const createBill = async ({ customerId, employeeId, addressId, paymentMethod }) => {
  const response = await api.post(`${API}/create`, null, {
    params: { customerId, employeeId, addressId, paymentMethod },
  });
  invalidateApiCache("cache:api:bill:");
  return response;
};

export const updateBill = async (id, status, employeeId) => {
  const response = await api.put(`${API}/update-status/${id}`, null, {
    params: { status, employeeId },
  });
  invalidateApiCache("cache:api:bill:");
  return response;
};

export const approveReturn = (billId) => {
  return api.put(`${API}/approve-return`, null, {
    params: { billId },
  });
};

export const rejectReturn = (billId) => {
  return api.put(`${API}/reject-return`, null, {
    params: { billId },
  });
};
