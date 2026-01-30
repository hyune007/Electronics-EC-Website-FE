import { useMemo, useState } from "react";
import { mockVouchers } from "../../../../mocks/mockVouchers.js";

export function useVoucherLogic() {
    const [vouchers, setVouchers] = useState(mockVouchers);
    const [search, setSearch] = useState("");
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState(null);

    const emptyForm = {
        km_id: "",
        km_name: "",
        km_description: "",
        km_percent: "",
        km_start_date: "",
        km_end_date: ""
    };

    const [form, setForm] = useState(emptyForm);

    /* ================= FILTER ================= */
    const filteredVouchers = useMemo(() => {
        const keyword = search.toLowerCase().trim();
        return vouchers.filter(v =>
            v.km_name.toLowerCase().includes(keyword)
        );
    }, [vouchers, search]);

    /* ================= OPEN ADD ================= */
    const openAdd = () => {
        setEditing(null);
        setForm({ ...emptyForm });
        setOpenForm(true);
    };

    /* ================= OPEN EDIT ================= */
    const openEdit = (voucher) => {
        setEditing(voucher);
        setForm({ ...voucher });
        setOpenForm(true);
    };

    /* ================= SUBMIT ================= */
    const handleSubmit = () => {
        if (editing) {
            setVouchers(vouchers.map(v =>
                v.km_id === editing.km_id ? form : v
            ));
        } else {
            setVouchers([...vouchers, form]);
        }
        setOpenForm(false);
    };

    /* ================= DELETE ================= */
    const handleDelete = (id) => {
        if (window.confirm("Xóa voucher này?")) {
            setVouchers(vouchers.filter(v => v.km_id !== id));
        }
    };

    return {
        search, setSearch,
        openForm, setOpenForm,
        form, setForm,
        filteredVouchers,
        openAdd, openEdit,
        handleSubmit,
        handleDelete
    };
}
