import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api/product-category",
});

export const getCategories = (params) =>
  API.get("/all", { params });

export const getCategoryById = (id) =>
  API.get(`/${id}`);
