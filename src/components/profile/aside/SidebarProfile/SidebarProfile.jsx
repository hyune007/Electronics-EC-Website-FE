import { useState, useRef, useEffect } from "react";
import useTheme from "../../../../hooks/useTheme";
import { decodeJwtPayload } from "../../../../utils/jwt";
import { getCustomerById } from "../../../../services/customer/customerService";
export default function Sidebar({
  name = "Nguyễn Trường Huy",
  onSelectView,
  view = "myorder",
}) {
  const [fullName, setFullName] = useState("");
  const { theme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x: null, y: null });
  const dragRef = useRef(null);
  const startRef = useRef({ x: 0, y: 0, origX: 0, origY: 0 });
  const dragMoved = useRef(false);
  const rafRef = useRef(null);
  const nextPosRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    function onMove(e) {
      if (!dragging) return;
      // prevent page scrolling during touch drag
      if (e.touches && e.cancelable) e.preventDefault();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = clientX - startRef.current.x;
      const dy = clientY - startRef.current.y;
      // if user moved enough, mark as drag to avoid click
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) dragMoved.current = true;
      const newX = startRef.current.origX + dx;
      const newY = startRef.current.origY + dy;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // clamp within viewport (keep 12px margin)
      const clampedX = clamp(newX, 12, vw - 12 - 48);
      const clampedY = clamp(newY, 12, vh - 12 - 48);
      // use rAF to batch updates for smoother dragging
      nextPosRef.current = { x: clampedX, y: clampedY };
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          setPos(nextPosRef.current);
          rafRef.current = null;
        });
      }
    }

    function onUp() {
      if (!dragging) return;
      setDragging(false);
      setTimeout(() => (dragMoved.current = false), 50);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [dragging]);

  useEffect(() => {
    const fetchCustomerName = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const decoded = decodeJwtPayload(token);
        const customerId = decoded?.sub;
        if (!customerId) return;

        const cacheKey = `customerInfo_${customerId}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const customer = JSON.parse(cached);
          setFullName(customer?.name || "");
        }

        const freshCustomer = await getCustomerById(customerId);
        setFullName(freshCustomer?.name || "");
        localStorage.setItem(cacheKey, JSON.stringify(freshCustomer));
      } catch (err) {
        console.error(err);
      }
    };

    fetchCustomerName();
  }, []);

  function handleDragStart(e) {
    // open on click still works; dragging starts on mousedown/touchstart
    if (e.type === "mousedown") {
      e.preventDefault();
      startRef.current.x = e.clientX;
      startRef.current.y = e.clientY;
    } else if (e.type === "touchstart") {
      startRef.current.x = e.touches[0].clientX;
      startRef.current.y = e.touches[0].clientY;
    }
    const rect = dragRef.current?.getBoundingClientRect();
    const origX = rect ? rect.left : window.innerWidth - 64;
    const origY = rect ? rect.top : 16;
    startRef.current.origX = origX;
    startRef.current.origY = origY;
    setDragging(true);
  }

  const handleSelect = (view) => (e) => {
    e.preventDefault();
    if (onSelectView) onSelectView(view);
    setMobileOpen(false);
  };

  const AsideContent = (
    <div
      className={`${theme === "dark" ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200"} rounded-2xl shadow-sm border overflow-hidden`}
    >
      <div
        className={`p-6 border-b ${theme === "dark" ? "border-slate-700" : "border-slate-100"} flex items-center gap-3`}
      >
        <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
          <span className="material-symbols-outlined text-black">
            account_circle
          </span>
        </div>
        <div>
          <p className="font-semibold text-sm">{fullName || name}</p>
        </div>
      </div>

      <nav className="p-4 space-y-1">
        <a
          onClick={handleSelect("information")}
          className={`flex items-center gap-3 px-3 py-2 ${view === "information" ? (theme === "dark" ? "bg-[var(--accent-dark)] text-white font-semibold" : "bg-[var(--accent-light)] font-semibold") : theme === "dark" ? "text-slate-200 hover:bg-slate-800 hover:rounded-lg" : "hover:bg-slate-50 hover:rounded-lg"} rounded-lg transition-colors`}
          href="#"
        >
          <span className="material-symbols-outlined text-[20px]">info</span>
          <span
            className={`text-sm ${view === "information" ? "font-semibold" : ""}`}
          >
            Thông tin
          </span>
        </a>
        <a
          onClick={handleSelect("myorder")}
          className={`flex items-center gap-3 px-3 py-2 ${view === "myorder" ? (theme === "dark" ? "bg-[var(--accent-dark)] text-white font-semibold" : "bg-[var(--accent-light)] font-semibold") : theme === "dark" ? "text-slate-200 hover:bg-slate-800 hover:rounded-lg" : "hover:bg-slate-50 hover:rounded-lg"} rounded-lg transition-colors`}
          href="#"
        >
          <span className="material-symbols-outlined text-[20px]">
            package_2
          </span>
          <span
            className={`text-sm ${view === "myorder" ? "font-semibold" : ""}`}
          >
            Đơn hàng của tôi
          </span>
        </a>
        <a
          onClick={handleSelect("address")}
          className={`flex items-center gap-3 px-3 py-2 ${view === "address" ? (theme === "dark" ? "bg-[var(--accent-dark)] text-white font-semibold" : "bg-[var(--accent-light)] font-semibold") : theme === "dark" ? "text-slate-200 hover:bg-slate-800 hover:rounded-lg" : "hover:bg-slate-50 hover:rounded-lg"} rounded-lg transition-colors`}
          href="#"
        >
          <span className="material-symbols-outlined text-[20px]">
            location_on
          </span>
          <span
            className={`text-sm ${view === "address" ? "font-semibold" : ""}`}
          >
            Địa chỉ
          </span>
        </a>
        <a
          onClick={handleSelect("setting")}
          className={`flex items-center gap-3 px-3 py-2 ${view === "setting" ? (theme === "dark" ? "bg-[var(--accent-dark)] text-white font-semibold" : "bg-[var(--accent-light)] font-semibold") : theme === "dark" ? "text-slate-200 hover:bg-slate-800 hover:rounded-lg" : "hover:bg-slate-50 hover:rounded-lg"} rounded-lg transition-colors border-t ${theme === "dark" ? "border-slate-700" : "border-slate-100"} pt-3`}
          href="#"
        >
          <span className="material-symbols-outlined text-[20px]">
            settings
          </span>
          <span
            className={`text-sm ${view === "setting" ? "font-semibold" : ""}`}
          >
            Cài đặt
          </span>
        </a>
        <a
          className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 hover:rounded-lg rounded-lg transition-colors"
          href="#"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="text-sm">Đăng xuất</span>
        </a>
      </nav>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block lg:w-64 shrink-0">{AsideContent}</aside>

      {/* Mobile: compact icon at top-right (draggable) */}
      <button
        aria-label="Open profile menu"
        ref={dragRef}
        onMouseDown={(e) => handleDragStart(e)}
        onTouchStart={(e) => handleDragStart(e)}
        className="md:hidden fixed z-50 w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-primary shadow-sm flex items-center justify-center ring-1 ring-transparent hover:ring-primary/20 transition"
        onClick={(e) => {
          if (dragMoved.current) {
            // user just dragged; ignore this click
            e.preventDefault();
            dragMoved.current = false;
            return;
          }
          setMobileOpen(true);
        }}
        style={
          pos.x != null
            ? { left: pos.x, top: pos.y, right: "auto" }
            : { top: 16, right: 16 }
        }
        title="Kéo để di chuyển"
      >
        <span className="material-symbols-outlined text-xl">
          account_circle
        </span>
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[86vw] max-w-xs bg-white dark:bg-slate-900 p-4 overflow-auto shadow-xl transform transition">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setMobileOpen(false)} className="p-2">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div>{AsideContent}</div>
          </div>
        </div>
      )}
    </>
  );
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
