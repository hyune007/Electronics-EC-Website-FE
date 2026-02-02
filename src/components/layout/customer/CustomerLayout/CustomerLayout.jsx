import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import { Outlet, useLocation } from "react-router-dom";
import ScrollToTop from "../../../common/ScrollToTop.jsx";
import { AnimatePresence } from "framer-motion";

export default function CustomerLayout() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-white dark:bg-background-dark">
        <Header />

        <main className="flex-1 bg-background-light dark:bg-navy-deep">
          <AnimatePresence mode="wait">
            <Outlet key={location.pathname} />
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </>
  );
}
