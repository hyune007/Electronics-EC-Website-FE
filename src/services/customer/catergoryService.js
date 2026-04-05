import api from "../api";

const API = "/api/product-category";

export const getCategories = (params) => api.get(`${API}/all`, { params });

export const getCategoryById = (id) => api.get(`${API}/${id}`);
