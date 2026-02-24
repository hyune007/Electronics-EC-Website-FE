import React from "react";
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import ProductTabs from "../../../components/customer/product/ProductTabs/ProductTabs.jsx";
import BreadcrumbNav from "../../../components/customer/product/ProductNav/BreadcrumbNav/BreadcrumbNav.jsx";
import vi from "../../../i18n/vi.js";
import { getProductById } from "../../../services/customer/productService.js";
import { useCart } from "../../../contexts/CartContext";
import { useAuth } from "../../../hooks/useAuth";
import NotiAuth from "../../../components/common/NotiAuth";

export default function ProductDetail() {
  const { addToCart } = useCart();
  const { isAuthenticated, isCustomer } = useAuth();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const imgRef = useRef();
  const handleQuantityChange = (type) => {
    setQuantity((prev) => {
      if (type === "increase") return prev + 1;
      if (type === "decrease") return prev > 1 ? prev - 1 : 1;
      return prev;
    });
  };

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
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await getProductById(id);
        setProduct(res.data);
      } catch (err) {
        setProduct(null);
        console.log("Không tìm thấy sản phẩm", err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <BreadcrumbNav />
        <div className="flex justify-center items-center min-h-[300px]">
          <span>Đang tải thông tin sản phẩm...</span>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <BreadcrumbNav />
        <div className="flex justify-center items-center min-h-[300px]">
          <span>Không tìm thấy sản phẩm.</span>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20">
      <BreadcrumbNav />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="space-y-4">
          <div className="w-full max-w-sm mx-auto aspect-square bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center p-4">
            <img
              ref={imgRef}
              src={`http://localhost:8080${product.image}`}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-[10px] font-bold rounded-full mb-4">
              Mới nhất
            </span>
            <h1 className="text-lg font-bold mb-2">
              {product?.name || "Android is the best"}
            </h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center text-yellow-500">
                <span className="material-symbols-outlined filled">star</span>
                <span className="material-symbols-outlined filled">star</span>
                <span className="material-symbols-outlined filled">star</span>
                <span className="material-symbols-outlined filled">star</span>
                <span className="material-symbols-outlined">star_half</span>
              </div>
              <span className="text-slate-500 text-xs">4.8 (0 Đánh giá)</span>
              <span className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700"></span>
              <span className="text-green-600 dark:text-green-400 text-xs font-semibold">
                Còn hàng
              </span>
            </div>
            <div className="text-base font-bold text-primary dark:text-white mb-2">
              {product?.price || "0"} VNĐ
              <span className="text-[10px] text-slate-400 line-through ml-3 font-normal">
                31,990,000 VNĐ
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl px-2">
                <button
                  onClick={() => handleQuantityChange("decrease")}
                  className="p-0.5 text-slate-500 hover:text-primary"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange("increase")}
                  className="p-0.5 text-slate-500 hover:text-primary"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => {
                  flyToCart();
                  addToCart(product, quantity);
                }}
                className="flex-1 bg-primary text-white py-1 rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined">shopping_cart</span>
                {vi.product.addToCart}
              </button>
            </div>
            <button
              type="button"
              className="w-full py-1 border-2 border-primary text-primary dark:text-white dark:border-white rounded-xl font-bold hover:bg-primary hover:text-white dark:hover:bg-white dark:hover:text-primary transition-all"
              onClick={() => {
                if (!isAuthenticated || !isCustomer) {
                  setShowLoginPrompt(true);
                  return;
                }

                flyToCart();
                addToCart(product, quantity);
              }}
            >
              {vi.product.buyNow}
            </button>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">
                local_shipping
              </span>
              <div className="text-xs">
                <p className="font-bold">{vi.product.shipping.title}</p>
                <p className="text-slate-500">{vi.product.shipping.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">
                verified_user
              </span>
              <div className="text-xs">
                <p className="font-bold">{vi.product.warranty.title}</p>
                <p className="text-slate-500">{vi.product.warranty.subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 dark:border-slate-800 pt-16">
        <ProductTabs />
      </div>
      <NotiAuth
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
    </main>
  );
}
