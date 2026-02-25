const API_URL = "http://localhost:8080/api/imports";
const BASE_URL = "http://localhost:8080";

// Helper to get auth token
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
    };
}

function resolveImageUrl(url, categoryId, productId) {
    if (!url || typeof url !== "string") {
        if (categoryId && productId) {
            return `${BASE_URL}/photos/products/${categoryId}/${productId}.jpg`;
        }
        return "";
    }
    let normalized = url.trim().replace(/\\/g, "/");

    if (normalized.startsWith("http://") || normalized.startsWith("https://")) return normalized;

    if (/^[A-Za-z]:\//.test(normalized)) {
        normalized = normalized.replace(/^[A-Za-z]:/, "");
    }

    const photosRootIndex = normalized.indexOf("/photos/");
    if (photosRootIndex >= 0) {
        return `${BASE_URL}${normalized.slice(photosRootIndex)}`;
    }

    const photosIndex = normalized.indexOf("photos/");
    if (photosIndex >= 0) {
        return `${BASE_URL}/${normalized.slice(photosIndex)}`;
    }

    if (normalized.startsWith("/")) return `${BASE_URL}${normalized}`;
    if (!normalized.includes("/") && categoryId) {
        return `${BASE_URL}/photos/products/${categoryId}/${normalized}`;
    }
    return `${BASE_URL}/${normalized}`;
}

/* ================= GET ALL ================= */
export async function getAllImports() {
    const res = await fetch(`${API_URL}/all`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Không lấy được danh sách nhập kho");

    return (await res.json()).map(i => ({
        nk_id: i.id ?? "",
        sp_id: i.product?.id ?? "",
        sp_name: i.product?.name ?? "",
        sp_brand: i.product?.brand?.name ?? "",
        sp_category: i.product?.category?.name ?? "",
        sp_price: i.product?.price ?? 0,
        sp_stock: i.product?.stock ?? 0,
        sp_image: resolveImageUrl(i.product?.image, i.product?.category?.id, i.product?.id),
        sp_description: i.product?.description ?? "",
        nk_quantity: i.quantity ?? 0,
        nk_date: i.importDate ? new Date(i.importDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
    }));
}

/* ================= CREATE ================= */
export async function createImport(importData) {
    const payload = {
        id: importData.nk_id || importData.id,
        quantity: Number(importData.nk_quantity),
        importDate: new Date(importData.nk_date).toISOString(),
        product: {
            id: importData.sp_id
        }
    };
    
    const res = await fetch(`${API_URL}/save`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error Response:", errorText);
        throw new Error(`Thêm nhập kho thất bại: ${errorText}`);
    }
    return res.json();
}

/* ================= UPDATE ================= */
export async function updateImport(id, importData) {
    const payload = {
        id,
        quantity: Number(importData.nk_quantity),
        importDate: new Date(importData.nk_date).toISOString(),
        product: {
            id: importData.sp_id
        }
    };
    
    const res = await fetch(`${API_URL}/update/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error Response:", errorText);
        throw new Error(`Cập nhật nhập kho thất bại: ${errorText}`);
    }
}

/* ================= DELETE ================= */
export async function deleteImport(id) {
    const res = await fetch(`${API_URL}/delete/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error Response:", errorText);
        throw new Error(`Xóa nhập kho thất bại: ${errorText}`);
    }
}
