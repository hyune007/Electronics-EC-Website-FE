import { useEffect, useState } from "react";
import { useCategoryDrawer } from "../../../../contexts/CategoryDrawerContext.jsx";
import CategoryMenuPanel from "../CategoryMenuPanel/CategoryMenuPanel.jsx";
import "./CategoryDrawer.css";

export default function CategoryDrawer() {
  const { isOpen, closeDrawer } = useCategoryDrawer();
  const [shellStyle, setShellStyle] = useState(null);
  const [hoverPanelStyle, setHoverPanelStyle] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const syncWithHomeSideMenu = () => {
      const vw = globalThis.innerWidth;
      if (vw <= 768) {
        setShellStyle(null);
        return;
      }

      const headerEl = document.querySelector(".site-main-header");
      const minTop = headerEl
        ? headerEl.getBoundingClientRect().bottom + 8
        : 72;

      const homeSideMenu = document.querySelector(".home-side-menu");
      const homeBanner = document.querySelector(".home-main-banner-shell");
      if (homeSideMenu) {
        const rect = homeSideMenu.getBoundingClientRect();
        if (rect.width >= 1 && rect.height >= 1) {
          const top = Math.max(rect.top, minTop);

          let nextHoverPanelStyle = {
            "--cmenu-hover-top": "0px",
            "--cmenu-hover-height": `${rect.height}px`,
          };

          if (homeBanner) {
            const bannerRect = homeBanner.getBoundingClientRect();
            nextHoverPanelStyle = {
              "--cmenu-hover-top": `${bannerRect.top - top}px`,
              "--cmenu-hover-width": `${bannerRect.width}px`,
              "--cmenu-hover-height": `${bannerRect.height}px`,
            };
          }

          setShellStyle({
            left: `${rect.left}px`,
            top: `${top}px`,
            width: `${rect.width}px`,
            minHeight: `${rect.height}px`,
            height: "auto",
          });
          setHoverPanelStyle(nextHoverPanelStyle);
          return;
        }
      }

      let horizontalPadding = 16;
      if (vw >= 1024) {
        horizontalPadding = 24;
      } else if (vw >= 640) {
        horizontalPadding = 20;
      }

      const homeGridWidth = 1320;
      const menuWidth = 224;
      const rightBannerWidth = 156;
      const gridGap = 6;
      const left = Math.max(
        0,
        Math.round((vw - homeGridWidth) / 2 + horizontalPadding),
      );
      const availableWidth = Math.max(
        480,
        vw - left - horizontalPadding - menuWidth - gridGap,
      );
      const hoverWidth = Math.max(
        480,
        Math.min(932, availableWidth - rightBannerWidth - gridGap),
      );

      setShellStyle({
        left: `${left}px`,
        top: `${minTop}px`,
        width: `${menuWidth}px`,
        height: "auto",
      });
      setHoverPanelStyle({
        "--cmenu-hover-top": "0px",
        "--cmenu-hover-width": `${hoverWidth}px`,
        "--cmenu-hover-height": "420px",
      });
    };

    syncWithHomeSideMenu();
    globalThis.addEventListener("resize", syncWithHomeSideMenu);
    globalThis.addEventListener("scroll", syncWithHomeSideMenu, {
      passive: true,
    });

    return () => {
      globalThis.removeEventListener("resize", syncWithHomeSideMenu);
      globalThis.removeEventListener("scroll", syncWithHomeSideMenu);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        aria-label="Đóng danh mục"
        className={`category-drawer-overlay${isOpen ? " is-open" : ""}`}
        onClick={closeDrawer}
      />

      <aside
        className={`category-drawer-shell${isOpen ? " is-open" : ""}`}
        aria-label="Danh mục sản phẩm"
        style={shellStyle || undefined}
      >
        <CategoryMenuPanel
          onClose={closeDrawer}
          insideDrawer={true}
          hoverPanelStyle={hoverPanelStyle}
        />
      </aside>
    </>
  );
}
