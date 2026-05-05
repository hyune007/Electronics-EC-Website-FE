import { cachedGetJson, invalidateCacheByPrefix } from "../utils/requestCache";
import { CACHE_TTL } from "../utils/cachePolicy";
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/promotion`;
// const API_URL = "https://ec-website-be-312564370609.asia-southeast1.run.app/api/promotion";

function mapPromotion(p) {
    return {
        km_id: p.id,
        km_name: p.name,
        km_description: p.description,
        km_percent: p.discountPercentage,
        km_start_date: p.startDate,
        km_end_date: p.endDate
    };
}

function isPromotionActive(promotion) {
    const now = new Date();
    const start = promotion?.km_start_date ? new Date(promotion.km_start_date) : null;
    const end = promotion?.km_end_date ? new Date(promotion.km_end_date) : null;

    if (start && !Number.isNaN(start.getTime()) && now < start) return false;
    if (end && !Number.isNaN(end.getTime()) && now > end) return false;
    return true;
}

// Helper to get auth token
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
    };
}

export async function getAllPromotions() {
    try {
        const data = await cachedGetJson(`${API_URL}/all`, {
            headers: getAuthHeaders(),
            cacheKey: "cache:promotion:all",
            ttlMs: CACHE_TTL.LONG
        });

        // MAP BE → FE
        return data.map(mapPromotion);
    } catch (error) {
        console.error("Get all promotions failed:", error);
        throw error;
    }
}

export async function getAllActivePromotions() {
    try {
        const data = await cachedGetJson(`${API_URL}/active`, {
            headers: getAuthHeaders(),
            cacheKey: "cache:promotion:active",
            ttlMs: CACHE_TTL.LONG
        });

        // MAP BE → FE
        return data.map(mapPromotion);
    } catch (error) {
        // Some BE branches do not expose /active yet.
        if (error?.status === 404) {
            const all = await getAllPromotions();
            return all.filter(isPromotionActive);
        }
        console.error("Get all promotions failed:", error);
        throw error;
    }
}

export async function getPromotionById(id) {
    try {
        const data = await cachedGetJson(`${API_URL}/${id}`, {
            headers: getAuthHeaders(),
            cacheKey: `cache:promotion:detail:${id}`,
            ttlMs: CACHE_TTL.VERY_LONG
        });
        
        return {
            km_id: data.id,
            km_name: data.name,
            km_description: data.description,
            km_percent: data.discountPercentage,
            km_start_date: data.startDate,
            km_end_date: data.endDate
        };
    } catch (error) {
        console.error("Get promotion by ID failed:", error);
        throw error;
    }
}

export async function createPromotion(promotion) {
    try {
        const res = await fetch(`${API_URL}/save`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                id: promotion.km_id,
                name: promotion.km_name,
                description: promotion.km_description,
                discountPercentage: parseInt(promotion.km_percent),
                startDate: new Date(promotion.km_start_date).toISOString(),
                endDate: new Date(promotion.km_end_date).toISOString()
            })
        });

        if (!res.ok) {
            const error = await res.text();
            throw new Error(error || "Thêm voucher thất bại");
        }

        const data = await res.json();
        invalidateCacheByPrefix("cache:promotion:");
        return {
            km_id: data.id,
            km_name: data.name,
            km_description: data.description,
            km_percent: data.discountPercentage,
            km_start_date: data.startDate,
            km_end_date: data.endDate
        };
    } catch (error) {
        console.error("Create promotion failed:", error);
        throw error;
    }
}

export async function updatePromotion(id, promotion) {
    try {
        const res = await fetch(`${API_URL}/update/${id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                id: promotion.km_id,
                name: promotion.km_name,
                description: promotion.km_description,
                discountPercentage: parseInt(promotion.km_percent),
                startDate: new Date(promotion.km_start_date).toISOString(),
                endDate: new Date(promotion.km_end_date).toISOString()
            })
        });

        if (!res.ok) {
            const error = await res.text();
            throw new Error(error || "Cập nhật voucher thất bại");
        }

        const data = await res.json();
        invalidateCacheByPrefix("cache:promotion:");
        return {
            km_id: data.id,
            km_name: data.name,
            km_description: data.description,
            km_percent: data.discountPercentage,
            km_start_date: data.startDate,
            km_end_date: data.endDate
        };
    } catch (error) {
        console.error("Update promotion failed:", error);
        throw error;
    }
}

export async function deletePromotion(id) {
    try {
        const res = await fetch(`${API_URL}/delete/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            throw new Error("Xóa voucher thất bại");
        }

        invalidateCacheByPrefix("cache:promotion:");
        return true;
    } catch (error) {
        console.error("Delete promotion failed:", error);
        throw error;
    }
}