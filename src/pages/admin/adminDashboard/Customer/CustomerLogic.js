import { useEffect, useMemo, useState, useCallback } from "react";
import {
    getAllCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
} from "../../../../services/customerService.js";
import { showToast } from "../../../../utils/adminToast";
import { generateSmartNextId } from "../../../../utils/codeGenerator";

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
    const [sortBy, setSortBy] = useState("newest");
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 12;


    const emptyForm = {
        kh_id: null,
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
        // Defer the call to avoid synchronous setState inside the effect
        const t = setTimeout(() => fetchCustomers(), 0);
        return () => clearTimeout(t);
     }, [fetchCustomers]);

    /* ================= FILTER ================= */
    const filteredCustomers = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        return customers.filter(c =>
            c.kh_name.toLowerCase().includes(keyword) ||
            c.kh_phone.includes(keyword) ||
            c.kh_mail.toLowerCase().includes(keyword) ||
            c.kh_id.toLowerCase().includes(keyword)
        );
    }, [customers, search]);

    const sortedCustomers = useMemo(() => {
        const getIdNumber = (value) => {
            const match = String(value || "").match(/(\d+)$/);
            return match ? Number(match[1]) : 0;
        };

        const list = [...filteredCustomers];
        list.sort((a, b) => {
            switch (sortBy) {
                case "oldest":
                    return getIdNumber(a.kh_id) - getIdNumber(b.kh_id);
                case "name_az":
                    return a.kh_name.localeCompare(b.kh_name, "vi", { sensitivity: "base" });
                case "name_za":
                    return b.kh_name.localeCompare(a.kh_name, "vi", { sensitivity: "base" });
                case "email_az":
                    return a.kh_mail.localeCompare(b.kh_mail, "vi", { sensitivity: "base" });
                case "newest":
                default:
                    return getIdNumber(b.kh_id) - getIdNumber(a.kh_id);
            }
        });

        return list;
    }, [filteredCustomers, sortBy]);

    /* ================= PAGINATION ================= */
    const paginatedCustomers = useMemo(() => {
        const startIndex = currentPage * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedCustomers.slice(startIndex, endIndex);
    }, [sortedCustomers, currentPage]);

    const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage);

    const stats = useMemo(() => {
        const completedProfiles = customers.filter((item) =>
            [item.kh_name, item.kh_phone, item.kh_mail].every((v) => String(v || "").trim().length > 0)
        ).length;

        const completionRate = customers.length > 0
            ? Math.round((completedProfiles / customers.length) * 100)
            : 0;

        return {
            total: customers.length,
            matched: sortedCustomers.length,
            pageTotal: paginatedCustomers.length,
            completionRate,
        };
    }, [customers, sortedCustomers.length, paginatedCustomers.length]);

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
        // Defer setState to next tick to avoid cascading render warning
        const t = setTimeout(() => setCurrentPage(0), 0);
        return () => clearTimeout(t);
     }, [search]);

    /* ================= SUBMIT ================= */
    const handleSubmit = async () => {
        console.log("Customer form data before validation:", form);
        
        // Validate required fields
        if (!form.kh_name || !form.kh_name.trim()) {
            showToast("Vui lòng nhập họ tên khách hàng", "warning");
            return;
        }
        
        if (!form.kh_password || !form.kh_password.trim()) {
            showToast("Vui lòng nhập mật khẩu", "warning");
            return;
        }
        
        if (!form.kh_phone || !form.kh_phone.trim()) {
            showToast("Vui lòng nhập số điện thoại", "warning");
            return;
        }
        
        if (!form.kh_mail || !form.kh_mail.trim()) {
            showToast("Vui lòng nhập email", "warning");
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.kh_mail)) {
            showToast("Định dạng email không hợp lệ", "warning");
            return;
        }
        
        const payload = {
            kh_id: form.kh_id,
            kh_name: form.kh_name.trim(),
            kh_password: form.kh_password.trim(),
            kh_phone: form.kh_phone.trim(),
            kh_mail: form.kh_mail.trim(),
            kh_role_id: form.kh_role || "ROLE_CUSTOMER",
        };
        
        console.log("Customer payload after validation:", payload);

        try {
            if (editing) {
                // UPDATE → cần id
                await updateCustomer(editing.kh_id, {
                    ...payload,
                    kh_id: editing.kh_id,
                });
            } else {
                await createCustomer(payload);
            }

            setOpenForm(false);
            
            // Clear cache and reload
            clearCustomerCache();
            await fetchCustomers();
            showToast(editing ? "Cập nhật khách hàng thành công" : "Thêm khách hàng thành công", "success");
        } catch (err) {
            console.error("Lỗi lưu khách hàng:", err);
            showToast(editing ? "Cập nhật khách hàng thất bại: " + err.message : "Thêm khách hàng thất bại: " + err.message, "error", 3400);
        }
    };


    /* ================= DELETE ================= */
    const handleDelete = async (id) => {
        if (window.confirm("Xóa khách hàng này?")) {
            try {
                await deleteCustomer(id);
                
                // Clear cache and reload
                clearCustomerCache();
                await fetchCustomers();
                showToast("Xóa khách hàng thành công", "success");
            } catch (err) {
                console.error("Delete customer failed:", err);
                showToast("Xóa khách hàng thất bại: " + (err.message || ""), "error", 3400);
            }
        }
    };

    return {
        search,
        setSearch,
        sortBy,
        setSortBy,
        stats,
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
            const nextId = generateSmartNextId(customers.map((item) => item.kh_id), "KH", 3);
            setForm({ ...emptyForm, kh_id: nextId });
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
