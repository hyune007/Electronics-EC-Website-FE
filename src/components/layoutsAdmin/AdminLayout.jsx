import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import Footer from "./Footer.jsx";

export default function AdminLayout({ children }) {
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
                    {children}
                </main>

                {/* FOOTER (nếu có, cao cố định) */}
                <Footer />
            </div>
        </div>
    );
}
