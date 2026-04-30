import { useState, useRef, useEffect } from "react";
import demoImg from "../../../../assets/demo/demo.jpg";
import { useNavigate } from "react-router-dom";
import { formatVND } from "../../../../utils/priceFormatter";
import "./ProductCard.css";

export default function ProductCard({ product, className = "" }) {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0 });
  const timerRef = useRef(null);
  const pendingPos = useRef({ x: 0, y: 0 });
  const navigate = useNavigate();

  const constrainTooltipPosition = (x, y, width = 300, height = 40) => {
    const margin = 8;
    const viewportWidth = globalThis.innerWidth;
    const viewportHeight = globalThis.innerHeight;

    let finalX = x + 12;
    let finalY = y + 12;

    // Prevent overflow on right edge (mobile-safe)
    if (finalX + width + margin > viewportWidth) {
      finalX = Math.max(margin, x - width - 12);
    }

    // Prevent overflow on bottom edge
    if (finalY + height + margin > viewportHeight) {
      finalY = y - height - 12;
    }

    return { x: Math.max(margin, finalX), y: Math.max(margin, finalY) };
  };

  const handlePointerEnter = (e) => {
    // Skip tooltip on mobile (avoid confusion with touch)
    if (globalThis.innerWidth < 768) return;

    pendingPos.current = { x: e.clientX, y: e.clientY };
    timerRef.current = setTimeout(() => {
      const { x, y } = constrainTooltipPosition(
        pendingPos.current.x,
        pendingPos.current.y,
      );
      setTooltip({
        visible: true,
        x,
        y,
      });
      timerRef.current = null;
    }, 1000);
  };

  const handlePointerMove = (e) => {
    if (globalThis.innerWidth < 768) return;

    pendingPos.current = { x: e.clientX, y: e.clientY };
    setTooltip((t) => {
      if (!t.visible) return t;
      const { x, y } = constrainTooltipPosition(e.clientX, e.clientY);
      return { ...t, x, y };
    });
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
      <div className="card-default overflow-hidden rounded-xl">
        <div className="skeleton-base h-44" />
        <div className="p-4">
          <div className="skeleton-base mb-2 h-3 w-1/3 rounded" />
          <div className="skeleton-base mb-2 h-4 w-3/4 rounded" />
          <div className="skeleton-base mb-3 h-3 w-1/2 rounded" />
          <div className="skeleton-base h-8 w-full rounded" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative h-full cursor-pointer ${className}`}
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
            background: "var(--color-surface)",
            color: "var(--color-text)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-sm)",
            padding: "7px 10px",
            borderRadius: 8,
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
        className="product-card-shine card-default group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border"
      >
        <div className="relative h-44 overflow-hidden bg-[var(--color-surface)]">
          <img
            alt={product?.name || "product"}
            className="h-full w-full object-contain py-2 transition-transform duration-220 ease-standard group-hover:scale-[1.02]"
            src={
              product?.image ? `http://localhost:8080${product.image}` : demoImg
              // product?.image
              //   ? `https://ec-website-be-312564370609.asia-southeast1.run.app${product.image}`
              //   : demoImg
            }
          />
        </div>

        <div className="product-card-body p-4 flex flex-col flex-1">
          <p className="mb-1 min-h-[1rem] text-xs font-semibold uppercase text-[var(--color-text-muted)] dark:text-[var(--color-text)]">
            {product.brand?.name || ""}
          </p>

          <h4 className="mb-1 min-h-[2.5rem] line-clamp-2 text-sm font-semibold text-[var(--color-text)]">
            {product?.name}
          </h4>

          <div className="mb-3">
            {product?.discountedPrice < product?.price ? (
              <div className="price-box">
                <div className="price-box-inner">
                  <div className="price-new">
                    {formatVND(product.discountedPrice)}
                  </div>
                  <div className="price-old">{formatVND(product.price)}</div>
                </div>
                <div className="price-percent">
                  -
                  {product.price
                    ? Math.round(
                        ((product.price - product.discountedPrice) /
                          product.price) *
                          100,
                      )
                    : 0}
                  %
                </div>
              </div>
            ) : (
              <span className="text-sm font-bold text-[var(--color-primary)] dark:text-[var(--color-text)]">
                {formatVND(product?.price)}
              </span>
            )}
          </div>

          <button className="btn-secondary mt-auto w-full py-2 text-xs group-hover:bg-[var(--color-primary)] group-hover:text-white dark:text-[var(--color-text)]">
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}
