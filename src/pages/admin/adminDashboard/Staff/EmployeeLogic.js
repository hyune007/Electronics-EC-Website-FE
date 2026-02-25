import { useEffect, useState, useCallback, useRef } from "react";
import {
    getAllEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee
} from "../../../../services/employeeservice";
import { generateNextEmployeeId } from "../../../../utils/codeGenerator";

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
            // Check cache first
            const cacheKey = `page_${currentPage}`;
            
            // Try localStorage cache first
            const cachedPage = getCachedPage(currentPage);
            if (cachedPage) {
                console.log(`Loading employees page ${currentPage} from cache...`);
                setEmployees(cachedPage.employees);
                setTotalPages(cachedPage.totalPages);
                cacheRef.current[cacheKey] = cachedPage;
                setLoading(false);
                return;
            }
            
            // Check memory cache
            if (cacheRef.current[cacheKey]) {
                console.log(`Loading employees page ${currentPage} from memory...`);
                setEmployees(cacheRef.current[cacheKey].employees);
                setTotalPages(cacheRef.current[cacheKey].totalPages);
                setLoading(false);
                return;
            }

            console.log(`Fetching employees page ${currentPage} from API...`);
            const data = await getAllEmployees(currentPage, search);
            
            const pageData = {
                employees: data.employees,
                totalPages: data.totalPages
            };

            // Cache to both memory and localStorage
            cacheRef.current[cacheKey] = pageData;
            setCachedPage(currentPage, pageData);

            setEmployees(data.employees);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error(err);
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
    useEffect(() => {
        const loadAllInBackground = async () => {
            // Wait for first page to load
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const firstPageCache = cacheRef.current["page_0"];
            if (!firstPageCache || firstPageCache.totalPages <= 1) return;
            
            const total = firstPageCache.totalPages;
            
            // Load remaining pages in background
            for (let p = 1; p < total; p++) {
                // Don't block UI
                const delay = () => new Promise(resolve => {
                    if (typeof requestIdleCallback !== 'undefined') {
                        requestIdleCallback(() => resolve(), { timeout: 500 });
                    } else {
                        setTimeout(resolve, 50);
                    }
                });
                
                await delay();
                
                // Skip if already cached
                if (cacheRef.current[`page_${p}`]) continue;
                const cachedPage = getCachedPage(p);
                if (cachedPage) {
                    cacheRef.current[`page_${p}`] = cachedPage;
                    continue;
                }
                
                try {
                    const data = await getAllEmployees(p, search);
                    const pageData = {
                        employees: data.employees,
                        totalPages: data.totalPages
                    };

                    cacheRef.current[`page_${p}`] = pageData;
                    setCachedPage(p, pageData);
                } catch (err) {
                    console.error(`Background load page ${p} failed:`, err);
                }
            }
        };
        
        // Only run on initial mount
        if (currentPage === 0 && !search) {
            loadAllInBackground();
        }
    }, []);

    /* ================= ADD ================= */
    const openAdd = () => {
        setEditing(null);
        setForm(emptyForm);
        setOpenForm(true);
    };

    /* ================= EDIT ================= */
    const openEdit = (emp) => {
        setEditing(emp);
        setForm({
            ...emp,
            nv_password: "" // Clear password for security
        });
        setOpenForm(true);
    };

    /* ================= SUBMIT ================= */
    const handleSubmit = async () => {
        // Validate required fields
        if (!form.nv_name || !form.nv_name.trim()) {
            alert("Vui lòng nhập họ tên nhân viên");
            return;
        }
        
        if (!editing && (!form.nv_password || !form.nv_password.trim())) {
            alert("Vui lòng nhập mật khẩu");
            return;
        }
        
        if (!form.nv_phone || !form.nv_phone.trim()) {
            alert("Vui lòng nhập số điện thoại");
            return;
        }
        
        if (!form.nv_mail || !form.nv_mail.trim()) {
            alert("Vui lòng nhập email");
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.nv_mail)) {
            alert("Định dạng email không hợp lệ");
            return;
        }
        
        try {
            // Tự động generate ID nếu đang tạo mới
            let employeeId = form.nv_id;
            if (!editing) {
                employeeId = generateNextEmployeeId(employees);
                console.log("Generated employee ID:", employeeId);
            }
            
            const payload = {
                ...form,
                nv_id: employeeId
            };
            
            if (editing) {
                await updateEmployee(form.nv_id, payload);
            } else {
                await createEmployee(payload);
            }
            setOpenForm(false);
            
            // Clear all cache and reload
            cacheRef.current = {};
            clearAllEmployeeCache();
            await fetchEmployees();
        } catch (err) {
            console.error("Lỗi lưu nhân viên:", err);
            alert(err.message || (editing ? "Cập nhật nhân viên thất bại" : "Thêm nhân viên thất bại"));
        }
    };

    /* ================= DELETE ================= */
    const handleDelete = async (id) => {
        if (!confirm("Xóa nhân viên này?")) return;
        try {
            await deleteEmployee(id);
            
            // Clear all cache and reload
            cacheRef.current = {};
            clearAllEmployeeCache();
            await fetchEmployees();
        } catch (err) {
            alert(err.message);
        }
    };

    /* ================= PAGINATION ================= */
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(0, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
    };

    return {
        search,
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
