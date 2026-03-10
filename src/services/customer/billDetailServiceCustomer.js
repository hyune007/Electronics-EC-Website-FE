import api from "../api";

const API = "/api/detail-bill";
export const getBillDetails = (billId) =>
  api.get(`${API}/bill/${billId}`);