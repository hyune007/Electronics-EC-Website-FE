import { Link } from "react-router-dom";
import vi from "../../../../i18n/vi.js";

export default function SubMenuHeader() {
  const CATEGORIES = [
    "Điện thoại",
    "Laptop",
    "Máy tính bảng",
    "Đồng hồ thông minh",
    "Tai nghe",
    "Bàn phím",
    "Chuột",
    "Màn hình",
    "Loa",
    "Phụ kiện khác",
  ];

  const BRANDS = [
     "Apple", "Samsung", "Google", "Xiaomi", "Oppo", "OnePlus", "Asus", "Sony",
    "Realme", "Vivo", "Nokia", "Dell", "HP", "Lenovo", "Razer", "LG", "Acer",
    "Microsoft", "MSI", "Gigabyte", "Amazon", "Huawei", "TCL", "Garmin",
    "Amazfit", "Fitbit", "Bose", "Sennheiser", "JBL", "Logitech", "Corsair",
    "SteelSeries", "BenQ", "ViewSonic", "Alienware"
  ];

  return (
    <div
      className="
        absolute left-1/2 top-full mt-3 -translate-x-1/2
        w-[92vw] max-w-5xl
        rounded-2xl
        bg-gradient-to-br from-white via-slate-50 to-slate-100
        dark:from-slate-900 dark:via-slate-900 dark:to-slate-800
        border border-gray-200/70 dark:border-slate-700/60
        shadow-[0_20px_60px_rgba(0,0,0,0.12)]
        backdrop-blur-xl
        p-6
        z-50
      "
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-slate-400 mb-4">
            {vi.product.form.productTypeLabel}
          </h4>

          <ul className="space-y-1">
            {CATEGORIES.map((name) => (
              <li key={name}>
                <Link
                  to="#"
                  className="
                    group flex items-center gap-2
                    px-3 py-2 rounded-lg
                    text-sm text-gray-800 dark:text-slate-100
                    hover:bg-primary/10 hover:text-primary
                    transition
                  "
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-slate-600 group-hover:bg-primary transition" />
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden md:block absolute left-1/2 top-6 bottom-6 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent dark:via-slate-700" />

        <div>
          <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-slate-400 mb-4">
            {vi.product.form.brand}
          </h4>

          <div className="flex flex-wrap gap-3">
            {BRANDS.map((b) => (
              <Link
                key={b}
                to="#"
                className="
                  px-4 py-1.5 rounded-full
                  text-sm font-medium
                  bg-white/80 dark:bg-slate-800/80
                  text-gray-700 dark:text-slate-100
                  border border-gray-200/70 dark:border-slate-700
                  shadow-sm
                  hover:-translate-y-0.5
                  hover:shadow-md
                  hover:bg-primary hover:text-white hover:border-primary
                  transition-all
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
