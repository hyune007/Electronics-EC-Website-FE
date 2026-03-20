import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api/product",
  // baseURL: "https://ec-website-be-312564370609.asia-southeast1.run.app/api/product",
});

export const getProducts = (params) => API.get("/all", { params });

const productCache = new Map();

export const getProductById = (id, { force = false } = {}) => {
  if (!id) {
    return Promise.reject(new Error("Product id is required"));
  }

  if (!force && productCache.has(id)) {
    return Promise.resolve(productCache.get(id));
  }

  const request = API.get(`/detail/${id}`)
    .then((res) => {
      productCache.set(id, res);
      return res;
    })
    .catch((error) => {
      productCache.delete(id);
      throw error;
    });

  productCache.set(id, request);
  return request;
};

export const invalidateProductCache = (id) => {
  if (id) productCache.delete(id);
  else productCache.clear();
};

