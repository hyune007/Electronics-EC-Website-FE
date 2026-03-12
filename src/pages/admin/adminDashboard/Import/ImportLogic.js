import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
    getAllImports,
    createImport,
    updateImport,
    deleteImport,
    setCreatorNameForImport,
    removeCreatorNameForImport,
} from "../../../../services/importService";
import {
    getAllProducts,
    getProductById,
    updateProduct as updateProductInventory,
} from "../../../../services/productService";
import { showToast } from "../../../../utils/adminToast";
import { generateSmartNextId } from "../../../../utils/codeGenerator";
import { getCache, setCache, removeCache, removeCacheByPrefix } from "../../../../utils/localCache";

const IMPORT_CACHE_KEY = "admin_imports_v1";
const IMPORT_PRODUCTS_CACHE_KEY = "admin_import_products_v1";
const IMPORT_CACHE_TTL = 5 * 60 * 1000;
const PRODUCT_CACHE_KEY_PREFIX = "product_page_v2_";
const PRODUCT_STATS_CACHE_KEY = "product_stats_v1";

function decodeJwtPayload(token) {
    try {
        if (!token) return null;
        const parts = token.split(".");
        if (parts.length < 2) return null;
        const payload = parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/")
            .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
}

function canWriteProductInventory() {
    const token = localStorage.getItem("authToken");
    const payload = decodeJwtPayload(token);
    const rawRole = String(payload?.roleId || payload?.role || "").toUpperCase();
    return rawRole.includes("ADMIN") || rawRole.includes("EMPLOYEE");
}

function formatYmd(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function parseImportDate(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return formatYmd(value);
    }

    if (typeof value === "number" && Number.isFinite(value)) {
        const parsed = XLSX.SSF.parse_date_code(value);
        if (parsed?.y && parsed?.m && parsed?.d) {
            const date = new Date(parsed.y, parsed.m - 1, parsed.d);
            return formatYmd(date);
        }
    }

    const raw = String(value || "").trim();
    if (!raw) return "";

    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);

    const dmy = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (dmy) {
        const day = Number(dmy[1]);
        const month = Number(dmy[2]);
        const year = Number(dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3]);
        const date = new Date(year, month - 1, day);
        if (!Number.isNaN(date.getTime())) return formatYmd(date);
    }

    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return formatYmd(parsed);
    return "";
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
        .map((line) => line.trim())
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

function parseExcel(arrayBuffer) {
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

export function useImportLogic() {
    const [list, setList] = useState([]);
    const [products, setProducts] = useState([
        { sp_id: "SP001", sp_name: "iPhone 15 Pro Max", sp_brand: "Apple", sp_category: "Điện thoại", sp_price: 28990000, sp_stock: 25 },
        { sp_id: "SP002", sp_name: "Samsung Galaxy S24 Ultra", sp_brand: "Samsung", sp_category: "Điện thoại", sp_price: 25990000, sp_stock: 15 },
        { sp_id: "SP003", sp_name: "MacBook Pro 14\"", sp_brand: "Apple", sp_category: "Laptop", sp_price: 45990000, sp_stock: 8 },
        { sp_id: "SP004", sp_name: "iPad Air", sp_brand: "Apple", sp_category: "Tablet", sp_price: 12990000, sp_stock: 30 },
        { sp_id: "SP005", sp_name: "AirPods Pro", sp_brand: "Apple", sp_category: "Tai nghe", sp_price: 5990000, sp_stock: 50 },
        { sp_id: "SP006", sp_name: "Sony WH-1000XM5", sp_brand: "Sony", sp_category: "Tai nghe", sp_price: 8990000, sp_stock: 12 }
    ]);
    const [search, setSearch] = useState("");
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    const emptyForm = {
        nk_id: "",
        sp_brand: "",
        sp_category: "",
        sp_id: "",
        nk_quantity: "",
        nk_date: new Date().toISOString().slice(0, 10)
    };

    const [form, setForm] = useState(emptyForm);
    const [importMode, setImportMode] = useState("single");
    const [showModeDropdown, setShowModeDropdown] = useState(false);
    const [isImportingFile, setIsImportingFile] = useState(false);
    const [bulkImportData, setBulkImportData] = useState([]);

    /* ================= LOAD DATA ================= */
    useEffect(() => {
        const cachedImports = getCache(IMPORT_CACHE_KEY, IMPORT_CACHE_TTL);
        const cachedProducts = getCache(IMPORT_PRODUCTS_CACHE_KEY, IMPORT_CACHE_TTL);

        if (cachedImports) setList(cachedImports);
        if (Array.isArray(cachedProducts) && cachedProducts.length > 0) {
            setProducts(cachedProducts);
        }

        const shouldShowLoading = !cachedImports;
        loadInitialData(shouldShowLoading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const mapProductsFromApi = (data) => {
        if (!data || !Array.isArray(data) || data.length === 0) return null;

        return data.map(p => ({
            sp_id: p.id || p.sp_id || "",
            sp_name: p.name || p.sp_name || "",
            sp_brand: p.brand?.name || p.sp_brand_name || "",
            sp_category: p.category?.name || p.sp_category_name || "",
            sp_price: p.price || p.sp_price || 0,
            sp_stock: p.stock || p.sp_stock || 0
        }));
    };

    const loadInitialData = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);

            const [importsResult, productsResult] = await Promise.allSettled([
                getAllImports(),
                getAllProducts(),
            ]);

            if (importsResult.status === "fulfilled") {
                setList(importsResult.value);
                setCache(IMPORT_CACHE_KEY, importsResult.value);
            } else {
                // Fallback: try cache
                const cached = getCache(IMPORT_CACHE_KEY, IMPORT_CACHE_TTL);
                if (cached && cached.length > 0) {
                    setList(cached);
                } else if (showLoading) {
                    console.warn("Không thể tải nhập kho từ API hoặc cache");
                }
            }

            if (productsResult.status === "fulfilled") {
                const mappedProducts = mapProductsFromApi(productsResult.value);
                if (mappedProducts && mappedProducts.length > 0) {
                    setProducts(mappedProducts);
                    setCache(IMPORT_PRODUCTS_CACHE_KEY, mappedProducts);
                }
            }
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const fetchImports = async () => {
        try {
            setLoading(true);
            const data = await getAllImports();
            setList(data);
            setCache(IMPORT_CACHE_KEY, data);
        } catch (err) {
            console.warn("Lỗi tải danh sách nhập kho từ API, đang dùng cache:", err);
            // Fallback: try cache
            const cached = getCache(IMPORT_CACHE_KEY, IMPORT_CACHE_TTL);
            if (cached && cached.length > 0) {
                setList(cached);
            } else {
                showToast("Không tải được danh sách nhập kho", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            console.log("Fetching products for import form...");
            const data = await getAllProducts();
            console.log("Products data received:", data);
            
            // If API returns data, use it (but keep mock as fallback)
            if (data && Array.isArray(data) && data.length > 0) {
                const mappedProducts = mapProductsFromApi(data);
                console.log("Using API products for import:", mappedProducts);
                setProducts(mappedProducts);
                setCache(IMPORT_PRODUCTS_CACHE_KEY, mappedProducts);
            } else {
                console.log("API returned no data, keeping mock products");
            }
        } catch (err) {
            console.error("Lỗi tải danh sách sản phẩm:", err);
            console.log("API failed, keeping mock products");
        }
    };

    /* ================= FILTER ================= */
    const filteredList = useMemo(() => {
        const keyword = search.toLowerCase().trim();
        return list.filter(i =>
            i.nk_id.toLowerCase().includes(keyword) ||
            i.sp_name.toLowerCase().includes(keyword) ||
            i.sp_brand.toLowerCase().includes(keyword) ||
            i.sp_category.toLowerCase().includes(keyword)
        );
    }, [list, search]);

    const groupedByDateMap = useMemo(() => {
        return list.reduce((acc, item) => {
            const dateKey = item.nk_date || new Date().toISOString().slice(0, 10);
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(item);
            return acc;
        }, {});
    }, [list]);

    const syncProductStocksByDelta = async (deltaList = []) => {
        if (!canWriteProductInventory()) {
            // Skip stock sync to avoid repeated 403 requests when current role cannot update product.
            return;
        }

        const deltaMap = (deltaList || []).reduce((acc, item) => {
            const productId = String(item?.productId || "").trim();
            const delta = Number(item?.delta || 0);
            if (!productId || !Number.isFinite(delta) || delta === 0) return acc;
            acc[productId] = Number(acc[productId] || 0) + delta;
            return acc;
        }, {});

        const productIds = Object.keys(deltaMap);
        if (productIds.length === 0) return;

        await Promise.allSettled(
            productIds.map(async (productId) => {
                const product = await getProductById(productId);
                if (!product) return;

                const currentStock = Number(product.stock || 0);
                const nextStock = Math.max(0, currentStock + Number(deltaMap[productId] || 0));

                await updateProductInventory(productId, {
                    name: product.name,
                    price: Number(product.price || 0),
                    stock: nextStock,
                    description: product.description || "",
                    image: product.raw_image || product.image || "",
                    brandId: product.brand?.id || "",
                    categoryId: product.category?.id || "",
                });
            })
        );

        setProducts((prev) => {
            const next = (prev || []).map((p) => {
                const pid = String(p.sp_id || "").trim();
                const delta = Number(deltaMap[pid] || 0);
                if (!delta) return p;
                return {
                    ...p,
                    sp_stock: Math.max(0, Number(p.sp_stock || 0) + delta),
                };
            });
            setCache(IMPORT_PRODUCTS_CACHE_KEY, next);
            return next;
        });

        removeCacheByPrefix(PRODUCT_CACHE_KEY_PREFIX);
        removeCache(PRODUCT_STATS_CACHE_KEY);
    };

    /* ================= SUBMIT ================= */
    const handleSubmit = async (creatorName) => {
        if (!form.sp_id || !String(form.sp_id).trim() || !form.nk_quantity || !form.nk_date || !String(form.nk_date).trim()) {
            showToast("Vui lòng điền đầy đủ thông tin", "warning");
            return;
        }

        // Validate quantity is positive number
        if (Number(form.nk_quantity) <= 0) {
            showToast("Số lượng phải lớn hơn 0", "warning");
            return;
        }

        // Log form data for debugging
        console.log("Submitting import form:", form);
        console.log("Selected product ID:", form.sp_id);
        console.log("Quantity:", form.nk_quantity);
        console.log("Date:", form.nk_date);

        setIsSubmitting(true);
        try {
            if (editing) {
                const oldProductId = String(editing.sp_id || "").trim();
                const newProductId = String(form.sp_id || "").trim();
                const oldQty = Number(editing.nk_quantity || 0);
                const newQty = Number(form.nk_quantity || 0);

                console.log("Updating import with ID:", editing.nk_id);
                await updateImport(editing.nk_id, {
                    ...form,
                    nk_id: editing.nk_id,
                });
                if (creatorName && !editing.nk_creator) {
                    setCreatorNameForImport(editing.nk_id, creatorName);
                }

                const deltas = [];
                if (oldProductId && oldProductId === newProductId) {
                    deltas.push({ productId: newProductId, delta: newQty - oldQty });
                } else {
                    if (oldProductId) deltas.push({ productId: oldProductId, delta: -oldQty });
                    if (newProductId) deltas.push({ productId: newProductId, delta: newQty });
                }
                await syncProductStocksByDelta(deltas);
                showToast("Cập nhật nhập kho thành công", "success");
            } else {
                const createPayload = {
                    ...form,
                    sp_id: String(form.sp_id).trim(),
                    nk_date: String(form.nk_date).trim(),
                };
                console.log("Creating new import with data:", createPayload);
                if (!createPayload.sp_id) {
                    showToast("Vui lòng chọn sản phẩm", "warning");
                    setIsSubmitting(false);
                    return;
                }

                const normalizedDate = String(createPayload.nk_date || "").slice(0, 10);
                const normalizedProductId = String(createPayload.sp_id || "").trim();
                const existingImport = list.find(
                    (item) =>
                        String(item.sp_id || "").trim() === normalizedProductId &&
                        String(item.nk_date || "").slice(0, 10) === normalizedDate
                );

                if (existingImport) {
                    const mergedQuantity =
                        Number(existingImport.nk_quantity || 0) + Number(createPayload.nk_quantity || 0);

                    await updateImport(existingImport.nk_id, {
                        ...existingImport,
                        nk_id: existingImport.nk_id,
                        sp_id: normalizedProductId,
                        nk_date: normalizedDate,
                        nk_quantity: mergedQuantity,
                    });

                    await syncProductStocksByDelta([
                        { productId: normalizedProductId, delta: Number(createPayload.nk_quantity || 0) },
                    ]);
                    showToast("Sản phẩm trong ngày đã tồn tại, đã cộng dồn số lượng", "success");
                } else {
                    let created;
                    let attempts = 0;
                    let lastError = null;
                    let idSource = list.map((item) => item.nk_id);
                    try {
                        const latestImports = await getAllImports();
                        idSource = latestImports.map((item) => item.nk_id);
                    } catch {
                        // Keep local id source fallback when /all is unavailable.
                    }

                    while (attempts < 3) {
                        try {
                            if (attempts > 0) {
                                const regeneratedId = generateSmartNextId(idSource, "NK", 3);
                                createPayload.nk_id = regeneratedId;
                                idSource = [...idSource, regeneratedId];
                            }

                            created = await createImport(createPayload);
                            lastError = null;
                            break;
                        } catch (err) {
                            lastError = err;
                            const status = Number(err?.status || 0);
                            const isRetryableBadRequest = status === 400;
                            attempts += 1;

                            if (!isRetryableBadRequest || attempts >= 3) {
                                throw err;
                            }
                        }
                    }

                    if (!created && lastError) {
                        throw lastError;
                    }

                    const createdId = created?.id || createPayload.nk_id;
                    if (creatorName && createdId) {
                        setCreatorNameForImport(createdId, creatorName);
                    }
                    await syncProductStocksByDelta([
                        { productId: createPayload.sp_id, delta: Number(createPayload.nk_quantity || 0) },
                    ]);
                    showToast("Thêm phiếu nhập kho thành công", "success");
                }
            }

            setOpenForm(false);
            fetchImports();
        } catch (err) {
            console.error("Lỗi lưu nhập kho:", err);
            showToast(editing ? "Cập nhật nhập kho thất bại" : "Thêm nhập kho thất bại", "error", 3400);
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ================= DELETE ================= */
    const handleDelete = async (id) => {
        if (!confirm("Xóa phiếu nhập kho này?")) return;

        setDeletingId(id);
        try {
            const deletedImport = list.find((item) => item.nk_id === id);
            await deleteImport(id);
            removeCreatorNameForImport(id);
            await syncProductStocksByDelta([
                {
                    productId: deletedImport?.sp_id,
                    delta: -Number(deletedImport?.nk_quantity || 0),
                },
            ]);
            showToast("Xóa phiếu nhập kho thành công", "success");
            fetchImports();
        } catch (err) {
            console.error("Lỗi xóa nhập kho:", err);
            showToast("Xóa nhập kho thất bại: " + err.message, "error", 3400);
        } finally {
            setDeletingId(null);
        }
    };

    const handleBulkDelete = async (ids = []) => {
        const uniqueIds = Array.from(new Set((ids || []).filter(Boolean)));
        if (uniqueIds.length === 0) {
            showToast("Vui lòng chọn ít nhất 1 phiếu để xóa", "warning");
            return { successIds: [], failedIds: [] };
        }

        if (!confirm(`Xóa ${uniqueIds.length} phiếu nhập đã chọn?`)) {
            return { successIds: [], failedIds: uniqueIds };
        }

        setIsBulkDeleting(true);
        try {
            const deletedImports = list.filter((item) => uniqueIds.includes(item.nk_id));
            const results = await Promise.allSettled(uniqueIds.map((id) => deleteImport(id)));

            const successIds = [];
            const failedIds = [];
            results.forEach((result, idx) => {
                if (result.status === "fulfilled") {
                    successIds.push(uniqueIds[idx]);
                } else {
                    failedIds.push(uniqueIds[idx]);
                }
            });

            successIds.forEach((id) => removeCreatorNameForImport(id));

            if (successIds.length > 0) {
                const deltaMap = deletedImports
                    .filter((item) => successIds.includes(item.nk_id))
                    .reduce((acc, item) => {
                        const pid = String(item.sp_id || "").trim();
                        if (!pid) return acc;
                        acc[pid] = Number(acc[pid] || 0) - Number(item.nk_quantity || 0);
                        return acc;
                    }, {});
                await syncProductStocksByDelta(
                    Object.keys(deltaMap).map((productId) => ({ productId, delta: deltaMap[productId] }))
                );
            }

            if (successIds.length > 0) {
                await fetchImports();
            }

            if (failedIds.length === 0) {
                showToast(`Đã xóa ${successIds.length} phiếu nhập`, "success");
            } else if (successIds.length > 0) {
                showToast(`Đã xóa ${successIds.length} phiếu, thất bại ${failedIds.length} phiếu`, "warning");
            } else {
                showToast("Xóa hàng loạt thất bại", "error");
            }

            return { successIds, failedIds };
        } catch (err) {
            console.error("Lỗi xóa hàng loạt nhập kho:", err);
            showToast("Xóa hàng loạt thất bại", "error");
            return { successIds: [], failedIds: uniqueIds };
        } finally {
            setIsBulkDeleting(false);
        }
    };

    /* ================= BULK IMPORT (FILE UPLOAD) ================= */
    const normalizeImportRows = (rows, availableProducts) => {
        const sourceProducts = Array.isArray(availableProducts) ? availableProducts : [];
        const productIdSet = new Set(sourceProducts.map((p) => String(p.sp_id || "").trim()));
        const productByName = new Map(
            sourceProducts.map((p) => [String(p.sp_name || "").trim().toLowerCase(), String(p.sp_id || "").trim()])
        );

        const normalizeHeader = (value) => String(value || "")
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");

        const toNumber = (value) => {
            const normalized = String(value ?? "")
                .trim()
                .replace(/\./g, "")
                .replace(/,/g, ".");
            const num = Number(normalized);
            return Number.isFinite(num) ? num : 0;
        };

        return rows.map((row, index) => {
            const normalizedRow = new Map(
                Object.entries(row || {}).map(([key, value]) => [normalizeHeader(key), value])
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

            const productIdRaw = String(pick([
                "sp_id", "product_id", "Mã sản phẩm", "Ma san pham", "masanpham", "product",
            ]) || "").trim();
            const productNameRaw = String(pick([
                "sp_name", "Tên sản phẩm", "Ten san pham", "tensanpham", "name",
            ]) || "").trim();

            const resolvedProductId = productIdSet.has(productIdRaw)
                ? productIdRaw
                : (productByName.get(productNameRaw.toLowerCase()) || "");

            return {
                rowNo: index + 2,
                nk_id: String(pick([
                    "nk_id", "id", "Mã phiếu nhập", "Ma phieu nhap", "maphieunhap", "Mã phiếu", "Ma phieu",
                ]) || "").trim(),
                sp_id: resolvedProductId,
                nk_quantity: toNumber(pick([
                    "nk_quantity", "quantity", "Số lượng nhập", "So luong nhap", "Số lượng", "So luong",
                ])),
                nk_date: parseImportDate(pick([
                    "nk_date", "importDate", "Ngày nhập", "Ngay nhap", "date",
                ])) || new Date().toISOString().slice(0, 10),
            };
        });
    };

    const downloadTemplate = () => {
        const ids = list.map((item) => item.nk_id);
        const firstId = generateSmartNextId(ids, "NK", 3);
        const secondId = generateSmartNextId([...ids, firstId], "NK", 3);

        const firstProduct = products?.[0];
        const secondProduct = products?.[1] || firstProduct;

        const aoa = [
            ["Mã phiếu nhập", "Mã sản phẩm", "Tên sản phẩm", "Số lượng nhập", "Ngày nhập", "Ghi chú"],
            [firstId, firstProduct?.sp_id || "SP001", firstProduct?.sp_name || "Ten san pham", 10, new Date().toISOString().slice(0, 10), ""],
            [secondId, secondProduct?.sp_id || "SP002", secondProduct?.sp_name || "Ten san pham", 5, new Date().toISOString().slice(0, 10), ""],
        ];

        const ws = XLSX.utils.aoa_to_sheet(aoa);
        ws["!cols"] = [
            { wch: 16 },
            { wch: 16 },
            { wch: 28 },
            { wch: 14 },
            { wch: 14 },
            { wch: 24 },
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "MauNhapKho");
        XLSX.writeFile(wb, `import-receipt-template-${new Date().toISOString().slice(0, 10)}.xlsx`);
        showToast("Đã tải file mẫu nhập kho", "success");
    };

    const handleBulkImportFile = async (file, creatorName = "") => {
        if (!file) return false;

        setIsImportingFile(true);
        try {
            let sourceProducts = products;
            if (!Array.isArray(sourceProducts) || sourceProducts.length === 0) {
                const fetched = await getAllProducts();
                const mapped = mapProductsFromApi(fetched) || [];
                if (mapped.length > 0) {
                    sourceProducts = mapped;
                    setProducts(mapped);
                    setCache(IMPORT_PRODUCTS_CACHE_KEY, mapped);
                }
            }

            if (!Array.isArray(sourceProducts) || sourceProducts.length === 0) {
                showToast("Không có dữ liệu sản phẩm để đối chiếu mã sản phẩm", "warning", 3600);
                return false;
            }

            const lowerName = String(file.name || "").toLowerCase();
            let rawRows = [];

            if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
                const buffer = await file.arrayBuffer();
                rawRows = parseExcel(buffer);
            } else if (lowerName.endsWith(".json")) {
                const text = await file.text();
                const parsed = JSON.parse(text);
                rawRows = Array.isArray(parsed) ? parsed : [];
            } else if (lowerName.endsWith(".csv")) {
                const text = await file.text();
                rawRows = parseCsv(text);
            } else {
                showToast("Định dạng file không hỗ trợ. Dùng XLSX/XLS/CSV/JSON.", "warning", 3600);
                return false;
            }

            if (!Array.isArray(rawRows) || rawRows.length === 0) {
                showToast("File không có dữ liệu hợp lệ", "warning");
                return false;
            }

            const normalizedRows = normalizeImportRows(rawRows, sourceProducts);
            const invalidRows = normalizedRows.filter((row) => !row.sp_id || row.nk_quantity <= 0 || !row.nk_date);
            if (invalidRows.length > 0) {
                const preview = invalidRows.slice(0, 5).map((r) => `dòng ${r.rowNo}`).join(", ");
                showToast(`Có ${invalidRows.length} dòng lỗi (${preview}). Vui lòng kiểm tra file mẫu.`, "warning", 4600);
                return false;
            }

            const existingIds = new Set(list.map((item) => String(item.nk_id || "").trim()).filter(Boolean));
            const finalRows = normalizedRows.map((row) => {
                let nextId = String(row.nk_id || "").trim();
                if (!nextId || existingIds.has(nextId)) {
                    nextId = generateSmartNextId(Array.from(existingIds), "NK", 3);
                }
                existingIds.add(nextId);
                return { ...row, nk_id: nextId };
            });

            const results = await runWithConcurrency(finalRows, 3, async (row) => {
                try {
                    await createImport({
                        nk_id: row.nk_id,
                        sp_id: row.sp_id,
                        nk_quantity: row.nk_quantity,
                        nk_date: row.nk_date,
                    });
                    return { ok: true, row };
                } catch (error) {
                    return { ok: false, message: error?.message || "Lỗi tạo phiếu nhập", row };
                }
            });

            const successRows = results.filter((r) => r.ok).map((r) => r.row);
            const failed = results.length - successRows.length;

            if (creatorName && successRows.length > 0) {
                await Promise.allSettled(
                    successRows.map((row) => setCreatorNameForImport(row.nk_id, creatorName))
                );
            }

            if (successRows.length > 0) {
                const deltaMap = successRows.reduce((acc, row) => {
                    acc[row.sp_id] = Number(acc[row.sp_id] || 0) + Number(row.nk_quantity || 0);
                    return acc;
                }, {});

                await syncProductStocksByDelta(
                    Object.keys(deltaMap).map((productId) => ({
                        productId,
                        delta: deltaMap[productId],
                    }))
                );
                await fetchImports();
            }

            if (failed === 0) {
                showToast(`Import thành công ${successRows.length} phiếu nhập`, "success");
            } else if (successRows.length > 0) {
                showToast(`Import xong: ${successRows.length} thành công, ${failed} thất bại`, "warning", 4200);
            } else {
                showToast("Không import được dữ liệu nào. Vui lòng kiểm tra file mẫu.", "error", 4200);
            }

            return successRows.length > 0;
        } catch (err) {
            console.error("Bulk import failed:", err);
            showToast("Import file thất bại. Hỗ trợ XLSX/XLS/CSV/JSON.", "error", 3600);
            return false;
        } finally {
            setIsImportingFile(false);
        }
    };

    const handleFileUpload = async (event, creatorName = "") => {
        const file = event?.target?.files?.[0];
        if (!file) return;
        await handleBulkImportFile(file, creatorName);
    };

    const handleBulkImportSubmit = async (creatorName) => {
        if (bulkImportData.length === 0) {
            showToast("Vui lòng chọn file có chứa dữ liệu", "warning");
            return;
        }

        setIsSubmitting(true);
        try {
            const results = await Promise.allSettled(
                bulkImportData.map(item =>
                    createImport({
                        nk_id: item.nk_id,
                        sp_id: item.sp_id,
                        nk_quantity: item.nk_quantity,
                        nk_date: item.nk_date
                    })
                )
            );

            const succeeded = results.filter(r => r.status === "fulfilled").length;
            const failed = results.length - succeeded;

            if (succeeded > 0) {
                if (creatorName) {
                    await Promise.all(
                        bulkImportData.slice(0, succeeded).map(item =>
                            setCreatorNameForImport(item.nk_id, creatorName).catch(() => {})
                        )
                    );
                }
                await fetchImports();
                setBulkImportData([]);
                setOpenForm(false);
                setShowModeDropdown(false);
                setImportMode("single");
            }

            if (succeeded > 0 && failed === 0) {
                showToast(`Đã nhập thành công ${succeeded} phiếu`, "success");
            } else if (failed > 0) {
                showToast(`Nhập thành công ${succeeded}, thất bại ${failed} phiếu`, "warning", 4200);
            }
        } catch (err) {
            console.error("Bulk import error:", err);
            showToast("Lỗi nhập dữ liệu", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        loading,
        isSubmitting,
        deletingId,
        isBulkDeleting,
        search,
        setSearch,
        openForm,
        setOpenForm,
        form,
        setForm,
        filteredList,
        products,
        openAdd: () => {
            setEditing(null);
            const nextId = generateSmartNextId(list.map((item) => item.nk_id), "NK", 3);
            setForm({ ...emptyForm, nk_id: nextId });
            setOpenForm(true);
        },
        openAddByDate: (dateKey) => {
            setEditing(null);
            const nextId = generateSmartNextId(list.map((item) => item.nk_id), "NK", 3);
            setForm({
                ...emptyForm,
                nk_id: nextId,
                nk_date: dateKey || emptyForm.nk_date,
            });
            setOpenForm(true);
        },
        openEdit: (item) => {
            setEditing(item);
            setForm({ ...emptyForm, ...item });
            setOpenForm(true);
        },
        handleSubmit,
        handleDelete,
        handleBulkDelete,
        groupedByDateMap,
        // Bulk import
        importMode,
        setImportMode,
        showModeDropdown,
        setShowModeDropdown,
        isImportingFile,
        bulkImportData,
        setBulkImportData,
        downloadTemplate,
        handleBulkImportFile,
        handleFileUpload,
        handleBulkImportSubmit
    };
}
