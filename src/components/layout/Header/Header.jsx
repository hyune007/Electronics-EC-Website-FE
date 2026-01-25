import "./Header.css";
import useTheme from "../../../hooks/useTheme";
import ThemeToggleButton from "../../common/ThemeToggleButtonHome.jsx";
import BrandLogo from "../../common/BrandLogo.jsx";
import vi from "../../../i18n/vi.js";
export default function Header() {
  const { toggleTheme } = useTheme();
  return (
    <div>
      <div className="h-[32px] bg-background-dark dark:bg-navy-light text-white flex items-center px-4 md:px-10 lg:px-20 overflow-hidden relative z-50">
        <div className="marquee flex-1 text-[11px] font-medium tracking-wide uppercase">
          <div className="marquee-content">
            <span>
              <p>
                {vi.layout.header.marqueeText}
                {vi.layout.header.marqueeText}
              </p>
            </span>
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

      <header className="sticky top-0 z-40 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/">
            <BrandLogo />
          </a>
          <nav className="hidden lg:flex items-center gap-10 ">
            <a
              className="text-sm font-medium text-gray-600 dark:text-gray-300 nav-link"
              href="#"
            >
              {vi.layout.header.home}
            </a>
            <a
              className="text-sm font-medium text-gray-600 dark:text-gray-300 nav-link"
              href="#"
            >
              {vi.layout.header.products}
            </a>
            <a
              className="text-sm font-medium text-gray-600 dark:text-gray-300 nav-link"
              href="#"
            >
              {vi.layout.header.news}
            </a>
            <a
              className="text-sm font-medium text-gray-600 dark:text-gray-300 nav-link"
              href="#"
            >
              {vi.layout.header.contact}
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <span className="material-symbols-outlined">search</span>
            </button>
            <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative">
              <span className="material-symbols-outlined">shopping_cart</span>
              <span className="absolute top-1 right-1 size-4 bg-primary text-white text-[10px] flex items-center justify-center rounded-full">
                0
              </span>
            </button>
            <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <span className="material-symbols-outlined">account_circle</span>
            </button>

            <ThemeToggleButton onToggle={toggleTheme} />
          </div>
        </div>
      </header>
    </div>
  );
}
