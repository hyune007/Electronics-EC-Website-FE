import Header from "./Header.jsx";
import Sidebar from "./Sidebar/Sidebar.jsx";
import Footer from "./Footer.jsx";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth.js";

export default function AdminLayout() {
    const { user, isLoading } = useAuth();

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
            {/* SIDEBAR */}
            <Sidebar />

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col min-h-0">
                {/* HEADER */}
                <Header />

                {/* MAIN */}
                <main className="flex-1 overflow-y-auto bg-neutral-50 p-6">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>

                {/* FOOTER */}
                <Footer />
            </div>
        </div>
    );
}

