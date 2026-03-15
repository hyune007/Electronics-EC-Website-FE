import { useEffect, useState } from "react";

const BASE = "https://gearvn.com/blogs/all";
const PROXY = "https://api.allorigins.win/raw?url=";

export default function NewsGearVN() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("Sẵn sàng");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAndRender();
  }, []);

  async function fetchWithTimeout(url, ms = 8000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      return res;
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  }

  async function loadFeed() {
    try {
      setStatus("Đang thử Atom...");
      let res = await fetchWithTimeout(`${BASE}.atom`);
      if (res.ok) return { type: "atom", raw: await res.text() };
    } catch (e) {
      void e;
    }

    try {
      setStatus("Đang thử RSS...");
      let res = await fetchWithTimeout(`${BASE}.rss`);
      if (res.ok) return { type: "rss", raw: await res.text() };
    } catch (e) {
      void e;
    }

    setStatus("Dùng proxy HTML...");
    let res = await fetchWithTimeout(PROXY + encodeURIComponent(BASE));
    return { type: "html", raw: await res.text() };
  }

  function parseAtom(xml) {
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    return [...doc.querySelectorAll("entry, item")]
      .map((e) => ({
        title: e.querySelector("title")?.textContent.trim(),
        href:
          e.querySelector("link")?.getAttribute("href") ||
          e.querySelector("link")?.textContent,
      }))
      .filter((x) => x.title && x.href);
  }

  function parseHTML(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const seen = new Set();

    return [...doc.querySelectorAll('a[href*="/blogs/"]')]
      .map((a) => {
        let href = a.href;
        let title = a.textContent.trim();
        if (title.length < 6) return null;
        const key = href + title;
        if (seen.has(key)) return null;
        seen.add(key);
        return { title, href };
      })
      .filter(Boolean);
  }

  async function loadAndRender() {
    try {
      setLoading(true);
      const result = await loadFeed();

      let data =
        result.type === "html" ? parseHTML(result.raw) : parseAtom(result.raw);

      setItems(data.slice(0, 30));
      setStatus(`Hoàn tất: ${data.length} bài`);
    } catch (e) {
      void e;
      setStatus("Lỗi tải tin");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-transparent px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="card-default mb-6 rounded-2xl border p-6 md:p-8">
          <h1 className="text-2xl font-bold text-[var(--color-text)] md:text-3xl">
            Tin công nghệ GearVN
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)] md:text-base">
            Cập nhật bài viết mới nhất từ nguồn tin công nghệ. Danh sách được
            làm mới tự động.
          </p>
          <p className="mt-4 inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-text-muted)]">
            {status}
          </p>
        </div>

        <div className="card-default rounded-2xl border p-4 md:p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it, i) => (
              <a
                key={i}
                href={it.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-[var(--color-primary)]"
              >
                <h3 className="line-clamp-2 text-base font-semibold text-[var(--color-text)]">
                  {it.title}
                </h3>
                <p className="mt-3 text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                  Nguồn: gearvn.com
                </p>
              </a>
            ))}
          </div>
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
