import { useState, useEffect } from "react";
import useTheme from "../../../../hooks/useTheme";
import { decodeJwtPayload } from "../../../../utils/jwt";
import { getCustomerById } from "../../../../services/customer/customerService";
export default function Sidebar({
  name = "Nguyễn Trường Huy",
  onSelectView,
  view = "myorder",
}) {
  const [fullName, setFullName] = useState("");
  const { theme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fetchCustomerName = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const decoded = decodeJwtPayload(token);
        const customerId = decoded?.sub;
        if (!customerId) return;

        const cacheKey = `customerInfo_${customerId}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const customer = JSON.parse(cached);
          setFullName(customer?.name || "");
        }

        const freshCustomer = await getCustomerById(customerId);
        setFullName(freshCustomer?.name || "");
        localStorage.setItem(cacheKey, JSON.stringify(freshCustomer));
      } catch (err) {
        console.error(err);
      }
    };

    fetchCustomerName();
  }, []);

  const handleSelect = (view) => (e) => {
    e.preventDefault();
    if (onSelectView) onSelectView(view);
    setMobileOpen(false);
  };

  const navItemClass = (key, extra = "") => {
    const active = view === key;
    const activeClass =
      theme === "dark"
        ? "bg-[var(--color-secondary)] text-white"
        : "bg-[var(--accent-light)] text-[var(--color-primary)]";
    const idleClass =
      theme === "dark"
        ? "text-slate-200 hover:bg-slate-800"
        : "text-[var(--color-text)] hover:bg-[var(--color-muted)]";

    return `flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-220 ease-standard ${
      active ? `${activeClass} font-semibold` : idleClass
    } ${extra}`;
  };

  const AsideContent = (
    <div
      className={`${theme === "dark" ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-[var(--color-surface)] border-[var(--color-border)]"} card-default overflow-hidden rounded-2xl border`}
    >
      <div
        className={`flex items-center gap-3 border-b p-6 ${theme === "dark" ? "border-slate-700" : "border-[var(--color-border)]"}`}
      >
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[var(--color-muted)]">
          <span className="material-symbols-outlined text-[var(--color-primary)]">
            account_circle
          </span>
        </div>
        <div>
          <p className="font-semibold text-sm">{fullName || name}</p>
        </div>
      </div>

      <nav className="p-4 space-y-1">
        <a
          onClick={handleSelect("information")}
          className={navItemClass("information")}
          href="#"
        >
          <span className="material-symbols-outlined text-[20px]">info</span>
          <span
            className={`text-sm ${view === "information" ? "font-semibold" : ""}`}
          >
            Thông tin
          </span>
        </a>
        <a
          onClick={handleSelect("myorder")}
          className={navItemClass("myorder")}
          href="#"
        >
          <span className="material-symbols-outlined text-[20px]">
            package_2
          </span>
          <span
            className={`text-sm ${view === "myorder" ? "font-semibold" : ""}`}
          >
            Đơn hàng của tôi
          </span>
        </a>
        <a
          onClick={handleSelect("address")}
          className={navItemClass("address")}
          href="#"
        >
          <span className="material-symbols-outlined text-[20px]">
            location_on
          </span>
          <span
            className={`text-sm ${view === "address" ? "font-semibold" : ""}`}
          >
            Địa chỉ
          </span>
        </a>
        <a
          onClick={handleSelect("setting")}
          className={navItemClass(
            "setting",
            `border-t pt-3 ${theme === "dark" ? "border-slate-700" : "border-[var(--color-border)]"}`,
          )}
          href="#"
        >
          <span className="material-symbols-outlined text-[20px]">
            settings
          </span>
          <span
            className={`text-sm ${view === "setting" ? "font-semibold" : ""}`}
          >
            Cài đặt
          </span>
        </a>
        <a
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-danger)] transition-colors duration-220 ease-standard hover:bg-[color-mix(in_oklab,var(--color-danger)_10%,white)]"
          href="#"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="text-sm">Đăng xuất</span>
        </a>
      </nav>
    </div>
  );

  return (
    <>
      <aside className="hidden shrink-0 lg:block lg:w-64">{AsideContent}</aside>

      {/* Mobile: profile tab picker trigger */}
      <button
        aria-label="Open profile menu"
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-primary)] shadow-md lg:hidden"
        onClick={() => setMobileOpen(true)}
        title="Mở các mục profile"
      >
        <span className="material-symbols-outlined text-[20px]">menu</span>
        <span className="text-xs font-semibold uppercase tracking-[0.08em]">
          Tab
        </span>
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-[var(--color-overlay)]"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-auto rounded-t-2xl border-t border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-lg">
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[var(--color-border)]" />
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--color-text)]">
                Chọn mục tài khoản
              </p>
              <button
                onClick={() => setMobileOpen(false)}
                className="icon-btn p-2"
                aria-label="Đóng menu profile"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div>{AsideContent}</div>
          </div>
        </div>
      )}
    </>
  );
}
