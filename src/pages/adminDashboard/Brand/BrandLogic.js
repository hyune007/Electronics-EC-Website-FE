import { useMemo, useState } from "react";
import { mockBrands } from "../../../mocks/mockBrands.js";

export function useBrandLogic() {
    const [brands, setBrands] = useState(mockBrands);
    const [search, setSearch] = useState("");
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState(null);

    const [form, setForm] = useState({
        hang_id: "",
        hang_name: ""
    });

    const filteredBrands = useMemo(() => {
        return brands.filter(b =>
            b.hang_name.toLowerCase().includes(search.toLowerCase())
        );
    }, [brands, search]);

    const openAdd = () => {
        setEditing(null);
        setForm({ hang_id: "", hang_name: "" });
        setOpenForm(true);
    };

    const openEdit = (brand) => {
        setEditing(brand);
        setForm(brand);
        setOpenForm(true);
    };

    const handleSubmit = () => {
        if (!form.hang_id || !form.hang_name) return;

        if (editing) {
            setBrands(brands.map(b =>
                b.hang_id === editing.hang_id ? form : b
            ));
        } else {
            setBrands([...brands, form]);
        }
        setOpenForm(false);
    };

    const handleDelete = (id) => {
        if (confirm("Xóa hãng này?")) {
            setBrands(brands.filter(b => b.hang_id !== id));
        }
    };

    return {
        search, setSearch,
        openForm, setOpenForm,
        editing,
        form, setForm,
        filteredBrands,
        openAdd, openEdit,
        handleSubmit,
        handleDelete
    };
}
