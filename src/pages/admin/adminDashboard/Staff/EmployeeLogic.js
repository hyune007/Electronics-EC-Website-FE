import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
    getAllEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee
} from "../../../../services/employeeservice";
import { showToast } from "../../../../utils/adminToast";
import { generateSmartNextId } from "../../../../utils/codeGenerator";

// Cache helpers
const CACHE_KEY_PREFIX = "employee_page_";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function getCachedPage(pageNum) {
    try {
        const data = localStorage.getItem(`${CACHE_KEY_PREFIX}${pageNum}`);
        if (!data) return null;

        const parsed = JSON.parse(data);
        const now = Date.now();

        // Check if cache is still valid
        if (now - parsed.timestamp > CACHE_DURATION) {
            localStorage.removeItem(`${CACHE_KEY_PREFIX}${pageNum}`);
            return null;
        }

        return parsed;
    } catch (err) {
        console.error("Error reading cache:", err);
        return null;
    }
}

function setCachedPage(pageNum, data) {
    try {
        localStorage.setItem(`${CACHE_KEY_PREFIX}${pageNum}`, JSON.stringify({
            ...data,
            timestamp: Date.now()
        }));
    } catch (err) {
        console.error("Error writing cache:", err);
    }
}

function clearAllEmployeeCache() {
    try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(CACHE_KEY_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    } catch (err) {
        console.error("Error clearing cache:", err);
    }
}

function getKnownEmployeeIds(memoryCache = {}) {
    const ids = [];

    Object.values(memoryCache).forEach((pageData) => {
        (pageData?.employees || []).forEach((emp) => {
            if (emp?.nv_id) ids.push(emp.nv_id);
        });
    });

    try {
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
            if (!key.startsWith(CACHE_KEY_PREFIX)) return;
            const raw = localStorage.getItem(key);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            (parsed?.employees || []).forEach((emp) => {
                if (emp?.nv_id) ids.push(emp.nv_id);
            });
        });
    } catch (err) {
        console.error("Error collecting employee ids:", err);
    }

    return Array.from(new Set(ids));
}

export function useEmployeeLogic() {
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("newest_id");
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState(null);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [loading, setLoading] = useState(false);

    // submission / deletion states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const itemsPerPage = 12;

    // Cache: store loaded pages to avoid re-fetching
    const cacheRef = useRef({});

    const emptyForm = {
        nv_id: "",
        nv_name: "",
        nv_password: "",
        nv_phone: "",
        nv_mail: "",
        nv_address: "",
        nv_birth: "",
        nv_role: "ROLE_EMPLOYEE"
    };

    const [form, setForm] = useState(emptyForm);

    /* ================= LOAD ================= */
    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        try {
            const cacheKey = `page_${currentPage}`;

            // Try localStorage cache first
            const cachedPage = getCachedPage(currentPage);
            if (cachedPage) {
                setEmployees(cachedPage.employees);
                setTotalPages(cachedPage.totalPages);
                cacheRef.current[cacheKey] = cachedPage;
                setLoading(false);
                return;
            }

            // Check memory cache
            if (cacheRef.current[cacheKey]) {
                setEmployees(cacheRef.current[cacheKey].employees);
                setTotalPages(cacheRef.current[cacheKey].totalPages);
                setLoading(false);
                return;
            }

            const data = await getAllEmployees(currentPage, search);
            const pageData = {
                employees: data.employees || [],
                totalPages: data.totalPages || 0,
                totalElements: data.totalElements || 0,
            };

            // Cache
            cacheRef.current[cacheKey] = pageData;
            setCachedPage(currentPage, pageData);

            setEmployees(pageData.employees);
            setTotalPages(pageData.totalPages);
            setTotalEmployees(pageData.totalElements);
        } catch (err) {
            console.error("Fetch employees failed:", err);
            setEmployees([]);
            setTotalPages(0);
            setTotalEmployees(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, search]);

    const sortedEmployees = useMemo(() => {
        const getIdNum = (value) => {
            const match = String(value || "").match(/(\d+)$/);
            return match ? Number(match[1]) : 0;
        };

        const list = [...employees];
        list.sort((a, b) => {
            switch (sortBy) {
                case "oldest_id":
                    return getIdNum(a.nv_id) - getIdNum(b.nv_id);
                case "name_az":
                    return String(a.nv_name || "").localeCompare(String(b.nv_name || ""), "vi", { sensitivity: "base" });
                case "name_za":
                    return String(b.nv_name || "").localeCompare(String(a.nv_name || ""), "vi", { sensitivity: "base" });
                case "role":
                    return String(a.nv_role || "").localeCompare(String(b.nv_role || ""));
                case "newest_id":
                default:
                    return getIdNum(b.nv_id) - getIdNum(a.nv_id);
            }
        });

        return list;
    }, [employees, sortBy]);

    const stats = useMemo(() => {
        const adminCount = employees.filter((e) => e.nv_role === "ROLE_ADMIN").length;
        const employeeCount = employees.filter((e) => e.nv_role === "ROLE_EMPLOYEE").length;

        return {
            total: totalEmployees,
            onPage: sortedEmployees.length,
            adminCount,
            employeeCount,
        };
    }, [employees, sortedEmployees.length, totalEmployees]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    /* ================= BACKGROUND LOAD ALL PAGES ================= */
    // Intentionally run on mount only; references currentPage/search inside
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const loadAllInBackground = async () => {
            // allow initial page to populate
            await new Promise(resolve => setTimeout(resolve, 100));

            const firstPageCache = cacheRef.current["page_0"];
            if (!firstPageCache || firstPageCache.totalPages <= 1) return;

            const total = firstPageCache.totalPages;
            for (let p = 1; p < total; p++) {
                // don't block UI
                await new Promise(resolve => {
                    if (typeof requestIdleCallback !== 'undefined') {
                        requestIdleCallback(() => resolve(), { timeout: 500 });
                    } else {
                        setTimeout(resolve, 50);
                    }
                });

                if (cacheRef.current[`page_${p}`]) continue;
                const cachedPage = getCachedPage(p);
                if (cachedPage) {
                    cacheRef.current[`page_${p}`] = cachedPage;
                    continue;
                }

                try {
                    const data = await getAllEmployees(p, "");
                    const pageData = {
                        employees: data.employees || [],
                        totalPages: data.totalPages || 0
                    };
                    cacheRef.current[`page_${p}`] = pageData;
                    setCachedPage(p, pageData);
                } catch (err) {
                    console.error(`Background load page ${p} failed:`, err);
                }
            }
        };

        if (currentPage === 0 && !search) {
            loadAllInBackground();
        }
    }, [currentPage, search]);

    /* ================= ADD / EDIT ================= */
    const openAdd = () => {
        setEditing(null);
        const knownIds = getKnownEmployeeIds(cacheRef.current);
        const nextId = generateSmartNextId(knownIds, "NV", 3);
        setForm({ ...emptyForm, nv_id: nextId });
        setOpenForm(true);
    };

    const openEdit = (emp) => {
        setEditing(emp);
        setForm({ ...emp, nv_password: "" });
        setOpenForm(true);
    };

    /* ================= SUBMIT ================= */
    const handleSubmit = async () => {
        if (!form.nv_name || !form.nv_name.trim()) {
            showToast("Vui lòng nhập họ tên nhân viên", "warning");
            return;
        }

        if (!form.nv_password || !form.nv_password.trim()) {
            showToast("Vui lòng nhập mật khẩu", "warning");
            return;
        }

        if (!form.nv_phone || !form.nv_phone.trim()) {
            showToast("Vui lòng nhập số điện thoại", "warning");
            return;
        }

        if (!form.nv_mail || !form.nv_mail.trim()) {
            showToast("Vui lòng nhập email", "warning");
            return;
        }

        if (!form.nv_birth || !String(form.nv_birth).trim()) {
            showToast("Vui lòng nhập ngày sinh", "warning");
            return;
        }

        if (!form.nv_address || !form.nv_address.trim()) {
            showToast("Vui lòng nhập địa chỉ", "warning");
            return;
        }

        if (!form.nv_role || !String(form.nv_role).trim()) {
            showToast("Vui lòng chọn vai trò", "warning");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.nv_mail)) {
            showToast("Định dạng email không hợp lệ", "warning");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...form,
                nv_name: form.nv_name.trim(),
                nv_password: form.nv_password.trim(),
                nv_phone: form.nv_phone.trim(),
                nv_mail: form.nv_mail.trim(),
                nv_address: form.nv_address.trim(),
            };
            if (editing) {
                await updateEmployee(form.nv_id, {
                    ...payload,
                    nv_id: form.nv_id,
                });
                showToast("Cập nhật nhân viên thành công", "success");
            } else {
                await createEmployee(payload);
                showToast("Thêm nhân viên mới thành công", "success");
            }

            setOpenForm(false);
            cacheRef.current = {};
            clearAllEmployeeCache();
            await fetchEmployees();
        } catch (err) {
            console.error("Lỗi lưu nhân viên:", err);
            showToast(err.message || (editing ? "Cập nhật nhân viên thất bại" : "Thêm nhân viên thất bại"), "error", 3400);
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ================= DELETE ================= */
    const handleDelete = async (id) => {
        if (!window.confirm("Xóa nhân viên này?")) return;
        setDeletingId(id);
        try {
            await deleteEmployee(id);
            showToast("Xóa nhân viên thành công", "success");

            cacheRef.current = {};
            clearAllEmployeeCache();
            await fetchEmployees();
        } catch (err) {
            showToast("Xóa nhân viên thất bại: " + (err.message || ""), "error", 3400);
        } finally {
            setDeletingId(null);
        }
    };

    /* ================= PAGINATION ================= */
    const handlePageChange = (page) => setCurrentPage(page);
    const handlePreviousPage = () => setCurrentPage(prev => Math.max(0, prev - 1));
    const handleNextPage = () => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));

    return {
        search,
        sortBy,
        setSortBy,
        stats,
        isSubmitting,
        deletingId,
        setSearch,
        openForm,
        setOpenForm,
        form,
        setForm,
        filteredEmployees: sortedEmployees,
        paginatedEmployees: sortedEmployees,
        currentPage,
        totalPages,
        itemsPerPage,
        loading,
        openAdd,
        openEdit,
        handleSubmit,
        handleDelete,
        handlePageChange,
        handlePreviousPage,
        handleNextPage,
    };
}
