import { useEffect } from "react";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar/Sidebar.jsx";
import Footer from "./Footer.jsx";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth.js";
import AdminChatNotifier from "../../../common/AdminChatNotifier.jsx";
import { ROUTE_MAP } from "../../../../routes/routesConfig/admin/routeMap.js";
// Preload page-level CSS so it's available on hard-refresh (F5) before lazy chunks inject their own CSS
import "../../../../pages/admin/adminDashboard/Customer/Customer.css";
import "../../../../pages/admin/adminDashboard/Order/Order.css";

const ADMIN_TAB_TITLE = "UBRAINTECH - Quản lý hệ thống";

export default function AdminLayout() {
    const { user, isLoading } = useAuth();
    const location = useLocation();
    const isChatRoute = location.pathname.startsWith(ROUTE_MAP.chat);

    useEffect(() => {
        document.title = ADMIN_TAB_TITLE;
    }, [location.pathname]);

    // Kiểm tra quyền
    if (!isLoading && (!user || (user.roleId !== "ROLE_ADMIN" && user.roleId !== "ROLE_EMPLOYEE"))) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="h-screen flex bg-neutral-50">
            <AdminChatNotifier />
            {/* SIDEBAR */}
            <Sidebar />

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col min-h-0">
                {/* HEADER */}
                <Header />

                {/* MAIN */}
                <main className={isChatRoute ? "flex-1 min-h-0 overflow-hidden bg-neutral-100 p-4 md:p-6" : "flex-1 overflow-y-auto bg-neutral-50 p-6"}>
                    <div className={isChatRoute ? "h-full max-w-none" : "max-w-7xl mx-auto"}>
                        <Outlet />
                    </div>
                </main>

                {/* FOOTER */}
                {!isChatRoute && <Footer />}
            </div>
        </div>
    );
}

