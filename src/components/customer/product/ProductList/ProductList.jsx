import { useState, useMemo } from "react";
import vi from "../../../../i18n/vi.js";
import ProductCard from "../ProductCard/ProductCard.jsx";

const PAGE_SIZE = 12;
const PRODUCTS = Array.from({ length: 37 }, (_, i) => ({
  id: i + 1,
}));

export default function ProductList() {
  const [page, setPage] = useState(1);

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

  const totalPages = Math.ceil(PRODUCTS.length / PAGE_SIZE);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return PRODUCTS.slice(start, start + PAGE_SIZE);
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
        <h1 className="text-2xl font-bold tracking-tight dark:text-slate-100">{vi.product.form.allProductsTitle}</h1>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-slate-300">{vi.product.form.sortLabel}</span>
            <select className="border border-gray-200 dark:border-gray-700 bg-transparent rounded-lg px-3 py-1.5 text-sm focus:outline-none dark:text-slate-100">
            <option>{vi.product.form.sortOptions.all}</option>
            <option>{vi.product.form.sortOptions.priceAsc}</option>
            <option>{vi.product.form.sortOptions.priceDesc}</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {paginatedProducts.map((product) => (
          <ProductCard key={product.id} />
        ))}
      </div>

      {/* Phân trang ở đây*/}
      <div className="mt-16 flex justify-center items-center gap-2">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700
            disabled:opacity-40 disabled:cursor-not-allowed
            hover:bg-primary hover:text-white transition dark:text-slate-100"
        >
          <span className="material-symbols-outlined text-[20px]">
            chevron_left
          </span>
        </button>

        {Array.from({ length: totalPages }).map((_, i) => {
          const p = i + 1;
          return (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-lg text-sm font-semibold transition
                  ${
                    page === p
                      ? "bg-primary text-white"
                      : "border border-gray-200 dark:border-gray-700 hover:bg-primary hover:text-white dark:text-slate-300"
                  }`}
            >
              {p}
            </button>
          );
        })}

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700
            disabled:opacity-40 disabled:cursor-not-allowed
            hover:bg-primary hover:text-white transition dark:text-slate-100"
        >
          <span className="material-symbols-outlined text-[20px] dark:text-slate-100">
            chevron_right
          </span>
        </button>
      </div>
    </main>
  );
}
