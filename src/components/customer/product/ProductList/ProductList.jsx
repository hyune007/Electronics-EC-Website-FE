import { useState, useEffect } from "react";
import vi from "../../../../i18n/vi.js";
import { getProducts } from "../../../../services/customer/productService.js";
import ProductCard from "../ProductCard/ProductCard.jsx";
import BreadcrumbNav from "../ProductNav/BreadcrumbNav/BreadcrumbNav.jsx";
import DoubleBanner from "../../../common/DoubleBanner.jsx";
// import { div } from "framer-motion/client";
import { useSearchParams } from "react-router-dom";
import { useProductCache } from "../../../../contexts/ProductCacheContext.jsx";

const PAGE_SIZE = 12;
export default function ProductList({
  page,
  setPage,
  category,
  setCategory,
  brands,
  keyword,
  priceRanges,
  minPrice,
  maxPrice,
  priceSort,
  setPriceSort,
}) {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searchParams] = useSearchParams();
  const { allProducts, loadingAll } = useProductCache();

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    if (categoryFromUrl) {
      setCategory(categoryFromUrl);
    }
  }, [searchParams]);

  const CATEGORIES = [
    { id: "LSP01", icon: "smartphone", name: "Điện thoại" },
    { id: "LSP02", icon: "laptop_mac", name: "Laptop" },
    { id: "LSP03", icon: "tablet_mac", name: "Máy tính bảng" },
    { id: "LSP04", icon: "watch", name: "Đồng hồ thông minh" },
    { id: "LSP05", icon: "headphones", name: "Tai nghe" },
    { id: "LSP06", icon: "keyboard", name: "Bàn phím" },
    { id: "LSP07", icon: "mouse", name: "Chuột" },
    { id: "LSP08", icon: "desktop_windows", name: "Màn hình" },
    { id: "LSP09", icon: "speaker", name: "Loa" },
    { id: "LSP10", icon: "devices_other", name: "Phụ kiện khác" },
  ];

  const BRAND_NAME_TO_ID = {
    Apple: "H01",
    Samsung: "H02",
    Google: "H03",
    Xiaomi: "H04",
    Oppo: "H05",
    OnePlus: "H06",
    Asus: "H07",
    Sony: "H08",
    Realme: "H09",
    Vivo: "H10",
    Nokia: "H11",
    Dell: "H12",
    HP: "H13",
    Lenovo: "H14",
    Razer: "H15",
    LG: "H16",
    Acer: "H17",
    MSI: "H19",
    Logitech: "H43",
    Corsair: "H45",
    SteelSeries: "H46",
    Marshall: "H38",
    JBL: "H69",
    Bose: "H31",
    Anker: "H34",
  };

  useEffect(() => {
    let mounted = true;

    const parseLabelToRange = (label) => {
      if (!label) return null;
      const DASH_RE = /[\u2012\u2013\u2014\u2015\-]/;
      const hasTren = /Trên/.test(label);

      if (hasTren) {
        const after = label.split(/Trên/i)[1] || label;
        const numStr = (after.match(/\d[\d\.\s]*/)?.[0] || "").replace(
          /[\.\s]/g,
          "",
        );
        const num = numStr ? Number(numStr) : 0;
        if (num >= 20000) return { min: 20000, max: 100000 };
        return { min: num, max: null };
      }

      const parts = label.split(DASH_RE).map((s) => (s || "").trim());
      if (parts.length < 2) return null;
      const leftNum = (parts[0].match(/\d[\d\.\s]*/)?.[0] || "").replace(
        /[\.\s]/g,
        "",
      );
      const rightNum = (parts[1].match(/\d[\d\.\s]*/)?.[0] || "").replace(
        /[\.\s]/g,
        "",
      );
      const min = leftNum ? Number(leftNum) : 0;
      const max = rightNum ? Number(rightNum) : null;
      if (Number.isNaN(min)) return null;
      if (max !== null && Number.isNaN(max)) return null;
      return { min, max };
    };

    const mappedRanges = (priceRanges || [])
      .map(parseLabelToRange)
      .filter(Boolean);

    const useCacheIfReady = () => {
      if (allProducts === null) return false;

      setLoading(true);
      setError(false);

      const toNumber = (value) => {
        if (typeof value === "number") return value;
        const parsed = Number((value ?? "").toString().replace(/[^\d.-]/g, ""));
        return Number.isFinite(parsed) ? parsed : 0;
      };

      const brandIds = new Set(
        (brands || []).map((b) => BRAND_NAME_TO_ID[b] || b),
      );

      const filtered = allProducts.filter((p) => {
        if (category && p.category?.id !== category) return false;

        if (keyword && !p.name?.toLowerCase().includes(keyword.toLowerCase())) {
          return false;
        }

        if (brandIds.size) {
          const pid = p.brand?.id || p.brand?.code || p.brand?.name;
          if (!pid || !brandIds.has(pid)) return false;
        }

        const priceValue = toNumber(p.price);

        if (mappedRanges.length) {
          return mappedRanges.some(({ min, max }) => {
            const minVal = min ?? 0;
            const maxVal =
              typeof max === "number" ? max : Number.MAX_SAFE_INTEGER;
            return priceValue >= minVal && priceValue <= maxVal;
          });
        }

        if (typeof minPrice === "number" && priceValue < minPrice) return false;
        if (typeof maxPrice === "number" && priceValue > maxPrice) return false;

        return true;
      });

      if (priceSort === "asc") {
        filtered.sort((a, b) => toNumber(a.price) - toNumber(b.price));
      } else if (priceSort === "desc") {
        filtered.sort((a, b) => toNumber(b.price) - toNumber(a.price));
      }

      const total =
        filtered.length === 0 ? 0 : Math.ceil(filtered.length / PAGE_SIZE);
      const nextPage = total === 0 ? 0 : Math.min(page, total - 1);
      const start = nextPage * PAGE_SIZE;
      const slice = filtered.slice(start, start + PAGE_SIZE);

      if (mounted) {
        if (nextPage !== page) setPage(nextPage);
        setProducts(slice);
        setTotalPages(total);
        setLoading(false);
      }

      return true;
    };

    const handledByCache = useCacheIfReady();
    if (handledByCache)
      return () => {
        mounted = false;
      };

    if (loadingAll && allProducts === null) {
      setLoading(true);
      return () => {
        mounted = false;
      };
    }

    const timer = setTimeout(() => {
      if (!mounted) return;

      setLoading(true);
      setError(false);

      const params = {
        p: page,
      };

      if (category) params.category = category;
      if (keyword) params.q = keyword;
      if (priceSort) params.priceSort = priceSort;

      if (brands?.length) {
        params.brand = brands.map((b) => BRAND_NAME_TO_ID[b] || b);
      }

      if (
        typeof minPrice === "number" &&
        typeof maxPrice === "number" &&
        mappedRanges.length > 0
      ) {
        const intersects = [];

        mappedRanges.forEach((r) => {
          const rMin = r.min ?? 0;
          const rMax = r.max ?? Number.MAX_SAFE_INTEGER;
          const aMin = Math.max(rMin, minPrice);
          const aMax = Math.min(rMax, maxPrice);
          if (aMin <= aMax) intersects.push({ min: aMin, max: aMax });
        });

        if (intersects.length === 0) {
          params.priceRanges = ["-1--1"];
        } else if (intersects.length === 1) {
          params.minPrice = intersects[0].min;
          params.maxPrice = intersects[0].max;
        } else {
          params.priceRanges = intersects.map((r) => `${r.min}-${r.max}`);
        }
      } else if (typeof minPrice === "number" && typeof maxPrice === "number") {
        params.minPrice = minPrice;
        params.maxPrice = maxPrice;
      } else if (mappedRanges.length === 1) {
        const r = mappedRanges[0];
        if (r.min != null) params.minPrice = r.min;
        if (r.max != null) params.maxPrice = r.max;
      } else if (mappedRanges.length > 1) {
        params.priceRanges = mappedRanges.map((r) => {
          const min = r.min ?? 0;
          const max = r.max ?? Number.MAX_SAFE_INTEGER;
          return `${min}-${max}`;
        });
      }

      getProducts(params)
        .then((res) => {
          if (!mounted) return;
          const data = res.data || {};
          setProducts(data.content || []);
          setTotalPages(data.totalPages || 0);
        })
        .catch(() => {
          if (!mounted) return;
          setError(true);
        })
        .finally(() => {
          if (!mounted) return;
          setLoading(false);
        });
    }, 250);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [
    page,
    priceSort,
    category,
    keyword,
    brands,
    priceRanges,
    minPrice,
    maxPrice,
    allProducts,
    loadingAll,
  ]);

  const currentCategory = CATEGORIES.find((c) => c.id === category) || null;
  return (
    <div className="min-w-0 flex-1">
      <BreadcrumbNav category={currentCategory} />
      <DoubleBanner />
      <main className="card-default px-4 py-5 sm:px-6">
        <div className="mb-6">
          <div className="mb-2 text-sm font-semibold text-[var(--color-text-muted)]">
            {vi.product.form.productTypeLabel}
          </div>

          <div className="flex flex-wrap gap-2.5 py-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setCategory(c.id);
                  setPage(0);
                }}
                className={`rounded-lg border px-3 py-2 text-sm font-medium motion-default inline-flex items-center gap-1.5 ${
                  category === c.id
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {c.icon}
                </span>
                {c.name}
              </button>
            ))}

            <button
              onClick={() => {
                setCategory(null);
                setPage(0);
              }}
              className={`rounded-lg border px-3 py-2 text-sm font-medium motion-default ${
                category === null
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              }`}
            >
              Tất cả
            </button>
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
            {vi.product.form.allProductsTitle}
          </h1>

          <select
            value={priceSort}
            onChange={(e) => {
              setPriceSort(e.target.value);
              setPage(0);
            }}
            className="select-default w-full sm:w-[260px]"
            aria-label="Sắp xếp theo giá"
          >
            <option value="">{vi.product.form.sortOptions.all}</option>
            <option value="asc">{vi.product.form.sortOptions.priceAsc}</option>
            <option value="desc">
              {vi.product.form.sortOptions.priceDesc}
            </option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading && (
            <div className="col-span-full rounded-lg border border-dashed border-[var(--color-border)] py-14 text-center text-sm text-[var(--color-text-muted)]">
              Đang tải...
            </div>
          )}
          {error && (
            <div className="col-span-full rounded-lg border border-dashed border-[var(--color-danger)] py-14 text-center text-sm text-[var(--color-danger)]">
              Lỗi tải dữ liệu
            </div>
          )}
          {!loading && !error && products.length === 0 && (
            <div className="col-span-full rounded-lg border border-dashed border-[var(--color-border)] py-14 text-center text-sm text-[var(--color-text-muted)]">
              Không có sản phẩm
            </div>
          )}
          {!loading &&
            !error &&
            products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-2.5">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="motion-default h-10 w-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Trang trước"
          >
            ‹
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`h-10 w-10 rounded-lg border text-sm font-semibold motion-default ${
                page === i
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              }`}
              aria-label={`Trang ${i + 1}`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="motion-default h-10 w-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Trang sau"
          >
            ›
          </button>
        </div>
      </main>
    </div>
  );
}
