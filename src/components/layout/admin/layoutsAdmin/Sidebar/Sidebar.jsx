import { useRef, useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ROUTE_MAP } from "../../../../../routes/routesConfig/routeMap";
import {
  Menu,
  Home,
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  UserCog,
  LogOut,
  Warehouse,
  TicketPercent,
} from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [highlight, setHighlight] = useState(null);
  const location = useLocation();

  const handleSelect = (rect) => {
    setHighlight(rect);
  };

  return (
      <aside
          className={`
                fixed md:static z-40 min-h-screen
                ${isOpen ? "w-72" : "w-20"}
                bg-[#C1E7FF]
                overflow-hidden shadow-lg
                flex flex-col justify-between
                transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
            `}
      >
        {/* ================= HEADER ================= */}
        <div>
          <div
              className={`
                        h-16 flex items-center px-4 border-b border-black/20
                        ${isOpen ? "justify-between" : "justify-center"}
                        transition-all duration-300
                    `}
          >
            {/* LOGO */}
            <div
                className={`
                            flex items-center gap-2 overflow-hidden
                            transition-all duration-500 ease-out
                            ${isOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-4 pointer-events-none"}
                        `}
            >
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold">
                U
              </div>
              <span className="font-bold text-lg text-black whitespace-nowrap">
                            UBRAINTECH
                        </span>
            </div>

            {/* MENU BUTTON */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="
                            w-9 h-9
                            flex items-center justify-center
                            rounded-lg
                            hover:bg-black/10
                            transition-all duration-300
                        "
            >
              <Menu />
            </button>
          </div>

          {/* ================= MENU ================= */}
          <nav className="relative px-3 py-6 space-y-2">
            {/* Highlight */}
            {highlight && (
                <div
                    className="
                                absolute left-2 right-2
                                rounded-xl
                                bg-white/60
                                backdrop-blur-md
                                shadow
                                transition-all duration-500 ease-out
                            "
                    style={{
                      top: highlight.top,
                      height: highlight.height,
                    }}
                />
            )}

            <SidebarItem icon={<Home />} label="Trang chủ" to={ROUTE_MAP.home}
                         onSelect={handleSelect} activePath={location.pathname} isOpen={isOpen} />

            <SidebarItem icon={<Users />} label="Quản lí khách hàng" to={ROUTE_MAP.customers}
                         onSelect={handleSelect} activePath={location.pathname} isOpen={isOpen} />

            <SidebarItem icon={<Package />} label="Quản lí đơn hàng" to={ROUTE_MAP.orders}
                         onSelect={handleSelect} activePath={location.pathname} isOpen={isOpen} />

            <SidebarItem icon={<DollarSign />} label="Quản lí sản phẩm" to={ROUTE_MAP.products}
                         onSelect={handleSelect} activePath={location.pathname} isOpen={isOpen} />

            <SidebarItem icon={<ShoppingBag />} label="Quản lí hãng" to={ROUTE_MAP.brands}
                         onSelect={handleSelect} activePath={location.pathname} isOpen={isOpen} />

            <SidebarItem icon={<UserCog />} label="Quản lí nhân viên" to={ROUTE_MAP.staff}
                         onSelect={handleSelect} activePath={location.pathname} isOpen={isOpen} />

            <SidebarItem icon={<Warehouse />} label="Quản lí nhập kho" to={ROUTE_MAP.imports}
                         onSelect={handleSelect} activePath={location.pathname} isOpen={isOpen} />

            <SidebarItem icon={<TicketPercent />} label="Quản lí voucher" to={ROUTE_MAP.vouchers}
                         onSelect={handleSelect} activePath={location.pathname} isOpen={isOpen} />
          </nav>
        </div>

        {/* ================= LOGOUT ================= */}
        <div className="px-4 pb-6">
          <button
              className="
                        w-full h-11
                        flex items-center gap-3 px-3
                        rounded-xl
                        bg-black text-white
                        hover:bg-black/80
                        transition-all duration-500 ease-out
                    "
          >
            <LogOut size={18} />

            <span
                className={`
                            transition-all duration-500 ease-out
                            delay-200
                            ${isOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-3 pointer-events-none"}
                        `}
            >
                        Đăng xuất
                    </span>
          </button>
        </div>
      </aside>
  );
}

/* ================= ITEM ================= */
function SidebarItem({ icon, label, to, onSelect, activePath, isOpen }) {
  const ref = useRef(null);

  const rect = () => ({
    top: ref.current.offsetTop,
    height: ref.current.offsetHeight,
  });

  useEffect(() => {
    if (activePath === to) {
      onSelect(rect());
    }
  }, [activePath, to]);

  return (
      <NavLink to={to} className="no-underline">
        <div
            ref={ref}
            onClick={() => onSelect(rect())}
            className="
                    relative z-10 h-11
                    flex items-center gap-4
                    px-3 rounded-xl
                    text-black
                    hover:bg-white/40
                    transition-all duration-300
                "
        >
          <span className="w-5 h-5 shrink-0">{icon}</span>

          <span
              className={`
                        whitespace-nowrap
                        transition-all duration-500 ease-out
                        delay-150
                        ${isOpen
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-4 pointer-events-none"}
                    `}
          >
                        {label}
                </span>
        </div>
      </NavLink>
  );
}