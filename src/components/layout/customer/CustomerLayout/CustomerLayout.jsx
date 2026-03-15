import "./CustomerLayout.css";
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import ScrollToTop from "../../../common/ScrollToTop.jsx";
import { ROUTE_TITLE_MAP } from "../../../../routes/routesConfig/customer/routeTitle.js";
import SocialChatPopup from "../../../common/SocialChatPopup.jsx";

const LAYOUT_ELECTRONICS_ICONS = [
  "smartphone",
  "watch",
  "laptop_mac",
  "headphones",
  "desktop_windows",
  "keyboard",
  "mouse",
  "tablet_mac",
  "speaker",
  "devices_other",
];

const LAYOUT_FALLING_ICONS = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${(index * 6) % 100}%`,
  delay: `${(index % 6) * 0.85}s`,
  duration: `${13 + (index % 5) * 2}s`,
  icon: LAYOUT_ELECTRONICS_ICONS[index % LAYOUT_ELECTRONICS_ICONS.length],
  size: `${28 + (index % 4) * 6}px`,
}));

export default function CustomerLayout() {
  const location = useLocation();
  const pageTitle = ROUTE_TITLE_MAP[location.pathname] || "Poly Shop";

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  return (
    <>
      <ScrollToTop />
      <div className="customer-layout-shell min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-text)] transition-colors duration-220 ease-standard">
        <div className="customer-layout-rain" aria-hidden="true">
          {LAYOUT_FALLING_ICONS.map((particle) => (
            <span
              key={particle.id}
              className="material-symbols-outlined customer-layout-particle"
              style={{
                left: particle.left,
                animationDelay: particle.delay,
                animationDuration: particle.duration,
                fontSize: particle.size,
              }}
            >
              {particle.icon}
            </span>
          ))}
        </div>
        <Header />

        <main className="relative z-10 flex-1 bg-transparent">
          <div className="min-h-full">
            <Outlet />
          </div>
        </main>

        <SocialChatPopup />
        <div className="relative z-10">
          <Footer />
        </div>
      </div>
    </>
  );
}
