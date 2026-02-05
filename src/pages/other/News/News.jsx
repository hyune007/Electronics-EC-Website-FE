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
    } catch (e){
        void e;
    }

    try {
      setStatus("Đang thử RSS...");
      let res = await fetchWithTimeout(`${BASE}.rss`);
      if (res.ok) return { type: "rss", raw: await res.text() };
    } catch (e){
        void e;
    }

    setStatus("Dùng proxy HTML...");
    let res = await fetchWithTimeout(
      PROXY + encodeURIComponent(BASE)
    );
    return { type: "html", raw: await res.text() };
  }

  function parseAtom(xml) {
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    return [...doc.querySelectorAll("entry, item")].map(e => ({
      title: e.querySelector("title")?.textContent.trim(),
      href:
        e.querySelector("link")?.getAttribute("href") ||
        e.querySelector("link")?.textContent,
    })).filter(x => x.title && x.href);
  }

  function parseHTML(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const seen = new Set();

    return [...doc.querySelectorAll('a[href*="/blogs/"]')]
      .map(a => {
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
        result.type === "html"
          ? parseHTML(result.raw)
          : parseAtom(result.raw);

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
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-2">Tin công nghệ GearVN</h1>
            <a href="https://youtu.be/dQw4w9WgXcQ" target="_blank" >
        <p className="text-red-500">Xem thêm tại đây</p>
        </a>
      <p className="text-sm text-gray-500 mb-6">{status}</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((it, i) => (
          <a
            key={i}
            href={it.href}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 border rounded-xl hover:shadow-lg transition"
          >
            <h3 className="font-semibold line-clamp-2">{it.title}</h3>
            <p className="text-xs text-gray-400 mt-2">
              gearvn.com
            </p>
          </a>
        ))}
      </div>

      {loading && <p className="mt-6 text-sm">Đang tải...</p>}
    </div>
  );
}
