import { useEffect, useMemo, useState } from "react";
import {
    getAllCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
} from "../../../../services/customerService";

export function useCustomerLogic() {
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState("");
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState(null);


    const emptyForm = {
        kh_id: "",
        kh_name: "",
        kh_password: "",
        kh_phone: "",
        kh_mail: "",
        kh_role: "ROLE_CUSTOMER",
    };

    const [form, setForm] = useState(emptyForm);

    /* ================= LOAD DATA ================= */
    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const data = await getAllCustomers();

            console.log("RAW API:", data);

            const mapped = data.map((c) => ({
                kh_id: c.kh_id,
                kh_name: c.kh_name,
                kh_phone: c.kh_phone,
                kh_mail: c.kh_mail,
                kh_password: c.kh_password,
                kh_role: c.kh_role
            }));

            setCustomers(mapped);
        } catch (e) {
            console.error("Fetch customers failed:", e);
        }
    };

    /* ================= FILTER ================= */
    const filteredCustomers = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        return customers.filter(c =>
            c.kh_name.toLowerCase().includes(keyword) ||
            c.kh_phone.includes(keyword)
        );
    }, [customers, search]);

    /* ================= SUBMIT ================= */
    const handleSubmit = async () => {
        const payload = {
            kh_id: form.kh_id,
            kh_name: form.kh_name,
            kh_password: form.kh_password,
            kh_phone: form.kh_phone,
            kh_mail: form.kh_mail,
            kh_role: "ROLE_CUSTOMER",
        };

        if (editing) {
            await updateCustomer(editing.kh_id, payload);
        } else {
            await createCustomer(payload);
        }

        setOpenForm(false);
        fetchCustomers();
    };

    /* ================= DELETE ================= */
    const handleDelete = async (id) => {
        if (window.confirm("Xóa khách hàng này?")) {
            await deleteCustomer(id);
            fetchCustomers();
        }
    };

    return {
        search,
        setSearch,
        openForm,
        setOpenForm,
        editing,
        form,
        setForm,
        filteredCustomers,
        openAdd: () => {
            setEditing(null);
            setForm(emptyForm);
            setOpenForm(true);
        },
        openEdit: (customer) => {
            setEditing(customer);
            setForm({ ...customer, kh_password: "" });
            setOpenForm(true);
        },
        handleSubmit,
        handleDelete,
    };
}
