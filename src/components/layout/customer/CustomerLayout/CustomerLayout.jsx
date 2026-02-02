import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import ScrollToTop from "../../../common/ScrollToTop.jsx";
import { AnimatePresence } from "framer-motion";
import { ROUTE_TITLE_MAP } from "../../../../routes/routesConfig/customer/routeTitle.js";

export default function CustomerLayout() {
  const location = useLocation();
  const pageTitle = ROUTE_TITLE_MAP[location.pathname] || "Poly Shop";

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

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
