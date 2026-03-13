import { cachedGetJson, invalidateCacheByPrefix } from "../utils/requestCache";
import { CACHE_TTL } from "../utils/cachePolicy";
 const API_URL = "http://localhost:8080/api/brand";
//const API_URL = "https://ec-website-be-312564370609.asia-southeast1.run.app/api/brand";

// Helper to get auth token
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
    };
}

export async function getAllBrands() {
    try {
        const data = await cachedGetJson(`${API_URL}/all`, {
            headers: getAuthHeaders(),
            cacheKey: "cache:brand:all",
            ttlMs: CACHE_TTL.STATIC
        });
        // MAP BE → FE
        return data.map(b => ({
            hang_id: b.id,
            hang_name: b.name
        }));
    } catch (error) {
        throw error;
    }
}

export async function createBrand(brand) {
    const payload = {
        id: brand.hang_id, // Luôn gửi ID
        name: brand.hang_name
    };
    
    console.log("Creating brand with payload:", payload);
    
    const res = await fetch(`${API_URL}/save`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error("Backend error:", errorText);
        throw new Error(`Thêm hãng thất bại: ${errorText}`);
    }
    invalidateCacheByPrefix("cache:brand:");
    return res.json();
}

export async function updateBrand(id, brand) {
    const res = await fetch(`${API_URL}/update/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            id,
            name: brand.hang_name
        })
    });

    if (!res.ok) throw new Error("Cập nhật thất bại");
    invalidateCacheByPrefix("cache:brand:");
}

export async function deleteBrand(id) {
    const res = await fetch(`${API_URL}/delete/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });

    if (!res.ok) throw new Error("Xóa thất bại");
    invalidateCacheByPrefix("cache:brand:");
}
