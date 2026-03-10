import { decodeJwtPayload } from "../utils/jwt";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API_URL = `${API_BASE_URL}/api/customer`;

// Helper to get auth token
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
    };
}

async function parseError(res) {
    const raw = await res.text();
    if (!raw) return "";
    try {
        const parsed = JSON.parse(raw);
        return parsed?.message || parsed?.error || raw;
    } catch {
        return raw;
    }
}

function getCurrentRole() {
    const token = localStorage.getItem("authToken");
    const payload = decodeJwtPayload(token);
    return payload?.roleId || "UNKNOWN_ROLE";
}

/* ================= GET ALL ================= */
export async function getAllCustomers() {
    const res = await fetch(`${API_URL}/all`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) {
        const details = await parseError(res);
        if (res.status === 403) {
            throw new Error(`403: Bạn không có quyền xem danh sách khách hàng (role hiện tại: ${getCurrentRole()})`);
        }
        throw new Error(`Không lấy được danh sách khách hàng (${res.status}): ${details || "Không có chi tiết"}`);
    }

    const data = await res.json();

    // MAP BE → FE (null-safe)
    return data.map(c => ({
        kh_id: c.id ?? "",
        kh_name: c.name ?? "",
        kh_password: c.password ?? "",
        kh_phone: c.phone ?? "",
        kh_mail: c.email ?? "",
        kh_role_id: c.role?.id ?? "ROLE_CUSTOMER",
        kh_role_name: c.role?.name ?? "Khách hàng"
    }));
}

/* ================= CREATE ================= */
export async function createCustomer(customer) {
    const payload = {
        id: customer.kh_id,
        username: customer.kh_mail,
        name: customer.kh_name,
        password: customer.kh_password,
        phone: customer.kh_phone,
        email: customer.kh_mail,
        role: {
            id: customer.kh_role_id ?? "ROLE_CUSTOMER"
        }
    };
    
    console.log("Creating customer with payload:", payload);
    
    const res = await fetch(`${API_URL}/save`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const details = await parseError(res);
        console.error("Backend error:", details);
        if (res.status === 403) {
            throw new Error(`403: Không có quyền thêm khách hàng (role hiện tại: ${getCurrentRole()})`);
        }
        throw new Error(`Thêm khách hàng thất bại (${res.status}): ${details || "Không có chi tiết"}`);
    }
    return res.json();
}

/* ================= UPDATE ================= */
export async function updateCustomer(id, customer) {
    const res = await fetch(`${API_URL}/update/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            id,
            name: customer.kh_name,
            password: customer.kh_password,
            phone: customer.kh_phone,
            email: customer.kh_mail,
            role: {
                id: customer.kh_role_id ?? "ROLE_CUSTOMER"
            }
        })
    });

    if (!res.ok) {
        const details = await parseError(res);
        if (res.status === 403) {
            throw new Error(`403: Không có quyền cập nhật khách hàng (role hiện tại: ${getCurrentRole()})`);
        }
        throw new Error(`Cập nhật khách hàng thất bại (${res.status}): ${details || "Không có chi tiết"}`);
    }
}

/* ================= DELETE ================= */
export async function deleteCustomer(id) {
    const res = await fetch(`${API_URL}/delete/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });

    if (!res.ok) {
        const details = await parseError(res);
        if (res.status === 403) {
            throw new Error(`403: Chỉ Admin được quyền xóa khách hàng (role hiện tại: ${getCurrentRole()})`);
        }
        throw new Error(`Xóa khách hàng thất bại (${res.status}): ${details || "Không có chi tiết"}`);
    }
}
