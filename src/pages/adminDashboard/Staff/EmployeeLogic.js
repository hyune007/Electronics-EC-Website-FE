import { useMemo, useState } from "react";
import { mockEmployee } from "../../../mocks/mockEmployee.js";

export function useEmployeeLogic() {
    const [employees, setEmployees] = useState(mockEmployee);
    const [search, setSearch] = useState("");
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState(null);

    const emptyForm = {
        nv_id: "",
        nv_name: "",
        nv_password: "",
        nv_phone: "",
        nv_mail: "",
        nv_address: "",
        nv_birth: "",
        nv_role: "STAFF"
    };

    const [form, setForm] = useState(emptyForm);

    /* ================= FILTER ================= */
    const filteredEmployees = useMemo(() => {
        const key = search.toLowerCase().trim();
        return employees.filter(e =>
            e.nv_name.toLowerCase().includes(key) ||
            e.nv_phone.includes(key)
        );
    }, [employees, search]);

    /* ================= ADD ================= */
    const openAdd = () => {
        setEditing(null);
        setForm({ ...emptyForm });
        setOpenForm(true);
    };

    /* ================= EDIT ================= */
    const openEdit = (employee) => {
        setEditing(employee);
        setForm({
            ...employee,
            nv_password: "" // không show password cũ
        });
        setOpenForm(true);
    };

    /* ================= SUBMIT ================= */
    const handleSubmit = () => {
        if (editing) {
            setEmployees(employees.map(e =>
                e.nv_id === editing.nv_id
                    ? {
                        ...e,
                        ...form,
                        nv_password: form.nv_password || e.nv_password
                    }
                    : e
            ));
        } else {
            setEmployees([...employees, form]);
        }
        setOpenForm(false);
    };

    /* ================= DELETE ================= */
    const handleDelete = (id) => {
        if (confirm("Xóa nhân viên này?")) {
            setEmployees(employees.filter(e => e.nv_id !== id));
        }
    };

    return {
        search, setSearch,
        openForm, setOpenForm,
        form, setForm,
        filteredEmployees,
        openAdd, openEdit,
        handleSubmit,
        handleDelete
    };
}
