import { Menu, Bell, User, Settings, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
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
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-3 p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all duration-200"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                                <User size={16} className="text-white" />
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-neutral-900">{user?.name || "Admin User"}</p>
                                <p className="text-xs text-neutral-500">{user?.email || "admin@electronics.com"}</p>
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-neutral-100 py-2 fade-in">
                                <div className="px-4 py-3 border-b border-neutral-100">
                                    <p className="text-sm font-medium text-neutral-900">{user?.name || "Admin User"}</p>
                                    <p className="text-xs text-neutral-500">{user?.email || "admin@electronics.com"}</p>
                                </div>
                                <button className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-3 transition-colors">
                                    <Settings size={16} />
                                    Cài đặt
                                </button>
                                <button 
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
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
