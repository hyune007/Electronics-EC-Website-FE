import "./Header.css";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "../../../../contexts/CartContext";
import useTheme from "../../../../hooks/useTheme.js";
import UserDropdown from "../../../profile/UserDropdown/UserDropdown.jsx";
import ThemeToggleButton from "../../../common/ThemeToggleButtonHome.jsx";
import BrandLogo from "../../../common/BrandLogo.jsx";
import vi from "../../../../i18n/vi.js";
import { useAuth } from "../../../../hooks/useAuth";
import { useProductCache } from "../../../../contexts/ProductCacheContext.jsx";
import demoImg from "../../../../assets/demo/demo.jpg";
import { useCategoryDrawer } from "../../../../contexts/CategoryDrawerContext.jsx";

const CATEGORY_NAME_BY_ID = {
  LSP01: "Điện thoại",
  LSP02: "Laptop",
  LSP03: "Máy tính bảng",
  LSP04: "Đồng hồ thông minh",
  LSP05: "Tai nghe",
  LSP06: "Bàn phím",
  LSP07: "Chuột",
  LSP08: "Màn hình",
  LSP09: "Loa",
  LSP10: "Phụ kiện khác",
};

export default function Header() {
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { toggleDrawer } = useCategoryDrawer();

  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  // Hiệu ứng
  const { cart, clearCart } = useCart();
  const { allProducts, loadingAll, prefetchAllProducts } = useProductCache();
  const badgeRef = useRef(null);
  const searchWrapRef = useRef(null);
  const searchInputRef = useRef(null);

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (!badgeRef.current) return;

    badgeRef.current.classList.add("scale-125");
    setTimeout(() => {
      badgeRef.current?.classList.remove("scale-125");
    }, 200);
  }, [totalQuantity]);

  useEffect(() => {
    if (!searchOpen) return;
    prefetchAllProducts().catch(() => {});
    searchInputRef.current?.focus();
  }, [searchOpen, prefetchAllProducts]);

  useEffect(() => {
    if (!searchOpen) return;

    const onMouseDown = (event) => {
      if (!searchWrapRef.current?.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [searchOpen]);

  const normalizedKeyword = searchKeyword.trim().toLowerCase();

  const matchedBrands = useMemo(() => {
    if (!normalizedKeyword || !Array.isArray(allProducts)) return [];

    const brandSet = new Set(
      allProducts.map((product) => product?.brand?.name).filter(Boolean),
    );

    return [...brandSet].filter((brandName) =>
      brandName.toLowerCase().includes(normalizedKeyword),
    );
  }, [allProducts, normalizedKeyword]);

  const searchSuggestions = useMemo(() => {
    if (!normalizedKeyword || !Array.isArray(allProducts)) return [];

    return allProducts
      .filter((product) => {
        const name = product?.name?.toLowerCase() || "";
        const brandName = product?.brand?.name?.toLowerCase() || "";
        const category =
          product?.category?.name?.toLowerCase() ||
          product?.category?.id?.toLowerCase() ||
          "";
        const categoryById =
          CATEGORY_NAME_BY_ID[product?.category?.id]?.toLowerCase() || "";

        return (
          name.includes(normalizedKeyword) ||
          brandName.includes(normalizedKeyword) ||
          category.includes(normalizedKeyword) ||
          categoryById.includes(normalizedKeyword)
        );
      })
      .slice(0, 3);
  }, [allProducts, normalizedKeyword]);

  const renderSuggestionContent = () => {
    if (loadingAll && !allProducts) {
      return (
        <p className="px-3 py-2 text-sm text-gray-500 dark:text-slate-400">
          Đang tải sản phẩm...
        </p>
      );
    }

    if (searchSuggestions.length === 0) {
      return (
        <p className="px-3 py-2 text-sm text-gray-500 dark:text-slate-400">
          Không có sản phẩm phù hợp.
        </p>
      );
    }

    return (
      <>
        {searchSuggestions.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => handleSelectSuggestion(product.id)}
            className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
          >
            <div className="flex items-center gap-2">
              <img
                src={
                  product?.image
                    // ? `http://localhost:8080${product.image}`
                    ? `https://ec-website-be-312564370609.asia-southeast1.run.app${product.image}`
                    : demoImg
                }
                alt={product?.name || "product"}
                className="w-9 h-9 rounded object-cover border border-gray-200 dark:border-gray-700"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-slate-100 line-clamp-1">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1">
                  Loại:{" "}
                  {product?.category?.name ||
                    CATEGORY_NAME_BY_ID[product?.category?.id] ||
                    "Khác"}
                </p>
              </div>
            </div>
          </button>
        ))}
      </>
    );
  };

  const handleSeeMore = () => {
    const keyword = searchKeyword.trim();
    if (!keyword) return;

    setSearchOpen(false);
    setMobileOpen(false);

    const exactBrand = matchedBrands.find(
      (brandName) => brandName.toLowerCase() === normalizedKeyword,
    );

    if (exactBrand) {
      navigate(`/products?brand=${encodeURIComponent(exactBrand)}`);
      return;
    }

    if (matchedBrands.length === 1) {
      navigate(`/products?brand=${encodeURIComponent(matchedBrands[0])}`);
      return;
    }

    navigate(`/products?q=${encodeURIComponent(keyword)}`);
  };

  const handleSelectSuggestion = (productId) => {
    setSearchOpen(false);
    setMobileOpen(false);
    navigate(`/product-detail/${productId}`);
  };
  //
  const handleLogout = () => {
    clearCart();
    logout();
    setShowDropdown(false);
    navigate("/login", { replace: true });
  };
  return (
    <>
      <div className="relative z-40 flex h-9 items-center overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-secondary)] px-4 text-white md:px-8 lg:px-14">
        <div className="marquee flex-1 text-[11px] font-semibold tracking-[0.08em] uppercase">
          <div className="marquee-content">
            <p>
              {vi.layout.header.marqueeText}
              {vi.layout.header.marqueeText}
            </p>
          </div>
        </div>

        <div className="ml-4 hidden shrink-0 items-center gap-6 text-[11px] md:flex">
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

      <header className="site-main-header border-b border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="shrink-0">
            <BrandLogo size="header" />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            <button
              type="button"
              onClick={toggleDrawer}
              className="nav-link category-trigger-btn inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">
                grid_view
              </span>{" "}
              Danh mục
            </button>

            <NavLink
              to="/home"
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
            >
              {vi.layout.header.home}
            </NavLink>

            <NavLink
              to="/products"
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
            >
              {vi.layout.header.products}
            </NavLink>

            <NavLink
              to="/news"
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
            >
              {vi.layout.header.news}
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
            >
              {vi.layout.header.contact}
            </NavLink>
          </nav>

          <div className="relative flex items-center gap-1.5 sm:gap-2">
            <div
              ref={searchWrapRef}
              className={`search-bar-wrap${searchOpen ? " open" : ""}`}
            >
              <div className="search-bar-track">
                <span className="material-symbols-outlined search-bar-leading-icon">
                  search
                </span>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchKeyword}
                  onFocus={() => setSearchOpen(true)}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSeeMore();
                  }}
                  placeholder="Bạn muốn mua gì hôm nay"
                  className="input-default search-bar-input"
                />
              </div>

              <button
                onClick={() => setSearchOpen((prev) => !prev)}
                className="icon-btn search-mobile-toggle"
                aria-label={searchOpen ? "Đóng tìm kiếm" : "Mở tìm kiếm"}
              >
                <span className="material-symbols-outlined">
                  {searchOpen ? "close" : "search"}
                </span>
              </button>

              {searchOpen && normalizedKeyword && (
                <div className="modal-shell search-bar-suggestion z-50 w-[320px] p-3 sm:w-[360px]">
                  <div className="overflow-hidden rounded-lg border border-[var(--color-border)]">
                    {renderSuggestionContent()}

                    <button
                      type="button"
                      onClick={handleSeeMore}
                      className="w-full px-3 py-2 text-left text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-muted)] motion-default"
                    >
                      Xem thêm
                    </button>
                  </div>
                </div>
              )}
            </div>

            <NavLink
              to="/checkout?tab=cart"
              className="icon-btn relative"
              id="cart-icon"
              aria-label="Giỏ hàng"
            >
              <span className="material-symbols-outlined">shopping_cart</span>

              {totalQuantity > 0 && (
                <span
                  ref={badgeRef}
                  id="cart-badge"
                  className="absolute -top-1 -right-1 size-4 bg-primary text-white text-[10px] flex items-center justify-center rounded-full transition-all duration-200"
                >
                  {totalQuantity}
                </span>
              )}
            </NavLink>

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setShowDropdown((s) => !s)}
                  className="icon-btn flex items-center gap-2"
                  aria-label="Mở menu người dùng"
                >
                  <span className="material-symbols-outlined">
                    account_circle
                  </span>
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
                className="icon-btn flex items-center gap-1 text-sm font-medium"
              >
                <span className="material-symbols-outlined">login</span>
                <span className="hidden lg:inline">Đăng nhập</span>
              </Link>
            )}

            <div className="hidden items-center lg:flex">
              {" "}
              <ThemeToggleButton onToggle={toggleTheme} />
            </div>

            <button
              onClick={() => setMobileOpen((s) => !s)}
              className="header-mobile-menu-btn lg:hidden icon-btn"
              aria-label="Mở menu di động"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] lg:hidden">
            <div className="space-y-4 px-4 py-4 sm:px-6">
              <nav className="flex flex-col gap-2">
                <button
                  className="nav-link category-trigger-btn text-left inline-flex items-center gap-2"
                  onClick={() => {
                    toggleDrawer();
                    setMobileOpen(false);
                  }}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    grid_view
                  </span>{" "}
                  Danh mục
                </button>

                <NavLink
                  to="/home"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    isActive ? "nav-link nav-link-active" : "nav-link"
                  }
                >
                  {vi.layout.header.home}
                </NavLink>

                <NavLink
                  to="/products"
                  className={({ isActive }) =>
                    isActive ? "nav-link nav-link-active" : "nav-link"
                  }
                >
                  {vi.layout.header.products}
                </NavLink>
                <NavLink
                  to="/news"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    isActive ? "nav-link nav-link-active" : "nav-link"
                  }
                >
                  {vi.layout.header.news}
                </NavLink>

                <NavLink
                  to="/contact"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    isActive ? "nav-link nav-link-active" : "nav-link"
                  }
                >
                  {vi.layout.header.contact}
                </NavLink>

                {isAuthenticated && (
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="nav-link text-left text-[var(--color-danger)]"
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
