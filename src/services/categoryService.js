import { cachedGetJson, invalidateCacheByPrefix } from "../utils/requestCache";
import { CACHE_TTL } from "../utils/cachePolicy";
// const API_URL = "http://localhost:8080/api/product-category";
const API_URL = "https://ec-website-be-312564370609.asia-southeast1.run.app/api/product-category";

// Helper to get auth token
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
    };
}

/* ================= GET ALL CATEGORIES ================= */
export async function getAllCategories() {
    try {
        const data = await cachedGetJson(`${API_URL}/all`, {
            headers: getAuthHeaders(),
            cacheKey: "cache:category:all",
            ttlMs: CACHE_TTL.STATIC
        });

        // MAP BE → FE
        return data.map(c => ({
            dm_id: c.id,
            dm_name: c.name,
            dm_description: c.description || ""
        }));
    } catch (error) {
        console.error("Get all categories failed:", error);
        throw error;
    }
}

/* ================= GET CATEGORY BY ID ================= */
export async function getCategoryById(id) {
    try {
        const data = await cachedGetJson(`${API_URL}/${id}`, {
            headers: getAuthHeaders(),
            cacheKey: `cache:category:detail:${id}`,
            ttlMs: CACHE_TTL.VERY_LONG
        });
        
        return {
            dm_id: data.id,
            dm_name: data.name,
            dm_description: data.description || ""
        };
    } catch (error) {
        console.error("Get category by ID failed:", error);
        throw error;
    }
}

/* ================= CREATE CATEGORY ================= */
export async function createCategory(category) {
    try {
        const res = await fetch(`${API_URL}/save`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                id: category.dm_id,
                name: category.dm_name,
                description: category.dm_description || null
            })
        });

        if (!res.ok) {
            const error = await res.text();
            throw new Error(error || "Thêm danh mục thất bại");
        }

        const data = await res.json();
        invalidateCacheByPrefix("cache:category:");
        return {
            dm_id: data.id,
            dm_name: data.name,
            dm_description: data.description || ""
        };
    } catch (error) {
        console.error("Create category failed:", error);
        throw error;
    }
}

/* ================= UPDATE CATEGORY ================= */
export async function updateCategory(id, category) {
    try {
        const res = await fetch(`${API_URL}/update/${id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                id: category.dm_id || id,
                name: category.dm_name,
                description: category.dm_description || null
            })
        });

        if (!res.ok) {
            const error = await res.text();
            throw new Error(error || "Cập nhật danh mục thất bại");
        }

        const data = await res.json();
        invalidateCacheByPrefix("cache:category:");
        return {
            dm_id: data.id,
            dm_name: data.name,
            dm_description: data.description || ""
        };
    } catch (error) {
        console.error("Update category failed:", error);
        throw error;
    }
}

/* ================= DELETE CATEGORY ================= */
export async function deleteCategory(id) {
    try {
        const res = await fetch(`${API_URL}/delete/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            throw new Error("Xóa danh mục thất bại");
        }

    invalidateCacheByPrefix("cache:category:");
        return true;
    } catch (error) {
        console.error("Delete category failed:", error);
        throw error;
    }
}
