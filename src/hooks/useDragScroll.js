import { useRef, useEffect } from "react";

export default function useDragScroll() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onDown = (e) => {
      isDown = true;
      el.classList.add("dragging");
      startX = e.pageX ?? (e.touches && e.touches[0].pageX) ?? 0;
      scrollLeft = el.scrollLeft;
      e.preventDefault();
    };
    const onMove = (e) => {
      if (!isDown) return;
      const x = e.pageX ?? (e.touches && e.touches[0].pageX) ?? 0;
      const walk = startX - x;
      el.scrollLeft = scrollLeft + walk;
    };
    const onUp = () => {
      isDown = false;
      el.classList.remove("dragging");
    };

    el.addEventListener("mousedown", onDown);
    el.addEventListener("touchstart", onDown, { passive: false });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);

    return () => {
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("touchstart", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, []);
  return ref;
}
