import { useEffect } from "react";

export default function useRevealOnScroll(
  options = { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.15 },
) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const els = Array.from(document.querySelectorAll(".reveal-on-scroll"));

    const resolveDelay = (el, index) => {
      const attrDelay = Number(el.getAttribute("data-reveal-delay"));
      if (!Number.isNaN(attrDelay) && attrDelay >= 0) {
        return attrDelay;
      }
      return Math.min(index * 60, 260);
    };

    // Fallback to prevent blank/transparent sections on route back/navigation.
    els.forEach((el, index) => {
      el.style.setProperty("--reveal-delay", `${resolveDelay(el, index)}ms`);
      el.classList.add("in-view");
    });

    if (!window.IntersectionObserver) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const target = entry.target;
        if (entry.isIntersecting) {
          target.classList.add("in-view");
          if (target.hasAttribute("data-reveal-once")) {
            observer.unobserve(target);
          }
        } else {
          if (!target.hasAttribute("data-reveal-once")) {
            target.classList.remove("in-view");
          }
        }
      });
    }, options);

    els.forEach((el) => observer.observe(el));

    return () => {
      els.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [JSON.stringify(options)]);
}
