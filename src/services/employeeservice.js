const API_URL = "http://localhost:8080/api/employees";
// const API_URL = "https://ec-website-be-312564370609.asia-southeast1.run.app/api/employees";

// Helper to get auth token
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
    };
}

/* ================= GET ALL ================= */
export async function getAllEmployees(page = 0, search = "") {
    const res = await fetch(`${API_URL}/all?p=${page}&q=${search}`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Không lấy được danh sách nhân viên");

    const data = await res.json();

    // MAP BE → FE (null-safe)
    return {
        employees: data.content.map(e => ({
            nv_id: e.id ?? "",
            nv_name: e.name ?? "",
            nv_password: "",
            nv_phone: e.phone ?? "",
            nv_mail: e.email ?? "",
            nv_address: e.address ?? "",
            nv_birth: e.birthday
                ? new Date(e.birthday).toISOString().slice(0, 10)
                : "",
            nv_role: e.role?.id ?? "ROLE_STAFF",
            nv_role_name: e.role?.name ?? ""
        })),
        totalPages: data.totalPages ?? 0,
        currentPage: data.number ?? 0
    };
}

/* ================= CREATE ================= */
export async function createEmployee(emp) {
    const payload = {
        id: emp.nv_id, // Luôn gửi ID
        name: emp.nv_name,
        password: emp.nv_password,
        phone: emp.nv_phone,
        email: emp.nv_mail,
        address: emp.nv_address,
        birthday: emp.nv_birth ? new Date(emp.nv_birth).toISOString() : null,
        role: {
            id: emp.nv_role
        }
    };

    const res = await fetch(`${API_URL}/save`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const err = await res.text();
        console.error("API Error:", err);
        throw new Error("Thêm nhân viên thất bại: " + err);
    }

    return res.json();
}

/* ================= UPDATE ================= */
export async function updateEmployee(id, emp) {
    const payload = {
        id,
        name: emp.nv_name,
        password: emp.nv_password || undefined,
        phone: emp.nv_phone,
        email: emp.nv_mail,
        address: emp.nv_address,
        birthday: emp.nv_birth ? new Date(emp.nv_birth).toISOString() : null,
        role: {
            id: emp.nv_role
        }
    };

    const res = await fetch(`${API_URL}/update/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const err = await res.text();
        console.error("API Error:", err);
        throw new Error("Cập nhật nhân viên thất bại");
    }
}

/* ================= DELETE ================= */
export async function deleteEmployee(id) {
    const res = await fetch(`${API_URL}/delete/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });

    if (!res.ok) {
        const err = await res.text();
        console.error("API Error:", err);
        throw new Error("Xóa nhân viên thất bại");
    }
}