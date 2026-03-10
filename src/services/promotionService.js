 const API_URL = "http://localhost:8080/api/promotion";
//const API_URL = "https://ec-website-be-312564370609.asia-southeast1.run.app/api/promotion";

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
        const res = await fetch(`${API_URL}/all`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error("Không lấy được danh sách voucher");

        const data = await res.json();

        // MAP BE → FE
        return data.map(p => ({
            km_id: p.id,
            km_name: p.name,
            km_description: p.description,
            km_percent: p.discountPercentage,
            km_start_date: p.startDate,
            km_end_date: p.endDate
        }));
    } catch (error) {
        console.error("Get all promotions failed:", error);
        throw error;
    }
}

export async function getPromotionById(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error("Không tìm thấy voucher");

        const data = await res.json();
        
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

        return true;
    } catch (error) {
        console.error("Delete promotion failed:", error);
        throw error;
    }
}