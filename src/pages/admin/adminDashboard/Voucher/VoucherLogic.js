import { useMemo, useState, useEffect, useCallback } from "react";
import { getAllPromotions, createPromotion, updatePromotion, deletePromotion } from "../../../../services/promotionService";
import { showToast } from "../../../../utils/adminToast";

// Cache helpers
const CACHE_KEY = "voucher_data_api_v2"; // Changed to force reload from API
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function getCachedVouchers() {
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
        
        return parsed.vouchers;
    } catch (err) {
        console.error("Error reading cache:", err);
        return null;
    }
}

function setCachedVouchers(vouchers) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            vouchers,
            timestamp: Date.now()
        }));
    } catch (err) {
        console.error("Error writing cache:", err);
    }
}

function clearVoucherCache() {
    try {
        localStorage.removeItem(CACHE_KEY);
    } catch (err) {
        console.error("Error clearing cache:", err);
    }
}

export function useVoucherLogic() {
    const [vouchers, setVouchers] = useState([]);
    const [search, setSearch] = useState("");
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const itemsPerPage = 12;

    const emptyForm = {
        km_name: "",
        km_description: "",
        km_percent: "",
        km_start_date: "",
        km_end_date: ""
    };

    const [form, setForm] = useState(emptyForm);

    /* ================= LOAD DATA ================= */
    const loadVouchers = useCallback(async () => {
        // Try cache first
        const cachedVouchers = getCachedVouchers();
        if (cachedVouchers) {
            setVouchers(cachedVouchers);
            return;
        }

        // Load from API
        try {
            const data = await getAllPromotions();
            setVouchers(data);
            setCachedVouchers(data);
        } catch (error) {
            console.error("Failed to load vouchers:", error);
            showToast("Không thể tải danh sách voucher. Vui lòng kiểm tra kết nối API.", "error", 3400);
        }
    }, []);

    useEffect(() => {
        loadVouchers();
    }, [loadVouchers]);

    /* ================= FILTER ================= */
    const filteredVouchers = useMemo(() => {
        const keyword = search.toLowerCase().trim();
        return vouchers.filter(v =>
            v.km_name.toLowerCase().includes(keyword)
        );
    }, [vouchers, search]);

    /* ================= PAGINATION ================= */
    const paginatedVouchers = useMemo(() => {
        const startIndex = currentPage * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredVouchers.slice(startIndex, endIndex);
    }, [filteredVouchers, currentPage]);

    const totalPages = Math.ceil(filteredVouchers.length / itemsPerPage);

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

    /* ================= OPEN ADD ================= */
    const openAdd = async () => {
        setEditing(null);
        setForm(emptyForm);
        setOpenForm(true);
    };

    /* ================= OPEN EDIT ================= */
    const openEdit = (voucher) => {
        setEditing(voucher);
        setForm({ ...voucher });
        setOpenForm(true);
    };

    /* ================= SUBMIT ================= */
    const handleSubmit = async () => {
        if (!form.km_name || !form.km_name.trim()) {
            showToast("Vui lòng nhập tên voucher", "warning");
            return;
        }

        if (!form.km_description || !form.km_description.trim()) {
            showToast("Vui lòng nhập mô tả voucher", "warning");
            return;
        }

        if (!form.km_percent || Number(form.km_percent) <= 0 || Number(form.km_percent) > 100) {
            showToast("Phần trăm giảm phải trong khoảng 1-100", "warning");
            return;
        }

        if (!form.km_start_date || !form.km_end_date) {
            showToast("Vui lòng nhập đầy đủ thời gian áp dụng", "warning");
            return;
        }

        if (new Date(form.km_start_date) > new Date(form.km_end_date)) {
            showToast("Ngày bắt đầu không được lớn hơn ngày kết thúc", "warning");
            return;
        }

        setIsSubmitting(true);
        const payload = {
            ...form,
            km_name: form.km_name.trim(),
            km_description: form.km_description.trim(),
            km_percent: Number(form.km_percent),
        };
        
        try {
            if (editing) {
                // Update
                await updatePromotion(editing.km_id, {
                    ...payload,
                    km_id: editing.km_id,
                });
                const updatedVouchers = vouchers.map(v =>
                    v.km_id === editing.km_id ? { ...v, ...payload } : v
                );
                setVouchers(updatedVouchers);
                setCachedVouchers(updatedVouchers);
            } else {
                // Create
                const newVoucher = await createPromotion(payload);
                const updatedVouchers = [...vouchers, newVoucher];
                setVouchers(updatedVouchers);
                setCachedVouchers(updatedVouchers);
            }
            
            setOpenForm(false);
            showToast(editing ? "Cập nhật voucher thành công" : "Thêm voucher thành công", "success");
        } catch (error) {
            console.error("Submit failed:", error);
            showToast(error.message || "Lưu voucher thất bại", "error", 3400);
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ================= DELETE ================= */
    const handleDelete = async (id) => {
        if (!window.confirm("Xóa voucher này?")) return;
        
        try {
            await deletePromotion(id);
            const updatedVouchers = vouchers.filter(v => v.km_id !== id);
            setVouchers(updatedVouchers);
            setCachedVouchers(updatedVouchers);
            showToast("Xóa voucher thành công", "success");
        } catch (error) {
            console.error("Delete failed:", error);
            showToast("Xóa voucher thất bại", "error");
        }
    };

    return {
        search, setSearch,
        openForm, setOpenForm,
        form, setForm,
        filteredVouchers,
        paginatedVouchers,
        currentPage,
        totalPages,
        itemsPerPage,
        isSubmitting,
        handlePageChange,
        handlePreviousPage,
        handleNextPage,
        openAdd, openEdit,
        handleSubmit,
        handleDelete
    };
}
