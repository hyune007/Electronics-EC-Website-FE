import { useEffect, useMemo, useState, useCallback } from "react";
import {
    getAllBrands,
    createBrand,
    updateBrand,
    deleteBrand,
} from "../../../../services/brandService";
import { showToast } from "../../../../utils/adminToast";
import { generateSmartNextId } from "../../../../utils/codeGenerator";

// Cache helpers
const CACHE_KEY = "brand_data";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function getCachedBrands() {
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
        
        return parsed.brands;
    } catch (err) {
        console.error("Error reading cache:", err);
        return null;
    }
}

function setCachedBrands(brands) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            brands,
            timestamp: Date.now()
        }));
    } catch (err) {
        console.error("Error writing cache:", err);
    }
}

function clearBrandCache() {
    try {
        localStorage.removeItem(CACHE_KEY);
    } catch (err) {
        console.error("Error clearing cache:", err);
    }
}

export function useBrandLogic() {
    // ===== STATE =====
    const [brands, setBrands] = useState([]);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("newest_id");
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [, setIsSubmitting] = useState(false);
    const [, setDeletingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 12;

    const [form, setForm] = useState({
        hang_id: "",
        hang_name: "",
    });

    // ===== LOAD DATA =====
    const fetchBrands = useCallback(async () => {
        setLoading(true);
        try {
            // Try localStorage cache first
            const cachedBrands = getCachedBrands();
            if (cachedBrands) {
                console.log("Loading brands from cache...");
                setBrands(cachedBrands);
                setLoading(false);
                return;
            }

            console.log("Fetching brands from API...");
            const data = await getAllBrands();
            console.log("Brands loaded:", data);
            
            // Cache the data
            setCachedBrands(data);
            setBrands(data);
        } catch (err) {
            console.error("Error loading brands:", err);
            showToast("Không tải được danh sách hãng", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]);

    // ===== FILTER =====
    const filteredBrands = useMemo(() => {
        const keyword = search.toLowerCase().trim();
        return brands.filter((b) =>
            b.hang_name.toLowerCase().includes(keyword) ||
            String(b.hang_id || "").toLowerCase().includes(keyword)
        );
    }, [brands, search]);

    const sortedBrands = useMemo(() => {
        const parseIdNumber = (value) => {
            const match = String(value || "").match(/(\d+)$/);
            return match ? Number(match[1]) : 0;
        };

        const list = [...filteredBrands];
        list.sort((a, b) => {
            switch (sortBy) {
                case "oldest_id":
                    return parseIdNumber(a.hang_id) - parseIdNumber(b.hang_id);
                case "name_az":
                    return String(a.hang_name || "").localeCompare(String(b.hang_name || ""), "vi", { sensitivity: "base" });
                case "name_za":
                    return String(b.hang_name || "").localeCompare(String(a.hang_name || ""), "vi", { sensitivity: "base" });
                case "id_az":
                    return String(a.hang_id || "").localeCompare(String(b.hang_id || ""), "vi", { sensitivity: "base" });
                case "newest_id":
                default:
                    return parseIdNumber(b.hang_id) - parseIdNumber(a.hang_id);
            }
        });

        return list;
    }, [filteredBrands, sortBy]);

    const stats = useMemo(() => {
        const total = brands.length;
        const matched = sortedBrands.length;

        return {
            total,
            matched,
        };
    }, [brands, sortedBrands.length]);

    // ===== PAGINATION =====
    const paginatedBrands = useMemo(() => {
        const startIndex = currentPage * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedBrands.slice(startIndex, endIndex);
    }, [sortedBrands, currentPage]);

    const totalPages = useMemo(() => {
        return Math.ceil(sortedBrands.length / itemsPerPage);
    }, [sortedBrands.length]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 0));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
    };

    // Reset to page 0 when search changes
    useEffect(() => {
        setCurrentPage(0);
    }, [search]);

    useEffect(() => {
        setCurrentPage(0);
    }, [sortBy]);

    // ===== OPEN FORM =====
    const openAdd = () => {
        setEditing(null);
        const nextId = generateSmartNextId(brands.map((item) => item.hang_id), "H", 2);
        setForm({ hang_id: nextId, hang_name: "" });
        setOpenForm(true);
    };

    const openEdit = (brand) => {
        setEditing(brand);
        setForm({ ...brand });
        setOpenForm(true);
    };

    // ===== SUBMIT =====
    const handleSubmit = async () => {
        if (!form.hang_name || !form.hang_name.trim()) {
            showToast("Vui lòng nhập tên thương hiệu", "warning");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                hang_id: form.hang_id,
                hang_name: form.hang_name.trim(),
            };
            
            if (editing) {
                await updateBrand(editing.hang_id, {
                    ...payload,
                    hang_id: editing.hang_id,
                });
                setBrands((prev) =>
                    prev.map((b) =>
                        b.hang_id === editing.hang_id
                            ? { ...b, ...payload }
                            : b
                    )
                );
            } else {
                await createBrand(payload);
            }
            
            // Clear cache and reload
            clearBrandCache();
            await fetchBrands();
            
            setOpenForm(false);
            showToast(editing ? "Cập nhật thương hiệu thành công" : "Thêm thương hiệu thành công", "success");
        } catch (err) {
            console.error(err);
            showToast("Lưu hãng thất bại: " + (err.message || ""), "error", 3400);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ===== DELETE =====
    const handleDelete = async (id) => {
        if (!confirm("Xóa hãng này?")) return;

        setDeletingId(id);
        try {
            await deleteBrand(id);
            
            // Clear cache and reload
            clearBrandCache();
            await fetchBrands();
            showToast("Xóa thương hiệu thành công", "success");
        } catch (err) {
            console.error(err);
            showToast("Xóa hãng thất bại: " + (err.message || ""), "error", 3400);
        } finally {
            setDeletingId(null);
        }
    };

    return {
        loading,
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
        filteredBrands,
        paginatedBrands,
        currentPage,
        totalPages,
        itemsPerPage,
        openAdd,
        openEdit,
        handleSubmit,
        handleDelete,
        handlePageChange,
        handlePreviousPage,
        handleNextPage,
    };
}
