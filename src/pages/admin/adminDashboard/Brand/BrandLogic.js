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

function parseCsvLine(line) {
    const out = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
        const ch = line[i];
        const next = line[i + 1];

        if (ch === '"') {
            if (inQuotes && next === '"') {
                current += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (ch === "," && !inQuotes) {
            out.push(current.trim());
            current = "";
            continue;
        }

        current += ch;
    }

    out.push(current.trim());
    return out;
}

function parseCsv(text) {
    const lines = String(text || "")
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

    if (lines.length === 0) return [];
    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());

    return lines.slice(1).map((line) => {
        const cells = parseCsvLine(line);
        const row = {};
        headers.forEach((header, idx) => {
            row[header] = cells[idx] ?? "";
        });
        return row;
    });
}

async function parseExcel(arrayBuffer) {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const firstSheetName = workbook.SheetNames?.[0];
    if (!firstSheetName) return [];

    const sheet = workbook.Sheets[firstSheetName];
    return XLSX.utils.sheet_to_json(sheet, {
        defval: "",
        raw: true,
    });
}

function normalizeHeaderKey(value) {
    return String(value ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

function normalizeImportRow(row) {
    const normalized = {};
    Object.entries(row || {}).forEach(([key, value]) => {
        const normalizedKey = normalizeHeaderKey(key);
        if (normalizedKey && !(normalizedKey in normalized)) {
            normalized[normalizedKey] = value;
        }
    });
    return normalized;
}

function pickField(row, aliases = []) {
    for (const alias of aliases) {
        const value = row?.[normalizeHeaderKey(alias)];
        if (value !== undefined && value !== null && String(value).trim() !== "") {
            return String(value).trim();
        }
    }
    return "";
}

async function runWithConcurrency(items, concurrency, worker) {
    const results = [];
    let cursor = 0;

    const runner = async () => {
        while (cursor < items.length) {
            const index = cursor;
            cursor += 1;
            results[index] = await worker(items[index], index);
        }
    };

    const workers = Array.from({ length: Math.max(1, concurrency) }, () => runner());
    await Promise.all(workers);
    return results;
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
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [isImportingFile, setIsImportingFile] = useState(false);
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
            const cachedBrands = getCachedBrands();
            if (cachedBrands) {
                setBrands(cachedBrands);
                setLoading(false);
                return;
            }
            const data = await getAllBrands();
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
                setBrands((prev) => [payload, ...prev]);
            }
            
            clearBrandCache();
            const freshBrands = await getAllBrands();
            setCachedBrands(freshBrands);
            setBrands(freshBrands);

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

            clearBrandCache();
            const freshBrands = await getAllBrands();
            setCachedBrands(freshBrands);
            setBrands(freshBrands);
            showToast("Xóa thương hiệu thành công", "success");
        } catch (err) {
            console.error(err);
            showToast("Xóa hãng thất bại: " + (err.message || ""), "error", 3400);
        } finally {
            setDeletingId(null);
        }
    };

    const handleDeleteMany = async (ids = []) => {
        const uniqueIds = Array.from(new Set((ids || []).filter(Boolean)));
        if (uniqueIds.length === 0) return;

        setIsBulkDeleting(true);
        try {
            const results = await Promise.allSettled(uniqueIds.map((id) => deleteBrand(id)));
            const success = results.filter((r) => r.status === "fulfilled").length;
            const failed = results.length - success;

            clearBrandCache();
            const freshBrands = await getAllBrands();
            setCachedBrands(freshBrands);
            setBrands(freshBrands);

            if (failed === 0) {
                showToast(`Đã xóa ${success} thương hiệu`, "success");
            } else {
                showToast(`Xóa nhanh: ${success} thành công, ${failed} thất bại`, "warning", 3600);
            }
        } catch (err) {
            console.error(err);
            showToast("Xóa nhanh thương hiệu thất bại", "error", 3400);
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const handleBulkImportFile = async (file) => {
        if (!file) return;
        setIsImportingFile(true);

        try {
            const lowerName = String(file.name || "").toLowerCase();
            let rawRows = [];

            if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
                const buffer = await file.arrayBuffer();
                rawRows = await parseExcel(buffer);
            } else if (lowerName.endsWith(".json")) {
                const text = await file.text();
                const parsed = JSON.parse(text);
                rawRows = Array.isArray(parsed) ? parsed : [];
            } else {
                const text = await file.text();
                rawRows = parseCsv(text);
            }

            if (!Array.isArray(rawRows) || rawRows.length === 0) {
                showToast("File không có dữ liệu hợp lệ", "warning");
                return;
            }

            const rows = rawRows.map((row, index) => {
                const normalized = normalizeImportRow(row);
                return {
                rowNo: index + 2,
                hang_id: pickField(normalized, ["hang_id", "hang id", "id", "ma", "ma thuong hieu", "ma hang"]),
                hang_name: pickField(normalized, ["hang_name", "hang name", "name", "ten", "ten thuong hieu", "thuong hieu"]),
            };
            });

            const invalidRows = rows.filter((r) => !r.hang_id || !r.hang_name);
            if (invalidRows.length > 0) {
                showToast(`Có ${invalidRows.length} dòng thiếu dữ liệu`, "warning", 3600);
                return;
            }

            const results = await runWithConcurrency(rows, 3, async (row) => {
                try {
                    await createBrand({ hang_id: row.hang_id, hang_name: row.hang_name });
                    return { ok: true };
                } catch (error) {
                    return { ok: false, message: error?.message || "Lỗi thêm thương hiệu" };
                }
            });

            const success = results.filter((r) => r.ok).length;
            const failed = results.length - success;

            clearBrandCache();
            await fetchBrands();

            if (failed === 0) {
                showToast(`Import thành công ${success} thương hiệu`, "success");
            } else {
                showToast(`Import xong: ${success} thành công, ${failed} thất bại`, "warning", 4200);
            }
        } catch (err) {
            console.error(err);
            showToast("Import file thương hiệu thất bại", "error", 3400);
        } finally {
            setIsImportingFile(false);
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
        isBulkDeleting,
        isImportingFile,
        openAdd,
        openEdit,
        handleSubmit,
        handleDelete,
        handleDeleteMany,
        handleBulkImportFile,
        handlePageChange,
        handlePreviousPage,
        handleNextPage,
    };
}
