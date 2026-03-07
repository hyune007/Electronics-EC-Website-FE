import { useEffect, useState, useRef, useCallback } from "react";
import { getProductsByPage, createProduct, updateProduct, deleteProduct } from "../../../../services/productService";
import { getAllBrands } from "../../../../services/brandService";
import { getAllCategories } from "../../../../services/categoryService";

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

    const [allProducts, setAllProducts] = useState([]); // To keep all products for stats and search

    // Global Stats state
    const [globalStats, setGlobalStats] = useState({
        totalValue: 0,
        totalStock: 0,
        lowStock: 0
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
                alert("Không tải được danh sách thương hiệu. Vui lòng thêm thương hiệu trước.");
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
                alert("Không tải được danh sách danh mục. Vui lòng kiểm tra API.");
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

            // If search is active, do local filtering from allProducts
            if (isSearch || search.trim() !== "") {
                const keyword = search.toLowerCase().trim();
                const filtered = allProducts.filter(p =>
                    String(p.sp_name || "").toLowerCase().includes(keyword) ||
                    String(p.sp_id || "").toLowerCase().includes(keyword)
                );

                // Calculate total pages for filtered
                setTotalElements(filtered.length);

                // Slice for pagination
                const startIdx = (pageNum - 1) * pageSize;
                const endIdx = startIdx + pageSize;
                setProducts(filtered.slice(startIdx, endIdx));
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

            setProducts(mapped);
            setTotalElements(res.totalElements);
        } catch (err) {
            console.error("Load products failed:", err);
        } finally {
            setLoading(false);
        }
    }, [search, pageSize, allProducts]);

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
            setGlobalStats({
                totalValue: uniqueProducts.reduce((s, p) => s + (p.sp_price * p.sp_stock), 0),
                totalStock: uniqueProducts.reduce((s, p) => s + p.sp_stock, 0),
                lowStock: uniqueProducts.filter(p => p.sp_stock < 10).length
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
        // Some brand objects may use different property names for id (hang_id, id, hangId)
        const brandExists = brands.find(b => (
            b.hang_id === form.brandId ||
            b.id === form.brandId ||
            b.hangId === form.brandId
        ));
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
            id: productId,
            image: finalImage
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

            alert("✅ Xóa sản phẩm thành công!");
            setTimeout(() => loadAllInBackground(), 500);
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
        globalStats, // Thêm export globalStats

        openAdd,
        openEdit,
        handleSubmit,
        handleDelete
    };
}
