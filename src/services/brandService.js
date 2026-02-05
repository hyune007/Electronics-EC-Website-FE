const API_URL = "http://localhost:8080/api/brand";

export async function getAllBrands() {
    const res = await fetch(`${API_URL}/all`);
    if (!res.ok) throw new Error("Không lấy được danh sách hãng");

    const data = await res.json();

    // MAP BE → FE
    return data.map(b => ({
        hang_id: b.id,
        hang_name: b.name
    }));
}

export async function createBrand(brand) {
    const res = await fetch(`${API_URL}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: brand.hang_id,
            name: brand.hang_name
        })
    });

    if (!res.ok) throw new Error("Thêm hãng thất bại");
    return res.json();
}

export async function updateBrand(id, brand) {
    const res = await fetch(`${API_URL}/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id,
            name: brand.hang_name
        })
    });

    if (!res.ok) throw new Error("Cập nhật thất bại");
}

export async function deleteBrand(id) {
    const res = await fetch(`${API_URL}/delete/${id}`, {
        method: "DELETE"
    });

    if (!res.ok) throw new Error("Xóa thất bại");
}
