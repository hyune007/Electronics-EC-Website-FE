import PriceRange from "../PriceRange/PriceRange.jsx";
import vi from "../../../../i18n/vi.js";

export default function ProductFilter({ open = false, onClose = () => {} }) {
  return (
    <>
      <aside className="hidden lg:block lg:w-1/4 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4 border-b pb-2 dark:border-slate-800 dark:text-slate-100">
            {vi.product.form.search}
          </h3>
          <input
            type="text"
            placeholder={vi.product.form.searchPlaceholder}
            className="
              w-full rounded-lg
              border border-slate-200 dark:border-slate-700
              bg-white dark:bg-slate-900
              px-3 py-2 text-sm dark:text-slate-100 dark:placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-primary/30
            "
          />
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4 border-b pb-2 dark:border-slate-800 dark:text-slate-100">
            {vi.product.form.priceRange}
          </h3>

          <div className="space-y-2">
            {[
              "0 – 5.000.000 ₫",
              "5.000.000 – 10.000.000 ₫",
              "10.000.000 – 20.000.000 ₫",
              "Trên 20.000.000 ₫",
            ].map((label) => (
              <label
                key={label}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-sm group-hover:text-accent transition-colors dark:text-slate-300">
                  {label}
                </span>
              </label>
            ))}
          </div>

          <div className="flex items-center gap-2 my-4 text-xs text-slate-400 dark:text-slate-400">
            <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            {vi.product.form.or}
            <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          <PriceRange />
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4 border-b pb-2 dark:border-slate-800 dark:text-slate-100">
            {vi.product.form.brand}
          </h3>

          <div className="max-h-64 overflow-y-auto pr-2 space-y-2">
            {[
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
            ].map((brand) => (
              <label
                key={brand}
                className="flex items-center gap-2 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  className="rounded text-primary focus:ring-primary"
                />
                <span className="hover:text-accent transition-colors dark:text-slate-300">
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </div>
      </aside>
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
        aria-hidden={!open}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div
        className={`fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white dark:bg-slate-900 p-4 overflow-auto transform transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold dark:text-slate-100">
            {vi.product.form.filterTitle}
          </h3>
          <button onClick={onClose} className="p-2 rounded-md">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4 border-b pb-2 dark:border-slate-800 dark:text-slate-100">
            {vi.product.form.search}
          </h3>
          <input
            type="text"
            placeholder={vi.product.form.searchPlaceholder}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm dark:text-slate-100 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-bold mb-4 border-b pb-2 dark:border-slate-800">
            {vi.product.form.priceRange}
          </h3>
          <div className="space-y-2">
            {[
              "0 – 5.000.000 ₫",
              "5.000.000 – 10.000.000 ₫",
              "10.000.000 – 20.000.000 ₫",
              "Trên 20.000.000 ₫",
            ].map((label) => (
              <label
                key={label}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-sm group-hover:text-accent transition-colors dark:text-slate-300">
                  {label}
                </span>
              </label>
            ))}
          </div>

          <div className="flex items-center gap-2 my-4 text-xs text-slate-400 dark:text-slate-400">
            <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            {vi.product.form.or}
            <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          <PriceRange />
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-bold mb-4 border-b pb-2 dark:border-slate-800 dark:text-slate-100">
            {vi.product.form.brand}
          </h3>
          <div className="max-h-64 overflow-y-auto pr-2 space-y-2">
            {[
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
            ].map((brand) => (
              <label
                key={brand}
                className="flex items-center gap-2 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  className="rounded text-primary focus:ring-primary"
                />
                <span className="hover:text-accent transition-colors dark:text-slate-300">
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
