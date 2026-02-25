import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
    getProductsByPage,
    createProduct,
    updateProduct,
    deleteProduct
} from "../../../../services/productService";
import { getAllBrands } from "../../../../services/brandService";
import { generateNextProductId } from "../../../../utils/codeGenerator";

// Cache helpers
const CACHE_KEY_PREFIX = "product_page_v2_";
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

function clearAllProductCache() {
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

export function useProductManageLogic() {
    const [products, setProducts] = useState([]); // Products of current page
    const [loading, setLoading] = useState(false);
    const [totalElements, setTotalElements] = useState(0);

    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 12; // Increased from 8 to 12

    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [isGeneratingId, setIsGeneratingId] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // Cache: store loaded pages to avoid re-fetching
    const cacheRef = useRef({});
    const searchTimeoutRef = useRef(null);

    const [form, setForm] = useState({
        id: "",
        name: "",
        price: 0,
        stock: 0,
        description: "",
        image: "",
        brandId: "",
        categoryId: ""
    });
    
    const [brands, setBrands] = useState([]);
    const [allBrands, setAllBrands] = useState([]); // Lưu tất cả brands
    const [categories] = useState([
        { id: "LSP01", name: "Điện thoại" },
        { id: "LSP02", name: "Laptop" },
        { id: "LSP03", name: "Tablet" },
        { id: "LSP04", name: "Màn hình" },
        { id: "LSP05", name: "Bàn phím" },
        { id: "LSP06", name: "Chuột" },
        { id: "LSP07", name: "Tai nghe" },
        { id: "LSP08", name: "Loa" },
        { id: "LSP09", name: "Webcam" },
        { id: "LSP10", name: "Phụ kiện" }
    ]);

    /* ================= LOAD BRANDS ================= */
    useEffect(() => {
        const loadBrands = async () => {
            try {
                // Clear cache trước khi load
                localStorage.removeItem('brand_data');
                
                const brandList = await getAllBrands();
                console.log("=== Brands loaded from backend ===");
                console.log("Total brands:", brandList.length);
                console.log("Brands:", brandList);
                
                if (brandList.length === 0) {
                    console.warn("WARNING: No brands loaded! Please add brands first.");
                }
                
                setAllBrands(brandList);
                setBrands(brandList);
            } catch (err) {
                console.error("Failed to load brands:", err);
                alert("Không tải được danh sách thương hiệu. Vui lòng thêm thương hiệu trước.");
            }
        };
        loadBrands();
    }, []);

    /* ================= NO BRAND FILTER ================= */
    useEffect(() => {
        setBrands(allBrands);
    }, [allBrands]);

    /* ================= LOAD PRODUCTS BY PAGE ================= */
    const loadProductsPage = useCallback(async (pageNum, isSearch = false) => {
        try {
            // If search is active but no search term, don't load
            if (!isSearch && search.trim() === "") {
                setLoading(true);
                
                // Check cache first
                const cacheKey = `page_${pageNum}`;
                
                // Try localStorage cache first
                const cachedPage = getCachedPage(pageNum);
                if (cachedPage) {
                    setProducts(cachedPage.products);
                    setTotalElements(cachedPage.totalElements);
                    cacheRef.current[cacheKey] = cachedPage;
                    setLoading(false);
                    return;
                }
                
                // Check memory cache
                if (cacheRef.current[cacheKey]) {
                    setProducts(cacheRef.current[cacheKey].products);
                    setTotalElements(cacheRef.current[cacheKey].totalElements);
                    setLoading(false);
                    return;
                }

                const res = await getProductsByPage(pageNum - 1, pageSize);
                
                // Map data to UI format
                const mapped = res.products.map(p => ({
                    sp_id: p.id,
                    sp_name: p.name,
                    sp_price: p.price ?? 0,
                    sp_stock: p.stock ?? 0,
                    sp_desc: p.description ?? "",
                    sp_image: p.image ?? "",
                    sp_brand_id: p.brand?.id ?? "",
                    sp_brand_name: p.brand?.name ?? "",
                    sp_category_id: p.category?.id ?? "",
                    sp_category_name: p.category?.name ?? ""
                }));

                const pageData = {
                    products: mapped,
                    totalElements: res.totalElements
                };

                // Cache to both memory and localStorage
                cacheRef.current[cacheKey] = pageData;
                setCachedPage(pageNum, pageData);

                setProducts(mapped);
                setTotalElements(res.totalElements);
            }
        } catch (err) {
            console.error("Load products failed:", err);
        } finally {
            setLoading(false);
        }
    }, [search, pageSize]);

    /* ================= PREFETCH NEXT 3 PAGES ================= */
    const prefetchNextPages = useCallback(async (currentPage) => {
        const totalPages = Math.ceil(totalElements / pageSize);
        
        // Prefetch next 3 pages
        for (let offset = 1; offset <= 3; offset++) {
            const nextPage = currentPage + offset;
            
            // Don't prefetch if already on last page or already cached
            if (nextPage > totalPages || cacheRef.current[`page_${nextPage}`]) {
                continue;
            }

            try {
                const res = await getProductsByPage(nextPage - 1, pageSize);
                const mapped = res.products.map(p => ({
                    sp_id: p.id,
                    sp_name: p.name,
                    sp_price: p.price ?? 0,
                    sp_stock: p.stock ?? 0,
                    sp_desc: p.description ?? "",
                    sp_image: p.image ?? "",
                    sp_brand_id: p.brand?.id ?? "",
                    sp_brand_name: p.brand?.name ?? "",
                    sp_category_id: p.category?.id ?? "",
                    sp_category_name: p.category?.name ?? ""
                }));

                cacheRef.current[`page_${nextPage}`] = {
                    products: mapped,
                    totalElements: res.totalElements
                };
            } catch (err) {
                console.error("Prefetch page failed:", err);
            }
        }
    }, [totalElements, pageSize]);

    /* ================= BACKGROUND LOADING ================= */
    const loadAllInBackground = useCallback(async () => {
        // Wait for first page to load and get total
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get total pages from first page data
        const firstPageCache = cacheRef.current["page_1"];
        if (!firstPageCache) return;
        
        const totalPages = Math.ceil(firstPageCache.totalElements / pageSize);
        
        console.log("🔄 Starting background load for", totalPages, "pages");
            
            // Load remaining pages in background
            for (let p = 2; p <= totalPages; p++) {
                // Don't block UI - use requestIdleCallback if available, otherwise setTimeout
                const delay = () => new Promise(resolve => {
                    if (typeof requestIdleCallback !== 'undefined') {
                        requestIdleCallback(() => resolve(), { timeout: 500 });
                    } else {
                        setTimeout(resolve, 50);
                    }
                });
                
                await delay();
                
                // Skip if already cached (memory or localStorage)
                if (cacheRef.current[`page_${p}`]) continue;
                const cachedPage = getCachedPage(p);
                if (cachedPage) {
                    cacheRef.current[`page_${p}`] = cachedPage;
                    continue;
                }
                
                try {
                    const res = await getProductsByPage(p - 1, pageSize);
                    const mapped = res.products.map(prod => ({
                        sp_id: prod.id,
                        sp_name: prod.name,
                        sp_price: prod.price ?? 0,
                        sp_stock: prod.stock ?? 0,
                        sp_desc: prod.description ?? "",
                        sp_image: prod.image ?? "",
                        sp_brand_id: prod.brand?.id ?? "",
                        sp_brand_name: prod.brand?.name ?? "",
                        sp_category_id: prod.category?.id ?? "",
                        sp_category_name: prod.category?.name ?? ""
                    }));

                    const pageData = {
                        products: mapped,
                        totalElements: res.totalElements
                    };

                    cacheRef.current[`page_${p}`] = pageData;
                    setCachedPage(p, pageData);
                } catch (err) {
                    console.error(`Background load page ${p} failed:`, err);
                }
            }
        console.log("✅ Background load completed");
    }, [pageSize]);

    /* ================= INITIAL LOAD ================= */
    useEffect(() => {
        loadProductsPage(1);
        loadAllInBackground();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Chỉ chạy 1 lần khi mount

    /* ================= HANDLE PAGE CHANGE ================= */
    useEffect(() => {
        loadProductsPage(page);
    }, [page, loadProductsPage]);

    /* ================= HANDLE SEARCH ================= */
    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        
        // Debounce search for 300ms
        searchTimeoutRef.current = setTimeout(() => {
            setSearch(searchInput);
            if (searchInput.trim() === "") {
                setPage(1);
                loadProductsPage(1, false);
            }
        }, 300);

        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [searchInput, loadProductsPage]);

    /* ================= CALCULATE TOTAL PAGES ================= */
    const totalPages = Math.max(
        1,
        Math.ceil(totalElements / pageSize)
    );

    /* ================= ACTIONS ================= */
    const openAdd = async () => {
        try {
            setEditing(null);
            
            console.log("=== Opening Add Product Form ===");
            console.log("Available brands (", brands.length, "):", brands);
            console.log("Available categories (", categories.length, "):", categories);
            
            if (brands.length === 0) {
                alert("Chưa có thương hiệu nào! Vui lòng thêm thương hiệu trước khi thêm sản phẩm.");
                return;
            }
            
            // Tự động generate ID từ SP201
            setIsGeneratingId(true);
            let nextId = "SP201"; // Default starting point
            
            try {
                // Fetch page đầu tiên để lấy totalElements
                const firstPageRes = await getProductsByPage(0, pageSize);
                const total = firstPageRes.totalElements || 0;
                
                // Tính page cuối cùng
                const lastPageIndex = Math.max(0, Math.ceil(total / pageSize) - 1);
                
                // Fetch 3 trang cuối để tìm ID cao nhất (thay vì fetch tất cả)
                const pagesToFetch = [];
                for (let i = Math.max(0, lastPageIndex - 2); i <= lastPageIndex; i++) {
                    pagesToFetch.push(getProductsByPage(i, pageSize));
                }
                
                const results = await Promise.all(pagesToFetch);
                const recentProducts = results.flatMap(res => res.products || []);
                
                // Tìm ID cao nhất
                const productIds = recentProducts
                    .map(p => p.id)
                    .filter(id => /^SP\d+$/.test(id))
                    .map(id => parseInt(id.replace('SP', ''), 10))
                    .filter(num => !isNaN(num));
                
                let maxId = Math.max(...productIds, 200); // Minimum 200
                nextId = `SP${String(maxId + 1).padStart(3, '0')}`;
                
                console.log("🎯 Auto-generated next ID:", nextId, "from last", pagesToFetch.length, "pages (", recentProducts.length, "products )");
            } catch (err) {
                console.error("Failed to generate ID:", err);
                // Tiếp tục với default SP201
            }
            
            setForm({
                id: nextId,
                name: "",
                price: 0,
                stock: 0,
                description: "",
                image: "",
                brandId: "",
                categoryId: ""
            });
            setOpenForm(true);
        } catch (err) {
            console.error("Error opening add form:", err);
            alert("Có lỗi khi mở form thêm sản phẩm");
        } finally {
            setIsGeneratingId(false);
        }
    };

    const openEdit = p => {
        setEditing(p);
        setForm({
            id: p.sp_id,
            name: p.sp_name,
            price: p.sp_price,
            stock: p.sp_stock,
            description: p.sp_desc,
            image: p.sp_image,
            brandId: p.sp_brand_id,
            categoryId: p.sp_category_id
        });
        setOpenForm(true);
    };

    const handleSubmit = async () => {
        console.log("=== Product Form Submission ===");
        console.log("Form data before validation:", form);
        console.log("Editing mode:", editing);
        
        // Validate required fields
        if (!form.name || !form.name.trim()) {
            alert("Vui lòng nhập tên sản phẩm");
            return;
        }
        
        if (!form.price || Number(form.price) <= 0) {
            alert("Vui lòng nhập giá sản phẩm hợp lệ");
            return;
        }
        
        if (!form.brandId || form.brandId === "") {
            alert("Vui lòng chọn thương hiệu");
            console.log("Brand validation failed. brandId:", form.brandId);
            return;
        }
        
        // Validate brand exists in loaded brands
        const brandExists = brands.find(b => b.hang_id === form.brandId);
        if (!brandExists) {
            alert("Thương hiệu không hợp lệ hoặc không tồn tại trong hệ thống. Vui lòng chọn lại.");
            console.error("Brand ID not found in brands list:", form.brandId);
            console.log("Available brands:", brands);
            return;
        }
        
        if (!form.categoryId || form.categoryId === "") {
            alert("Vui lòng chọn danh mục");
            console.log("Category validation failed. categoryId:", form.categoryId);
            return;
        }
        
        // Validate ID
        let productId = form.id;
        if (!editing) {
            if (!productId || !productId.trim()) {
                alert("Vui lòng nhập mã sản phẩm");
                return;
            }
            
            // Kiểm tra format ID (SPxxx)
            if (!/^SP\d{3,}$/.test(productId)) {
                alert("Mã sản phẩm phải có định dạng SPxxx (ví dụ: SP201, SP202,...)");
                return;
            }
        }
        
        const payload = {
            ...form,
            id: productId
        };
        
        console.log("=== Payload to submit ===");
        console.log(JSON.stringify(payload, null, 2));
        
        setIsSubmitting(true);
        try {
            if (editing) {
                await updateProduct(editing.sp_id, payload);
                alert("✅ Cập nhật sản phẩm thành công!");
            } else {
                await createProduct(payload);
                alert("✅ Thêm sản phẩm thành công! Mã: " + productId);
            }
            setOpenForm(false);
            
            // Chỉ clear cache của 3 pages đầu (product mới sẽ ở đầu)
            // Giữ lại cache của các page khác để không phải load lại hết
            for (let i = 1; i <= 3; i++) {
                delete cacheRef.current[`page_${i}`];
                localStorage.removeItem(`${CACHE_KEY_PREFIX}${i}`);
            }
            
            // Về page 1 và reload
            setPage(1);
            await loadProductsPage(1, false);
            
            // Trigger lại background load cho các page chưa có cache
            setTimeout(() => loadAllInBackground(), 500);
        } catch (err) {
            console.error("Save product error:", err);
            
            // Parse error message
            let errorMsg = err.message || "Lỗi không xác định";
            if (errorMsg.includes("400")) {
                errorMsg = "Mã sản phẩm đã tồn tại hoặc dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
            }
            alert("❌ Lưu sản phẩm thất bại: " + errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async sp_id => {
        if (!window.confirm("Bạn chắc chắn muốn xoá sản phẩm này?")) return;
        
        setDeletingId(sp_id);
        try {
            await deleteProduct(sp_id);
            
            // Chỉ clear cache của page hiện tại, giữ lại cache khác
            delete cacheRef.current[`page_${page}`];
            localStorage.removeItem(`${CACHE_KEY_PREFIX}${page}`);
            
            // Reload page hiện tại
            await loadProductsPage(page, false);
            alert("✅ Xóa sản phẩm thành công!");
        } catch (err) {
            console.error("Delete product error:", err);
            alert("❌ Xoá sản phẩm thất bại");
        } finally {
            setDeletingId(null);
        }
    };

    return {
        products,
        loading,
        totalElements,

        search: searchInput,
        setSearch: setSearchInput,

        page,
        setPage,
        totalPages,

        openForm,
        setOpenForm,
        editing,

        form,
        setForm,
        isSubmitting,
        isGeneratingId,
        deletingId,
        brands,
        categories,

        openAdd,
        openEdit,
        handleSubmit,
        handleDelete
    };
}
