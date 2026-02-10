// src/services/productService.js

// Sau này BE làm xong chỉ việc sửa file này
export const getAllProducts = async () => {
    // MOCK TẠM
    const { MOCK_PRODUCTS } = await import("../mocks/mockProducts");
    return MOCK_PRODUCTS;

    // SAU NÀY BE
    // const res = await fetch("http://localhost:8080/api/products");
    // return res.json();
};


