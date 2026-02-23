import { useState, useEffect } from "react";
import vi from "../../../../i18n/vi.js";
import { getProducts } from "../../../../services/customer/productService.js";
import ProductCard from "../ProductCard/ProductCard.jsx";

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

  const CATEGORIES = [
    { id: "LSP01", name: "Điện thoại" },
    { id: "LSP02", name: "Laptop" },
    { id: "LSP03", name: "Máy tính bảng" },
    { id: "LSP04", name: "Đồng hồ thông minh" },
    { id: "LSP05", name: "Tai nghe" },
    { id: "LSP06", name: "Bàn phím" },
    { id: "LSP07", name: "Chuột" },
    { id: "LSP08", name: "Màn hình" },
    { id: "LSP09", name: "Loa" },
    { id: "LSP10", name: "Phụ kiện khác" },
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

    const timer = setTimeout(() => {
      if (!mounted) return;

      setLoading(true);
      setError(false);

      const parseLabelToRange = (label) => {
        if (!label) return null;
        // chuẩn hóa dấu gạch
        const DASH_RE = /[\u2012\u2013\u2014\u2015\-]/;
        const hasTren = /Trên/.test(label);

        if (hasTren) {
          // trích xuất mã số đầu tiên sau 'Trên'
          const after = label.split(/Trên/i)[1] || label;
          const numStr = (after.match(/\d[\d\.\s]*/)?.[0] || "").replace(
            /[\.\s]/g,
            "",
          );
          const num = numStr ? Number(numStr) : 0;
          if (num >= 20000) return { min: 20000, max: 100000 };
          return { min: num, max: null };
        }

        // được chia thành các phần trái/phải bằng các ký tự giống dấu gạch ngang.
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
  ]);

  return (
    <main className="container mx-auto px-4 py-5">
      <div className="mb-6">
        <div className="mb-2 text-sm font-semibold text-gray-700 dark:text-slate-300">
          {vi.product.form.productTypeLabel}
        </div>

        <div className="flex flex-wrap gap-3 py-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setCategory(c.id);
                setPage(0);
              }}
              className={`px-3 py-2 rounded-lg border ${
                category === c.id
                  ? "bg-primary text-white"
                  : "border-gray-200 dark:border-gray-700 hover:bg-primary hover:text-white"
              }`}
            >
              {c.name}
            </button>
          ))}

          <button
            onClick={() => {
              setCategory(null);
              setPage(0);
            }}
            className={`px-3 py-2 rounded-lg border ${
              category === null
                ? "bg-primary text-white border-primary"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:bg-primary hover:text-white dark:text-slate-100"
            }`}
          >
            Tất cả
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <h1 className="text-2xl font-bold tracking-tight dark:text-slate-100">
          {vi.product.form.allProductsTitle}
        </h1>

        <select
          value={priceSort}
          onChange={(e) => {
            setPriceSort(e.target.value);
            setPage(0);
          }}
          className="border border-gray-200 dark:bg-primary rounded-lg px-3 py-1.5 text-sm dark:text-slate-100"
        >
          <option value="">{vi.product.form.sortOptions.all}</option>
          <option value="asc">{vi.product.form.sortOptions.priceAsc}</option>
          <option value="desc">{vi.product.form.sortOptions.priceDesc}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {loading && (
          <div className="col-span-full text-center">Đang tải...</div>
        )}
        {error && (
          <div className="col-span-full text-center text-red-500">
            Lỗi tải dữ liệu
          </div>
        )}
        {!loading && !error && products.length === 0 && (
          <div className="col-span-full text-center">Không có sản phẩm</div>
        )}
        {!loading &&
          !error &&
          products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>

      <div className="mt-16 flex justify-center items-center gap-2">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="w-10 h-10 rounded-lg border hover:bg-primary hover:text-white disabled:opacity-40"
        >
          ‹
        </button>

        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`w-10 h-10 rounded-lg ${
              page === i
                ? "bg-primary text-white"
                : "border hover:bg-primary hover:text-white"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={page === totalPages - 1}
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          className="w-10 h-10 rounded-lg border hover:bg-primary hover:text-white disabled:opacity-40"
        >
          ›
        </button>
      </div>
    </main>
  );
}
