import Banner from "../../components/customer/home/Banner/Banner.jsx";
import useDragScroll from "../../hooks/useDragScroll";
import vi from "../../i18n/vi";
import ProductCard from "../../components/customer/product/ProductCard/ProductCard.jsx";

export default function Home() {
  const scroller1 = useDragScroll();
  const scroller2 = useDragScroll();
  const scroller3 = useDragScroll();

  return (
    <div className="w-full min-h-screen bg-neutral-100 dark:bg-[#0b0f1a] py-6 text-neutral-900 dark:text-neutral-100 transition-colors">
      <div className="max-w-[1250px] mx-auto pb-20 space-y-14 px-3">
        <section className="w-full h-[48vh] flex items-center justify-center hidden lg:flex">
          <div className="w-full h-full rounded-2xl overflow-hidden border border-neutral-200 dark:border-[#1f2937] shadow-lg ">
            <Banner />
          </div>
        </section>

        <div className="text-center">
          <h2 className="text-4xl font-extrabold tracking-tight">
            {vi.home.featuredTitle}
          </h2>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            {vi.home.exploreProduct}
          </p>
        </div>

        <section className="rounded-2xl border border-neutral-200 dark:border-[#1f2937] bg-white dark:bg-[#0f172a] p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className="group cursor-pointer rounded-2xl border border-neutral-200 dark:border-[#243041]
                            bg-neutral-50 dark:bg-[#111827]
                            p-6 transition-all duration-300
                            hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className="w-14 h-14 rounded-xl bg-neutral-200/70 dark:bg-[#1e293b]
                              flex items-center justify-center mb-6"
              >
                <span className="material-symbols-outlined text-3xl text-primary">
                  smartphone
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">
                {vi.home.categories.phone}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                {vi.home.descriptions.phone}
              </p>
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <span>{vi.home.exploreNow}</span>
                <span className="material-symbols-outlined text-base">
                  arrow_forward
                </span>
              </div>
            </div>

            <div
              className="group cursor-pointer rounded-2xl border border-neutral-200 dark:border-[#243041]
                            bg-neutral-50 dark:bg-[#111827]
                            p-6 transition-all duration-300
                            hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className="w-14 h-14 rounded-xl bg-neutral-200/70 dark:bg-[#1e293b]
                              flex items-center justify-center mb-6"
              >
                <span className="material-symbols-outlined text-3xl text-primary">
                  laptop_mac
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">
                {vi.home.categories.computer}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                {vi.home.descriptions.computer}
              </p>
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <span>{vi.home.exploreNow}</span>
                <span className="material-symbols-outlined text-base">
                  arrow_forward
                </span>
              </div>
            </div>

            <div
              className="group cursor-pointer rounded-2xl border border-neutral-200 dark:border-[#243041]
                            bg-neutral-50 dark:bg-[#111827]
                            p-6 transition-all duration-300
                            hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className="w-14 h-14 rounded-xl bg-neutral-200/70 dark:bg-[#1e293b]
                              flex items-center justify-center mb-6"
              >
                <span className="material-symbols-outlined text-3xl text-primary">
                  desktop_windows
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">
                {vi.home.categories.monitor}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                {vi.home.descriptions.monitor}
              </p>
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <span>{vi.home.exploreNow}</span>
                <span className="material-symbols-outlined text-base">
                  arrow_forward
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 dark:border-[#1f2937] bg-white dark:bg-[#0f172a] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold">
              {vi.home.popularComputersTitle}
            </h2>
            <button className="text-sm font-semibold text-neutral-500 hover:text-primary flex items-center gap-1">
              {vi.home.viewAll}
              <span className="material-symbols-outlined text-sm">
                chevron_right
              </span>
            </button>
          </div>

          <div
            ref={scroller1}
            className="flex items-start gap-6 overflow-x-auto no-scrollbar overflow-y-visible
                       pt-3 pb-6 -mx-6 px-6"
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

        <section className="rounded-2xl border border-neutral-200 dark:border-[#1f2937] bg-white dark:bg-[#0f172a] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold">
              {vi.home.latestPhonesTitle}
            </h2>
            <button className="text-sm font-semibold text-neutral-500 hover:text-primary flex items-center gap-1">
              {vi.home.viewAll}
              <span className="material-symbols-outlined text-sm">
                chevron_right
              </span>
            </button>
          </div>

          <div
            ref={scroller2}
            className="flex items-start gap-6 overflow-x-auto no-scrollbar overflow-y-visible
                       pt-3 pb-6 -mx-6 px-6"
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

        <section className="rounded-2xl border border-neutral-200 dark:border-[#1f2937] bg-white dark:bg-[#0f172a] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold">
              {vi.home.graphicsMonitorsTitle}
            </h2>
            <button className="text-sm font-semibold text-neutral-500 hover:text-primary flex items-center gap-1">
              {vi.home.viewAll}
              <span className="material-symbols-outlined text-sm">
                chevron_right
              </span>
            </button>
          </div>

          <div
            ref={scroller3}
            className="flex items-start gap-6 overflow-x-auto no-scrollbar overflow-y-visible
                       pt-3 pb-6 -mx-6 px-6"
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
