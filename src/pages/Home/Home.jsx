import Banner from "../../components/customer/home/Banner/Banner.jsx";
import useDragScroll from "../../hooks/useDragScroll";
import vi from "../../i18n/vi";
// import bgTech from "../../assets/background/backgroundtech.jpg";
import ProductCard from "../../components/customer/product/ProductCard/ProductCard.jsx";

export default function Home() {
  const scroller1 = useDragScroll();
  const scroller2 = useDragScroll();
  const scroller3 = useDragScroll();

  return (
    <div className="w-full min-h-screen dark:text-white bg-gradient-to-br from-[#e5e7eb] via-[#f3f4f6] to-[#e5e7eb] dark:from-[#0B0F1A] dark:via-[#05070A] dark:to-[#161B28] transition-colors">
      <div className="max-w-[1250px] mx-auto pb-16 space-y-8">
        <section className="w-full h-[48vh] flex items-center justify-center px-2 py-4">
          <div className="w-full h-full rounded-md overflow-hidden relative group flex items-center justify-center shadow-[0_0_15px_0_rgba(0,0,0,0.5)] dark:shadow-[0_0_20px_0_rgba(230,230,235,0.2)]">
            <div>
              <Banner />
            </div>
          </div>
        </section>
        <div className="flex justify-center dark:text-white ">
          <h2 className="text-4xl font-black ">{vi.home.featuredTitle}</h2>
        </div>
        <section className="px-2 sm:px-4 md:px-6 py-8 bg-white/90 dark:bg-[#0f1724] rounded-md shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group cursor-pointer bg-white dark:bg-[#232a3a] border border-gray-200 dark:border-[#2e3950] p-4 rounded-lg shadow-xl dark:hover:bg-[#27304a] hover:shadow-2xl dark:hover:shadow-[0_4px_32px_0_rgba(80,120,255,0.10)] hover:scale-105 transition-all duration-300">
              <div className="size-16 bg-blue-100 dark:bg-[#32406a] rounded-md flex items-center justify-center mb-7 shadow-sm dark:shadow-[0_2px_8px_0_rgba(80,120,255,0.10)]">
                <span className="material-symbols-outlined text-4xl text-primary dark:text-white">
                  smartphone
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-3 dark:text-[#eaf1fb]">
                {vi.home.categories.phone}
              </h3>
              <p className="text-base mb-5 font-medium dark:text-[#c7d2e6]">
                {vi.home.descriptions.phone}
              </p>
              <div className="flex items-center gap-2 text-primary dark:text-[#7bb0ff] font-bold text-base">
                <span>{vi.home.exploreNow}</span>
                <span className="material-symbols-outlined text-base">
                  arrow_forward
                </span>
              </div>
            </div>

            <div className="group cursor-pointer bg-white dark:bg-[#232a3a] border border-gray-200 dark:border-[#2e3950] p-4 rounded-lg shadow-xl dark:hover:bg-[#27304a] hover:shadow-2xl dark:hover:shadow-[0_4px_32px_0_rgba(80,120,255,0.10)] hover:scale-105 transition-all duration-300">
              <div className="size-16 bg-blue-100 dark:bg-[#32406a] rounded-md flex items-center justify-center mb-7 shadow-sm dark:shadow-[0_2px_8px_0_rgba(80,120,255,0.10)]">
                <span className="material-symbols-outlined text-4xl text-primary dark:text-white">
                  laptop_mac
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-3 dark:text-[#eaf1fb]">
                {vi.home.categories.computer}
              </h3>
              <p className="text-base mb-5 font-medium dark:text-[#c7d2e6]">
                {vi.home.descriptions.computer}
              </p>
              <div className="flex items-center gap-2 text-primary dark:text-[#7bb0ff] font-bold text-base">
                <span>{vi.home.exploreNow}</span>
                <span className="material-symbols-outlined text-base">
                  arrow_forward
                </span>
              </div>
            </div>
            <div className="group cursor-pointer bg-white dark:bg-[#232a3a] border border-gray-200 dark:border-[#2e3950] p-4 rounded-lg shadow-xl dark:hover:bg-[#27304a] hover:shadow-2xl dark:hover:shadow-[0_4px_32px_0_rgba(80,120,255,0.10)] hover:scale-105 transition-all duration-300">
              <div className="size-16 bg-blue-100 dark:bg-[#32406a] rounded-md flex items-center justify-center mb-7 shadow-sm dark:shadow-[0_2px_8px_0_rgba(80,120,255,0.10)]">
                <span className="material-symbols-outlined text-4xl text-primary dark:text-white">
                  desktop_windows
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-3 dark:text-[#eaf1fb]">
                {vi.home.categories.monitor}
              </h3>
              <p className="text-base mb-5 font-medium dark:text-[#c7d2e6]">
                {vi.home.descriptions.monitor}
              </p>
              <div className="flex items-center gap-2 text-primary dark:text-[#7bb0ff] font-bold text-base">
                <span>{vi.home.exploreNow}</span>
                <span className="material-symbols-outlined text-base">
                  arrow_forward
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="px-2 sm:px-4 md:px-6 py-8 bg-white/90 dark:bg-[#0f1724] rounded-md shadow-sm">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-3xl font-black">
                {vi.home.popularComputersTitle}
              </h2>
            </div>
            <button className="text-sm font-bold hover:text-primary flex items-center gap-1">
              {vi.home.viewAll}{" "}
              <span className="material-symbols-outlined text-sm">
                chevron_right
              </span>
            </button>
          </div>
          <div
            ref={scroller1}
            className="flex items-start gap-6 overflow-x-auto no-scrollbar overflow-y-visible pt-3 pb-6 -mx-6 px-6"
          >
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
          </div>
        </section>
        <section className="px-2 sm:px-4 md:px-6 py-8 bg-white/90 dark:bg-[#0f1724] rounded-md shadow-sm">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-3xl font-black">
                {vi.home.latestPhonesTitle}
              </h2>
            </div>
            <button className="text-sm font-bold hover:text-primary flex items-center gap-1">
              {vi.home.viewAll}{" "}
              <span className="material-symbols-outlined text-sm">
                chevron_right
              </span>
            </button>
          </div>
          <div
            ref={scroller2}
            className="flex items-start gap-6 overflow-x-auto no-scrollbar overflow-y-visible pt-3 pb-6 -mx-6 px-6"
          >
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
          </div>
        </section>
        <section className="px-6 py-12 bg-white/90 dark:bg-[#0f1724] rounded-md shadow-sm">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black">
                {vi.home.graphicsMonitorsTitle}
              </h2>
            </div>
            <button className="text-sm font-bold hover:text-primary flex items-center gap-1">
              {vi.home.viewAll}{" "}
              <span className="material-symbols-outlined text-sm">
                chevron_right
              </span>
            </button>
          </div>
          <div
            ref={scroller3}
            className="flex items-start gap-6 overflow-x-auto no-scrollbar overflow-y-visible pt-3 pb-6 -mx-6 px-6"
          >
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
          </div>
        </section>
      </div>
    </div>
  );
}
