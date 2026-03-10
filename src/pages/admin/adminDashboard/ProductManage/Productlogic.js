import { useEffect, useState, useRef, useCallback } from "react";
import { getProductsByPage, createProduct, updateProduct, deleteProduct } from "../../../../services/productService";
import { getAllBrands } from "../../../../services/brandService";
import { getAllCategories } from "../../../../services/categoryService";
import { showToast } from "../../../../utils/adminToast";

function getNextProductIdFromList(products, totalElements) {
    const ids = (products || []).map((item) => item?.sp_id).filter(Boolean);
    let maxNumber = 0;

    ids.forEach((id) => {
        const match = String(id).match(/^SP(\d+)$/i);
        if (!match) return;
        const num = Number(match[1]);
        if (!Number.isNaN(num)) {
            maxNumber = Math.max(maxNumber, num);
        }
    });

    const fallbackByTotal = Number(totalElements || 0) + 1;
    const nextNumber = Math.max(maxNumber + 1, fallbackByTotal, 1);
    return `SP${String(nextNumber).padStart(3, "0")}`;
}

function getProductIdNum(id) {
    const match = String(id || "").match(/(\d+)$/);
    return match ? Number(match[1]) : 0;
}

function sortProducts(list, sortBy) {
    const sorted = [...list];
    sorted.sort((a, b) => {
        switch (sortBy) {
            case "oldest_id":
                return getProductIdNum(a.sp_id) - getProductIdNum(b.sp_id);
            case "name_az":
                return String(a.sp_name || "").localeCompare(String(b.sp_name || ""), "vi", { sensitivity: "base" });
            case "name_za":
                return String(b.sp_name || "").localeCompare(String(a.sp_name || ""), "vi", { sensitivity: "base" });
            case "price_desc":
                return Number(b.sp_price || 0) - Number(a.sp_price || 0);
            case "price_asc":
                return Number(a.sp_price || 0) - Number(b.sp_price || 0);
            case "stock_desc":
                return Number(b.sp_stock || 0) - Number(a.sp_stock || 0);
            case "stock_asc":
                return Number(a.sp_stock || 0) - Number(b.sp_stock || 0);
            case "value_desc":
                return (Number(b.sp_price || 0) * Number(b.sp_stock || 0)) - (Number(a.sp_price || 0) * Number(a.sp_stock || 0));
            case "low_stock_first":
                return Number(a.sp_stock || 0) - Number(b.sp_stock || 0);
            case "newest_id":
            default:
                return getProductIdNum(b.sp_id) - getProductIdNum(a.sp_id);
        }
    });
    return sorted;
}

// Cache helpers
const CACHE_KEY_PREFIX = "product_page_v2_";

function getCachedPage(pageNum) {
    return null; // Disable localStorage read cache for admin panels to prevent stale data
}

function setCachedPage(pageNum, data) {
    // Disable localStorage write cache
}

export function useProductManageLogic() {
    const [products, setProducts] = useState([]); // Products of current page
    const [loading, setLoading] = useState(false);
    const [totalElements, setTotalElements] = useState(0);

    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [sortBy, setSortBy] = useState("newest_id");
    const [page, setPage] = useState(1);
    const pageSize = 12; // Increased from 8 to 12

    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState(null);
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

    const [allProducts, setAllProducts] = useState([]); // To keep all products for stats and search

    // Global Stats state
    const [globalStats, setGlobalStats] = useState({
        totalProducts: 0,
        totalValue: 0,
        totalStock: 0,
        lowStock: 0,
        outOfStock: 0,
        averagePrice: 0,
        inStockRate: 0
    });

    const [brands, setBrands] = useState([]);
    const [allBrands, setAllBrands] = useState([]); // Lưu tất cả brands
    const [categories, setCategories] = useState([]);
    const [allCategories, setAllCategories] = useState([]); // Lưu tất cả categories

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
                showToast("Không tải được danh sách thương hiệu. Vui lòng thêm thương hiệu trước.", "error", 3400);
            }
        };
        loadBrands();
    }, []);

    /* ================= LOAD CATEGORIES ================= */
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categoryList = await getAllCategories();
                console.log("=== Categories loaded from backend ===");
                console.log("Total categories:", categoryList.length);
                console.log("Categories:", categoryList);

                if (categoryList.length === 0) {
                    console.warn("WARNING: No categories loaded! Please add categories first.");
                }

                // Map dm_id -> id and dm_name -> name for consistency
                const mappedCategories = categoryList.map(c => ({
                    id: c.dm_id,
                    name: c.dm_name
                }));

                setAllCategories(mappedCategories);
                setCategories(mappedCategories);
            } catch (err) {
                console.error("Failed to load categories:", err);
                showToast("Không tải được danh sách danh mục. Vui lòng kiểm tra API.", "error", 3400);
            }
        };
        loadCategories();
    }, []);

    /* ================= NO BRAND FILTER ================= */
    useEffect(() => {
        setBrands(allBrands);
    }, [allBrands]);

    /* ================= LOAD PRODUCTS BY PAGE ================= */
    const loadProductsPage = useCallback(async (pageNum, isSearch = false) => {
        try {
            setLoading(true);

            const keyword = search.toLowerCase().trim();
            const shouldUseLocalData = allProducts.length > 0 && (keyword !== "" || sortBy !== "newest_id");

            if (shouldUseLocalData) {
                const filtered = allProducts.filter(p =>
                    String(p.sp_name || "").toLowerCase().includes(keyword) ||
                    String(p.sp_id || "").toLowerCase().includes(keyword)
                );

                const sorted = sortProducts(filtered, sortBy);
                setTotalElements(sorted.length);

                const startIdx = (pageNum - 1) * pageSize;
                const endIdx = startIdx + pageSize;
                setProducts(sorted.slice(startIdx, endIdx));
                setLoading(false);
                return;
            }

            // If search is active, do local filtering from allProducts
            if (isSearch || search.trim() !== "") {
                const filtered = allProducts.filter(p =>
                    String(p.sp_name || "").toLowerCase().includes(keyword) ||
                    String(p.sp_id || "").toLowerCase().includes(keyword)
                );

                const sorted = sortProducts(filtered, sortBy);

                // Calculate total pages for filtered
                setTotalElements(sorted.length);

                // Slice for pagination
                const startIdx = (pageNum - 1) * pageSize;
                const endIdx = startIdx + pageSize;
                setProducts(sorted.slice(startIdx, endIdx));
                setLoading(false);
                return;
            }

            // Normal load
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
                sp_raw_image: p.raw_image ?? "",
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

            setProducts(sortProducts(mapped, sortBy));
            setTotalElements(res.totalElements);
        } catch (err) {
            console.error("Load products failed:", err);
        } finally {
            setLoading(false);
        }
    }, [search, pageSize, allProducts, sortBy]);

    /* ================= BACKGROUND LOADING ================= */
    const loadAllInBackground = useCallback(async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            // Tải tuần tự qua các trang để tính thống kê và search, tránh việc BE giới hạn size
            let allLoadedProducts = [];
            let currentPage = 0;
            let hasMore = true;

            while (hasMore) {
                const res = await getProductsByPage(currentPage, 50);
                allLoadedProducts = [...allLoadedProducts, ...res.products];

                if (res.isLast || res.products.length === 0) {
                    hasMore = false;
                } else {
                    currentPage++;
                }
            }

            const mappedAll = allLoadedProducts.map(prod => ({
                ...prod,
                sp_id: prod.id,
                sp_name: prod.name,
                sp_price: Number(prod.price ?? 0),
                sp_stock: Number(prod.stock ?? 0),
                sp_desc: prod.description ?? "",
                sp_image: prod.image ?? "",
                sp_raw_image: prod.raw_image ?? "",
                sp_brand_id: prod.brand?.id ?? "",
                sp_brand_name: prod.brand?.name ?? "",
                sp_category_id: prod.category?.id ?? "",
                sp_category_name: prod.category?.name ?? ""
            }));

            // Xóa trùng lặp (nếu có) do sai sót logic BE
            const uniqueProducts = Array.from(new Map(mappedAll.map(p => [p.sp_id, p])).values());
            setAllProducts(uniqueProducts);

            // Calculate global stats
            const totalProducts = uniqueProducts.length;
            const totalValue = uniqueProducts.reduce((s, p) => s + (p.sp_price * p.sp_stock), 0);
            const totalStock = uniqueProducts.reduce((s, p) => s + p.sp_stock, 0);
            const lowStock = uniqueProducts.filter(p => p.sp_stock > 0 && p.sp_stock < 10).length;
            const outOfStock = uniqueProducts.filter(p => p.sp_stock <= 0).length;
            const averagePrice = totalProducts > 0
                ? Math.round(uniqueProducts.reduce((s, p) => s + Number(p.sp_price || 0), 0) / totalProducts)
                : 0;
            const inStockRate = totalProducts > 0
                ? Math.round(((totalProducts - outOfStock) / totalProducts) * 100)
                : 0;

            setGlobalStats({
                totalProducts,
                totalValue,
                totalStock,
                lowStock,
                outOfStock,
                averagePrice,
                inStockRate,
            });
            console.log("✅ Background load completed. Total Loaded:", uniqueProducts.length);
        } catch (err) {
            console.error("Background load failed:", err);
        }
    }, []);

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

        // Debounce search for 500ms
        searchTimeoutRef.current = setTimeout(() => {
            setSearch(searchInput);
            setPage(1); // Reset page on new search
            if (searchInput.trim() === "") {
                loadProductsPage(1, false);
            } else {
                loadProductsPage(1, true);
            }
        }, 500);

        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [searchInput, loadProductsPage]);

    useEffect(() => {
        setPage(1);
    }, [sortBy]);

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
                showToast("Chưa có thương hiệu nào. Vui lòng thêm thương hiệu trước khi thêm sản phẩm.", "warning", 3400);
                return;
            }

            setForm({
                id: getNextProductIdFromList(allProducts, totalElements),
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
            showToast("Có lỗi khi mở form thêm sản phẩm", "error");
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
            image: p.sp_raw_image, // Lấy đường dẫn gốc thay vì đường dẫn đã gán localhost
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
            showToast("Vui lòng nhập tên sản phẩm", "warning");
            return;
        }

        if (!form.price || Number(form.price) <= 0) {
            showToast("Vui lòng nhập giá sản phẩm hợp lệ", "warning");
            return;
        }

        if (!form.brandId || form.brandId === "") {
            showToast("Vui lòng chọn thương hiệu", "warning");
            console.log("Brand validation failed. brandId:", form.brandId);
            return;
        }

        // Validate brand exists in loaded brands
        // Some brand objects may use different property names for id (hang_id, id, hangId)
        const brandExists = brands.find(b => (
            b.hang_id === form.brandId ||
            b.id === form.brandId ||
            b.hangId === form.brandId
        ));
        if (!brandExists) {
            showToast("Thương hiệu không hợp lệ hoặc không tồn tại trong hệ thống. Vui lòng chọn lại.", "warning", 3400);
            console.error("Brand ID not found in brands list:", form.brandId);
            console.log("Available brands:", brands);
            return;
        }

        if (!form.categoryId || form.categoryId === "") {
            showToast("Vui lòng chọn danh mục", "warning");
            console.log("Category validation failed. categoryId:", form.categoryId);
            return;
        }

        if (!form.description || !form.description.trim()) {
            showToast("Vui lòng nhập mô tả sản phẩm", "warning");
            return;
        }

        if (!form.image || !form.image.trim()) {
            showToast("Vui lòng nhập URL hình ảnh sản phẩm", "warning");
            return;
        }

        let finalImage = form.image;
        if (finalImage) {
            // Nếu phát hiện có chứa link http/https bên trong chuỗi bị nối
            const httpIndex = finalImage.indexOf("http://");
            const httpsIndex = finalImage.indexOf("https://");

            if (httpIndex >= 0) {
                finalImage = finalImage.substring(httpIndex);
            } else if (httpsIndex >= 0) {
                finalImage = finalImage.substring(httpsIndex);
            } else {
                // Chỉ cắt tiền tố thư mục đối với ảnh cục bộ
                const matchIndex = finalImage.lastIndexOf("/photos/products/");
                if (matchIndex >= 0) {
                    finalImage = finalImage.substring(matchIndex);

                    const expectedPrefix = `/photos/products/${form.categoryId}/`;
                    if (finalImage.startsWith(expectedPrefix)) {
                        finalImage = finalImage.replace(expectedPrefix, "");
                    }
                }
            }
        }

        const payload = {
            ...form,
            name: form.name.trim(),
            description: form.description.trim(),
            image: finalImage
        };

        console.log("=== Payload to submit ===");
        console.log(JSON.stringify(payload, null, 2));

        setIsSubmitting(true);
        try {
            if (editing) {
                await updateProduct(editing.sp_id, payload);
                showToast("Cập nhật sản phẩm thành công", "success");
            } else {
                await createProduct(payload);
                showToast("Thêm sản phẩm thành công", "success");
            }
            setOpenForm(false);

            // Clear all cache to ensure correct data and pagination
            cacheRef.current = {};
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(CACHE_KEY_PREFIX)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));

            if (editing) {
                await loadProductsPage(page, false);
            } else {
                // Đi tới trang cuối cùng để thấy sản phẩm vừa thêm
                const newTotalElems = totalElements + 1;
                const lastPage = Math.max(1, Math.ceil(newTotalElems / pageSize));
                setPage(lastPage);
                await loadProductsPage(lastPage, false);
            }

            // Trigger lại background load cho các page chưa có cache
            setTimeout(() => loadAllInBackground(), 500);
        } catch (err) {
            console.error("Save product error:", err);

            // Parse error message
            let errorMsg = err.message || "Lỗi không xác định";
            if (errorMsg.includes("400")) {
                errorMsg = "Mã sản phẩm đã tồn tại hoặc dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
            }
            showToast("Lưu sản phẩm thất bại: " + errorMsg, "error", 3600);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async sp_id => {
        if (!window.confirm("Bạn chắc chắn muốn xoá sản phẩm này?")) return;

        setDeletingId(sp_id);
        try {
            await deleteProduct(sp_id);

            // Clear all cache to ensure correct data and pagination
            cacheRef.current = {};
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(CACHE_KEY_PREFIX)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));

            // Điều chỉnh page nếu page hiện tại trống
            const newTotalElems = Math.max(0, totalElements - 1);
            const newTotalPages = Math.max(1, Math.ceil(newTotalElems / pageSize));
            const targetPage = Math.min(page, newTotalPages);

            if (targetPage !== page) {
                setPage(targetPage);
            } else {
                await loadProductsPage(page, false);
            }

            showToast("Xóa sản phẩm thành công", "success");
            setTimeout(() => loadAllInBackground(), 500);
        } catch (err) {
            console.error("Delete product error:", err);
            showToast("Xóa sản phẩm thất bại", "error");
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
        sortBy,
        setSortBy,

        page,
        setPage,
        totalPages,

        openForm,
        setOpenForm,
        editing,

        form,
        setForm,
        isSubmitting,
        deletingId,
        brands,
        categories,
        globalStats, // Thêm export globalStats

        openAdd,
        openEdit,
        handleSubmit,
        handleDelete
    };
}
