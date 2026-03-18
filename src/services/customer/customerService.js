import api, { apiGetCached, invalidateApiCache } from "../api";
const API_URL = "http://localhost:8080/api/customer";
// const API_URL = "https://ec-website-be-312564370609.asia-southeast1.run.app/api/customer";

export const getCustomerById = async (id) => {
  return apiGetCached(
    `${API_URL}/${id}`,
    {},
    {
      cacheKey: `cache:api:customer:detail:${id}`,
      ttlMs: 15000,
    },
  );
};
export const updateCustomerInfor = async (id, customer) => {
  const response = await api.put(`${API_URL}/update/${id}`, {
    id: id,
    name: customer.kh_name,
    phone: customer.kh_phone,
    email: customer.kh_mail,
    password: customer.kh_password,
    role: {
      id: customer.kh_role_id ?? "ROLE_CUSTOMER",
    },
  });

  invalidateApiCache("cache:api:customer:");

  return response.data;
};

export const changePassword = async (id, oldPassword, newPassword) => {
  const response = await api.put(`${API_URL}/update/${id}`, {
    id: id,
    oldPassword: oldPassword,
    password: newPassword,
    role: {
      id: "ROLE_CUSTOMER",
    },
  });

  invalidateApiCache("cache:api:customer:");

  return response.data;
};
