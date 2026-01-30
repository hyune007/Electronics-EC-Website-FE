import Header from "./Header.jsx";
import Sidebar from "./Sidebar/Sidebar.jsx";
import Footer from "./Footer.jsx";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
    return (
        <div className="h-screen flex overflow-hidden">
            {/* SIDEBAR */}
            <Sidebar />

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* HEADER (cao cố định) */}
                <Header />

                {/* MAIN (KHÔNG SCROLL) */}
                <main className="flex-1 bg-gray-50 overflow-hidden p-4">
                    <Outlet />
                </main>

                {/* FOOTER (nếu có, cao cố định) */}
                <Footer />
            </div>
        </div>
    );
}