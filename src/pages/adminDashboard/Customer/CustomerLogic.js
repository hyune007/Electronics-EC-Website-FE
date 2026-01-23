import { useMemo, useState } from "react";
import { mockCustomers } from "../../../mocks/mockCustomers.js";

export function useCustomerLogic() {
    const [customers, setCustomers] = useState(mockCustomers);
    const [search, setSearch] = useState("");
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState(null);

    const emptyForm = {
        kh_id: "",
        kh_name: "",
        kh_password: "",
        kh_phone: "",
        kh_mail: "",
        kh_role: "USER" // 🔒 khóa cứng
    };

    const [form, setForm] = useState(emptyForm);

    /* ================= FILTER ================= */
    const filteredCustomers = useMemo(() => {
        const keyword = search.toLowerCase().trim();
        return customers.filter(c =>
            c.kh_name.toLowerCase().includes(keyword) ||
            c.kh_phone.includes(keyword)
        );
    }, [customers, search]);

    /* ================= OPEN ADD ================= */
    const openAdd = () => {
        setEditing(null);
        setForm({ ...emptyForm }); // tránh reference
        setOpenForm(true);
    };

    /* ================= OPEN EDIT ================= */
    const openEdit = (customer) => {
        setEditing(customer);
        setForm({
            ...customer,
            kh_password: "",   // ⚠️ không show password cũ
            kh_role: "USER"    // 🔒 ép role
        });
        setOpenForm(true);
    };

    /* ================= SUBMIT ================= */
    const handleSubmit = () => {
        const submitData = {
            ...form,
            kh_role: "USER" // 🔒 luôn USER
        };

        if (editing) {
            setCustomers(customers.map(c =>
                c.kh_id === editing.kh_id
                    ? {
                        ...c,
                        ...submitData,
                        // nếu không nhập password mới thì giữ cũ
                        kh_password: submitData.kh_password || c.kh_password
                    }
                    : c
            ));
        } else {
            setCustomers([...customers, submitData]);
        }

        setOpenForm(false);
    };

    /* ================= DELETE ================= */
    const handleDelete = (id) => {
        if (window.confirm("Xóa khách hàng này?")) {
            setCustomers(customers.filter(c => c.kh_id !== id));
        }
    };

    return {
        search, setSearch,
        openForm, setOpenForm,
        editing,
        form, setForm,
        filteredCustomers,
        openAdd, openEdit,
        handleSubmit,
        handleDelete
    };
}
