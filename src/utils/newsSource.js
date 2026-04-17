export const NEWS_BASE_URL = "https://gearvn.com/blogs/all";
export const NEWS_PROXY_URL = "https://api.allorigins.win/raw?url=";

export function toAbsoluteNewsUrl(url) {
  if (!url) return "";
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  try {
    return new URL(url, NEWS_BASE_URL).toString();
  } catch {
    return "";
  }
}

export function pickNewsImageFromElement(img) {
  if (!img) return "";

  const direct =
    img.getAttribute("src") ||
    img.dataset?.src ||
    img.dataset?.original ||
    img.dataset?.lazySrc ||
    "";

  if (direct) return toAbsoluteNewsUrl(direct);

  const srcset = img.getAttribute("srcset") || "";
  if (!srcset) return "";

  const firstSrcsetUrl = srcset
    .split(",")
    .map((part) => part.trim().split(" ")[0])
    .find(Boolean);

  return toAbsoluteNewsUrl(firstSrcsetUrl || "");
}

function decodeHtmlEntities(html) {
  if (!html) return "";
  const textarea = document.createElement("textarea");
  textarea.innerHTML = html;
  return textarea.value;
}

function isValidNewsSummary(text) {
  if (!text || text.length < 10) return false;
  // Lọc ra JSON, mảng, hoặc dữ liệu cấu trúc khác
  if (/^\{|\[|\}|\]|"Manual"|"Auto"|"Slide"|\{&nbsp;/.test(text)) {
    return false;
  }
  // Lọc ra các chuỗi chỉ chứa ký tự đặc biệt
  if (!/[a-zA-Z0-9à-ỿ]/.test(text)) return false;
  return true;
}

function extractSummary(container, title) {
  if (!container) return "";

  const summaryText =
    container.querySelector(".excerpt, .summary, .short-desc, .article-excerpt")
      ?.textContent ||
    container.querySelector("p")?.textContent ||
    "";

  let normalized = summaryText.replace(/\s+/g, " ").trim();
  normalized = decodeHtmlEntities(normalized);

  if (!normalized || normalized === title || !isValidNewsSummary(normalized)) {
    return "";
  }

  return normalized;
}

export function parseGearVnNewsLinksFromHtml(html, options = {}) {
  const { limit = Number.POSITIVE_INFINITY } = options;
  const doc = new DOMParser().parseFromString(html, "text/html");
  const seen = new Set();

  return [...doc.querySelectorAll('a[href*="/blogs/"]')]
    .map((anchor) => {
      const href = toAbsoluteNewsUrl(
        anchor.getAttribute("href") || anchor.href,
      );
      const title =
        anchor.getAttribute("title")?.trim() ||
        anchor.textContent.replace(/\s+/g, " ").trim();

      if (!href || !title || title.length < 6) return null;
      if (seen.has(href)) return null;
      seen.add(href);

      const container = anchor.closest(
        "article, li, .item, .blog-item, .post-item, .blog-post",
      );
      const imageEl =
        anchor.querySelector("img") || container?.querySelector("img");
      const image = pickNewsImageFromElement(imageEl);
      const summary = extractSummary(container, title);

      return { title, href, image, summary };
    })
    .filter(Boolean)
    .slice(0, limit);
}

function firstImageInHtml(htmlSnippet) {
  if (!htmlSnippet) return "";

  const doc = new DOMParser().parseFromString(htmlSnippet, "text/html");
  const img = doc.querySelector("img");
  const src =
    img?.getAttribute("src") ||
    img?.dataset?.src ||
    img?.dataset?.original ||
    "";

  return toAbsoluteNewsUrl(src);
}

function parseGearVnNewsFromAtom(xml, options = {}) {
  const { limit = Number.POSITIVE_INFINITY } = options;
  const doc = new DOMParser().parseFromString(xml, "application/xml");

  return [...doc.querySelectorAll("entry, item")]
    .map((entry) => ({
      title: entry.querySelector("title")?.textContent?.trim(),
      href:
        entry.querySelector("link")?.getAttribute("href") ||
        entry.querySelector("link")?.textContent ||
        "",
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
      summary:
        entry.querySelector("summary")?.textContent?.trim() ||
        entry.querySelector("description")?.textContent?.trim() ||
        "",
    }))
    .map((item) => {
      let cleanSummary = (item.summary || "").replace(/\s+/g, " ").trim();
      cleanSummary = decodeHtmlEntities(cleanSummary);

      // Lọc summaries không hợp lệ
      if (!isValidNewsSummary(cleanSummary)) {
        cleanSummary = "";
      }

      return {
        ...item,
        href: toAbsoluteNewsUrl(item.href),
        image: toAbsoluteNewsUrl(item.image),
        summary: cleanSummary,
      };
    })
    .filter((item) => item.title && item.href)
    .slice(0, limit);
}

export async function fetchGearVnNews(options = {}) {
  const { limit = 3, timeoutMs = 8000 } = options;

  const fetchWithTimeout = async (url) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { signal: controller.signal });
      return response;
    } finally {
      clearTimeout(id);
    }
  };

  try {
    const atomRes = await fetchWithTimeout(`${NEWS_BASE_URL}.atom`);
    if (atomRes.ok) {
      const atomRaw = await atomRes.text();
      const atomItems = parseGearVnNewsFromAtom(atomRaw, { limit });
      if (atomItems.length) return atomItems;
    }
  } catch {
    // fallback to next source
  }

  try {
    const rssRes = await fetchWithTimeout(`${NEWS_BASE_URL}.rss`);
    if (rssRes.ok) {
      const rssRaw = await rssRes.text();
      const rssItems = parseGearVnNewsFromAtom(rssRaw, { limit });
      if (rssItems.length) return rssItems;
    }
  } catch {
    // fallback to next source
  }

  const htmlRes = await fetchWithTimeout(
    NEWS_PROXY_URL + encodeURIComponent(NEWS_BASE_URL),
  );
  if (!htmlRes.ok) return [];

  const htmlRaw = await htmlRes.text();
  return parseGearVnNewsLinksFromHtml(htmlRaw, { limit });
}
