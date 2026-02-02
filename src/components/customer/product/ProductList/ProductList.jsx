import { useState, useEffect } from "react";
import vi from "../../../../i18n/vi.js";
import { getProducts } from "../../../../api/Product/productApi.js";
import ProductCard from "../ProductCard/ProductCard.jsx";

const PAGE_SIZE = 12;

export default function ProductList() {
  const [page, setPage] = useState(0);
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

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (!mounted) return;
      setLoading(true);
      setError(false);

      getProducts({ p: page, size: PAGE_SIZE })
        .then((res) => {
          if (!mounted) return;
          const data = res.data;
          setProducts(data.content || []);
          setTotalPages(data.totalPages || 0);
        })
        .catch((err) => {
          if (!mounted) return;
          console.error(err);
          setError(true);
        })
        .finally(() => {
          if (!mounted) return;
          setLoading(false);
        });
    }, 0);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [page]);

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
              type="button"
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-md font-medium hover:bg-primary hover:text-white transition dark:text-slate-100"
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <h1 className="text-2xl font-bold tracking-tight dark:text-slate-100">
          {vi.product.form.allProductsTitle}
        </h1>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-slate-300">
            {vi.product.form.sortLabel}
          </span>
          <select className="border border-gray-200 dark:bg-primary rounded-lg px-3 py-1.5 text-sm focus:outline-none dark:text-slate-100">
            <option value="">{vi.product.form.sortOptions.all}</option>
            <option value="asc">{vi.product.form.sortOptions.priceAsc}</option>
            <option value="desc">
              {vi.product.form.sortOptions.priceDesc}
            </option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 dark:text-slate-100">
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
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
      </div>

      {/* Phân trang đây */}
      <div className="mt-16 flex justify-center items-center gap-2">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700
            disabled:opacity-40 disabled:cursor-not-allowed
            hover:bg-primary hover:text-white transition dark:text-slate-100"
        >
          <span className="material-symbols-outlined text-[20px]">
            chevron_left
          </span>
        </button>

        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`w-10 h-10 rounded-lg text-sm font-semibold transition
              ${
                page === i
                  ? "bg-primary text-white"
                  : "border border-gray-200 dark:border-gray-700 hover:bg-primary hover:text-white dark:text-slate-300"
              }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={page === totalPages - 1}
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700
            disabled:opacity-40 disabled:cursor-not-allowed
            hover:bg-primary hover:text-white transition dark:text-slate-100"
        >
          <span className="material-symbols-outlined text-[20px]">
            chevron_right
          </span>
        </button>
      </div>
    </main>
  );
}
