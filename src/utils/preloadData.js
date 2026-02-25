import { getProductsByPage } from "../services/productService";
import { getAllBrands } from "../services/brandService";
import { getAllCustomers } from "../services/customerService";
import { getAllEmployees } from "../services/employeeservice";
import { getAllImports } from "../services/importService";
import { getAllPromotions } from "../services/promotionService";

const PRELOAD_META_KEY = "preload_meta_v2";
const PRELOAD_TTL = 24 * 60 * 60 * 1000; // 24 hours
const PRODUCT_PAGE_SIZE = 12;
const PRODUCT_CACHE_PREFIX = "product_page_v2_";
const BRAND_CATEGORY_MAP_KEY = "preload_brand_category_map_v2";

function now() {
    return Date.now();
}

function setCache(key, payload) {
    localStorage.setItem(key, JSON.stringify({
        ...payload,
        timestamp: now()
    }));
}

function setMeta(status) {
    localStorage.setItem(PRELOAD_META_KEY, JSON.stringify({
        status,
        timestamp: now()
    }));
}

export function shouldPreload() {
    try {
        const raw = localStorage.getItem(PRELOAD_META_KEY);
        if (!raw) return true;
        const meta = JSON.parse(raw);
        if (!meta?.timestamp) return true;
        return now() - meta.timestamp > PRELOAD_TTL;
    } catch (err) {
        console.error("Preload meta read failed:", err);
        return true;
    }
}

function mapProductsToUI(list) {
    return list.map(p => ({
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
}

function buildBrandCategoryMap(products, map) {
    products.forEach(p => {
        const brandId = p.sp_brand_id;
        const categoryId = p.sp_category_id;
        if (!brandId || !categoryId) return;
        if (!map[brandId]) {
            map[brandId] = new Set();
        }
        map[brandId].add(categoryId);
    });
}

function persistBrandCategoryMap(map) {
    const normalized = {};
    Object.keys(map).forEach(key => {
        normalized[key] = Array.from(map[key]);
    });
    setCache(BRAND_CATEGORY_MAP_KEY, { map: normalized });
}

export async function preloadAllData({ onProgress, onPhaseChange }) {
    setMeta("running");

    // Phase 1: preload brands + 50% product pages
    if (onPhaseChange) onPhaseChange("loading-initial");
    const brandList = await getAllBrands();
    setCache("brand_data", { brands: brandList });

    const firstPage = await getProductsByPage(0, PRODUCT_PAGE_SIZE);
    const totalPages = Math.max(1, firstPage.totalPages ?? 1);
    const halfPages = Math.max(1, Math.ceil(totalPages / 2));

    const brandCategoryMap = {};
    const allPages = [];

    const firstMapped = mapProductsToUI(firstPage.products);
    allPages.push({ pageNum: 1, products: firstMapped });
    buildBrandCategoryMap(firstMapped, brandCategoryMap);

    for (let p = 1; p < halfPages; p++) {
        const res = await getProductsByPage(p, PRODUCT_PAGE_SIZE);
        const mapped = mapProductsToUI(res.products);
        allPages.push({ pageNum: p + 1, products: mapped });
        buildBrandCategoryMap(mapped, brandCategoryMap);
        if (onProgress) {
            const percent = Math.round(((p + 1) / halfPages) * 50);
            onProgress(Math.min(50, Math.max(1, percent)));
        }
    }

    allPages.forEach(page => {
        setCache(`${PRODUCT_CACHE_PREFIX}${page.pageNum}`, {
            products: page.products,
            totalElements: firstPage.totalElements ?? page.products.length
        });
    });

    persistBrandCategoryMap(brandCategoryMap);

    if (onProgress) onProgress(50);

    // Phase 2: load remaining data in background
    if (onPhaseChange) onPhaseChange("loading-background");

    const remainingPages = Math.max(0, totalPages - halfPages);
    const tasks = remainingPages + 4; // customers, employees, imports, promotions
    let completed = 0;

    for (let p = halfPages; p < totalPages; p++) {
        const res = await getProductsByPage(p, PRODUCT_PAGE_SIZE);
        const mapped = mapProductsToUI(res.products);
        setCache(`${PRODUCT_CACHE_PREFIX}${p + 1}`, {
            products: mapped,
            totalElements: res.totalElements ?? mapped.length
        });
        buildBrandCategoryMap(mapped, brandCategoryMap);
        completed += 1;
        if (onProgress) {
            const percent = 50 + Math.round((completed / tasks) * 50);
            onProgress(Math.min(100, percent));
        }
    }

    const customers = await getAllCustomers();
    setCache("customer_data", { customers });
    completed += 1;
    if (onProgress) onProgress(50 + Math.round((completed / tasks) * 50));

    const firstEmp = await getAllEmployees(0, "");
    setCache("employee_page_0", {
        employees: firstEmp.employees,
        totalPages: firstEmp.totalPages
    });

    const empTotal = Math.max(1, firstEmp.totalPages ?? 1);
    for (let p = 1; p < empTotal; p++) {
        const page = await getAllEmployees(p, "");
        setCache(`employee_page_${p}`, {
            employees: page.employees,
            totalPages: page.totalPages
        });
    }
    completed += 1;
    if (onProgress) onProgress(50 + Math.round((completed / tasks) * 50));

    const imports = await getAllImports();
    setCache("import_data", { imports });
    completed += 1;
    if (onProgress) onProgress(50 + Math.round((completed / tasks) * 50));

    const vouchers = await getAllPromotions();
    setCache("voucher_data_api_v2", { vouchers });
    completed += 1;
    if (onProgress) onProgress(50 + Math.round((completed / tasks) * 50));

    persistBrandCategoryMap(brandCategoryMap);
    setMeta("done");
    if (onPhaseChange) onPhaseChange("done");
    if (onProgress) onProgress(100);
}
