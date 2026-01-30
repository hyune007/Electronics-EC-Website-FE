import useTheme from "../../../../hooks/useTheme";

export default function Sidebar({
  name = "Nguyễn Trường Huy",
  onSelectView,
  view = "myorder",
}) {
  const { theme } = useTheme();
  const handleSelect = (view) => (e) => {
    e.preventDefault();
    if (onSelectView) onSelectView(view);
  };

  return (
    <aside className="w-64 shrink-0">
      <div
        className={`${theme === "dark" ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200"} rounded-2xl shadow-sm border overflow-hidden`}
      >
        <div
          className={`p-6 border-b ${theme === "dark" ? "border-slate-700" : "border-slate-100"} flex items-center gap-3`}
        >
          <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
            <span className="material-symbols-outlined text-black">account_circle</span>
          </div>
          <div>
            <p className="font-semibold text-sm">{name}</p>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          <a
            onClick={handleSelect("information")}
            className={`flex items-center gap-3 px-3 py-2 ${view === "information" ? (theme === "dark" ? "bg-[var(--accent-dark)] text-white font-semibold" : "bg-[var(--accent-light)] font-semibold") : theme === "dark" ? "text-slate-200 hover:bg-slate-800 hover:rounded-lg" : "hover:bg-slate-50 hover:rounded-lg"} rounded-lg transition-colors`}
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
            className={`flex items-center gap-3 px-3 py-2 ${view === "myorder" ? (theme === "dark" ? "bg-[var(--accent-dark)] text-white font-semibold" : "bg-[var(--accent-light)] font-semibold") : theme === "dark" ? "text-slate-200 hover:bg-slate-800 hover:rounded-lg" : "hover:bg-slate-50 hover:rounded-lg"} rounded-lg transition-colors`}
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
            className={`flex items-center gap-3 px-3 py-2 ${view === "address" ? (theme === "dark" ? "bg-[var(--accent-dark)] text-white font-semibold" : "bg-[var(--accent-light)] font-semibold") : theme === "dark" ? "text-slate-200 hover:bg-slate-800 hover:rounded-lg" : "hover:bg-slate-50 hover:rounded-lg"} rounded-lg transition-colors`}
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
            className={`flex items-center gap-3 px-3 py-2 ${view === "setting" ? (theme === "dark" ? "bg-[var(--accent-dark)] text-white font-semibold" : "bg-[var(--accent-light)] font-semibold") : theme === "dark" ? "text-slate-200 hover:bg-slate-800 hover:rounded-lg" : "hover:bg-slate-50 hover:rounded-lg"} rounded-lg transition-colors border-t ${theme === "dark" ? "border-slate-700" : "border-slate-100"} pt-3`}
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
            className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 hover:rounded-lg rounded-lg transition-colors"
            href="#"
          >
            <span className="material-symbols-outlined text-[20px]">
              logout
            </span>
            <span className="text-sm">Đăng xuất</span>
          </a>
        </nav>
      </div>
    </aside>
  );
}
