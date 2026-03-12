import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import vi from "../../../../i18n/vi.js";
import ProductList from "../ProductList/ProductList.jsx";
import ProductFilter from "../ProductFilter/ProductFilter.jsx";
import Banner from "../../home/Banner/Banner.jsx";

export default function ProductLayout() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [keyword, setKeyword] = useState(() => searchParams.get("q") || "");
  const [brands, setBrands] = useState(() => {
    const brandsFromUrl = searchParams.get("brand");
    if (!brandsFromUrl) return [];

    return brandsFromUrl
      .split(",")
      .map((brand) => brand.trim())
      .filter(Boolean);
  });
  const [priceRanges, setPriceRanges] = useState(() => {
    const pr = searchParams.get("priceRanges");
    return pr ? pr.split(",") : [];
  });

  const [minPrice, setMinPrice] = useState(() => {
    const v = searchParams.get("minPrice");
    return v ? Number(v) : null;
  });

  const [maxPrice, setMaxPrice] = useState(() => {
    const v = searchParams.get("maxPrice");
    return v ? Number(v) : null;
  });

  const [priceSort, setPriceSort] = useState(
    () => searchParams.get("sort") || ""
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(() => {
    const fromUrl = Number(searchParams.get("p") || 1);
    return Number.isFinite(fromUrl) && fromUrl > 0 ? fromUrl - 1 : 0;
  });
  const [category, setCategory] = useState(
    () => searchParams.get("category") || null,
  );

  useEffect(() => {
    const params = new URLSearchParams();

    if (page >= 0) params.append("p", page + 1);
    if (category) params.append("category", category);
    if (brands.length) params.append("brand", brands.join(","));
    if (keyword) params.append("q", keyword);

    if (priceRanges.length) {
      params.append("priceRanges", priceRanges.join(","));
    } else {
      if (typeof minPrice === "number") params.append("minPrice", minPrice);
      if (typeof maxPrice === "number") params.append("maxPrice", maxPrice);
    }

    if (priceSort) params.append("sort", priceSort);

    setSearchParams(params, { replace: true });
  }, [
    page,
    category,
    brands,
    keyword,
    priceRanges,
    minPrice,
    maxPrice,
    priceSort,
    setSearchParams,
  ]);

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
            page={page}
            setPage={setPage}
            category={category}
            setCategory={setCategory}
            brands={brands}
            keyword={keyword}
            priceRanges={priceRanges}
            minPrice={minPrice}
            maxPrice={maxPrice}
            priceSort={priceSort}
            setPriceSort={setPriceSort}
          />
        </div>
      </main>
    </div>
  );
}
