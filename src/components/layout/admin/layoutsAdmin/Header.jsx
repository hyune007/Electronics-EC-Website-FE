import { Menu, Bell, Settings, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState, useRef, useEffect } from "react";
import { useAuth } from "../../../../hooks/useAuth.js";
import { useCart } from "../../../../contexts/CartContext.jsx";
import { jwtDecode } from "jwt-decode";
import { ROUTE_TITLE_MAP } from "../../../../routes/routesConfig/admin/routeTitle.js";

export default function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { user, logout } = useAuth();
    const { clearCart } = useCart();
    const userMenuRef = useRef(null);

    const displayName = user?.name || (user?.email ? String(user.email).split("@")[0] : "Tài khoản");
    const displayEmail = user?.email || "Chưa có email";
    const avatarInitials = useMemo(() => {
        const parts = String(displayName).trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return "AU";
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return `${parts[0][0] || "A"}${parts[parts.length - 1][0] || "U"}`.toUpperCase();
    }, [displayName]);

    const roleLabel = useMemo(() => {
        if (user?.roleId === "ROLE_ADMIN") return "Quản trị viên";
        if (user?.roleId === "ROLE_EMPLOYEE") return "Nhân viên";
        if (user?.roleId === "ROLE_CUSTOMER") return "Khách hàng";
        return "Tài khoản";
    }, [user?.roleId]);

    const currentTitle =
        ROUTE_TITLE_MAP[location.pathname] || "Trang quản trị";

    const handleLogout = () => {
        const token = localStorage.getItem("authToken");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                localStorage.removeItem(`customerInfo_${decoded.sub}`);
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        }
        localStorage.removeItem("customerInfo");
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        clearCart();
        logout();
        navigate("/login", { replace: true });
    };

    useEffect(() => {
        const onPointerDown = (event) => {
            if (!showUserMenu) return;
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        const onEsc = (event) => {
            if (event.key === "Escape") setShowUserMenu(false);
        };

        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onEsc);
        };
    }, [showUserMenu]);

    return (
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-neutral-200 shadow-sm">
            <div className="h-full px-6 flex items-center justify-between">
                {/* Left */}
                <div className="flex items-center gap-4">
                    <button className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all duration-200">
                        <Menu size={20} />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">E</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-neutral-900">
                                {currentTitle}
                            </h1>
                            <p className="text-xs text-neutral-500">Quản lý hệ thống</p>
                        </div>
                    </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-3">
                    {/* Notifications */}
                    <button className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all duration-200">
                        <Bell size={18} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User Menu */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="group flex items-center gap-3 px-3 py-2 text-neutral-700 border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 rounded-xl shadow-sm transition-all duration-200"
                        >
                            <div className="relative w-9 h-9 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-sm">
                                <span className="text-white text-xs font-bold tracking-wide">{avatarInitials}</span>
                                <span className="absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                            </div>
                            <div className="hidden md:block text-left min-w-[180px]">
                                <p className="text-sm font-semibold text-neutral-900 leading-5 truncate">{displayName}</p>
                                <p className="text-xs text-neutral-500 leading-4 truncate">{displayEmail}</p>
                            </div>
                            <span className="hidden lg:inline-flex text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                                {roleLabel}
                            </span>
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-neutral-200 py-2 fade-in overflow-hidden">
                                <div className="px-4 py-4 border-b border-neutral-100 bg-gradient-to-r from-teal-50 to-cyan-50">
                                    <div className="flex items-start gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white flex items-center justify-center font-bold text-sm">
                                            {avatarInitials}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-neutral-900 truncate">{displayName}</p>
                                            <p className="text-xs text-neutral-600 truncate">{displayEmail}</p>
                                            <span className="inline-flex mt-2 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full bg-white text-teal-700 border border-teal-200">
                                                {roleLabel}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-3 transition-colors">
                                    <Settings size={16} />
                                    Cài đặt
                                </button>
                                <button 
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                >
                                    <LogOut size={16} />
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
