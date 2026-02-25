const API_URL = "http://localhost:8080/api/customer";

// Helper to get auth token
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
    };
}

/* ================= GET ALL ================= */
export async function getAllCustomers() {
    const res = await fetch(`${API_URL}/all`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Không lấy được danh sách khách hàng");

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
    // Thử nhiều format khác nhau cho backend
    const payload = {
        id: customer.kh_id, // Luôn gửi ID
        username: customer.kh_mail, // Backend có thể dùng username = email
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
        const errorText = await res.text();
        console.error("Backend error:", errorText);
        throw new Error(`Thêm khách hàng thất bại: ${errorText}`);
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

    if (!res.ok) throw new Error("Cập nhật khách hàng thất bại");
}

/* ================= DELETE ================= */
export async function deleteCustomer(id) {
    const res = await fetch(`${API_URL}/delete/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });

    if (!res.ok) throw new Error("Xóa khách hàng thất bại");
}
