import "./CustomerLayout.css";
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import usePageTransition from "../../../../hooks/usePageTransition";
import ScrollToTop from "../../../common/ScrollToTop.jsx";
import BackToTopButton from "../../../common/BackToTopButton.jsx";
import FavoritesPanel from "../../../common/FavoritesPanel.jsx";
import { ROUTE_TITLE_MAP } from "../../../../routes/routesConfig/customer/routeTitle.js";
import CategoryDrawer from "../../../customer/home/CategoryDrawer/CategoryDrawer.jsx";
import AIChatButton from "../../../common/aiChat/AIChatButton.jsx";
import AIChatBox from "../../../common/aiChat/AIChatBox.jsx";

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
  const shellRef = useRef(null);
  const isTransitioning = usePageTransition();
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  useEffect(() => {
    if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const shell = shellRef.current;
    if (!shell) return;

    let rafId = null;
    let queued = null;

    const applyPosition = () => {
      if (!queued) {
        rafId = null;
        return;
      }

      shell.style.setProperty("--cursor-spot-x", `${queued.x}px`);
      shell.style.setProperty("--cursor-spot-y", `${queued.y}px`);
      shell.classList.add("cursor-spot-active");
      queued = null;
      rafId = null;
    };

    const onMouseMove = (event) => {
      if (globalThis.innerWidth < 768) return;
      queued = { x: event.clientX, y: event.clientY };
      if (!rafId) {
        rafId = globalThis.requestAnimationFrame(applyPosition);
      }
    };

    const onMouseOut = (event) => {
      if (event.relatedTarget) return;
      shell.classList.remove("cursor-spot-active");
    };

    globalThis.addEventListener("mousemove", onMouseMove, { passive: true });
    globalThis.addEventListener("mouseout", onMouseOut);

    return () => {
      if (rafId) globalThis.cancelAnimationFrame(rafId);
      globalThis.removeEventListener("mousemove", onMouseMove);
      globalThis.removeEventListener("mouseout", onMouseOut);
    };
  }, []);

  return (
    <>
      <ScrollToTop />
      <div
        ref={shellRef}
        className="customer-layout-shell min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-text)] transition-colors duration-220 ease-standard"
      >
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
        <div className="customer-layout-cursor-spot" aria-hidden="true" />
        <Header />

        <main className="relative z-10 flex-1 bg-transparent">
          <div
            className={`min-h-full ${
              isTransitioning ? "page-transition-exit" : "page-transition-enter"
            }`}
          >
            <Outlet />
          </div>
        </main>

        <FavoritesPanel />
        <BackToTopButton />
        <AIChatButton
          isOpen={isAiChatOpen}
          onToggle={() => setIsAiChatOpen((prev) => !prev)}
        />
        <AIChatBox
          isOpen={isAiChatOpen}
          onClose={() => setIsAiChatOpen(false)}
        />
        {/* 
        <script
          async
          src="https://chat.taggoai.com/v2.js"
          data-taggo-botid="69c930ced8ce2922941af32b"
        ></script> */}
        {/* <SocialChatPopup /> */}
        <CategoryDrawer />
        <div className="relative z-10">
          <Footer />
        </div>
      </div>
    </>
  );
}
