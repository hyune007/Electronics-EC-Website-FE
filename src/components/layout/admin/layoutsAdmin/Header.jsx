import { Menu, Bell, Settings, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState, useRef, useEffect } from "react";
import { useAuth } from "../../../../hooks/useAuth.js";
import { useCart } from "../../../../contexts/CartContext.jsx";
import { jwtDecode } from "jwt-decode";
import { ROUTE_TITLE_MAP } from "../../../../routes/routesConfig/admin/routeTitle.js";
import { subscribeToast } from "../../../../utils/adminToast.js";

const ADMIN_NOTIFICATION_KEY = "admin_header_notifications";

export default function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotificationMenu, setShowNotificationMenu] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const { user, logout } = useAuth();
    const { clearCart } = useCart();
    const userMenuRef = useRef(null);
    const notificationMenuRef = useRef(null);

    const displayName = user?.name || (user?.email ? String(user.email).split("@")[0] : "Tài khoản");
    const displayEmail = user?.email || "Chưa có email";
    const avatarInitials = useMemo(() => {
        const parts = String(displayName).trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return "AU";
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return `${parts[0][0] || "A"}${parts[parts.length - 1][0] || "U"}`.toUpperCase();
    }, [displayName]);

    const roleLabel = useMemo(() => {
        if (user?.roleId === "ROLE_ADMIN") return "Admin";
        if (user?.roleId === "ROLE_EMPLOYEE") return "Nhân viên";
        if (user?.roleId === "ROLE_CUSTOMER") return "Khách hàng";
        return "Tài khoản";
    }, [user?.roleId]);

    const unreadCount = useMemo(
        () => notifications.filter((item) => !item.read).length,
        [notifications],
    );

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

    const handleToggleNotifications = () => {
        setShowNotificationMenu((prev) => {
            const nextOpen = !prev;
            if (nextOpen) {
                setNotifications((current) => {
                    const updated = current.map((item) => ({ ...item, read: true }));
                    localStorage.setItem(ADMIN_NOTIFICATION_KEY, JSON.stringify(updated));
                    return updated;
                });
            }
            return nextOpen;
        });
    };

    const handleClearNotifications = () => {
        localStorage.removeItem(ADMIN_NOTIFICATION_KEY);
        setNotifications([]);
    };

    useEffect(() => {
        try {
            const raw = localStorage.getItem(ADMIN_NOTIFICATION_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            if (Array.isArray(parsed)) {
                setNotifications(parsed);
            }
        } catch (error) {
            console.error("Cannot parse admin notifications:", error);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = subscribeToast((toast) => {
            const nextItem = {
                id: toast.id,
                message: toast.message,
                type: toast.type || "info",
                createdAt: Date.now(),
                read: false,
            };

            setNotifications((prev) => {
                const merged = [nextItem, ...prev.filter((item) => item.id !== nextItem.id)].slice(0, 20);
                localStorage.setItem(ADMIN_NOTIFICATION_KEY, JSON.stringify(merged));
                return merged;
            });
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        const onPointerDown = (event) => {
            if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }

            if (
                showNotificationMenu &&
                notificationMenuRef.current &&
                !notificationMenuRef.current.contains(event.target)
            ) {
                setShowNotificationMenu(false);
            }
        };

        const onEsc = (event) => {
            if (event.key === "Escape") setShowUserMenu(false);
            if (event.key === "Escape") setShowNotificationMenu(false);
        };

        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onEsc);
        };
    }, [showNotificationMenu, showUserMenu]);

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
                    <div className="relative" ref={notificationMenuRef}>
                        <button
                            onClick={handleToggleNotifications}
                            className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all duration-200"
                        >
                            <Bell size={18} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] leading-[18px] text-center rounded-full font-semibold">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotificationMenu && (
                            <div className="absolute right-0 mt-3 w-[360px] max-w-[86vw] bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden z-50">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                                    <div>
                                        <p className="text-sm font-semibold text-neutral-900">Thông báo quản trị</p>
                                        <p className="text-xs text-neutral-500">Các thao tác mới đã thực hiện</p>
                                    </div>
                                    <button
                                        onClick={handleClearNotifications}
                                        className="text-xs font-medium text-red-600 hover:text-red-700"
                                    >
                                        Xóa tất cả
                                    </button>
                                </div>

                                <div className="max-h-[360px] overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="px-4 py-8 text-center text-sm text-neutral-500">
                                            Chưa có thông báo mới
                                        </div>
                                    ) : (
                                        notifications.map((item) => (
                                            <div key={item.id} className="px-4 py-3 border-b border-neutral-100 last:border-b-0">
                                                <div className="flex items-start gap-2">
                                                    <span
                                                        className={`mt-1 inline-block w-2 h-2 rounded-full ${
                                                            item.type === "error"
                                                                ? "bg-rose-500"
                                                                : item.type === "warning"
                                                                  ? "bg-amber-500"
                                                                  : item.type === "success"
                                                                    ? "bg-emerald-500"
                                                                    : "bg-sky-500"
                                                        }`}
                                                    ></span>
                                                    <div className="min-w-0">
                                                        <p className="text-sm text-neutral-800 leading-5 break-words">{item.message}</p>
                                                        <p className="mt-1 text-[11px] text-neutral-400">
                                                            {new Date(item.createdAt).toLocaleString("vi-VN")}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

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
