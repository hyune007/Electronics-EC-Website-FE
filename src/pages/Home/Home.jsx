import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Banner from "../../components/customer/home/Banner/Banner.jsx";
import CategoryMenuPanel from "../../components/customer/home/CategoryMenuPanel/CategoryMenuPanel.jsx";
import Carousel1 from "../../assets/banner/carousel_ads.jpg";
import Carousel2 from "../../assets/banner/carousel2_ads.jpg";
import Carousel3 from "../../assets/banner/carousel3_ads.jpg";
import Carousel4 from "../../assets/banner/carousel4_ads.jpg";
import ManHinhBanner from "../../assets/banner/ManHinh.jpg";
import MuaLaptopOnlineBanner from "../../assets/banner/MuaLaptopOnline.png";
import Xiaomi17UltraHomeBanner from "../../assets/banner/Xiaomi17ultra_home.jpg";
import WatchAdsBanner from "../../assets/banner/watch_ads.png";
import LaptopBannerVer from "../../assets/banner/laptopBannerVer.png";
import PhoneBannerVer from "../../assets/banner/phoneBannerVer.png";
import MonitorBannerVer from "../../assets/banner/monitorBannerVer.png";
import DealHotBackground from "../../assets/background/DealHot.jpg";
import useDragScroll from "../../hooks/useDragScroll";
import useRevealOnScroll from "../../hooks/useRevealOnScroll";
import "./Home.css";
import vi from "../../i18n/vi";
import ProductCard from "../../components/customer/product/ProductCard/ProductCard.jsx";
import LoadScreen from "../../components/common/LoadScreen.jsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProductCache } from "../../contexts/ProductCacheContext.jsx";
import { fetchGearVnNews } from "../../utils/newsSource.js";

const HOME_SLIDE_SIZE = 8;
const HOME_NEWS_PREVIEW_SIZE = 3;
const HOME_NEWS_BADGES = ["Bài nổi bật", "Bài cập nhật", "Bài đáng chú ý"];
const RECENT_VIEWED_PRODUCT_IDS_KEY = "recentViewedProductIds";

const TRUST_BADGES = [
  {
    icon: "local_shipping",
    title: "Vận chuyển nhanh chóng",
    desc: "Giao hàng toàn quốc trong 1-5 ngày",
  },
  {
    icon: "verified_user",
    title: "Bảo hành tận tâm",
    desc: "Cam kết chính hãng 100%",
  },
  {
    icon: "support_agent",
    title: "Tư vấn chuyên gia",
    desc: "Hỗ trợ kỹ thuật 24/7",
  },
  {
    icon: "swap_horiz",
    title: "Đổi trả linh hoạt",
    desc: "Đổi trả trong vòng 7 ngày",
  },
];

const CATEGORIES = [
  { id: "phone", icon: "smartphone", cat: "LSP01", label: "Điện thoại" },
  { id: "laptop", icon: "laptop_mac", cat: "LSP02", label: "Laptop" },
  { id: "monitor", icon: "desktop_windows", cat: "LSP08", label: "Màn hình" },
  { id: "tablet", icon: "tablet_mac", cat: "LSP03", label: "Máy tính bảng" },
  { id: "watch", icon: "watch", cat: "LSP04", label: "Đồng hồ thông minh" },
  { id: "headphones", icon: "headphones", cat: "LSP05", label: "Tai nghe" },
];

const PROMO_CARDS = [
  {
    id: "phone-promo",
    title: "Điện thoại giảm sâu",
    subtitle: "Giá sốc cuối tuần",
    cta: "Xem ngay",
    image: Xiaomi17UltraHomeBanner,
    action: "/products?p=1&category=LSP01",
  },
  {
    id: "laptop-promo",
    title: "Laptop văn phòng",
    subtitle: "Trả góp 0% linh hoạt",
    cta: "Mua liền",
    image: MuaLaptopOnlineBanner,
    action: "/products?p=1&category=LSP02",
  },
  {
    id: "monitor-promo",
    title: "Màn hình đồ họa",
    subtitle: "Ưu đãi độc quyền online",
    cta: "Khám phá",
    image: ManHinhBanner,
    action: "/products?p=1&category=LSP08",
  },
];

const SIDE_BANNERS = [
  {
    id: "side-right",
    image: WatchAdsBanner,
    action: "/products?p=1&category=LSP04",
    alt: "Khuyen mai dong ho",
  },
];

export default function Home() {
  const dealHotScroller = useDragScroll();
  const scroller1 = useDragScroll();
  const scroller2 = useDragScroll();
  const scroller3 = useDragScroll();
  const viewedScroller = useDragScroll();
  const navigate = useNavigate();
  useRevealOnScroll();
  const [homeHoverPanelStyle, setHomeHoverPanelStyle] = useState(null);
  const [homeNews, setHomeNews] = useState([]);
  const [loadingHomeNews, setLoadingHomeNews] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentViewedIds, setRecentViewedIds] = useState([]);

  const { allProducts, loadingAll, prefetchAllProducts } = useProductCache();

  useEffect(() => {
    const warmUp = globalThis.setTimeout(() => {
      prefetchAllProducts().catch(() => {});
    }, 500);

    return () => {
      globalThis.clearTimeout(warmUp);
    };
  }, [prefetchAllProducts]);

  useEffect(() => {
    let active = true;

    const loadHomeNews = async () => {
      try {
        setLoadingHomeNews(true);
        const parsed = await fetchGearVnNews({ limit: HOME_NEWS_PREVIEW_SIZE });

        if (active) setHomeNews(parsed);
      } catch {
        if (active) setHomeNews([]);
      } finally {
        if (active) setLoadingHomeNews(false);
      }
    };

    loadHomeNews();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const loadRecentViewedIds = () => {
      try {
        const raw = localStorage.getItem(RECENT_VIEWED_PRODUCT_IDS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        const normalized = Array.isArray(parsed) ? parsed.map(String) : [];
        setRecentViewedIds(normalized);
      } catch {
        setRecentViewedIds([]);
      }
    };

    loadRecentViewedIds();
    globalThis.addEventListener("storage", loadRecentViewedIds);

    return () => {
      globalThis.removeEventListener("storage", loadRecentViewedIds);
    };
  }, []);

  useEffect(() => {
    const syncHomeHoverPanel = () => {
      if (globalThis.innerWidth < 1280) {
        setHomeHoverPanelStyle(null);
        return;
      }

      const sideMenu = document.querySelector(".home-side-menu");
      const banner = document.querySelector(".home-main-banner-shell");

      if (!sideMenu || !banner) {
        setHomeHoverPanelStyle(null);
        return;
      }

      const sideMenuRect = sideMenu.getBoundingClientRect();
      const bannerRect = banner.getBoundingClientRect();

      if (
        sideMenuRect.width < 1 ||
        sideMenuRect.height < 1 ||
        bannerRect.width < 1 ||
        bannerRect.height < 1
      ) {
        setHomeHoverPanelStyle(null);
        return;
      }

      setHomeHoverPanelStyle({
        "--cmenu-hover-width": `${bannerRect.width}px`,
        "--cmenu-hover-height": `${Math.max(
          sideMenuRect.height,
          bannerRect.height,
        )}px`,
      });
    };

    syncHomeHoverPanel();
    globalThis.addEventListener("resize", syncHomeHoverPanel);

    return () => {
      globalThis.removeEventListener("resize", syncHomeHoverPanel);
    };
  }, []);

  const popularComputers = useMemo(
    () =>
      (allProducts || [])
        .filter((p) => p.category?.id === "LSP02")
        .slice(0, HOME_SLIDE_SIZE),
    [allProducts],
  );

  const latestPhones = useMemo(
    () =>
      (allProducts || [])
        .filter((p) => p.category?.id === "LSP01")
        .slice(0, HOME_SLIDE_SIZE),
    [allProducts],
  );

  const graphicsMonitors = useMemo(
    () =>
      (allProducts || [])
        .filter((p) => p.category?.id === "LSP08")
        .slice(0, HOME_SLIDE_SIZE),
    [allProducts],
  );

  const dealHotProducts = useMemo(
    () =>
      (allProducts || [])
        .filter((p) => Number(p?.discountedPrice) < Number(p?.price))
        .slice(0, HOME_SLIDE_SIZE),
    [allProducts],
  );

  const recentlyViewedProducts = useMemo(() => {
    if (!recentViewedIds.length || !allProducts?.length) return [];

    const productById = new Map(
      allProducts.map((product) => [String(product.id), product]),
    );

    return recentViewedIds
      .map((id) => productById.get(String(id)))
      .filter(Boolean)
      .slice(0, 12);
  }, [allProducts, recentViewedIds]);

  const scrollViewedBy = (offset) => {
    const el = viewedScroller?.current;
    if (!el) return;
    el.scrollBy({ left: offset, behavior: "smooth" });
  };

  const getViewedScrollStep = useCallback(() => {
    const el = viewedScroller?.current;
    if (!el) return 0;
    const first = el.querySelector(":scope > .viewed-item");
    if (!first) return 0;
    const itemWidth = first.getBoundingClientRect().width;
    const computed = getComputedStyle(el);
    const gap = Number.parseFloat(computed.columnGap || computed.gap) || 0;
    return Math.round((itemWidth + gap) * 3);
  }, [viewedScroller]);

  const scrollViewedPrev = () => {
    const step = getViewedScrollStep();
    if (!step) return;
    scrollViewedBy(-step);
  };

  const scrollViewedNext = () => {
    const step = getViewedScrollStep();
    if (!step) return;
    scrollViewedBy(step);
  };

  const persistRecentViewedIds = (nextIds) => {
    setRecentViewedIds(nextIds);
    try {
      localStorage.setItem(
        RECENT_VIEWED_PRODUCT_IDS_KEY,
        JSON.stringify(nextIds),
      );
    } catch (error) {
      console.error("Failed to update recently viewed product IDs.", error);
    }
  };

  const handleClearRecentlyViewed = () => {
    persistRecentViewedIds([]);
  };

  const handleRemoveViewedItem = (productId) => {
    const next = recentViewedIds.filter(
      (id) => String(id) !== String(productId),
    );
    persistRecentViewedIds(next);
  };

  const scrollDealBy = (offset) => {
    const el = dealHotScroller?.current;
    if (!el) return;
    el.scrollBy({ left: offset, behavior: "smooth" });
  };

  const getDealScrollStep = useCallback(() => {
    const el = dealHotScroller?.current;
    if (!el) return 0;
    const first = el.querySelector(":scope > .dealhot-item");
    if (!first) return 0;
    const itemWidth = first.getBoundingClientRect().width;
    const computed = getComputedStyle(el);
    const gap = Number.parseFloat(computed.columnGap || computed.gap) || 0;
    return Math.round((itemWidth + gap) * 3);
  }, [dealHotScroller]);

  const scrollDealPrev = () => {
    const step = getDealScrollStep();
    if (!step) return;
    scrollDealBy(-step);
  };

  const scrollDealNext = () => {
    const step = getDealScrollStep();
    if (!step) return;
    scrollDealBy(step);
  };

  // Autoplay: advance every N ms, pause on hover or dragging
  useEffect(() => {
    const el = dealHotScroller?.current;
    if (!el) return;
    let mounted = true;
    const paused = { value: false };

    const onEnter = () => (paused.value = true);
    const onLeave = () => (paused.value = false);

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("touchstart", onEnter, { passive: true });
    el.addEventListener("touchend", onLeave);

    const interval = setInterval(() => {
      if (!mounted) return;
      if (paused.value) return;
      if (el.classList?.contains("dragging")) return;

      const step = getDealScrollStep();
      if (!step) return;
      const max = el.scrollWidth - el.clientWidth;
      // if near end, wrap to start
      if (el.scrollLeft + step >= max - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 4000);

    return () => {
      mounted = false;
      clearInterval(interval);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("touchstart", onEnter);
      el.removeEventListener("touchend", onLeave);
    };
  }, [dealHotScroller, getDealScrollStep]);

  const loadingHome = useMemo(
    () => loadingAll || !allProducts?.length,
    [loadingAll, allProducts],
  );

  const renderProductSectionContent = (products, scrollerRef = null) => {
    if (loadingHome) {
      return <LoadScreen show={true} className="py-24 w-full" size={12} />;
    }

    if (products.length === 0) {
      return (
        <div className="w-full text-center text-slate-400 py-24 border border-dashed border-slate-200 dark:border-white/5 rounded-[2rem] font-light italic tracking-widest text-xs uppercase">
          Sản phẩm đang được cập nhật...
        </div>
      );
    }

    // Render as responsive grid on small/medium screens, horizontal scroller on large screens
    return (
      <>
        {/* Grid layout for mobile/tablet (hidden on lg+) */}
        <div className="lg:hidden grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {products.map((p) => (
            <div key={p.id} className="min-h-[320px] sm:min-h-[380px]">
              <ProductCard product={p} className="h-full" />
            </div>
          ))}
        </div>

        {/* Horizontal scroller for desktop (hidden on <lg) */}
        <div
          ref={scrollerRef}
          className="hidden lg:flex home-horizontal-scroller items-stretch gap-6 overflow-x-auto overflow-y-visible no-scrollbar"
        >
          {products.map((p) => (
            <div
              key={p.id}
              className="lg:w-[272px] lg:shrink-0 lg:min-h-[390px]"
            >
              <ProductCard product={p} className="h-full" />
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderDealHotContent = (products) => {
    if (loadingHome) {
      return <LoadScreen show={true} className="py-24 w-full" size={12} />;
    }

    if (products.length === 0) {
      return (
        <div className="w-full text-center text-slate-400 py-24 border border-dashed border-slate-200 dark:border-white/5 rounded-[2rem] font-light italic tracking-widest text-xs uppercase">
          Sản phẩm giảm giá đang được cập nhật...
        </div>
      );
    }

    return products.map((p) => (
      <div
        key={p.id}
        className="dealhot-item shrink-0 transition-transform duration-500"
      >
        <ProductCard product={p} className="h-full" />
      </div>
    ));
  };

  const REVIEW_VIDEOS = [
    { id: "r1", src: "https://www.youtube.com/embed/TzY6m1rOgjU" },
    { id: "r2", src: "https://www.youtube.com/embed/MUmqNjtyE2w" },
    { id: "r3", src: "https://www.youtube.com/embed/eHiaesghquI" },
    { id: "r4", src: "https://www.youtube.com/embed/Yelu3NsfCNE" },
  ];

  const renderViewedProductCard = (product) => (
    <div key={product.id} className="relative min-h-[320px] sm:min-h-[380px]">
      <button
        type="button"
        onClick={() => handleRemoveViewedItem(product.id)}
        className="absolute right-2 top-2 z-20 inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)] shadow-sm transition-colors duration-200 hover:text-[var(--color-danger)]"
        aria-label={`Xóa ${product.name} khỏi sản phẩm đã xem`}
      >
        <span>Xóa sản phẩm</span>
        <span aria-hidden="true">×</span>
      </button>
      <ProductCard product={product} className="h-full" />
    </div>
  );

  return (
    <div className="page-ambient page-ambient-home min-h-screen w-full overflow-hidden bg-transparent pb-10 text-[var(--color-text)] transition-colors duration-220 ease-standard">
      <div className="mx-auto w-full max-w-[1320px] px-4 pb-12 pt-2 sm:px-5 lg:px-6">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 top-16 z-[60] bg-black/50 backdrop-blur-sm xl:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile sidebar menu */}
        <aside
          className={`fixed left-0 top-16 z-[70] h-[calc(100vh-4rem)] w-56 bg-[var(--color-surface)] shadow-xl transition-transform duration-300 ease-standard xl:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="overflow-y-auto p-4">
            <CategoryMenuPanel hoverPanelStyle={homeHoverPanelStyle} />
          </div>
        </aside>

        <section
          className="reveal-on-scroll pt-3 relative"
          data-reveal-delay="0"
        >
          <div className="grid grid-cols-1 gap-1.5 xl:grid-cols-[224px_minmax(0,1fr)_156px]">
            <aside className="home-side-menu hidden xl:block">
              <CategoryMenuPanel hoverPanelStyle={homeHoverPanelStyle} />
            </aside>

            <div className="home-main-banner-shell relative overflow-hidden rounded-[0.72rem] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md">
              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="absolute left-4 top-4 z-10 flex items-center justify-center rounded-lg bg-white/90 p-2 text-slate-900 shadow-md transition-all hover:bg-white backdrop-blur xl:hidden"
                aria-label="Toggle menu"
              >
                <span className="material-symbols-outlined text-xl">
                  {sidebarOpen ? "close" : "menu"}
                </span>
              </button>
              <Banner variant="home" />
            </div>

            <button
              type="button"
              onClick={() => navigate(SIDE_BANNERS[0].action)}
              className="home-side-banner home-side-banner-right hidden xl:block"
            >
              <img
                src={SIDE_BANNERS[0].image}
                alt={SIDE_BANNERS[0].alt}
                className="h-full w-full object-cover"
              />
            </button>
          </div>
        </section>

        <section className="reveal-on-scroll mt-6" data-reveal-delay="60">
          <div className="mb-5 flex items-center justify-between px-1">
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)] md:text-base">
              Ưu đãi nổi bật hôm nay
            </h3>
            <button
              type="button"
              onClick={() => navigate("/products?p=1")}
              className="motion-default text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)] hover:opacity-80"
            >
              Xem tất cả ưu đãi
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {PROMO_CARDS.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => navigate(card.action)}
                className="home-image-promo group"
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-320 ease-standard group-hover:scale-[1.04]"
                />
                <div className="home-image-promo-overlay" />
                <div className="home-image-promo-content relative z-10 flex h-full flex-col justify-end p-6 text-white text-left">
                  <p className="text-[10px] uppercase tracking-[0.2em] opacity-90 mb-2">
                    {card.subtitle}
                  </p>
                  <h4 className="text-xl font-semibold tracking-tight mb-4">
                    {card.title}
                  </h4>
                  <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-black">
                    {card.cta}
                    <span className="material-symbols-outlined !text-lg transition-transform duration-220 ease-standard group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section
          className="reveal-on-scroll mt-6 grid grid-cols-2 gap-4 border-y border-[var(--color-border)] py-6 lg:grid-cols-4"
          data-reveal-delay="100"
        >
          {TRUST_BADGES.map((badge) => (
            <div
              key={badge.title}
              className="group flex flex-col items-center px-4 text-center"
            >
              <span className="material-symbols-outlined mb-3 !text-3xl font-light text-[var(--color-primary)] transition-transform duration-220 ease-standard group-hover:scale-105">
                {badge.icon}
              </span>
              <h3 className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.16em]">
                {badge.title}
              </h3>
              <p className="text-[10px] uppercase tracking-tight text-[var(--color-text-muted)]">
                {badge.desc}
              </p>
            </div>
          ))}
        </section>

        <section className="reveal-on-scroll mt-6" data-reveal-delay="140">
          <div className="mb-7 flex flex-col items-center">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
              Bộ sưu tập mới nhất
            </h2>
            <h3 className="text-3xl font-light tracking-tight md:text-4xl">
              Danh Mục <span className="font-bold">Nổi Bật</span>
            </h3>
            <div className="mt-4 h-1 w-14 bg-[var(--color-primary)]"></div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => navigate(`/products?p=1&category=${cat.cat}`)}
                className="group flex flex-col items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-4 text-center shadow-sm motion-default hover:-translate-y-0.5 hover:border-[var(--color-primary)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-muted)]/70">
                  <span className="material-symbols-outlined text-2xl font-light text-[var(--color-text-muted)] transition-colors duration-220 ease-standard group-hover:text-[var(--color-primary)]">
                    {cat.icon}
                  </span>
                </div>
                <span className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)] transition-colors duration-220 ease-standard group-hover:text-[var(--color-primary)]">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="reveal-on-scroll mt-6" data-reveal-delay="180">
          <div className="overflow-hidden rounded-[2rem] border border-[var(--color-border)] shadow-md">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 3200, disableOnInteraction: false }}
              loop
              spaceBetween={16}
              className="w-full h-full"
            >
              {[Carousel1, Carousel2, Carousel3, Carousel4].map((img, idx) => (
                <SwiperSlide key={img}>
                  <img
                    src={img}
                    alt={`Carousel banner ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>

        <section className="reveal-on-scroll mt-6" data-reveal-delay="220">
          <div
            className="dealhot-shell relative overflow-hidden rounded-[1rem] border border-[var(--color-border)] shadow-md"
            style={{
              backgroundImage: `url(${DealHotBackground})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="dealhot-overlay absolute inset-0" />
            <div className="relative z-10 p-5 sm:p-6 md:p-7">
              <div className="dealhot-inner grid grid-cols-1 items-center gap-6 lg:grid-cols-[320px_1fr]">
                <div className="dealhot-info">
                  <div className="flex flex-col gap-3">
                    <span className="dealhot-badge inline-block">DEAL HOT</span>
                    <h2 className="dealhot-title text-white">
                      DEAL HỜI - GIÁ SỐC MUA LIỀN TAY
                    </h2>
                    <p className="dealhot-subtitle">
                      Săn ưu đãi giới hạn, giảm trực tiếp trên sản phẩm chính
                      hãng.
                    </p>
                    <div className="mt-4">
                      <button
                        onClick={() => navigate("/products?p=1")}
                        className="dealhot-cta group motion-default inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.2em]"
                      >
                        <span>Xem tất cả deal</span>
                        <span className="material-symbols-outlined !text-xl transition-transform duration-220 ease-standard group-hover:translate-x-1">
                          trending_flat
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="dealhot-scroller-wrapper relative">
                  <button
                    type="button"
                    aria-label="Cuon trai"
                    onClick={scrollDealPrev}
                    className="scroller-nav-button scroller-prev"
                  >
                    <span className="material-symbols-outlined">
                      chevron_left
                    </span>
                  </button>

                  <div
                    ref={dealHotScroller}
                    className="dealhot-horizontal-scroller home-horizontal-scroller flex items-stretch overflow-x-auto overflow-y-visible px-0 py-4 no-scrollbar"
                  >
                    {renderDealHotContent(dealHotProducts)}
                  </div>

                  <button
                    type="button"
                    aria-label="Cuon phai"
                    onClick={scrollDealNext}
                    className="scroller-nav-button scroller-next"
                  >
                    <span className="material-symbols-outlined">
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {[
          {
            id: "laptop",
            title: vi.home.popularComputersTitle,
            data: popularComputers,
            scroller: scroller1,
            cat: "LSP02",
          },
          {
            id: "phone",
            title: vi.home.latestPhonesTitle,
            data: latestPhones,
            scroller: scroller2,
            cat: "LSP01",
          },
          {
            id: "monitor",
            title: vi.home.graphicsMonitorsTitle,
            data: graphicsMonitors,
            scroller: scroller3,
            cat: "LSP08",
          },
        ].map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="reveal-on-scroll mt-6"
          >
            <div className="mb-5 flex items-end justify-between px-1 sm:px-2">
              <div className="space-y-3">
                <div className="h-[2px] w-14 bg-[var(--color-primary)]"></div>
                <h2 className="text-2xl font-bold uppercase leading-none tracking-tight sm:text-3xl">
                  {section.title}
                </h2>
              </div>
              <button
                onClick={() =>
                  navigate(`/products?p=1&category=${section.cat}`)
                }
                className="group motion-default flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
              >
                <span>Tất cả sản phẩm</span>
                <span className="material-symbols-outlined !text-xl transition-transform duration-220 ease-standard group-hover:translate-x-1.5">
                  trending_flat
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[155px_minmax(0,1fr)] gap-8 items-start">
              <button
                type="button"
                onClick={() =>
                  navigate(`/products?p=1&category=${section.cat}`)
                }
                className="hidden lg:block home-vertical-banner"
                aria-label={`Banner ${section.id}`}
              >
                <img
                  src={
                    section.id === "laptop"
                      ? LaptopBannerVer
                      : section.id === "phone"
                        ? PhoneBannerVer
                        : MonitorBannerVer
                  }
                  alt={`${section.id} banner`}
                  className="h-full w-full object-cover rounded-lg"
                />
              </button>

              <div className="w-full">
                {renderProductSectionContent(section.data, section.scroller)}
              </div>
            </div>
          </section>
        ))}

        <section className="reveal-on-scroll mt-8" data-reveal-delay="260">
          <div className="mb-5 flex items-center justify-between px-1">
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)] md:text-base">
              REVIEW SẢN PHẨM
            </h3>
            <a
              href="https://youtu.be/dQw4w9WgXcQ"
              target="_blank"
              rel="noopener noreferrer"
              className="motion-default text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)] hover:opacity-80"
            >
              Xem Thêm tại Youtube
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {REVIEW_VIDEOS.map((v) => (
              <div
                key={v.id}
                className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm"
              >
                <div className="w-full h-[420px] sm:h-[520px] md:h-[620px]">
                  <iframe
                    src={v.src}
                    title={v.id}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="reveal-on-scroll mt-8" data-reveal-delay="300">
          <div className="mb-5 flex items-center justify-between px-1">
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)] md:text-base">
              Tin tức công nghệ
            </h3>
            <button
              type="button"
              onClick={() => navigate("/news")}
              className="motion-default text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)] hover:opacity-80"
            >
              Xem thêm tại đây
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {(loadingHomeNews || !homeNews.length) &&
              Array.from({ length: HOME_NEWS_PREVIEW_SIZE }).map((_, idx) => (
                <div
                  key={`news-skeleton-${idx}`}
                  className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                >
                  <div className="skeleton-base h-44 w-full" />
                  <div className="space-y-3 p-4">
                    <div className="skeleton-base h-4 w-28 rounded" />
                    <div className="skeleton-base h-4 w-full rounded" />
                    <div className="skeleton-base h-4 w-5/6 rounded" />
                    <div className="skeleton-base h-3 w-24 rounded" />
                  </div>
                </div>
              ))}

            {!loadingHomeNews &&
              homeNews.map((news, index) => (
                <a
                  key={news.href}
                  href={news.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:shadow-md"
                >
                  {news.image ? (
                    <img
                      src={news.image}
                      alt={news.title}
                      className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-44 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                      {HOME_NEWS_BADGES[index] || "Bài tin công nghệ"}
                    </div>
                  )}

                  <div className="p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-primary)]">
                      {HOME_NEWS_BADGES[index] || `Bài tin ${index + 1}`}
                    </p>
                    <h4 className="mt-2 line-clamp-3 text-sm font-semibold text-[var(--color-text)] md:text-base">
                      {news.title}
                    </h4>
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[var(--color-text-muted)] md:text-sm">
                      {news.summary ||
                        "Nhấn xem thêm để đọc nội dung chi tiết của bài viết này trên trang GearVN."}
                    </p>
                    <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                      Nguồn: GearVN
                    </p>
                  </div>
                </a>
              ))}
          </div>
        </section>

        <section className="reveal-on-scroll mt-8" data-reveal-delay="340">
          <div className="mb-5 flex items-end justify-between px-1 sm:px-2">
            <div className="space-y-3">
              <div className="h-[2px] w-14 bg-[var(--color-primary)]"></div>
              <h2 className="text-2xl font-bold uppercase leading-none tracking-tight sm:text-3xl">
                Sản phẩm đã xem
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {recentlyViewedProducts.length > 0 ? (
                <button
                  type="button"
                  onClick={handleClearRecentlyViewed}
                  className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-danger)] hover:opacity-80"
                >
                  Xóa tất cả
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => navigate("/products?p=1")}
                className="group motion-default flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
              >
                <span>Xem thêm sản phẩm</span>
                <span className="material-symbols-outlined !text-xl transition-transform duration-220 ease-standard group-hover:translate-x-1.5">
                  trending_flat
                </span>
              </button>
            </div>
          </div>

          {recentlyViewedProducts.length > 0 ? (
            <div className="lg:hidden grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {recentlyViewedProducts.map((p) => renderViewedProductCard(p))}
            </div>
          ) : (
            <div className="lg:hidden w-full text-center text-slate-400 py-16 border border-dashed border-slate-200 dark:border-white/5 rounded-[2rem] font-light italic tracking-widest text-xs uppercase">
              Bạn chưa xem sản phẩm nào gần đây.
            </div>
          )}

          <div className="relative hidden lg:block">
            {recentlyViewedProducts.length >= 5 ? (
              <button
                type="button"
                aria-label="Cuon trai san pham da xem"
                onClick={scrollViewedPrev}
                className="scroller-nav-button scroller-prev"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
            ) : null}

            <div
              ref={viewedScroller}
              className="home-horizontal-scroller flex items-stretch gap-6 overflow-x-auto overflow-y-visible no-scrollbar"
            >
              {recentlyViewedProducts.length > 0 ? (
                recentlyViewedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="viewed-item lg:w-[272px] lg:shrink-0"
                  >
                    {renderViewedProductCard(p)}
                  </div>
                ))
              ) : (
                <div className="w-full text-center text-slate-400 py-16 border border-dashed border-slate-200 dark:border-white/5 rounded-[2rem] font-light italic tracking-widest text-xs uppercase">
                  Bạn chưa xem sản phẩm nào gần đây.
                </div>
              )}
            </div>

            {recentlyViewedProducts.length >= 5 ? (
              <button
                type="button"
                aria-label="Cuon phai san pham da xem"
                onClick={scrollViewedNext}
                className="scroller-nav-button scroller-next"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
