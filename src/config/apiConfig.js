const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ec-website-be-312564370609.asia-southeast1.run.app';

export const API_BASE_URL = BASE_URL;
export const IMAGE_BASE_URL = BASE_URL;

export const BRAND_API_URL = `${BASE_URL}/api/brand`;
export const PRODUCT_API_URL = `${BASE_URL}/api/product`;
export const IMPORT_API_URL = `${BASE_URL}/api/imports`;
export const PROMOTION_API_URL = `${BASE_URL}/api/promotion`;
export const CATEGORY_API_URL = `${BASE_URL}/api/product-category`;
export const CUSTOMER_API_URL = `${BASE_URL}/api/customer`;
export const EMPLOYEE_API_URL = `${BASE_URL}/api/employees`;
