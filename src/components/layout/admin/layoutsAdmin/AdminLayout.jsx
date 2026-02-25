import Header from "./Header.jsx";
import Sidebar from "./Sidebar/Sidebar.jsx";
import Footer from "./Footer.jsx";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
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

