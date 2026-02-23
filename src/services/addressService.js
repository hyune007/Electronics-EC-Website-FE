const BASE_URL = "";

export const getProvinces = async () => {
  const res = await fetch(`${BASE_URL}/p`);
  return res.json();
};

export const getWardsByProvince = async (provinceCode) => {
  const res = await fetch(`${BASE_URL}/p/${provinceCode}?depth=2`);
  const data = await res.json();
  return data.wards;
};