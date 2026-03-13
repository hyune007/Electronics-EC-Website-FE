import { useState, useRef, useEffect } from "react";
import demoImg from "../../../../assets/demo/demo.jpg";
import { useNavigate } from "react-router-dom";
import { formatVND } from "../../../../utils/priceFormatter";

export default function ProductCard({ product }) {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0 });
  const timerRef = useRef(null);
  const pendingPos = useRef({ x: 0, y: 0 });
  const navigate = useNavigate();

  const handlePointerEnter = (e) => {
    pendingPos.current = { x: e.clientX, y: e.clientY };
    timerRef.current = setTimeout(() => {
      setTooltip({
        visible: true,
        x: pendingPos.current.x + 12,
        y: pendingPos.current.y + 12,
      });
      timerRef.current = null;
    }, 1000);
  };

  const handlePointerMove = (e) => {
    pendingPos.current = { x: e.clientX, y: e.clientY };
    setTooltip((t) =>
      t.visible ? { ...t, x: e.clientX + 12, y: e.clientY + 12 } : t,
    );
  };

  const handlePointerLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setTooltip({ visible: false, x: 0, y: 0 });
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!product) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-primary/40 dark:border-primary/30">
        <div className="h-44 bg-gray-50 dark:bg-gray-800 animate-pulse" />
        <div className="p-4">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3 animate-pulse" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="cursor-pointer relative"
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {product.description && tooltip.visible && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y,
            background: "rgba(0,0,0,0.85)",
            color: "#fff",
            padding: "6px 8px",
            borderRadius: 6,
            fontSize: 12,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 300,
            zIndex: 9999,
          }}
        >
          {product.description}
        </div>
      )}

      <div
        onClick={() => navigate(`/product-detail/${product.id}`)}
        className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden
          border border-primary/80 dark:border-primary/60 hover:border-primary hover:border-2
          group flex flex-col
          transition-transform duration-300 hover:scale-105 hover:shadow-lg"
      >
        <div className="h-44 bg-white relative overflow-hidden">
          <img
            alt={product?.name || "product"}
            className="w-full h-full py-2 object-contain
                 group-hover:scale-105 transition-transform duration-300"
            src={
              // product?.image ? `http://localhost:8080${product.image}` : demoImg
              product?.image
                ? `https://ec-website-be-312564370609.asia-southeast1.run.app${product.image}`
                : demoImg
            }
          />
        </div>

        <div className="p-4 flex flex-col flex-1">
          <p className="text-xs text-gray-400 dark:text-slate-300 uppercase font-semibold mb-1 min-h-[1rem]">
            {product.brand?.name || ""}
          </p>

          <h4 className="font-bold text-sm mb-1 line-clamp-2 min-h-[2.5rem] dark:text-text-light">
            {product?.name}
          </h4>

          <div className="flex items-center gap-2 mb-3">
            {product?.discountedPrice < product?.price ? (
              <>
                <span className="text-text-light font-black text-sm">
                  {formatVND(product.discountedPrice)}
                </span>

                <span className="text-xs text-gray-400 line-through">
                  {formatVND(product.price)}
                </span>
              </>
            ) : (
              <span className="text-text-light font-black text-sm">
                {formatVND(product?.price)}
              </span>
            )}
          </div>

          <button
            className="mt-auto w-full py-2 bg-gray-100 dark:bg-slate-800
             group-hover:bg-primary group-hover:text-white
             text-gray-700 dark:text-slate-100
             text-xs font-semibold rounded transition-colors"
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}
