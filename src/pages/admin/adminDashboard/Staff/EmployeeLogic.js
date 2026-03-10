import { useEffect, useState, useCallback, useRef } from "react";
import {
    getAllEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee
} from "../../../../services/employeeservice";
import { showToast } from "../../../../utils/adminToast";

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

export function useEmployeeLogic() {
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState("");
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState(null);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
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
        nv_role: "ROLE_STAFF"
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
                totalPages: data.totalPages || 0
            };

            // Cache
            cacheRef.current[cacheKey] = pageData;
            setCachedPage(currentPage, pageData);

            setEmployees(pageData.employees);
            setTotalPages(pageData.totalPages);
        } catch (err) {
            console.error("Fetch employees failed:", err);
            setEmployees([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, search]);

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
        setForm(emptyForm);
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
        isSubmitting,
        deletingId,
        setSearch,
        openForm,
        setOpenForm,
        form,
        setForm,
        filteredEmployees: employees,
        paginatedEmployees: employees,
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
