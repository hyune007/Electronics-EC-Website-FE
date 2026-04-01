import "./CustomerLayout.css";
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import ScrollToTop from "../../../common/ScrollToTop.jsx";
import { ROUTE_TITLE_MAP } from "../../../../routes/routesConfig/customer/routeTitle.js";
import SocialChatPopup from "../../../common/SocialChatPopup.jsx";
import CategoryDrawer from "../../../customer/home/CategoryDrawer/CategoryDrawer.jsx";

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

const LAYOUT_FALLING_ICONS = Array.from({ length: 34 }, (_, index) => {
  const left = ((index * 17 + 9) % 94) + 1;
  const delay = ((index * 13) % 12) * 0.62;
  const duration = 10.4 + ((index * 7 + 5) % 10) * 1.3;
  const size = 20 + ((index * 11 + 3) % 6) * 4;

  return {
    id: index,
    left: `${left}%`,
    delay: `${delay.toFixed(2)}s`,
    duration: `${duration.toFixed(1)}s`,
    icon: LAYOUT_ELECTRONICS_ICONS[index % LAYOUT_ELECTRONICS_ICONS.length],
    size: `${size}px`,
  };
});

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

        <script async src="https://chat.taggoai.com/v2.js" data-taggo-botid="69c930ced8ce2922941af32b"></script>
        {/* <SocialChatPopup /> */}
        <CategoryDrawer />
        <div className="relative z-10">
          <Footer />
        </div>
      </div>
    </>
  );
}
