import PriceRange from "../PriceRange/PriceRange.jsx";
import vi from "../../../../i18n/vi.js";

const PRICE_LABELS = new Map([
  ["0-5000", "0 – 5.000₫"],
  ["5000-10000", "5.000 – 10.000 ₫"],
  ["10000-20000", "10.000 – 20.000 ₫"],
  ["20000-100000", "Trên 20.000 ₫"],
]);

const BRANDS = [
  "Apple",
  "Samsung",
  "Google",
  "Xiaomi",
  "Oppo",
  "OnePlus",
  "Asus",
  "Sony",
  "Dell",
  "HP",
  "Lenovo",
  "LG",
  "Acer",
  "MSI",
  "Razer",
  "Logitech",
  "Corsair",
  "SteelSeries",
  "Marshall",
  "JBL",
  "Bose",
  "Sony Audio",
  "Anker",
];

export default function ProductFilter({
  open = false,
  onClose = () => {},

  keyword = "",
  selectedBrands = [],
  selectedPriceRanges = [],
  minPrice = 0,
  maxPrice = 0,

  onKeywordChange = () => {},
  onToggleBrand = () => {},
  onTogglePriceRange = () => {},
  onPriceRangeChange = () => {},
}) {
  const sectionTitleClass =
    "mb-4 border-b border-[var(--color-border)] pb-2 text-base font-semibold text-[var(--color-text)]";

  const checkboxClass =
    "rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]";

  return (
    <>
      <aside className="hidden w-[290px] shrink-0 space-y-7 lg:block">
        <div className="card-default p-5">
          <h3 className={sectionTitleClass}>{vi.product.form.search}</h3>
          <div>
            <input
              type="text"
              placeholder={vi.product.form.searchPlaceholder}
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              className="input-default"
            />
          </div>
        </div>

        <div className="card-default p-5">
          <h3 className={sectionTitleClass}>{vi.product.form.priceRange}</h3>

          <div className="space-y-2">
            {[...PRICE_LABELS.entries()].map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedPriceRanges.includes(key)}
                  onChange={() => onTogglePriceRange(key)}
                  className={checkboxClass}
                />
                <span className="text-sm text-[var(--color-text)] transition-colors duration-220 ease-standard group-hover:text-[var(--color-primary)]">
                  {label}
                </span>
              </label>
            ))}
          </div>

          <div className="my-4 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <span className="h-px flex-1 bg-[var(--color-border)]" />
            {vi.product.form.or}
            <span className="h-px flex-1 bg-[var(--color-border)]" />
          </div>

          <PriceRange
            min={minPrice}
            max={maxPrice}
            onChange={onPriceRangeChange}
          />
        </div>

        <div className="card-default p-5">
          <h3 className={sectionTitleClass}>{vi.product.form.brand}</h3>

          <div className="max-h-64 space-y-2 overflow-y-auto pr-2">
            {BRANDS.map((brand) => (
              <label
                key={brand}
                className="flex items-center gap-2 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => onToggleBrand(brand)}
                  className={checkboxClass}
                />
                <span className="text-[var(--color-text)] transition-colors duration-220 ease-standard hover:text-[var(--color-primary)]">
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </div>
      </aside>
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-220 ease-standard ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
        aria-hidden={!open}
      >
        <div className="absolute inset-0 bg-[var(--color-overlay)]" />
      </div>

      <div
        className={`fixed inset-y-0 left-0 z-50 w-full max-w-xs transform overflow-auto border-r border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-transform duration-220 ease-standard ${open ? "translate-x-0" : "-translate-x-full"}`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--color-text)]">
            {vi.product.form.filterTitle}
          </h3>
          <button
            onClick={onClose}
            className="icon-btn rounded-md"
            aria-label="Đóng bộ lọc"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="card-default p-4">
          <h3 className={sectionTitleClass}>{vi.product.form.search}</h3>
          <input
            type="text"
            placeholder={vi.product.form.searchPlaceholder}
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            className="input-default"
          />
        </div>

        <div className="card-default mt-4 p-4">
          <h3 className={sectionTitleClass}>{vi.product.form.priceRange}</h3>
          <div className="space-y-2">
            {[...PRICE_LABELS.entries()].map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedPriceRanges.includes(key)}
                  onChange={() => onTogglePriceRange(key)}
                  className={checkboxClass}
                />
                <span className="text-sm text-[var(--color-text)] transition-colors duration-220 ease-standard group-hover:text-[var(--color-primary)]">
                  {label}
                </span>
              </label>
            ))}
          </div>

          <div className="my-4 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <span className="h-px flex-1 bg-[var(--color-border)]" />
            {vi.product.form.or}
            <span className="h-px flex-1 bg-[var(--color-border)]" />
          </div>

          <PriceRange
            min={minPrice}
            max={maxPrice}
            onChange={onPriceRangeChange}
          />
        </div>

        <div className="card-default mt-4 p-4">
          <h3 className={sectionTitleClass}>{vi.product.form.brand}</h3>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-2">
            {BRANDS.map((brand) => (
              <label
                key={brand}
                className="flex items-center gap-2 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => onToggleBrand(brand)}
                  className={checkboxClass}
                />
                <span className="text-[var(--color-text)] transition-colors duration-220 ease-standard hover:text-[var(--color-primary)]">
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
