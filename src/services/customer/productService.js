import api from "../api";

const API = "/api/product";

export const getProducts = (params) => api.get(`${API}/all`, { params });

const productCache = new Map();

export const getProductById = (id, { force = false } = {}) => {
  if (!id) {
    return Promise.reject(new Error("Product id is required"));
  }

  if (!force && productCache.has(id)) {
    return Promise.resolve(productCache.get(id));
  }

  const request = api
    .get(`${API}/detail/${id}`)
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
