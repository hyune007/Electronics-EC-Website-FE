import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ROUTE_MAP } from "../../../../../routes/routesConfig/admin/routeMap";
import {
  Menu,
  ChevronDown,
  Home,
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  UserCog,
  LogOut,
  Warehouse,
  TicketPercent,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../../../../../hooks/useAuth";
import { useCart } from "../../../../../contexts/CartContext";
import { SECTION_TITLE, SIDEBAR_ITEMS } from "./sidebar.config";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isManageOpen, setIsManageOpen] = useState(true);
  const [isStatsOpen, setIsStatsOpen] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { clearCart } = useCart();

  const roleId = user?.roleId;

  const routeByKey = {
    home: ROUTE_MAP.home,
    customers: ROUTE_MAP.customers,
    orders: ROUTE_MAP.orders,
    products: ROUTE_MAP.products,
    brands: ROUTE_MAP.brands,
    staff: ROUTE_MAP.staff,
    imports: ROUTE_MAP.imports,
    vouchers: ROUTE_MAP.vouchers,
    chat: ROUTE_MAP.chat,
    customer_stats: ROUTE_MAP.customer_stats,
    order_stats: ROUTE_MAP.order_stats,
    product_stats: ROUTE_MAP.product_stats,
    brand_stats: ROUTE_MAP.brand_stats,
    staff_stats: ROUTE_MAP.staff_stats,
    import_stats: ROUTE_MAP.import_stats,
    voucher_stats: ROUTE_MAP.voucher_stats,
  };

  const iconByKey = {
    home: Home,
    customers: Users,
    orders: Package,
    products: DollarSign,
    brands: ShoppingBag,
    staff: UserCog,
    imports: Warehouse,
    vouchers: TicketPercent,
    chat: MessageCircle,
    customer_stats: Users,
    order_stats: Package,
    product_stats: DollarSign,
    brand_stats: ShoppingBag,
    staff_stats: UserCog,
    import_stats: Warehouse,
    voucher_stats: TicketPercent,
  };

  const hasNestedPath = (path, route) => path === route || path.startsWith(`${route}/`);

  const visibleItems = useMemo(
    () => SIDEBAR_ITEMS.filter((item) => item.roleAccess.includes(roleId)),
    [roleId]
  );

  const topItems = visibleItems.filter((item) => item.section === "overview");
  const managementItems = visibleItems.filter((item) => item.section === "management");
  const statisticsItems = visibleItems.filter((item) => item.section === "statistics");
  const communicationItems = visibleItems.filter((item) => item.section === "communication");

  const isManagementActive = managementItems.some((item) => {
    const route = routeByKey[item.key];
    return route ? hasNestedPath(location.pathname, route) : false;
  });

  const isStatisticsActive = statisticsItems.some((item) => {
    const route = routeByKey[item.key];
    return route ? hasNestedPath(location.pathname, route) : false;
  });

  const handleLogout = () => {
    clearCart();
    logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    if (isManagementActive) {
      setIsManageOpen(true);
    }
  }, [isManagementActive]);

  useEffect(() => {
    if (isStatisticsActive) {
      setIsStatsOpen(true);
    }
  }, [isStatisticsActive]);

  return (
    <aside
      className={`
        relative z-40 h-full
        ${isOpen ? "w-72" : "w-24"}
        overflow-hidden
        bg-gradient-to-b from-slate-50 via-slate-100 to-slate-100
        border-r border-slate-200
        text-slate-700
        flex flex-col
        transition-all duration-400 ease-out
      `}
    >
      <div className="pointer-events-none absolute -right-14 top-16 h-52 w-52 rounded-full bg-slate-300/35 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-4 h-56 w-56 rounded-full bg-white/80 blur-3xl" />

      <div className="flex-1 min-h-0 flex flex-col">
        <div
          className={`
            h-20 flex items-center px-4 border-b border-slate-200
            ${isOpen ? "justify-between" : "justify-center"}
            transition-all duration-300
          `}
        >
          <div
            className={`
              flex items-center gap-2 overflow-hidden
              transition-all duration-300 ease-out
              ${
                isOpen
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-4 pointer-events-none"
              }
            `}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck size={18} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-base tracking-wide whitespace-nowrap text-slate-900">UBRAINTECH</p>
              <p className="text-xs text-slate-500 whitespace-nowrap">Admin control hub</p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="
              w-9 h-9 flex items-center justify-center
              rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200
              transition-all duration-300
            "
            title={isOpen ? "Thu gọn sidebar" : "Mở rộng sidebar"}
          >
            {isOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-2 py-4">
          <nav className="relative px-1 py-1 space-y-4">
            {!isOpen && (
              <div
                className="
                  h-9 flex items-center justify-center rounded-lg
                  bg-white border border-slate-200 text-slate-500
                "
              >
                <Menu size={16} />
              </div>
            )}

            <SidebarSectionLabel isOpen={isOpen} label={SECTION_TITLE.overview} />
            {topItems.map((item) => {
              const Icon = iconByKey[item.key];
              return (
                <SidebarItem
                  key={item.key}
                  icon={Icon}
                  label={item.title}
                  to={routeByKey[item.key]}
                  isOpen={isOpen}
                />
              );
            })}

            <div>
              <button
                onClick={() => setIsManageOpen(!isManageOpen)}
                className="
                  w-full h-11 flex items-center justify-between gap-3 px-3 rounded-xl
                  text-slate-600 hover:text-slate-900 hover:bg-slate-200/70
                  border border-slate-200
                  transition-all duration-300
                "
              >
                <span className="flex items-center gap-3">
                  <Package size={18} />
                  {isOpen && <span className="font-medium">Quản lý</span>}
                </span>
                {isOpen && (
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${isManageOpen ? "rotate-180" : "rotate-0"}`}
                  />
                )}
              </button>

              <div
                className={`
                  overflow-hidden transition-all duration-300
                  ${isManageOpen ? "max-h-[500px]" : "max-h-0"}
                `}
              >
                <div className={`mt-2 space-y-2 ${isOpen ? "pl-4" : "pl-0"}`}>
                  {managementItems.map((item) => {
                    const Icon = iconByKey[item.key];
                    return (
                      <SidebarItem
                        key={item.key}
                        icon={Icon}
                        label={item.title}
                        to={routeByKey[item.key]}
                        isOpen={isOpen}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {statisticsItems.length > 0 && (
            <div>
              <button
                onClick={() => setIsStatsOpen(!isStatsOpen)}
                className="
                  w-full h-11 flex items-center justify-between gap-3 px-3 rounded-xl
                  text-slate-600 hover:text-slate-900 hover:bg-slate-200/70
                  border border-slate-200
                  transition-all duration-300
                "
              >
                <span className="flex items-center gap-3">
                  <BarChart3 size={18} />
                  {isOpen && <span className="font-medium">Thống kê</span>}
                </span>
                {isOpen && (
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${isStatsOpen ? "rotate-180" : "rotate-0"}`}
                  />
                )}
              </button>

              <div
                className={`
                  overflow-hidden transition-all duration-300
                  ${isStatsOpen ? "max-h-[500px]" : "max-h-0"}
                `}
              >
                <div className={`mt-2 space-y-2 ${isOpen ? "pl-4" : "pl-0"}`}>
                  {statisticsItems.map((item) => {
                    const Icon = iconByKey[item.key];
                    return (
                      <SidebarItem
                        key={item.key}
                        icon={Icon}
                        label={item.title}
                        to={routeByKey[item.key]}
                        isOpen={isOpen}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
            )}

            <SidebarSectionLabel isOpen={isOpen} label={SECTION_TITLE.communication} />
            {communicationItems.map((item) => {
              const Icon = iconByKey[item.key];
              return (
                <SidebarItem
                  key={item.key}
                  icon={Icon}
                  label={item.title}
                  to={routeByKey[item.key]}
                  isOpen={isOpen}
                />
              );
            })}
          </nav>
        </div>
      </div>

      <div className="px-4 pb-5">
        <button
          onClick={handleLogout}
          className="
            w-full h-11 flex items-center gap-3 px-3
            rounded-xl border border-slate-800/80
            bg-slate-900 text-white
            hover:bg-slate-800
            transition-all duration-300
          "
          title="Đăng xuất"
        >
          <LogOut size={18} />
          <span
            className={`
              whitespace-nowrap
              transition-all duration-300
              ${
                isOpen
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-2 pointer-events-none"
              }
            `}
          >
            Đăng xuất
          </span>
        </button>
      </div>
    </aside>
  );
}

function SidebarSectionLabel({ isOpen, label }) {
  if (!isOpen) {
    return null;
  }

  return <p className="px-3 text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</p>;
}

function SidebarItem({ icon: Icon, label, to, isOpen }) {
  if (!to || !Icon) {
    return null;
  }

  return (
    <NavLink
      to={to}
      title={label}
      className={({ isActive }) =>
        `group relative z-10 h-11 flex items-center gap-3 px-3 rounded-xl border transition-all duration-200
        ${
          isActive
            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
            : "text-slate-600 border-transparent hover:bg-white hover:text-slate-900 hover:border-slate-200"
        }
        ${isOpen ? "justify-start" : "justify-center"}`
      }
    >
      <span className="w-5 h-5 shrink-0 flex items-center justify-center">
        <Icon size={18} />
      </span>
      <span
        className={`
          whitespace-nowrap text-sm font-medium
          transition-all duration-300
          ${
            isOpen
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-2 pointer-events-none w-0 overflow-hidden"
          }
        `}
      >
        {label}
      </span>
    </NavLink>
  );
}