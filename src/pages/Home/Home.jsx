import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Banner from "../../components/customer/home/Banner/Banner.jsx";
import Carousel1 from "../../assets/banner/carousel_ads.jpg";
import Carousel2 from "../../assets/banner/carousel2_ads.jpg";
import Carousel3 from "../../assets/banner/carousel3_ads.jpg";
import Carousel4 from "../../assets/banner/carousel4_ads.jpg";
import ManHinhBanner from "../../assets/banner/ManHinh.jpg";
import MuaLaptopOnlineBanner from "../../assets/banner/MuaLaptopOnline.png";
import Xiaomi17UltraHomeBanner from "../../assets/banner/Xiaomi17ultra_home.jpg";
import useDragScroll from "../../hooks/useDragScroll";
import useRevealOnScroll from "../../hooks/useRevealOnScroll";
import "./Home.css";
import vi from "../../i18n/vi";
import ProductCard from "../../components/customer/product/ProductCard/ProductCard.jsx";
import LoadScreen from "../../components/common/LoadScreen.jsx";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useProductCache } from "../../contexts/ProductCacheContext.jsx";

const HOME_SLIDE_SIZE = 8;

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

export default function Home() {
  const scroller1 = useDragScroll();
  const scroller2 = useDragScroll();
  const scroller3 = useDragScroll();
  const navigate = useNavigate();
  useRevealOnScroll();

  const { allProducts, loadingAll, prefetchAllProducts } = useProductCache();

  useEffect(() => {
    prefetchAllProducts().catch(() => {});
  }, [prefetchAllProducts]);

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

  const loadingHome = useMemo(
    () => loadingAll || !allProducts?.length,
    [loadingAll, allProducts],
  );

  const renderProductSectionContent = (products) => {
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

    return products.map((p) => (
      <div key={p.id} className="transition-transform duration-500 hover:z-50">
        <ProductCard product={p} />
      </div>
    ));
  };

  return (
    <div className="w-full min-h-screen bg-[#fbfbfb] dark:bg-[#0b0c10] text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-10">
      <div className="max-w-[1440px] mx-auto pb-24 px-4 sm:px-6 lg:px-10">
        <section className="pt-6 reveal-on-scroll">
          <div className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/5 border border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900">
            <Banner variant="home" />
          </div>
        </section>

        <section className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 py-10 border-y border-slate-200 dark:border-white/10 reveal-on-scroll">
          {TRUST_BADGES.map((badge) => (
            <div
              key={badge.title}
              className="flex flex-col items-center text-center px-4 group"
            >
              <span className="material-symbols-outlined !text-3xl text-primary mb-3 font-light group-hover:scale-110 transition-transform duration-300">
                {badge.icon}
              </span>
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-1.5">
                {badge.title}
              </h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-tight">
                {badge.desc}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-20 reveal-on-scroll">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 mb-2 font-mono">
              Bộ sưu tập mới nhất
            </h2>
            <h3 className="text-3xl font-light tracking-tight">
              Danh Mục <span className="font-bold">Nổi Bật</span>
            </h3>
            <div className="h-1 w-12 bg-primary mt-4"></div>
          </div>
          <div className="flex flex-wrap justify-center gap-6 lg:gap-14">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => navigate(`/products?p=1&category=${cat.cat}`)}
                className="group flex flex-col items-center focus:outline-none"
              >
                <div className="w-20 h-20 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm group-hover:shadow-xl group-hover:border-primary group-hover:-translate-y-2 transition-all duration-500">
                  <span className="material-symbols-outlined text-3xl text-slate-500 group-hover:text-primary transition-colors font-light">
                    {cat.icon}
                  </span>
                </div>
                <span className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-primary transition-colors">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-16 reveal-on-scroll">
          <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="text-sm md:text-base font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
              Ưu đãi nổi bật hôm nay
            </h3>
            <button
              type="button"
              onClick={() => navigate("/products?p=1")}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:opacity-80 transition-opacity"
            >
              Xem tất cả ưu đãi
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="home-image-promo-overlay" />
                <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white text-left">
                  <p className="text-[10px] uppercase tracking-[0.2em] opacity-90 mb-2">
                    {card.subtitle}
                  </p>
                  <h4 className="text-xl font-semibold tracking-tight mb-4">
                    {card.title}
                  </h4>
                  <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-black">
                    {card.cta}
                    <span className="material-symbols-outlined !text-lg group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-28 reveal-on-scroll">
          <div className="rounded-[3rem] overflow-hidden shadow-2xl shadow-black/5 border border-slate-100 dark:border-white/5">
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
            className="mt-28 reveal-on-scroll"
          >
            <div className="flex items-end justify-between mb-12 px-2">
              <div className="space-y-3">
                <div className="h-[2px] w-16 bg-primary"></div>
                <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">
                  {section.title}
                </h2>
              </div>
              <button
                onClick={() =>
                  navigate(`/products?p=1&category=${section.cat}`)
                }
                className="group text-[10px] font-black text-slate-400 hover:text-primary transition-colors flex items-center gap-3 uppercase tracking-[0.3em]"
              >
                Tất cả sản phẩm{" "}
                <span className="material-symbols-outlined !text-xl group-hover:translate-x-2 transition-transform duration-300">
                  trending_flat
                </span>
              </button>
            </div>

            <div
              ref={section.scroller}
              className="flex items-stretch gap-8 overflow-x-auto no-scrollbar overflow-y-visible py-12 -my-12 -mx-4 px-4"
            >
              {renderProductSectionContent(section.data)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
