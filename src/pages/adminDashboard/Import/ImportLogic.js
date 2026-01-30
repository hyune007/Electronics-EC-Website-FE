import { useMemo, useState } from "react";
import { mockImport } from "../../../mocks/mockImports.js";

export function useImportLogic() {
    const [list, setList] = useState(mockImport);
    const [search, setSearch] = useState("");
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState(null);

    const emptyForm = {
        ip_id: "",
        sp_id: "",
        ip_quantity: "",
        ip_date: ""
    };

    const [form, setForm] = useState(emptyForm);

    /* ================= FILTER ================= */
    const filteredList = useMemo(() => {
        const keyword = search.toLowerCase().trim();
        return list.filter(i =>
            i.ip_id.toLowerCase().includes(keyword) ||
            i.sp_id.toLowerCase().includes(keyword)
        );
    }, [list, search]);

    /* ================= OPEN ADD ================= */
    const openAdd = () => {
        setEditing(null);
        setForm({ ...emptyForm });
        setOpenForm(true);
    };

    /* ================= OPEN EDIT ================= */
    const openEdit = (item) => {
        setEditing(item);
        setForm({ ...item });
        setOpenForm(true);
    };

    /* ================= SUBMIT ================= */
    const handleSubmit = () => {
        if (editing) {
            setList(list.map(i =>
                i.ip_id === editing.ip_id ? form : i
            ));
        } else {
            setList([...list, form]);
        }
        setOpenForm(false);
    };

    /* ================= DELETE ================= */
    const handleDelete = (id) => {
        if (window.confirm("Xóa phiếu import này?")) {
            setList(list.filter(i => i.ip_id !== id));
        }
    };

    return {
        search, setSearch,
        openForm, setOpenForm,
        form, setForm,
        filteredList,
        openAdd, openEdit,
        handleSubmit,
        handleDelete
    };
}
