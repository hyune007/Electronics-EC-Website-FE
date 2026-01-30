import { useRef, useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ROUTE_MAP } from "../../../../../routes/routesConfig/routeMap.js";
import {
  Menu,
  Home,
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  UserCog,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const [highlight, setHighlight] = useState(null);
  const [activeRect, setActiveRect] = useState(null);
  const location = useLocation();

  const handleHover = (rect) => {
    setHighlight(rect);
  };

  const handleClick = (rect) => {
    setHighlight(rect);
    setActiveRect(rect);
  };

  return (
    <aside
      className="
                group fixed md:static z-40 min-h-screen
                bg-[#C1E7FF]
                w-20 hover:w-72
                transition-all duration-300
                overflow-hidden shadow-lg
                flex flex-col justify-between
            "
      onMouseLeave={() => {
        if (activeRect) setHighlight(activeRect);
      }}
    >
      {/* HEADER */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-black/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold">
              U
            </div>
            <span className="font-bold text-lg text-black opacity-0 group-hover:opacity-100 transition">
              UBRAINTECH
            </span>
          </div>
          <Menu />
        </div>

        {/* MENU */}
        <nav className="relative px-3 py-6 space-y-2">
          {/* Highlight kính lúp */}
          {highlight && (
            <div
              className="
                                absolute left-2 right-2
                                rounded-xl
                                bg-white/40
                                backdrop-blur-md
                                shadow
                                transition-all duration-300
                            "
              style={{
                top: highlight.top,
                height: highlight.height,
              }}
            />
          )}

          <SidebarItem
            icon={<Home />}
            label="Trang chủ"
            to={ROUTE_MAP.home}
            onHover={handleHover}
            onClick={handleClick}
            activePath={location.pathname}
          />

          <SidebarItem
            icon={<Users />}
            label="Quản lí khách hàng"
            to={ROUTE_MAP.customers}
            onHover={handleHover}
            onClick={handleClick}
            activePath={location.pathname}
          />

          <SidebarItem
            icon={<Package />}
            label="Quản lí đơn hàng"
            to={ROUTE_MAP.orders}
            onHover={handleHover}
            onClick={handleClick}
            activePath={location.pathname}
          />

          <SidebarItem
            icon={<DollarSign />}
            label="Quản lí sản phẩm"
            to={ROUTE_MAP.products}
            onHover={handleHover}
            onClick={handleClick}
            activePath={location.pathname}
          />

          <SidebarItem
            icon={<ShoppingBag />}
            label="Quản lí hãng"
            to={ROUTE_MAP.brands}
            onHover={handleHover}
            onClick={handleClick}
            activePath={location.pathname}
          />

          <SidebarItem
            icon={<UserCog />}
            label="Quản lí nhân viên"
            to={ROUTE_MAP.staff}
            onHover={handleHover}
            onClick={handleClick}
            activePath={location.pathname}
          />
        </nav>
      </div>

      {/* LOGOUT */}
      {/* BOTTOM */}
      <div className="px-4 pb-6">
        <button
          className="
            w-full h-11
            flex items-center
            justify-center group-hover:justify-start
            gap-3
            px-3
            rounded-xl
            bg-black text-white
            transition-all duration-300
        "
        >
          {/* ICON */}
          <LogOut size={18} className="shrink-0" />

          {/* TEXT */}
          <span
            className="
                max-w-0
                opacity-0
                group-hover:max-w-[120px]
                group-hover:opacity-100
                transition-all duration-300
                whitespace-nowrap
                overflow-hidden
            "
          >
            Đăng xuất
          </span>
        </button>
      </div>
    </aside>
  );
}

/* ===== ITEM ===== */
function SidebarItem({ icon, label, to, onHover, onClick, activePath }) {
  const ref = useRef(null);

  const rect = () => ({
    top: ref.current.offsetTop,
    height: ref.current.offsetHeight,
  });

  useEffect(() => {
    if (activePath === to) {
      onClick(rect());
    }
  }, [activePath]);

  return (
    <NavLink to={to} style={{ textDecoration: "none" }}>
      <div
        ref={ref}
        onMouseEnter={() => onHover(rect())}
        onClick={() => onClick(rect())}
        className="
                    relative z-10
                    h-11
                    flex items-center gap-4
                    px-3
                    rounded-xl
                    text-black
                    cursor-pointer
                    transition-all duration-200
                "
      >
        <span className="w-5 h-5 shrink-0">{icon}</span>
        <span className="opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
          {label}
        </span>
      </div>
    </NavLink>
  );
}
