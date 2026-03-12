import { cachedGetJson, invalidateCacheByPrefix } from "../utils/requestCache";
import { CACHE_TTL } from "../utils/cachePolicy";

 const API_URL = "http://localhost:8080/api/imports";
 const BASE_URL = "http://localhost:8080";
const IMPORT_CREATOR_MAP_KEY = "admin_import_creator_map_v1";
//const API_URL = "https://ec-website-be-312564370609.asia-southeast1.run.app/api/imports";
//const BASE_URL = "https://ec-website-be-312564370609.asia-southeast1.run.app";

function getImportCreatorMap() {
    try {
        const raw = localStorage.getItem(IMPORT_CREATOR_MAP_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return {};
        return parsed;
    } catch {
        return {};
    }
}

function setImportCreatorMap(map) {
    try {
        localStorage.setItem(IMPORT_CREATOR_MAP_KEY, JSON.stringify(map));
    } catch {
        // Ignore storage errors.
    }
}

export function getCreatorNameForImport(importId) {
    if (!importId) return "";
    const map = getImportCreatorMap();
    return map[importId] || "";
}

export function setCreatorNameForImport(importId, creatorName) {
    if (!importId || !creatorName) return;
    const map = getImportCreatorMap();
    map[importId] = creatorName;
    setImportCreatorMap(map);
}

export function removeCreatorNameForImport(importId) {
    if (!importId) return;
    const map = getImportCreatorMap();
    if (!map[importId]) return;
    delete map[importId];
    setImportCreatorMap(map);
}

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
    const data = await cachedGetJson(`${API_URL}/all`, {
        headers: getAuthHeaders(),
        cacheKey: "cache:import:all",
        ttlMs: CACHE_TTL.MEDIUM
    });

    return data.map(i => ({
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
        nk_date: i.importDate ? new Date(i.importDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        nk_creator:
            i.createdBy?.name ??
            i.createdByName ??
            i.creatorName ??
            getCreatorNameForImport(i.id ?? "") ??
            "",
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
        const err = new Error(`Thêm nhập kho thất bại: ${errorText}`);
        err.status = res.status;
        err.rawText = errorText;
        throw err;
    }
    invalidateCacheByPrefix("cache:import:");
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

    invalidateCacheByPrefix("cache:import:");
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

    invalidateCacheByPrefix("cache:import:");
}
