import { useEffect, useMemo, useState, useCallback } from "react";
import {
    getAllBrands,
    createBrand,
    updateBrand,
    deleteBrand,
} from "../../../../services/brandService";
import { generateNextBrandId } from "../../../../utils/codeGenerator";

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
            alert("Không tải được danh sách hãng");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]);

    // ===== FILTER =====
    const filteredBrands = useMemo(() => {
        return brands.filter((b) =>
            b.hang_name.toLowerCase().includes(search.toLowerCase())
        );
    }, [brands, search]);

    // ===== PAGINATION =====
    const paginatedBrands = useMemo(() => {
        const startIndex = currentPage * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredBrands.slice(startIndex, endIndex);
    }, [filteredBrands, currentPage]);

    const totalPages = useMemo(() => {
        return Math.ceil(filteredBrands.length / itemsPerPage);
    }, [filteredBrands.length]);

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

    // ===== OPEN FORM =====
    const openAdd = () => {
        setEditing(null);
        setForm({ hang_id: "", hang_name: "" });
        setOpenForm(true);
    };

    const openEdit = (brand) => {
        setEditing(brand);
        setForm({ ...brand });
        setOpenForm(true);
    };

    // ===== SUBMIT =====
    const handleSubmit = async () => {
        // Chỉ validate tên thương hiệu, ID sẽ được tạo tự động khi thêm mới
        if (!form.hang_name || !form.hang_name.trim()) {
            alert("Vui lòng nhập tên thương hiệu");
            return;
        }

        setIsSubmitting(true);
        try {
            // Tự động generate ID nếu đang tạo mới
            let brandId = form.hang_id;
            if (!editing) {
                // Fetch fresh data để tránh duplicate ID
                const allBrands = await getAllBrands();
                brandId = generateNextBrandId(allBrands);
                console.log("Generated brand ID:", brandId);
            }
            
            const payload = {
                hang_id: brandId,
                hang_name: form.hang_name
            };
            
            if (editing) {
                await updateBrand(editing.hang_id, payload);
                setBrands((prev) =>
                    prev.map((b) =>
                        b.hang_id === editing.hang_id ? payload : b
                    )
                );
            } else {
                const newBrand = await createBrand(payload);
                setBrands((prev) => [
                    ...prev,
                    { hang_id: newBrand.id || brandId, hang_name: newBrand.name },
                ]);
            }
            
            // Clear cache and reload
            clearBrandCache();
            await fetchBrands();
            
            setOpenForm(false);
            alert(editing ? "✅ Cập nhật thương hiệu thành công!" : "✅ Thêm thương hiệu thành công!");
        } catch (err) {
            console.error(err);
            alert("❌ Lưu hãng thất bại: " + (err.message || ""));
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
            alert("✅ Xóa thương hiệu thành công!");
        } catch (err) {
            console.error(err);
            alert("❌ Xóa hãng thất bại: " + (err.message || ""));
        } finally {
            setDeletingId(null);
        }
    };

    return {
        loading,
        search,
        setSearch,
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
