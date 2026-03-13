import { cachedGetJson, invalidateCacheByPrefix } from "../utils/requestCache";
import { CACHE_TTL } from "../utils/cachePolicy";

const API_URL = "http://localhost:8080/api/product";
const BASE_URL = "http://localhost:8080";
// const API_URL = "https://ec-website-be-312564370609.asia-southeast1.run.app/api/product";
//const BASE_URL = "https://ec-website-be-312564370609.asia-southeast1.run.app";
// Helper to get auth token
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
    };
}

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

function getNextProductCode(currentId) {
    const raw = String(currentId || "").trim();
    const match = raw.match(/^SP(\d+)$/i);
    if (!match) return raw;
    const nextNum = Number(match[1]) + 1;
    return `SP${String(nextNum).padStart(match[1].length, "0")}`;
}

function hasImageExtension(path) {
    return /\.(png|jpe?g|webp|gif|bmp|svg|avif)(\?.*)?$/i.test(String(path || ""));
}

function extractRawImage(url) {
    if (!url || typeof url !== "string") return "";
    let normalized = url.trim().replace(/\\/g, "/");
    const httpIdx = normalized.indexOf("http://");
    const httpsIdx = normalized.indexOf("https://");

    // Nếu BE vô tình gán thêm "/photos/products/DM/https://..."
    if (httpIdx >= 0) return normalized.substring(httpIdx);
    if (httpsIdx >= 0) return normalized.substring(httpsIdx);

    // Fix duplicated local path like: /photos/products/DM//photos/products/DM/file.jpg
    const duplicatedRoot = "/photos/products/";
    if (normalized.includes(duplicatedRoot)) {
        const chunks = normalized.split(duplicatedRoot).filter(Boolean);
        if (chunks.length > 0) {
            normalized = `${duplicatedRoot}${chunks[chunks.length - 1]}`;
        }
    }

    return normalized;
}

function resolveImageUrl(url, categoryId, productId) {
    if (!url || typeof url !== "string") {
        if (categoryId && productId) {
            return `${BASE_URL}/photos/products/${categoryId}/${productId}.jpg`;
        }
        return "";
    }
    let normalized = extractRawImage(url);

    if (normalized.startsWith("data:image/")) return normalized;
    if (normalized.startsWith("http://") || normalized.startsWith("https://")) return normalized;

    if (/^[A-Za-z]:\//.test(normalized)) {
        normalized = normalized.replace(/^[A-Za-z]:/, "");
    }

    const photosRootIndex = normalized.lastIndexOf("/photos/");
    if (photosRootIndex >= 0) {
        return `${BASE_URL}${normalized.slice(photosRootIndex)}`;
    }

    const photosIndex = normalized.lastIndexOf("photos/");
    if (photosIndex >= 0) {
        return `${BASE_URL}/${normalized.slice(photosIndex)}`;
    }

    if (normalized.startsWith("/")) {
        if (!hasImageExtension(normalized)) return "";
        return `${BASE_URL}${normalized}`;
    }
    if (!normalized.includes("/") && categoryId) {
        if (!hasImageExtension(normalized)) return "";
        return `${BASE_URL}/photos/products/${categoryId}/${normalized}`;
    }
    if (!hasImageExtension(normalized)) return "";
    return `${BASE_URL}/${normalized}`;
}

/* ================= GET PRODUCTS BY PAGE (OPTIMIZED) ================= */
export async function getProductsByPage(pageNum = 0, pageSize = 8, inStockOnly = true) {
    const data = await cachedGetJson(`${API_URL}/all?p=${pageNum}&size=${pageSize}&inStockOnly=${inStockOnly}`, {
        headers: getAuthHeaders(),
        cacheKey: `cache:product:page:${pageNum}:${pageSize}:${inStockOnly}`,
        ttlMs: CACHE_TTL.LONG
    });
    const list = data?.content ?? [];

    return {
        products: list.map(p => ({
            id: p.id ?? "",
            name: p.name ?? "",
            price: Number(p.price ?? 0),
            discountedPrice: Number(p.discountedPrice ?? p.price ?? 0),
            stock: Number(p.stock ?? 0),
            description: p.description ?? "",
            image: resolveImageUrl(p.image, p.category?.id, p.id),
            raw_image: extractRawImage(p.image),
            brand: {
                id: p.brand?.id ?? "",
                name: p.brand?.name ?? ""
            },
            category: {
                id: p.category?.id ?? "",
                name: p.category?.name ?? ""
            },
            promotion: {
                id: p.promotion?.id ?? "",
                name: p.promotion?.name ?? ""
            }
        })),
        totalPages: data?.totalPages ?? 0,
        totalElements: data?.totalElements ?? 0,
        isLast: data?.last ?? true
    };
}

/* ================= GET ALL (AUTO LOOP PAGE) - DEPRECATED ================= */
export async function getAllProducts(inStockOnly = true) {
    let page = 0;
    let hasNext = true;
    const MAX_PAGES = 200;
    const allProducts = [];

    while (hasNext && page < MAX_PAGES) {
        const data = await cachedGetJson(`${API_URL}/all?p=${page}&inStockOnly=${inStockOnly}`, {
            headers: getAuthHeaders(),
            cacheKey: `cache:product:all-page:${page}:${inStockOnly}`,
            ttlMs: CACHE_TTL.LONG
        });

        // Some BE branches return plain array instead of paged object.
        if (Array.isArray(data)) {
            allProducts.push(
                ...data.map(p => ({
                    id: p.id ?? "",
                    name: p.name ?? "",
                    price: Number(p.price ?? 0),
                    discountedPrice: Number(p.discountedPrice ?? p.price ?? 0),
                    stock: Number(p.stock ?? 0),
                    description: p.description ?? "",
                    image: resolveImageUrl(p.image, p.category?.id, p.id),
                    raw_image: extractRawImage(p.image),
                    brand: {
                        id: p.brand?.id ?? "",
                        name: p.brand?.name ?? ""
                    },
                    category: {
                        id: p.category?.id ?? "",
                        name: p.category?.name ?? ""
                    },
                    promotion: {
                        id: p.promotion?.id ?? "",
                        name: p.promotion?.name ?? ""
                    }
                }))
            );
            break;
        }

        const list = Array.isArray(data?.content) ? data.content : [];

        if (!Array.isArray(list)) break;

        allProducts.push(
            ...list.map(p => ({
                id: p.id ?? "",
                name: p.name ?? "",
                price: Number(p.price ?? 0),
                discountedPrice: Number(p.discountedPrice ?? p.price ?? 0),
                stock: Number(p.stock ?? 0),
                description: p.description ?? "",
                image: resolveImageUrl(p.image, p.category?.id, p.id),
                raw_image: extractRawImage(p.image),
                brand: {
                    id: p.brand?.id ?? "",
                    name: p.brand?.name ?? ""
                },
                category: {
                    id: p.category?.id ?? "",
                    name: p.category?.name ?? ""
                },
                promotion: {
                    id: p.promotion?.id ?? "",
                    name: p.promotion?.name ?? ""
                }
            }))
        );

        const isLast = data?.last === true;
        const totalPages = Number(data?.totalPages);
        hasNext = !isLast;
        if (Number.isFinite(totalPages) && page + 1 >= totalPages) {
            hasNext = false;
        }
        if (list.length === 0) {
            hasNext = false;
        }
        page++;
    }

    return allProducts;
}

export async function getProductById(id) {
    const p = await cachedGetJson(`${API_URL}/detail/${id}`, {
        headers: getAuthHeaders(),
        cacheKey: `cache:product:detail:${id}`,
        ttlMs: CACHE_TTL.VERY_LONG
    });
    return {
        id: p.id ?? "",
        name: p.name ?? "",
        price: Number(p.price ?? 0),
        stock: Number(p.stock ?? 0),
        description: p.description ?? "",
        image: resolveImageUrl(p.image, p.category?.id, p.id),
        raw_image: extractRawImage(p.image),
        brand: {
            id: p.brand?.id ?? "",
            name: p.brand?.name ?? ""
        },
        category: {
            id: p.category?.id ?? "",
            name: p.category?.name ?? ""
        }
    };
}





/* ================= CREATE ================= */

export async function createProduct(productData) {

    const rawToken = localStorage.getItem("authToken");
    const tokenPayload = decodeJwtPayload(rawToken);
    const authUserRaw = localStorage.getItem("authUser");
    let authUser = null;
    try {
        authUser = authUserRaw ? JSON.parse(authUserRaw) : null;
    } catch {
        authUser = null;
    }

    const payload = {
        id: productData.id, // Luôn gửi ID
        name: productData.name,
        price: Number(productData.price),
        stock: Number(productData.stock),
        description: productData.description || null, // Gửi null thay vì empty string
        image: productData.image || null, // Gửi null thay vì empty string
        brand: { id: productData.brandId },
        category: { id: productData.categoryId },
        promotion: productData.promotionId ? { id: productData.promotionId } : null
    };

    console.log("=== Creating Product ===");
    console.log("Full productData received:", productData);
    console.log("Payload to send:", JSON.stringify(payload, null, 2));
    console.log("Brand ID:", productData.brandId, "Type:", typeof productData.brandId);
    console.log("Category ID:", productData.categoryId, "Type:", typeof productData.categoryId);
    console.log("Auth debug:", {
        hasToken: Boolean(rawToken),
        tokenPrefix: rawToken ? `${rawToken.slice(0, 12)}...` : null,
        tokenRole: tokenPayload?.roleId || tokenPayload?.role || null,
        tokenSub: tokenPayload?.sub || null,
        tokenExp: tokenPayload?.exp || null,
        authUserRole: authUser?.roleId || null,
    });

    let workingPayload = { ...payload };

    for (let attempt = 0; attempt < 6; attempt += 1) {
        let res = await fetch(`${API_URL}/save`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(workingPayload)
        });

        // Some BE branches do not support product.promotion field yet.
        if (!res.ok && res.status === 400 && workingPayload.promotion) {
            const fallbackPayload = {
                id: workingPayload.id,
                name: workingPayload.name,
                price: workingPayload.price,
                stock: workingPayload.stock,
                description: workingPayload.description,
                image: workingPayload.image,
                brand: workingPayload.brand,
                category: workingPayload.category
            };

            console.warn("Create product fallback: retrying without promotion field");
            res = await fetch(`${API_URL}/save`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(fallbackPayload)
            });
        }

        if (res.ok) {
            invalidateCacheByPrefix("cache:product:");
            return res.json();
        }

        const errorText = await res.text();

        // ProductController returns 400 empty body when ID already exists.
        if (res.status === 400 && !errorText && /^SP\d+$/i.test(String(workingPayload.id || ""))) {
            const nextId = getNextProductCode(workingPayload.id);
            if (nextId && nextId !== workingPayload.id) {
                console.warn(`Create product retry with next id: ${workingPayload.id} -> ${nextId}`);
                workingPayload = { ...workingPayload, id: nextId };
                continue;
            }
        }

        console.error("=== Backend Error ===");
        console.error("Status:", res.status);
        console.error("Error message:", errorText);
        console.error("Response headers:", {
            wwwAuthenticate: res.headers.get("www-authenticate"),
            contentType: res.headers.get("content-type"),
        });
        console.error("Request payload was:", JSON.stringify(workingPayload, null, 2));

        if (res.status === 403) {
            throw new Error("Không tạo được sản phẩm: 403 Forbidden. Kiểm tra quyền tài khoản (ROLE_ADMIN/ROLE_EMPLOYEE) và token đăng nhập.");
        }

        throw new Error(`Không tạo được sản phẩm: ${errorText}`);
    }

    throw new Error("Không tạo được sản phẩm: Hết số lần thử tạo ID tự động");
}



/* ================= UPDATE ================= */

export async function updateProduct(id, productData) {
    const payload = {
        name: productData.name,
        price: Number(productData.price),
        stock: Number(productData.stock),
        description: productData.description,
        image: productData.image,
        brand: { id: productData.brandId },
        category: { id: productData.categoryId },
        promotion: productData.promotionId ? { id: productData.promotionId } : null
    };

    let res = await fetch(`${API_URL}/update/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });

    if (!res.ok && res.status === 400 && payload.promotion) {
        const fallbackPayload = {
            name: payload.name,
            price: payload.price,
            stock: payload.stock,
            description: payload.description,
            image: payload.image,
            brand: payload.brand,
            category: payload.category
        };

        console.warn("Update product fallback: retrying without promotion field");
        res = await fetch(`${API_URL}/update/${id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(fallbackPayload)
        });
    }

    if (!res.ok) {
        throw new Error("Không cập nhật được sản phẩm");
    }

    invalidateCacheByPrefix("cache:product:");
    return res.json();

}



/* ================= DELETE ================= */

export async function deleteProduct(id) {

    const res = await fetch(`${API_URL}/delete/${id}`, {

        method: "DELETE",
        headers: getAuthHeaders()

    });
    if (!res.ok) {

        throw new Error("Không xoá được sản phẩm");

    }

    invalidateCacheByPrefix("cache:product:");

}