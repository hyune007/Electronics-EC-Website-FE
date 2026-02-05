import { useEffect, useMemo, useState } from "react";
import {
    getAllBrands,
    createBrand,
    updateBrand,
    deleteBrand,
} from "../../../../services/brandService";

export function useBrandLogic() {
    // ===== STATE =====
    const [brands, setBrands] = useState([]);
    const [search, setSearch] = useState("");
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        hang_id: "",
        hang_name: "",
    });

    // ===== LOAD DATA =====
    useEffect(() => {
        setLoading(true);
        getAllBrands()
            .then(setBrands)
            .catch((err) => {
                console.error(err);
                alert("Không tải được danh sách hãng");
            })
            .finally(() => setLoading(false));
    }, []);

    // ===== FILTER =====
    const filteredBrands = useMemo(() => {
        return brands.filter((b) =>
            b.hang_name.toLowerCase().includes(search.toLowerCase())
        );
    }, [brands, search]);

    // ===== OPEN FORM =====
    const openAdd = () => {
        setEditing(null);
        setForm({ hang_id: "", hang_name: "" });
        setOpenForm(true);
    };

    const openEdit = (brand) => {
        setEditing(brand);
        setForm({ ...brand });
        setOpenForm(true);
    };

    // ===== SUBMIT =====
    const handleSubmit = async () => {
        if (!form.hang_id || !form.hang_name) return;

        try {
            if (editing) {
                await updateBrand(editing.hang_id, form);
                setBrands((prev) =>
                    prev.map((b) =>
                        b.hang_id === editing.hang_id ? { ...form } : b
                    )
                );
            } else {
                const newBrand = await createBrand(form);
                setBrands((prev) => [
                    ...prev,
                    { hang_id: newBrand.id, hang_name: newBrand.name },
                ]);
            }
            setOpenForm(false);
        } catch (err) {
            console.error(err);
            alert("Lưu hãng thất bại");
        }
    };

    // ===== DELETE =====
    const handleDelete = async (id) => {
        if (!confirm("Xóa hãng này?")) return;

        try {
            await deleteBrand(id);
            setBrands((prev) => prev.filter((b) => b.hang_id !== id));
        } catch (err) {
            console.error(err);
            alert("Xóa thất bại");
        }
    };

    return {
        loading,
        search,
        setSearch,
        openForm,
        setOpenForm,
        editing,
        form,
        setForm,
        filteredBrands,
        openAdd,
        openEdit,
        handleSubmit,
        handleDelete,
    };
}
