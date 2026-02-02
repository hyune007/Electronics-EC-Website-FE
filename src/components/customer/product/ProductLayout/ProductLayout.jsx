import { useState, useEffect } from "react";
import vi from "../../../../i18n/vi.js";
import ProductList from "../ProductList/ProductList.jsx";
import ProductFilter from "../ProductFilter/ProductFilter.jsx";
import Banner from "../../home/Banner/Banner.jsx";

export default function ProductLayout() {
  const [filterOpen, setFilterOpen] = useState(false);
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024 && filterOpen) {
        setFilterOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, [filterOpen]);
  return (
    <div>
      <Banner variant="product" />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-4 lg:hidden">
          <button
            onClick={() => setFilterOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm font-medium dark:text-slate-100"
          >
            <span className="material-symbols-outlined">filter_list</span>
            {vi.product.form.filterButton}
          </button>
        </div>

        <div className="flex gap-8">
          <ProductFilter
            open={filterOpen}
            onClose={() => setFilterOpen(false)}
          />
          <ProductList />
        </div>
      </main>
    </div>
  );
}
