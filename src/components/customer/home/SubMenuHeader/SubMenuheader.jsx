import { Link } from "react-router-dom";
import vi from "../../../../i18n/vi.js";

export default function SubMenuHeader({ onSelect }) {
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

  const BRANDS = [
    "Apple",
    "Samsung",
    "Google",
    "Xiaomi",
    "Oppo",
    "OnePlus",
    "Asus",
    "Sony",
    "Realme",
    "Vivo",
    "Nokia",
    "Dell",
    "HP",
    "Lenovo",
    "Razer",
    "LG",
    "Acer",
    "Microsoft",
    "MSI",
    "Gigabyte",
    "Amazon",
    "Huawei",
    "TCL",
    "Garmin",
    "Amazfit",
    "Fitbit",
    "Bose",
    "Sennheiser",
    "JBL",
    "Logitech",
    "Corsair",
    "SteelSeries",
    "BenQ",
    "ViewSonic",
    "Alienware",
  ];

  return (
    <div
      className="
        absolute left-1/2 top-full mt-3 -translate-x-1/2
        w-[92vw] max-w-5xl
        rounded-2xl
        bg-[var(--color-surface)]
        border border-[var(--color-border)]
        shadow-lg
        p-6
        z-50
      "
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            {vi.product.form.productTypeLabel}
          </h4>

          <ul className="space-y-1">
            {CATEGORIES.map((category) => (
              <li key={category.id}>
                <Link
                  to={`/products?p=1&category=${category.id}`}
                  onClick={onSelect}
                  className="
                    group flex items-center gap-2
                    px-3 py-2 rounded-lg
                    text-sm text-[var(--color-text)]
                    hover:bg-[var(--color-muted)] hover:text-[var(--color-primary)]
                    transition-colors duration-220 ease-standard
                  "
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-border)] transition-colors duration-220 ease-standard group-hover:bg-[var(--color-primary)]" />
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="absolute bottom-6 left-1/2 top-6 hidden w-px bg-[var(--color-border)] md:block" />

        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            {vi.product.form.brand}
          </h4>

          <div className="flex flex-wrap gap-3">
            {BRANDS.map((b) => (
              <Link
                key={b}
                to={`/products?p=1&brand=${encodeURIComponent(b)}`}
                onClick={onSelect}
                className="
                  px-4 py-1.5 rounded-full
                  text-sm font-medium
                  bg-[var(--color-surface)]
                  text-[var(--color-text)]
                  border border-[var(--color-border)]
                  shadow-sm
                  hover:-translate-y-0.5
                  hover:shadow-md
                  hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]
                  transition-all duration-220 ease-standard
                "
              >
                {b}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
