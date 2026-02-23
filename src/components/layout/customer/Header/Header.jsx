import "./Header.css";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

import useTheme from "../../../../hooks/useTheme.js";
import UserDropdown from "../../../profile/UserDropdown/UserDropdown.jsx";
import ThemeToggleButton from "../../../common/ThemeToggleButtonHome.jsx";
import BrandLogo from "../../../common/BrandLogo.jsx";
import vi from "../../../../i18n/vi.js";
import SubMenuHeader from "../../../customer/home/SubMenuHeader/SubMenuheader.jsx";
import { useAuth } from "../../../../hooks/useAuth";
import { jwtDecode } from "jwt-decode";

export default function Header() {
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    const token = localStorage.getItem("authToken");
    if (token){
      const decoded = jwtDecode(token);
      localStorage.removeItem(`customerInfo_${decoded.sub}`);
    }
    localStorage.removeItem("customerInfo");
    logout();
    setShowDropdown(false);
    navigate("/login");
  };
  //
  // const handleLogout = () => {
  //   logout();
  //   setShowDropdown(false);
  //   navigate("/login");
  // };

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
            <span className="material-symbols-outlined text-[14px]">mail</span>
            <span>{vi.layout.header.infoEmail}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">call</span>
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
          <Link to="/">
            <BrandLogo />
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            <NavLink to="/home" className="nav-link">
              {vi.layout.header.home}
            </NavLink>

            <div
              className="relative"
              onMouseEnter={() => setShowSubmenu(true)}
              onMouseLeave={() => setShowSubmenu(false)}
            >
              <NavLink to="/products" className="nav-link">
                {vi.layout.header.products}
              </NavLink>
              {showSubmenu && (
                <>
                  <div className="absolute left-1/2 top-full -translate-x-1/2 w-12 h-3 bg-transparent rounded-b-md z-40 pointer-events-auto" />
                  <SubMenuHeader />
                </>
              )}
            </div>

            <NavLink to="/news" className="nav-link">
              {vi.layout.header.news}
            </NavLink>

            <NavLink to="/contact" className="nav-link">
              {vi.layout.header.contact}
            </NavLink>
          </nav>

          <div className="flex items-center gap-2 relative">
            <button className="icon-btn hidden lg:flex items-center gap-10">
              <span className="material-symbols-outlined">search</span>
            </button>

            <button className="icon-btn relative">
              <span className="material-symbols-outlined">shopping_cart</span>
              <span className="absolute -top-1 -right-1 size-4 bg-primary text-white text-[10px] flex items-center justify-center rounded-full">
                0
              </span>
            </button>

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setShowDropdown((s) => !s)}
                  className="icon-btn flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">account_circle</span>
                  <span className="hidden lg:inline text-sm text-gray-700 dark:text-gray-200">
                    {user?.name}
                  </span>
                </button>

                <UserDropdown
                  open={showDropdown}
                  onClose={() => setShowDropdown(false)}
                  onLogout={handleLogout}
                  user={user}
                />
              </>
            ) : (
              <Link
                to="/login"
                className="icon-btn flex items-center gap-1 text-sm"
              >
                <span className="material-symbols-outlined">login</span>
                <span className="hidden lg:inline">Đăng nhập</span>
              </Link>
            )}

            <div className="hidden lg:flex items-center gap-10">
              {" "}
              <ThemeToggleButton onToggle={toggleTheme} />
            </div>

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
                <button className="icon-btn justify-start flex">
                  <span className="material-symbols-outlined">search</span>
                </button>
                <NavLink
                  to="/home"
                  onClick={() => setMobileOpen(false)}
                  className="nav-link"
                >
                  {vi.layout.header.home}
                </NavLink>

                <NavLink to="/products" className="nav-link">
                  {vi.layout.header.products}
                </NavLink>
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

                {isAuthenticated && (
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="nav-link text-left text-red-500"
                  >
                    Đăng xuất
                  </button>
                )}

                <ThemeToggleButton onToggle={toggleTheme} />
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
