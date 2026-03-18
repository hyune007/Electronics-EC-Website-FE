import { useEffect, useState } from "react";
import AdsImg from "../../assets/banner/AdsOverlay.jpg";

export default function AdsOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    try {
      const shown = sessionStorage.getItem("ads_overlay_shown");
      if (shown) return undefined;
    } catch (err) {
      void err;
    }

    const show = () => {
      setTimeout(() => {
        if (!cancelled) setOpen(true);
      }, 300);
    };

    if (document.readyState === "complete") {
      show();
      return undefined;
    }

    window.addEventListener("load", show);
    return () => {
      cancelled = true;
      window.removeEventListener("load", show);
    };
  }, []);

  if (!open) return null;

  const handleClose = () => {
    try {
      sessionStorage.setItem("ads_overlay_shown", "1");
    } catch (e) {
      void e;
    }
    setOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-0"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-lg bg-[var(--color-surface)] shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Đóng quảng cáo"
          className="absolute top-2 right-2 z-60 inline-flex items-center justify-center rounded-full bg-black/70 hover:bg-black/80 text-white w-9 h-9 shadow-lg focus:outline-none"
        >
          <span className="text-lg">✕</span>
        </button>
        <div className="w-full h-full rounded-md overflow-hidden bg-gray-100 dark:bg-slate-800 flex items-center justify-center ads-zoom-in">
          <a
            href="https://youtu.be/dQw4w9WgXcQ"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              try {
                sessionStorage.setItem("ads_overlay_shown", "1");
              } catch (e) {
                void e;
              }
            }}
          >
            <img
              src={AdsImg}
              alt="Quảng cáo"
              className="w-full h-full object-contain"
            />
          </a>
        </div>
      </div>
    </div>
  );
}
