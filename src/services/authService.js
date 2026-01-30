import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export async function login({ email, password }) {
  const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
    email,
    password,
  });
  return response.data;
}
export async function register({ name, email, password, phone }) {
  const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
    name,
    email,
    password,
    phone,
  });
  return response.data;
}

export async function fetchCustomerByEmail(email) {
  const safeEmail = encodeURIComponent(email);
  const response = await axios.get(`${API_BASE_URL}/api/customer/mail/${safeEmail}`);
  return response.data;
}
