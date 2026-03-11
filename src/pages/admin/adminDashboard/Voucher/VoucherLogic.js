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

export function useVoucherLogic() {
    const [vouchers, setVouchers] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("latest_start");
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [isImportingFile, setIsImportingFile] = useState(false);
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

    const handleDeleteMany = async (ids = []) => {
        const uniqueIds = Array.from(new Set((ids || []).filter(Boolean)));
        if (uniqueIds.length === 0) return;

        setIsBulkDeleting(true);
        try {
            const results = await Promise.allSettled(uniqueIds.map((id) => deletePromotion(id)));
            const success = results.filter((r) => r.status === "fulfilled").length;
            const failed = results.length - success;

            const deletedSet = new Set(uniqueIds);
            const updatedVouchers = vouchers.filter((v) => !deletedSet.has(v.km_id));
            setVouchers(updatedVouchers);
            setCachedVouchers(updatedVouchers);

            if (failed === 0) {
                showToast(`Đã xóa ${success} voucher`, "success");
            } else {
                showToast(`Xóa nhanh: ${success} thành công, ${failed} thất bại`, "warning", 3600);
            }
        } catch (error) {
            console.error("Bulk delete failed:", error);
            showToast("Xóa nhanh voucher thất bại", "error");
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
                const percentRaw = pickField(normalized, ["km_percent", "km percent", "percent", "phan tram", "giam gia"]);
                return {
                    rowNo: index + 2,
                    km_id: pickField(normalized, ["km_id", "km id", "id", "ma", "ma voucher", "ma khuyen mai"]),
                    km_name: pickField(normalized, ["km_name", "km name", "name", "ten", "ten voucher", "ten khuyen mai"]),
                    km_description: pickField(normalized, ["km_description", "km description", "description", "mo ta"]),
                    km_percent: Number(percentRaw || 0),
                    km_start_date: pickField(normalized, ["km_start_date", "km start date", "start_date", "start date", "ngay bat dau"]),
                    km_end_date: pickField(normalized, ["km_end_date", "km end date", "end_date", "end date", "ngay ket thuc"]),
                };
            });

            const invalidRows = rows.filter((r) => !r.km_id || !r.km_name || !r.km_description || r.km_percent <= 0 || r.km_percent > 100 || !r.km_start_date || !r.km_end_date);
            if (invalidRows.length > 0) {
                showToast(`Có ${invalidRows.length} dòng thiếu hoặc sai dữ liệu`, "warning", 3600);
                return;
            }

            const results = await runWithConcurrency(rows, 3, async (row) => {
                try {
                    await createPromotion(row);
                    return { ok: true };
                } catch (error) {
                    return { ok: false, message: error?.message || "Lỗi thêm voucher" };
                }
            });

            const success = results.filter((r) => r.ok).length;
            const failed = results.length - success;

            clearVoucherCache();
            await loadVouchers();

            if (failed === 0) {
                showToast(`Import thành công ${success} voucher`, "success");
            } else {
                showToast(`Import xong: ${success} thành công, ${failed} thất bại`, "warning", 4200);
            }
        } catch (error) {
            console.error("Bulk import voucher failed:", error);
            showToast("Import file voucher thất bại", "error", 3400);
        } finally {
            setIsImportingFile(false);
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
        isBulkDeleting,
        isImportingFile,
        handlePageChange,
        handlePreviousPage,
        handleNextPage,
        openAdd, openEdit,
        handleSubmit,
        handleDelete,
        handleDeleteMany,
        handleBulkImportFile
    };
}
