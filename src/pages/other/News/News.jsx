import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  NEWS_BASE_URL,
  NEWS_PROXY_URL,
  pickNewsImageFromElement,
  toAbsoluteNewsUrl,
} from "../../../utils/newsSource.js";

const MAX_ITEMS = 50;
const INITIAL_BATCH = 15;
const LOAD_MORE_BATCH = 15;

function ignoreError() {
  return undefined;
}

async function fetchWithTimeout(url, ms = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

function firstImageInHtml(htmlSnippet) {
  if (!htmlSnippet) return "";

  const doc = new DOMParser().parseFromString(htmlSnippet, "text/html");
  const img = doc.querySelector("img");
  const src =
    img?.getAttribute("src") || img?.dataset.src || img?.dataset.original || "";

  return toAbsoluteNewsUrl(src);
}

function normalizeItems(rawItems) {
  const seen = new Set();

  return rawItems
    .map((item) => ({
      ...item,
      title: item.title?.trim(),
      href: toAbsoluteNewsUrl(item.href),
      image: toAbsoluteNewsUrl(item.image || ""),
    }))
    .filter((item) => {
      if (!item.title || !item.href) return false;
      if (seen.has(item.href)) return false;
      seen.add(item.href);
      return true;
    });
}

function normalizeKeyword(value) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

function parseAtom(xml) {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  return [...doc.querySelectorAll("entry, item")]
    .map((entry) => ({
      title: entry.querySelector("title")?.textContent.trim(),
      href:
        entry.querySelector("link")?.getAttribute("href") ||
        entry.querySelector("link")?.textContent,
      image:
        entry.querySelector("enclosure")?.getAttribute("url") ||
        entry.querySelector(String.raw`media\:content`)?.getAttribute("url") ||
        entry
          .querySelector(String.raw`media\:thumbnail`)
          ?.getAttribute("url") ||
        firstImageInHtml(
          entry.querySelector("content")?.textContent ||
            entry.querySelector("summary")?.textContent ||
            entry.querySelector("description")?.textContent ||
            "",
        ),
    }))
    .filter((item) => item.title && item.href);
}

function parseHTML(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");

  return [...doc.querySelectorAll('a[href*="/blogs/"]')]
    .map((anchor) => {
      const href = anchor.href;
      const title =
        anchor.getAttribute("title")?.trim() || anchor.textContent.trim();
      if (title.length < 6) return null;

      const container = anchor.closest(
        "article, li, .item, .blog-item, .post-item",
      );
      const imageEl =
        anchor.querySelector("img") || container?.querySelector("img");
      const image = pickNewsImageFromElement(imageEl);

      return { title, href, image };
    })
    .filter(Boolean);
}

export default function NewsGearVN() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const [status, setStatus] = useState("Sẵn sàng");
  const [loading, setLoading] = useState(false);
  const loadMoreRef = useRef(null);

  const loadFeed = useCallback(async () => {
    try {
      setStatus("Đang thử nguồn Atom...");
      const atomRes = await fetchWithTimeout(`${NEWS_BASE_URL}.atom`);
      if (atomRes.ok) return { type: "atom", raw: await atomRes.text() };
    } catch (error) {
      ignoreError(error);
    }

    try {
      setStatus("Đang thử nguồn RSS...");
      const rssRes = await fetchWithTimeout(`${NEWS_BASE_URL}.rss`);
      if (rssRes.ok) return { type: "rss", raw: await rssRes.text() };
    } catch (error) {
      ignoreError(error);
    }

    setStatus("Đang tải từ trang web...");
    const htmlRes = await fetchWithTimeout(
      NEWS_PROXY_URL + encodeURIComponent(NEWS_BASE_URL),
    );
    return { type: "html", raw: await htmlRes.text() };
  }, []);

  const loadAndRender = useCallback(async () => {
    try {
      setLoading(true);
      const result = await loadFeed();

      const data =
        result.type === "html" ? parseHTML(result.raw) : parseAtom(result.raw);
      const normalized = normalizeItems(data).slice(0, MAX_ITEMS);

      setItems(normalized);
      setVisibleCount(Math.min(INITIAL_BATCH, normalized.length));
      setStatus(`Hoàn tất: ${normalized.length} bài`);
    } catch {
      setStatus("Lỗi tải tin");
    } finally {
      setLoading(false);
    }
  }, [loadFeed]);

  useEffect(() => {
    loadAndRender();
  }, [loadAndRender]);

  const filteredItems = useMemo(() => {
    const keyword = normalizeKeyword(searchTerm);
    if (!keyword) return items;

    return items.filter((item) =>
      normalizeKeyword(item.title).includes(keyword),
    );
  }, [items, searchTerm]);

  useEffect(() => {
    if (!loadMoreRef.current || visibleCount >= filteredItems.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;

        setVisibleCount((prev) =>
          Math.min(prev + LOAD_MORE_BATCH, filteredItems.length),
        );
      },
      { threshold: 0.2 },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [filteredItems.length, visibleCount]);

  useEffect(() => {
    setVisibleCount(Math.min(INITIAL_BATCH, filteredItems.length));
  }, [searchTerm, filteredItems.length]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  const featuredItem = visibleItems[0];
  const headlineItems = visibleItems.slice(1, 5);
  const gridItems = visibleItems.slice(5);
  const gearVnSearchUrl =
    searchTerm.trim().length > 0
      ? `https://gearvn.com/search?type=article&q=${encodeURIComponent(searchTerm.trim())}`
      : "";

  return (
    <div className="page-ambient page-ambient-news min-h-screen px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-7 text-slate-100 shadow-xl md:px-10 md:py-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-slate-400/30 bg-slate-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200">
              Bản tin công nghệ
            </span>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-200">
              Cập nhật trực tiếp
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-black leading-tight md:text-5xl">
            Phòng tin công nghệ
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">
            Tổng hợp tin tức mới nhất từ GearVN, hiển thị theo mô hình trang báo
            điện tử với bài nổi bật, tin nhanh và luồng đọc liên tục.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
            <span className="rounded-full border border-slate-500/40 px-3 py-1">
              {status}
            </span>
            <span className="rounded-full border border-slate-500/40 px-3 py-1">
              {visibleItems.length}/{filteredItems.length} bài đang hiển thị
            </span>
          </div>
        </div>

        <section className="card-default mb-6 rounded-2xl border p-4 md:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-[var(--color-text)] md:text-base">
              Quản lý tin tức
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)]">
              <span className="rounded-full border border-[var(--color-border)] px-3 py-1">
                Tổng từ GearVN: {items.length}
              </span>
              <span className="rounded-full border border-[var(--color-border)] px-3 py-1">
                Kết quả phù hợp: {filteredItems.length}
              </span>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
            <label className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5">
              <span className="material-symbols-outlined !text-base text-[var(--color-text-muted)]">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full bg-transparent text-sm text-[var(--color-text)] outline-none"
                placeholder="Nhập từ khóa để tìm tin bạn muốn"
              />
            </label>

            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              Xóa lọc
            </button>

            <a
              href={gearVnSearchUrl || undefined}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition ${
                searchTerm.trim()
                  ? "bg-[var(--color-primary)] text-white hover:opacity-90"
                  : "cursor-not-allowed border border-[var(--color-border)] text-[var(--color-text-muted)]"
              }`}
              onClick={(event) => {
                if (!searchTerm.trim()) event.preventDefault();
              }}
            >
              Tìm kiếm trên GearVN
            </a>
          </div>
        </section>

        {featuredItem && (
          <section className="mb-8 grid gap-5 lg:grid-cols-12">
            <a
              href={featuredItem.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl lg:col-span-8"
            >
              {featuredItem.image ? (
                <img
                  src={featuredItem.image}
                  alt={featuredItem.title}
                  loading="lazy"
                  className="h-56 sm:h-80 md:h-96 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="h-56 sm:h-80 md:h-96 w-full bg-gradient-to-br from-slate-200 to-slate-300" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent" />
              <div className="absolute bottom-0 p-6 md:p-8">
                <p className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
                  Nổi bật
                </p>
                <h2 className="mt-3 text-xl font-extrabold leading-tight text-white md:text-3xl">
                  {featuredItem.title}
                </h2>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200">
                  Nguồn: trang tin GearVN
                </p>
              </div>
            </a>

            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70 lg:col-span-4 md:p-5">
              <div className="mb-4 flex items-center justify-between border-b border-[var(--color-border)] pb-3 dark:border-slate-700/70">
                <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--color-text)]">
                  Tin nhanh
                </h3>
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                  Mới nhất
                </span>
              </div>

              <div className="space-y-3">
                {headlineItems.map((it, index) => (
                  <a
                    key={it.href}
                    href={it.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-xl border border-transparent bg-slate-50 p-3 transition hover:border-[var(--color-primary)] hover:bg-white dark:bg-slate-800/70 dark:hover:border-sky-500/60 dark:hover:bg-slate-800"
                  >
                    <div className="flex gap-3">
                      <span className="mt-0.5 text-sm font-black text-slate-400 dark:text-slate-500">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="line-clamp-3 text-sm font-semibold leading-relaxed text-[var(--color-text)] group-hover:text-[var(--color-primary)] dark:text-slate-100 dark:group-hover:text-sky-300">
                        {it.title}
                      </p>
                    </div>
                  </a>
                ))}

                {!headlineItems.length && (
                  <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
                    Đang cập nhật tin nhanh...
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        <div className="card-default rounded-2xl border p-4 md:p-5">
          <div className="mb-5 flex items-end justify-between border-b border-[var(--color-border)] pb-3">
            <h3 className="text-base font-extrabold uppercase tracking-[0.12em] text-[var(--color-text)] md:text-lg">
              Dòng sự kiện
            </h3>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
              Cuộn để xem thêm
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gridItems.map((it) => (
              <a
                key={it.href}
                href={it.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:shadow-lg"
              >
                {it.image ? (
                  <img
                    src={it.image}
                    alt={it.title}
                    loading="lazy"
                    className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                    Không có ảnh
                  </div>
                )}

                <div className="p-5">
                  <h3 className="line-clamp-3 text-base font-semibold leading-snug text-[var(--color-text)]">
                    {it.title}
                  </h3>
                  <p className="mt-3 text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                    Nguồn: gearvn.com
                  </p>
                </div>
              </a>
            ))}
          </div>

          {filteredItems.length === 0 && !loading && (
            <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
              Không tìm thấy bài viết phù hợp.
            </p>
          )}

          {filteredItems.length > 0 && visibleItems.length > 5 && (
            <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
              Hiển thị {visibleItems.length}/{filteredItems.length} bài
            </p>
          )}

          <div ref={loadMoreRef} className="h-4" aria-hidden="true" />
        </div>
        {loading && (
          <p className="mt-6 text-sm font-medium text-[var(--color-text-muted)]">
            Đang tải...
          </p>
        )}
      </div>
    </div>
  );
}
