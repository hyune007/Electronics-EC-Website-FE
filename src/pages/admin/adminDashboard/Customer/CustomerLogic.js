import { useEffect, useMemo, useState } from "react";
import {
    getAllCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
} from "../../../../services/customerService";
import { generateNextCustomerId } from "../../../../utils/codeGenerator";

// Cache helpers
const CACHE_KEY = "customer_data";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function getCachedCustomers() {
    try {
        const data = localStorage.getItem(CACHE_KEY);
        if (!data) return null;

        const parsed = JSON.parse(data);
        const now = Date.now();

        // Check if cache is still valid
        if (now - parsed.timestamp > CACHE_DURATION) {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }

        return parsed.customers;
    } catch (err) {
        console.error("Error reading cache:", err);
        return null;
    }
}

function setCachedCustomers(customers) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            customers,
            timestamp: Date.now()
        }));
    } catch (err) {
        console.error("Error writing cache:", err);
    }
}

function clearCustomerCache() {
    try {
        localStorage.removeItem(CACHE_KEY);
    } catch (err) {
        console.error("Error clearing cache:", err);
    }
}

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
    const fetchCustomers = useCallback(async () => {
        try {
            // Try localStorage cache first
            const cachedCustomers = getCachedCustomers();
            if (cachedCustomers) {
                console.log("Loading customers from cache...");
                setCustomers(cachedCustomers);
                return;
            }

            console.log("Fetching customers from API...");
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

            // Cache the data
            setCachedCustomers(mapped);
            setCustomers(mapped);
        } catch (e) {
            console.error("Fetch customers failed:", e);
        }
    }, []);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    /* ================= FILTER ================= */
    const filteredCustomers = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        return customers.filter(c =>
            c.kh_name.toLowerCase().includes(keyword) ||
            c.kh_phone.includes(keyword)
        );
    }, [customers, search]);

    /* ================= PAGINATION ================= */
    const paginatedCustomers = useMemo(() => {
        const startIndex = currentPage * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredCustomers.slice(startIndex, endIndex);
    }, [filteredCustomers, currentPage]);

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(0, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
    };

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(0);
    }, [search]);

    /* ================= SUBMIT ================= */
    const handleSubmit = async () => {
        console.log("Customer form data before validation:", form);

        // Validate required fields
        if (!form.kh_name || !form.kh_name.trim()) {
            alert("Vui lòng nhập họ tên khách hàng");
            return;
        }

        if (!editing && (!form.kh_password || !form.kh_password.trim())) {
            alert("Vui lòng nhập mật khẩu");
            return;
        }

        if (!form.kh_phone || !form.kh_phone.trim()) {
            alert("Vui lòng nhập số điện thoại");
            return;
        }

        if (!form.kh_mail || !form.kh_mail.trim()) {
            alert("Vui lòng nhập email");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.kh_mail)) {
            alert("Định dạng email không hợp lệ");
            return;
        }

        // Tự động generate ID nếu đang tạo mới
        let customerId = form.kh_id;
        if (!editing) {
            customerId = generateNextCustomerId(customers);
            console.log("Generated customer ID:", customerId);
        }

        const payload = {
            kh_id: customerId,
            kh_name: form.kh_name,
            kh_password: form.kh_password,
            kh_phone: form.kh_phone,
            kh_mail: form.kh_mail,
            kh_role_id: form.kh_role || "ROLE_CUSTOMER",
        };

        console.log("Customer payload after validation:", payload);

        try {
            if (editing) {
                // UPDATE → cần id
                await updateCustomer(editing.kh_id, payload);
            } else {
                // CREATE → GỬi ID đã generate
                await createCustomer(payload);
            }

            setOpenForm(false);

            // Clear cache and reload
            clearCustomerCache();
            await fetchCustomers();
        } catch (err) {
            console.error("Lỗi lưu khách hàng:", err);
            alert(editing ? "Cập nhật khách hàng thất bại: " + err.message : "Thêm khách hàng thất bại: " + err.message);
        }
    };


    /* ================= DELETE ================= */
    const handleDelete = async (id) => {
        if (window.confirm("Xóa khách hàng này?")) {
            await deleteCustomer(id);

            // Clear cache and reload
            clearCustomerCache();
            await fetchCustomers();
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
        paginatedCustomers,
        currentPage,
        totalPages,
        itemsPerPage,
        handlePageChange,
        handlePreviousPage,
        handleNextPage,
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
