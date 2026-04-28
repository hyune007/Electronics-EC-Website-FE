import { useEffect } from "react";

const DEFAULT_REVEAL_OPTIONS = Object.freeze({
  root: null,
  rootMargin: "0px 0px -18% 0px",
  threshold: 0.22,
});

function resolveDelay(el, index) {
  const attrDelay = Number(el.dataset.revealDelay);
  if (!Number.isNaN(attrDelay) && attrDelay >= 0) {
    return attrDelay;
  }
  return Math.min(index * 60, 260);
}

function isRevealOnce(el) {
  return el.dataset.revealOnce === "true";
}

export default function useRevealOnScroll(options = DEFAULT_REVEAL_OPTIONS) {
  useEffect(() => {
    if (globalThis.window === undefined) return;

    const els = Array.from(document.querySelectorAll(".reveal-on-scroll"));
    if (els.length === 0) return;

    els.forEach((el, index) => {
      el.style.setProperty("--reveal-delay", `${resolveDelay(el, index)}ms`);
      el.dataset.revealSeen = "false";
      el.classList.remove("in-view");
    });

    const shouldRevealAll =
      globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in globalThis);

    if (shouldRevealAll) {
      els.forEach((el) => el.classList.add("in-view"));
      return;
    }

    const mergedOptions = { ...DEFAULT_REVEAL_OPTIONS, ...options };

    const observer = new globalThis.IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const target = entry.target;
        const revealOnce = isRevealOnce(target);

        if (entry.isIntersecting) {
          if (target.dataset.revealSeen === "true") {
            target.style.setProperty("--reveal-delay", "0ms");
          }
          target.classList.add("in-view");
          target.dataset.revealSeen = "true";

          if (revealOnce) {
            observer.unobserve(target);
          }
          return;
        }

        if (!revealOnce) {
          target.classList.remove("in-view");
        }
      });
    }, mergedOptions);

    els.forEach((el) => observer.observe(el));

    return () => {
      els.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [options]);
}
