const API_URL = "http://localhost:8080/api/product";
const BASE_URL = "http://localhost:8080";

function resolveImageUrl(url, categoryId, productId) {
    if (!url || typeof url !== "string") {
        if (categoryId && productId) {
            return `${BASE_URL}/photos/products/${categoryId}/${productId}.jpg`;
        }
        return "";
    }
    let normalized = url.trim().replace(/\\/g, "/");

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
    const res = await fetch(`${API_URL}/all?p=${pageNum}&size=${pageSize}`);

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
            stock: Number(p.stock ?? 0),
            description: p.description ?? "",
            image: resolveImageUrl(p.image, p.category?.id, p.id),
            brand: {
                id: p.brand?.id ?? "",
                name: p.brand?.name ?? ""
            },
            category: {
                id: p.category?.id ?? "",
                name: p.category?.name ?? ""
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
        const res = await fetch(`${API_URL}/all?p=${page}`);

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
                stock: Number(p.stock ?? 0),
                description: p.description ?? "",
                image: resolveImageUrl(p.image, p.category?.id, p.id),
                brand: {
                    id: p.brand?.id ?? "",
                    name: p.brand?.name ?? ""
                },
                category: {
                    id: p.category?.id ?? "",
                    name: p.category?.name ?? ""
                }
            }))
        );

        hasNext = !data.last;
        page++;
    }

// Sau này BE làm xong chỉ việc sửa file này
export const getAllProducts = async () => {
    // MOCK TẠM
    const { MOCK_PRODUCTS } = await import("../mocks/mockProducts");
    return MOCK_PRODUCTS;

    // SAU NÀY BE
    // const res = await fetch("http://localhost:8080/api/products");
    // return res.json();
};
