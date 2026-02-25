import { useMemo, useState, useEffect, useCallback } from "react";
import { getAllPromotions, createPromotion, updatePromotion, deletePromotion } from "../../../../services/promotionService";
import { generateNextVoucherId } from "../../../../utils/codeGenerator";

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
    const [isGeneratingId, setIsGeneratingId] = useState(false);
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
            alert("Không thể tải danh sách voucher. Vui lòng kiểm tra kết nối API.");
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
        
        // Generate ID in background
        setIsGeneratingId(true);
        const nextId = generateNextVoucherId(vouchers);
        setForm(prev => ({ ...prev, km_id: nextId }));
        setIsGeneratingId(false);
    };

    /* ================= OPEN EDIT ================= */
    const openEdit = (voucher) => {
        setEditing(voucher);
        setForm({ ...voucher });
        setOpenForm(true);
    };

    /* ================= SUBMIT ================= */
    const handleSubmit = async () => {
        setIsSubmitting(true);
        
        try {
            if (editing) {
                // Update
                await updatePromotion(editing.km_id, form);
                const updatedVouchers = vouchers.map(v =>
                    v.km_id === editing.km_id ? form : v
                );
                setVouchers(updatedVouchers);
                setCachedVouchers(updatedVouchers);
            } else {
                // Create
                const newVoucher = await createPromotion(form);
                const updatedVouchers = [...vouchers, newVoucher];
                setVouchers(updatedVouchers);
                setCachedVouchers(updatedVouchers);
            }
            
            setOpenForm(false);
            alert(editing ? "Cập nhật voucher thành công!" : "Thêm voucher thành công!");
        } catch (error) {
            console.error("Submit failed:", error);
            alert(error.message || "Lưu voucher thất bại!");
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
            alert("Xóa voucher thành công!");
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Xóa voucher thất bại!");
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
        isGeneratingId,
        isSubmitting,
        handlePageChange,
        handlePreviousPage,
        handleNextPage,
        openAdd, openEdit,
        handleSubmit,
        handleDelete
    };
}
