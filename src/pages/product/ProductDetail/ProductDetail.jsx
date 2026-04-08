import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import ProductTabs from "../../../components/customer/product/ProductTabs/ProductTabs.jsx";
import BreadcrumbNav from "../../../components/customer/product/ProductNav/BreadcrumbNav/BreadcrumbNav.jsx";
import vi from "../../../i18n/vi.js";
import { getProductById } from "../../../services/customer/productService.js";
import { useCart } from "../../../contexts/CartContext";
import { useAuth } from "../../../hooks/useAuth";
import NotiAuth from "../../../components/common/NotiAuth";
import Warning from "../../../components/common/Warning";
import { useProductCache } from "../../../contexts/ProductCacheContext.jsx";

export default function ProductDetail() {
  const { addToCart, cart } = useCart();
  const { isAuthenticated, isCustomer } = useAuth();
  const navigate = useNavigate();
  const { allProducts, loadingAll, prefetchAllProducts } = useProductCache();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviewStats, setReviewStats] = useState({ average: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showStockWarning, setShowStockWarning] = useState(false);
  const imgRef = useRef();

  const stock = Number(product?.stock ?? 0);
  const cartItem = cart.find((item) => String(item.id) === String(product?.id));
  const quantityInCart = cartItem?.quantity || 0;
  const maxAddable = Math.max(stock - quantityInCart, 0);
  const canIncrease = quantity < maxAddable;
  const canAddToCart = maxAddable > 0 && quantity > 0 && quantity <= maxAddable;

  const handleQuantityChange = (type) => {
    setQuantity((prev) => {
      if (type === "increase") {
        if (maxAddable <= 0 || prev >= maxAddable) {
          setShowStockWarning(true);
          return prev;
        }
        return prev < maxAddable ? prev + 1 : prev;
      }
      if (type === "decrease") return prev > 1 ? prev - 1 : 1;
      return prev;
    });
  };

  useEffect(() => {
    if (maxAddable > 0 && quantity > maxAddable) {
      setQuantity(maxAddable);
    }
  }, [maxAddable, quantity]);

  const flyToCart = () => {
    const cartIcon = document.getElementById("cart-icon");
    const productImg = imgRef.current;

    if (!cartIcon || !productImg) return;

    const imgRect = productImg.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    const clone = productImg.cloneNode(true);

    clone.style.position = "fixed";
    clone.style.left = imgRect.left + "px";
    clone.style.top = imgRect.top + "px";
    clone.style.width = imgRect.width + "px";
    clone.style.height = imgRect.height + "px";
    clone.style.transition = "all 0.7s cubic-bezier(0.65,-0.55,0.27,1.55)";
    clone.style.zIndex = 9999;

    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      clone.style.left = cartRect.left + "px";
      clone.style.top = cartRect.top + "px";
      clone.style.width = "20px";
      clone.style.height = "20px";
      clone.style.opacity = "0.5";
    });

    clone.addEventListener("transitionend", () => {
      clone.remove();
    });
  };

  useEffect(() => {
    const warmUp = globalThis.setTimeout(() => {
      prefetchAllProducts().catch(() => {});
    }, 600);

    return () => {
      globalThis.clearTimeout(warmUp);
    };
  }, [prefetchAllProducts]);

  useEffect(() => {
    let mounted = true;

    const cached = () => {
      if (!allProducts) return false;
      const hit = allProducts.find((p) => String(p.id) === String(id));
      if (!hit) return false;
      if (mounted) {
        setProduct(hit);
        setLoading(false);
      }
      return true;
    };

    if (cached()) {
      return () => {
        mounted = false;
      };
    }

    async function loadProduct() {
      setLoading(true);
      try {
        const res = await getProductById(id);
        if (!mounted) return;
        setProduct(res.data);
      } catch (err) {
        if (!mounted) return;
        setProduct(null);
        console.log("Không tìm thấy sản phẩm", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [id, allProducts, loadingAll]);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1200px] px-4 py-5 sm:px-6 lg:px-8">
        <BreadcrumbNav suppressFetch />
        <div className="card-default flex min-h-[280px] items-center justify-center rounded-2xl">
          <span className="text-sm text-[var(--color-text-muted)]">
            Đang tải thông tin sản phẩm...
          </span>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="mx-auto w-full max-w-[1200px] px-4 py-5 sm:px-6 lg:px-8">
        <BreadcrumbNav suppressFetch />
        <div className="card-default flex min-h-[280px] items-center justify-center rounded-2xl">
          <span className="text-sm text-[var(--color-text-muted)]">
            Không tìm thấy sản phẩm.
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-5 pb-16 sm:px-6 lg:px-8 lg:pb-20">
      <BreadcrumbNav product={product} />
      <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="space-y-4">
          <div className="card-default mx-auto flex aspect-square w-full max-w-md items-center justify-center overflow-hidden rounded-[1.6rem] p-5">
            <img
              ref={imgRef}
              src={
                product?.image?.startsWith("http")
                  ? product.image
                  : `http://localhost:8080${product.image || ""}`
                  // : `https://ec-website-be-312564370609.asia-southeast1.run.app${product.image || ""}`
              }
              alt={product.name}
              className="h-full w-full object-contain"
            />
          </div>
        </div>
        <div className="card-default flex flex-col rounded-2xl p-5 sm:p-6">
          <div className="mb-6">
            <span className="badge-default badge-info mb-4 inline-flex">
              Mới nhất
            </span>
            <h1 className="mb-2 text-xl font-bold leading-tight">
              {product?.name || "Android is the best"}
            </h1>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center text-yellow-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`material-symbols-outlined ${
                      star <= Math.round(reviewStats.average) ? "filled" : ""
                    }`}
                  >
                    star
                  </span>
                ))}
              </div>
              <span className="text-xs text-[var(--color-text-muted)]">
                {reviewStats.average.toFixed(1)} ({reviewStats.total} Đánh giá)
              </span>
              <span className="h-4 w-px bg-[var(--color-border)]"></span>
              {product?.stock > 0 ? (
                <span className="text-xs font-semibold text-[var(--color-success)]">
                  Còn hàng
                </span>
              ) : (
                <span className="text-xs font-semibold text-[var(--color-danger)]">
                  Hết hàng
                </span>
              )}
            </div>
            <div className="mb-2 text-xl font-bold text-[var(--color-primary)]">
              {product?.discountedPrice &&
              product.discountedPrice < product.price ? (
                <>
                  {product.discountedPrice.toLocaleString("vi-VN")} VNĐ
                  <span className="ml-3 text-xs font-normal text-[var(--color-text-muted)] line-through">
                    {product.price.toLocaleString("vi-VN")} VNĐ
                  </span>
                </>
              ) : (
                <>{product?.price?.toLocaleString("vi-VN") || "0"} VNĐ</>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3.5">
            <div className="flex gap-2">
              <div className="flex items-center rounded-xl border border-[var(--color-border)] px-2">
                <button
                  onClick={() => handleQuantityChange("decrease")}
                  className="icon-btn p-0.5"
                  aria-label="Giảm số lượng"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange("increase")}
                  className={`icon-btn p-0.5 ${
                    canIncrease ? "" : "text-[var(--color-text-muted)]"
                  }`}
                  aria-label="Tăng số lượng"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  flyToCart();
                  addToCart(product, quantity);
                }}
                disabled={!canAddToCart}
                className={`flex flex-1 items-center justify-center gap-1 rounded-xl py-2 ${
                  canAddToCart
                    ? "btn-primary"
                    : "cursor-not-allowed bg-gray-600 text-white opacity-85"
                }`}
              >
                <span className="material-symbols-outlined">shopping_cart</span>
                {vi.product.addToCart}
              </button>
            </div>
            <button
              type="button"
              className="btn-secondary w-full rounded-xl border-2 py-2 font-bold"
              onClick={() => {
                if (!isAuthenticated || !isCustomer) {
                  setShowLoginPrompt(true);
                  return;
                }

                flyToCart();
                addToCart(product, quantity);
                navigate("/checkout?tab=infor");
              }}
            >
              {vi.product.buyNow}
            </button>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 border-t border-[var(--color-border)] pt-4 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[var(--color-primary)]">
                local_shipping
              </span>
              <div className="text-xs">
                <p className="font-bold">{vi.product.shipping.title}</p>
                <p className="text-[var(--color-text-muted)]">
                  {vi.product.shipping.subtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[var(--color-primary)]">
                verified_user
              </span>
              <div className="text-xs">
                <p className="font-bold">{vi.product.warranty.title}</p>
                <p className="text-[var(--color-text-muted)]">
                  {vi.product.warranty.subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--color-border)] pt-10 sm:pt-12">
        <ProductTabs
          product={product}
          onStatsChange={(stats) =>
            setReviewStats(stats || { average: 0, total: 0 })
          }
          onRequireAuth={() => setShowLoginPrompt(true)}
        />
      </div>
      <NotiAuth
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />

      <Warning
        open={showStockWarning}
        onClose={() => setShowStockWarning(false)}
        title="Thông báo"
        message="Số lượng sản phẩm trong giỏ vượt quá số lượng tồn kho của sản phẩm, thành thật xin lỗi bạn"
        buttonText="Đã hiểu"
      />
    </main>
  );
}
