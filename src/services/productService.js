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

function extractRawImage(url) {
    if (!url || typeof url !== "string") return "";
    let normalized = url.trim().replace(/\\/g, "/");
    const httpIdx = normalized.indexOf("http://");
    const httpsIdx = normalized.indexOf("https://");

    // Nếu BE vô tình gán thêm "/photos/products/DM/https://..."
    if (httpIdx >= 0) return normalized.substring(httpIdx);
    if (httpsIdx >= 0) return normalized.substring(httpsIdx);

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

    if (normalized.startsWith("http://") || normalized.startsWith("https://")) return normalized;

    if (/^[A-Za-z]:\//.test(normalized)) {
        normalized = normalized.replace(/^[A-Za-z]:/, "");
    }

    const photosRootIndex = normalized.indexOf("/photos/");
    if (photosRootIndex >= 0) {
        return `${BASE_URL}${normalized.slice(photosRootIndex)}`;
    }

    const photosIndex = normalized.indexOf("photos/");
    if (photosIndex >= 0) {
        return `${BASE_URL}/${normalized.slice(photosIndex)}`;
    }

    if (normalized.startsWith("/")) return `${BASE_URL}${normalized}`;
    if (!normalized.includes("/") && categoryId) {
        return `${BASE_URL}/photos/products/${categoryId}/${normalized}`;
    }
    return `${BASE_URL}/${normalized}`;
}

/* ================= GET PRODUCTS BY PAGE (OPTIMIZED) ================= */
export async function getProductsByPage(pageNum = 0, pageSize = 8) {
    const res = await fetch(`${API_URL}/all?p=${pageNum}&size=${pageSize}`, {
        headers: getAuthHeaders()
    });

    if (!res.ok) {
        throw new Error("Không lấy được danh sách sản phẩm");
    }

    const data = await res.json();
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
export async function getAllProducts() {
    let page = 0;
    let hasNext = true;
    const allProducts = [];

    while (hasNext) {
        const res = await fetch(`${API_URL}/all?p=${page}`, {
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            throw new Error("Không lấy được danh sách sản phẩm");
        }

        const data = await res.json();
        const list = data?.content ?? [];

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

        hasNext = !data.last;
        page++;
    }

    return allProducts;
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

    const res = await fetch(`${API_URL}/save`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error("=== Backend Error ===");
        console.error("Status:", res.status);
        console.error("Error message:", errorText);
        console.error("Response headers:", {
            wwwAuthenticate: res.headers.get("www-authenticate"),
            contentType: res.headers.get("content-type"),
        });
        console.error("Request payload was:", JSON.stringify(payload, null, 2));

        if (res.status === 403) {
            throw new Error("Không tạo được sản phẩm: 403 Forbidden. Kiểm tra quyền tài khoản (ROLE_ADMIN/ROLE_EMPLOYEE) và token đăng nhập.");
        }

        throw new Error(`Không tạo được sản phẩm: ${errorText}`);
    }

    return res.json();
}



/* ================= UPDATE ================= */

export async function updateProduct(id, productData) {

    const res = await fetch(`${API_URL}/update/${id}`, {

        method: "PUT",

        headers: getAuthHeaders(),

        body: JSON.stringify({

            name: productData.name,

            price: Number(productData.price),

            stock: Number(productData.stock),

            description: productData.description,

            image: productData.image,

            brand: { id: productData.brandId },

            category: { id: productData.categoryId },

            promotion: productData.promotionId ? { id: productData.promotionId } : null

        })

    });



    if (!res.ok) {

        throw new Error("Không cập nhật được sản phẩm");

    }



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

}