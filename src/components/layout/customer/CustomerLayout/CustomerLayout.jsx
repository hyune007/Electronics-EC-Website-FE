import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import { Outlet } from "react-router-dom";

export default function CustomerLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-background-dark">
            <Header />
            <main className="flex-1 bg-background-light dark:bg-navy-deep">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}