import { useMemo, useState, useEffect, useCallback } from "react";
import { getAllPromotions, createPromotion, updatePromotion, deletePromotion } from "../../../../services/promotionService";
import { showToast } from "../../../../utils/adminToast";
import { generateSmartNextId } from "../../../../utils/codeGenerator";

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
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("latest_start");
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const itemsPerPage = 12;

    const emptyForm = {
        km_id: "",
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

    const getVoucherStatus = useCallback((voucher) => {
        const now = new Date();
        const start = new Date(voucher.km_start_date);
        const end = new Date(voucher.km_end_date);

        if (now < start) return "upcoming";
        if (now > end) return "expired";
        return "active";
    }, []);

    /* ================= FILTER ================= */
    const filteredVouchers = useMemo(() => {
        const keyword = search.toLowerCase().trim();
        return vouchers.filter(v => {
            const matchesKeyword =
                v.km_name.toLowerCase().includes(keyword) ||
                v.km_id.toLowerCase().includes(keyword) ||
                (v.km_description || "").toLowerCase().includes(keyword);

            const status = getVoucherStatus(v);
            const matchesStatus = statusFilter === "all" ? true : status === statusFilter;

            return matchesKeyword && matchesStatus;
        });
    }, [vouchers, search, statusFilter, getVoucherStatus]);

    const sortedVouchers = useMemo(() => {
        const sorted = [...filteredVouchers].sort((a, b) => {
            if (sortBy === "latest_start") {
                return new Date(b.km_start_date) - new Date(a.km_start_date);
            }
            if (sortBy === "oldest_start") {
                return new Date(a.km_start_date) - new Date(b.km_start_date);
            }
            if (sortBy === "highest_percent") {
                return Number(b.km_percent || 0) - Number(a.km_percent || 0);
            }
            if (sortBy === "lowest_percent") {
                return Number(a.km_percent || 0) - Number(b.km_percent || 0);
            }
            if (sortBy === "name_az") {
                return String(a.km_name || "").localeCompare(String(b.km_name || ""));
            }
            if (sortBy === "name_za") {
                return String(b.km_name || "").localeCompare(String(a.km_name || ""));
            }
            return String(a.km_id || "").localeCompare(String(b.km_id || ""));
        });

        return sorted.map((voucher, index) => {
            const start = new Date(voucher.km_start_date);
            const end = new Date(voucher.km_end_date);
            const durationDays = Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())
                ? 0
                : Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);

            return {
                ...voucher,
                status: getVoucherStatus(voucher),
                rank: index + 1,
                durationDays,
            };
        });
    }, [filteredVouchers, sortBy, getVoucherStatus]);

    /* ================= PAGINATION ================= */
    const paginatedVouchers = useMemo(() => {
        const startIndex = currentPage * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedVouchers.slice(startIndex, endIndex);
    }, [sortedVouchers, currentPage]);

    const totalPages = Math.max(1, Math.ceil(sortedVouchers.length / itemsPerPage));

    const stats = useMemo(() => {
        const total = sortedVouchers.length;
        const activeCount = sortedVouchers.filter((v) => v.status === "active").length;
        const upcomingCount = sortedVouchers.filter((v) => v.status === "upcoming").length;
        const expiredCount = sortedVouchers.filter((v) => v.status === "expired").length;
        const avgPercent = total > 0
            ? Math.round(sortedVouchers.reduce((sum, v) => sum + Number(v.km_percent || 0), 0) / total)
            : 0;
        const maxPercent = total > 0
            ? Math.max(...sortedVouchers.map((v) => Number(v.km_percent || 0)))
            : 0;

        return {
            total,
            activeCount,
            upcomingCount,
            expiredCount,
            avgPercent,
            maxPercent,
        };
    }, [sortedVouchers]);

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
    }, [search, statusFilter, sortBy]);

    /* ================= OPEN ADD ================= */
    const openAdd = async () => {
        setEditing(null);
        const nextId = generateSmartNextId(vouchers.map((item) => item.km_id), "KM", 3);
        setForm({ ...emptyForm, km_id: nextId });
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
            km_id: form.km_id,
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
        statusFilter, setStatusFilter,
        sortBy, setSortBy,
        openForm, setOpenForm,
        editing,
        form, setForm,
        filteredVouchers,
        sortedVouchers,
        paginatedVouchers,
        stats,
        totalVisible: sortedVouchers.length,
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
