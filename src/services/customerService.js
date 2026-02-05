const API_URL = "http://localhost:8080/api/customer";

/* ================= GET ALL ================= */
export async function getAllCustomers() {
    const res = await fetch(`${API_URL}/all`);
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
    const res = await fetch(`${API_URL}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: customer.kh_id,
            name: customer.kh_name,
            password: customer.kh_password,
            phone: customer.kh_phone,
            email: customer.kh_mail,
            role: {
                id: customer.kh_role_id ?? "ROLE_CUSTOMER"
            }
        })
    });

    if (!res.ok) throw new Error("Thêm khách hàng thất bại");
    return res.json();
}

/* ================= UPDATE ================= */
export async function updateCustomer(id, customer) {
    const res = await fetch(`${API_URL}/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
        method: "DELETE"
    });

    if (!res.ok) throw new Error("Xóa khách hàng thất bại");
}
