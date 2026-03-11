import { useEffect, useState, useRef, useCallback } from "react";
import { getProductsByPage, createProduct, updateProduct, deleteProduct } from "../../../../services/productService";
import { getAllBrands } from "../../../../services/brandService";
import { getAllCategories } from "../../../../services/categoryService";
import { showToast } from "../../../../utils/adminToast";
import { getCache, setCache, removeCache, removeCacheByPrefix } from "../../../../utils/localCache";

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
const PRODUCT_PAGE_CACHE_TTL = 5 * 60 * 1000;
const PRODUCT_STATS_CACHE_KEY = "product_stats_v1";
const PRODUCT_STATS_CACHE_TTL = 10 * 60 * 1000;
const BG_PAGE_SIZE = 100;
const BG_PAGE_CONCURRENCY = 4;

function getCachedPage(pageNum) {
    return getCache(`${CACHE_KEY_PREFIX}${pageNum}`, PRODUCT_PAGE_CACHE_TTL);
}

function setCachedPage(pageNum, data) {
    setCache(`${CACHE_KEY_PREFIX}${pageNum}`, data);
}

function toUiProduct(prod) {
    return {
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
    };
}

function computeGlobalStats(list) {
    const totalProducts = list.length;
    const totalValue = list.reduce((s, p) => s + (Number(p.sp_price || 0) * Number(p.sp_stock || 0)), 0);
    const totalStock = list.reduce((s, p) => s + Number(p.sp_stock || 0), 0);
    const lowStock = list.filter((p) => Number(p.sp_stock || 0) > 0 && Number(p.sp_stock || 0) < 10).length;
    const outOfStock = list.filter((p) => Number(p.sp_stock || 0) <= 0).length;
    const averagePrice = totalProducts > 0
        ? Math.round(list.reduce((s, p) => s + Number(p.sp_price || 0), 0) / totalProducts)
        : 0;
    const inStockRate = totalProducts > 0
        ? Math.round(((totalProducts - outOfStock) / totalProducts) * 100)
        : 0;

    return {
        totalProducts,
        totalValue,
        totalStock,
        lowStock,
        outOfStock,
        averagePrice,
        inStockRate,
    };
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
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [isImportingFile, setIsImportingFile] = useState(false);

    // Cache: store loaded pages to avoid re-fetching
    const cacheRef = useRef({});
    const searchTimeoutRef = useRef(null);
    const allProductsLoadingRef = useRef(false);

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

    useEffect(() => {
        const cachedStats = getCache(PRODUCT_STATS_CACHE_KEY, PRODUCT_STATS_CACHE_TTL);
        if (cachedStats) {
            setGlobalStats(cachedStats);
        }
    }, []);

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
        if (allProductsLoadingRef.current || allProducts.length > 0) return;

        try {
            allProductsLoadingRef.current = true;
            const first = await getProductsByPage(0, BG_PAGE_SIZE);
            const totalPages = Math.max(1, Number(first.totalPages || 1));
            const allLoadedProducts = [...(first.products || [])];

            if (totalPages > 1) {
                const pages = Array.from({ length: totalPages - 1 }, (_, idx) => idx + 1);

                for (let i = 0; i < pages.length; i += BG_PAGE_CONCURRENCY) {
                    const chunk = pages.slice(i, i + BG_PAGE_CONCURRENCY);
                    const results = await Promise.all(chunk.map((p) => getProductsByPage(p, BG_PAGE_SIZE)));
                    results.forEach((res) => {
                        if (Array.isArray(res?.products)) {
                            allLoadedProducts.push(...res.products);
                        }
                    });
                }
            }

            const mappedAll = allLoadedProducts.map(toUiProduct);

            // Xóa trùng lặp (nếu có) do sai sót logic BE
            const uniqueProducts = Array.from(new Map(mappedAll.map(p => [p.sp_id, p])).values());
            setAllProducts(uniqueProducts);

            const stats = computeGlobalStats(uniqueProducts);
            setGlobalStats(stats);
            setCache(PRODUCT_STATS_CACHE_KEY, stats);
            console.log("✅ Background load completed. Total Loaded:", uniqueProducts.length);
        } catch (err) {
            console.error("Background load failed:", err);
        } finally {
            allProductsLoadingRef.current = false;
        }
    }, [allProducts.length]);

    /* ================= INITIAL LOAD ================= */
    useEffect(() => {
        loadProductsPage(1);
        loadAllInBackground();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Chỉ tải trang hiện tại khi mở màn hình

    /* ================= HANDLE PAGE CHANGE ================= */
    useEffect(() => {
        loadProductsPage(page);
    }, [page, loadProductsPage]);

    /* ================= HANDLE SEARCH ================= */
    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        // Debounce search for 500ms
        searchTimeoutRef.current = setTimeout(() => {
            if (searchInput.trim() && allProducts.length === 0) {
                loadAllInBackground();
            }
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

    const normalizeImportRows = (rows) => {
        const brandByName = new Map(allBrands.map((b) => [String(b.hang_name || b.name || "").toLowerCase(), String(b.hang_id || b.id || "")]));
        const validBrandIds = new Set(allBrands.map((b) => String(b.hang_id || b.id || "")));
        const categoryByName = new Map(allCategories.map((c) => [String(c.name || "").toLowerCase(), String(c.id || "")]));
        const validCategoryIds = new Set(allCategories.map((c) => String(c.id || "")));

        const normalizeHeader = (value) => String(value || "")
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");

        return rows.map((row, index) => {
            const normalizedRow = new Map(
                Object.entries(row || {}).map(([key, value]) => [normalizeHeader(key), value]),
            );

            const pick = (aliases) => {
                for (const alias of aliases) {
                    const direct = row?.[alias];
                    if (direct !== undefined && direct !== null && String(direct).trim() !== "") {
                        return direct;
                    }

                    const normalized = normalizedRow.get(normalizeHeader(alias));
                    if (normalized !== undefined && normalized !== null && String(normalized).trim() !== "") {
                        return normalized;
                    }
                }
                return "";
            };

            const brandIdRaw = pick([
                "brandId", "brand_id", "brand", "brandname", "thuonghieu", "thương hiệu", "hang", "hãng",
            ]);

            const categoryIdRaw = pick([
                "categoryId", "category_id", "category", "categoryname", "danhmuc", "danh mục", "loai", "loại",
            ]);

            const normalizedBrand = String(brandIdRaw || "").trim();
            const normalizedCategory = String(categoryIdRaw || "").trim();

            const brandId = validBrandIds.has(normalizedBrand)
                ? normalizedBrand
                : (brandByName.get(normalizedBrand.toLowerCase()) || "");

            const categoryId = validCategoryIds.has(normalizedCategory)
                ? normalizedCategory
                : (categoryByName.get(normalizedCategory.toLowerCase()) || "");

            return {
                rowNo: index + 2,
                id: String(pick(["id", "sp_id", "ma", "mã", "ma san pham", "mã sản phẩm", "masanpham"]) || "").trim(),
                name: String(pick(["name", "sp_name", "ten", "tên", "sanpham", "sản phẩm", "tensanpham"]) || "").trim(),
                price: Number(pick(["price", "sp_price", "gia", "giá", "dongia", "đơn giá"]) || 0),
                stock: Number(pick(["stock", "sp_stock", "kho", "soluong", "số lượng", "tonkho", "tồn kho"]) || 0),
                description: String(pick(["description", "sp_desc", "mota", "mô tả"]) || "").trim(),
                image: String(pick(["image", "sp_image", "anh", "ảnh", "hinhanh", "hình ảnh", "url"]) || "").trim(),
                brandId,
                categoryId,
            };
        });
    };

    const handleBulkImportFile = async (file) => {
        if (!file) return;

        if (allBrands.length === 0 || allCategories.length === 0) {
            showToast("Cần có dữ liệu thương hiệu và danh mục trước khi import", "warning", 3400);
            return;
        }

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

            const rows = normalizeImportRows(rawRows);
            const invalidRows = rows.filter((row) => {
                return !row.id || !row.name || row.price <= 0 || row.stock < 0 || !row.brandId || !row.categoryId;
            });

            if (invalidRows.length > 0) {
                showToast(`Có ${invalidRows.length} dòng lỗi dữ liệu. Vui lòng kiểm tra lại file.`, "warning", 4200);
                return;
            }

            const results = await runWithConcurrency(rows, 3, async (row) => {
                try {
                    await createProduct({
                        id: row.id,
                        name: row.name,
                        price: row.price,
                        stock: row.stock,
                        description: row.description,
                        image: row.image,
                        brandId: row.brandId,
                        categoryId: row.categoryId,
                    });
                    return { ok: true };
                } catch (error) {
                    return { ok: false, message: error?.message || "Lỗi tạo sản phẩm" };
                }
            });

            const success = results.filter((r) => r.ok).length;
            const failed = results.length - success;

            cacheRef.current = {};
            removeCacheByPrefix(CACHE_KEY_PREFIX);
            removeCache(PRODUCT_STATS_CACHE_KEY);
            setAllProducts([]);

            await loadProductsPage(1, false);
            setPage(1);
            loadAllInBackground();

            if (failed === 0) {
                showToast(`Import thành công ${success} sản phẩm`, "success");
            } else {
                showToast(`Import xong: ${success} thành công, ${failed} thất bại`, "warning", 4200);
            }
        } catch (err) {
            console.error("Bulk import failed:", err);
            showToast("Import file thất bại. Hỗ trợ: XLSX, XLS, CSV, JSON.", "error", 3600);
        } finally {
            setIsImportingFile(false);
        }
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

                const addedPrice = Number(payload.price || 0);
                const addedStock = Number(payload.stock || 0);
                setGlobalStats((prev) => {
                    const prevTotalProducts = Number(prev?.totalProducts || 0);
                    const prevTotalValue = Number(prev?.totalValue || 0);
                    const prevTotalStock = Number(prev?.totalStock || 0);
                    const prevLowStock = Number(prev?.lowStock || 0);
                    const prevOutOfStock = Number(prev?.outOfStock || 0);
                    const prevAveragePrice = Number(prev?.averagePrice || 0);

                    const totalProducts = prevTotalProducts + 1;
                    const totalValue = prevTotalValue + (addedPrice * addedStock);
                    const totalStock = prevTotalStock + addedStock;
                    const lowStock = prevLowStock + (addedStock > 0 && addedStock < 10 ? 1 : 0);
                    const outOfStock = prevOutOfStock + (addedStock <= 0 ? 1 : 0);
                    const averagePrice = totalProducts > 0
                        ? Math.round(((prevAveragePrice * prevTotalProducts) + addedPrice) / totalProducts)
                        : 0;
                    const inStockRate = totalProducts > 0
                        ? Math.round(((totalProducts - outOfStock) / totalProducts) * 100)
                        : 0;

                    const optimisticStats = {
                        totalProducts,
                        totalValue,
                        totalStock,
                        lowStock,
                        outOfStock,
                        averagePrice,
                        inStockRate,
                    };

                    setCache(PRODUCT_STATS_CACHE_KEY, optimisticStats);
                    return optimisticStats;
                });

                showToast("Thêm sản phẩm thành công", "success");
            }
            setOpenForm(false);

            // Clear all cache to ensure correct data and pagination
            cacheRef.current = {};
            removeCacheByPrefix(CACHE_KEY_PREFIX);
            removeCache(PRODUCT_STATS_CACHE_KEY);
            setAllProducts([]);

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
            loadAllInBackground();
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
            removeCacheByPrefix(CACHE_KEY_PREFIX);
            removeCache(PRODUCT_STATS_CACHE_KEY);
            setAllProducts([]);

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
            loadAllInBackground();
        } catch (err) {
            console.error("Delete product error:", err);
            showToast("Xóa sản phẩm thất bại", "error");
        } finally {
            setDeletingId(null);
        }
    };

    const handleDeleteMany = async (ids = []) => {
        const uniqueIds = Array.from(new Set((ids || []).filter(Boolean)));
        if (uniqueIds.length === 0) return;

        setIsBulkDeleting(true);
        try {
            const results = await runWithConcurrency(uniqueIds, 3, async (id) => {
                try {
                    await deleteProduct(id);
                    return { ok: true };
                } catch (error) {
                    return { ok: false, message: error?.message || "Lỗi xóa sản phẩm" };
                }
            });

            const success = results.filter((r) => r.ok).length;
            const failed = results.length - success;

            cacheRef.current = {};
            removeCacheByPrefix(CACHE_KEY_PREFIX);
            removeCache(PRODUCT_STATS_CACHE_KEY);
            setAllProducts([]);

            const newTotalElems = Math.max(0, totalElements - success);
            const newTotalPages = Math.max(1, Math.ceil(newTotalElems / pageSize));
            const targetPage = Math.min(page, newTotalPages);

            if (targetPage !== page) {
                setPage(targetPage);
                await loadProductsPage(targetPage, false);
            } else {
                await loadProductsPage(page, false);
            }

            loadAllInBackground();

            if (failed === 0) {
                showToast(`Đã xóa ${success} sản phẩm`, "success");
            } else {
                showToast(`Xóa nhanh: ${success} thành công, ${failed} thất bại`, "warning", 4200);
            }
        } catch (err) {
            console.error("Bulk delete product error:", err);
            showToast("Xóa nhanh sản phẩm thất bại", "error");
        } finally {
            setIsBulkDeleting(false);
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
        isBulkDeleting,
        isImportingFile,
        brands,
        categories,
        globalStats, // Thêm export globalStats

        openAdd,
        openEdit,
        handleBulkImportFile,
        handleSubmit,
        handleDelete,
        handleDeleteMany
    };
}
