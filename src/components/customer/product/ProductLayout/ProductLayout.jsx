import { useState, useEffect } from "react";
import vi from "../../../../i18n/vi.js";
import ProductList from "../ProductList/ProductList.jsx";
import ProductFilter from "../ProductFilter/ProductFilter.jsx";
import Banner from "../../home/Banner/Banner.jsx";

export default function ProductLayout() {
  const [keyword, setKeyword] = useState("");
  const [brands, setBrands] = useState([]);
  const [priceRanges, setPriceRanges] = useState([]);
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);
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
            keyword={keyword}
            selectedBrands={brands}
            selectedPriceRanges={priceRanges}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onKeywordChange={setKeyword}
            onToggleBrand={(b) =>
              setBrands((prev) =>
                prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b],
              )
            }
            onTogglePriceRange={(r) =>
              setPriceRanges((prev) => {
                const next = prev.includes(r)
                  ? prev.filter((x) => x !== r)
                  : [...prev, r];
                // reset slider to default bounds (0 - 100000) when user selects a checkbox
                setMinPrice(0);
                setMaxPrice(100000);
                return next;
              })
            }
            onPriceRangeChange={(min, max) => {
              // user moved slider -> clear checkbox selections to avoid conflict
              setPriceRanges([]);
              setMinPrice(min);
              setMaxPrice(max);
            }}
          />
          <ProductList
            keyword={keyword}
            brands={brands}
            priceRanges={priceRanges}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        </div>
      </main>
    </div>
  );
}
