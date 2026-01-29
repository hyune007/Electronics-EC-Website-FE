import "./Header.css";
import { Link, NavLink } from "react-router-dom";
import { useState } from "react";

import useTheme from "../../../../hooks/useTheme.js";
import UserDropdown from "../../../profile/UserDropdown/UserDropdown.jsx";
import ThemeToggleButton from "../../../common/ThemeToggleButtonHome.jsx";
import BrandLogo from "../../../common/BrandLogo.jsx";
import vi from "../../../../i18n/vi.js";

export default function Header() {
  const { toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="h-[32px] bg-background-dark dark:bg-navy-light text-white flex items-center px-4 md:px-10 lg:px-20 overflow-hidden relative z-40">
        <div className="marquee flex-1 text-[11px] font-medium tracking-wide uppercase">
          <div className="marquee-content">
            <p>
              {vi.layout.header.marqueeText}
              {vi.layout.header.marqueeText}
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-[11px] ml-4 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">
              mail
            </span>
            <span>{vi.layout.header.infoEmail}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">
              call
            </span>
            <span>{vi.layout.header.infoPhone}</span>
          </div>
        </div>
      </div>


      <header
        className="
          sticky top-0 z-50
          bg-white/80 dark:bg-background-dark/80
          backdrop-blur-xl
          border-b border-gray-200/60 dark:border-gray-800/60
          shadow-[0_4px_20px_rgba(0,0,0,0.04)]
        "
      >
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
    
          <Link to="/home">
            <BrandLogo />
          </Link>

 
          <nav className="hidden lg:flex items-center gap-10">
            <NavLink to="/home" className="nav-link">
              {vi.layout.header.home}
            </NavLink>

            <button type="button" className="nav-link">
              {vi.layout.header.products}
            </button>

            <NavLink to="/news" className="nav-link">
              {vi.layout.header.news}
            </NavLink>

            <NavLink to="/contact" className="nav-link">
              {vi.layout.header.contact}
            </NavLink>
          </nav>


          <div className="flex items-center gap-2 relative">
  
            <button className="icon-btn">
              <span className="material-symbols-outlined">search</span>
            </button>

 
            <button className="icon-btn relative">
              <span className="material-symbols-outlined">
                shopping_cart
              </span>
              <span className="absolute -top-1 -right-1 size-4 bg-primary text-white text-[10px] flex items-center justify-center rounded-full">
                0
              </span>
            </button>

            <button
              onClick={() => setShowDropdown((s) => !s)}
              className="icon-btn"
            >
              <span className="material-symbols-outlined">
                account_circle
              </span>
            </button>

            <UserDropdown
              open={showDropdown}
              onClose={() => setShowDropdown(false)}
              onLogout={() => {
                console.log("logout");
                setShowDropdown(false);
              }}
            />

            <ThemeToggleButton onToggle={toggleTheme} />

            <button
              onClick={() => setMobileOpen((s) => !s)}
              className="lg:hidden icon-btn"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-background-dark">
            <div className="px-6 py-4 space-y-4">
              <nav className="flex flex-col gap-2">
                <NavLink
                  to="/home"
                  onClick={() => setMobileOpen(false)}
                  className="nav-link"
                >
                  {vi.layout.header.home}
                </NavLink>

                <button
                  type="button"
                  className="nav-link text-left"
                >
                  {vi.layout.header.products}
                </button>

                <NavLink
                  to="/news"
                  onClick={() => setMobileOpen(false)}
                  className="nav-link"
                >
                  {vi.layout.header.news}
                </NavLink>

                <NavLink
                  to="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="nav-link"
                >
                  {vi.layout.header.contact}
                </NavLink>
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
