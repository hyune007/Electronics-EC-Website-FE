import { useCart } from "../../../../contexts/CartContext";
import { useAuth } from "../../../../hooks/useAuth";
import { useState } from "react";
import NotiAuth from "../../../common/NotiAuth";
import { NavLink } from "react-router-dom";

export default function ShoppingCartStep({ onProceed }) {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const { isAuthenticated, isCustomer } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // const vat = Math.round(subtotal * 0.1);
  // const total = subtotal + vat;
  const handleChangeQty = (id, newQty) => {
    updateQuantity(id, newQty);
  };

  const handleDelete = (id) => {
    removeFromCart(id);
  };

  const handleProceed = () => {
    if (!isAuthenticated || !isCustomer) {
      setShowLoginPrompt(true);
      return;
    }
    onProceed?.();
  };

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-8">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Giỏ hàng của bạn
            <span className="ml-2 text-lg font-normal text-[var(--color-text-muted)]">
              ({cart.length} sản phẩm)
            </span>
          </h2>
        </div>

        {cart.map((item) => (
          <div
            key={item.id}
            className="card-default flex gap-4 rounded-xl border p-4"
          >
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--color-muted)] md:h-32 md:w-32">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col flex-1 justify-between py-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="cursor-pointer text-base font-bold motion-default hover:text-[var(--color-primary)]">
                    {item.name}
                  </h3>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="icon-btn text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
                  aria-label="Xóa sản phẩm khỏi giỏ hàng"
                >
                  <span className="material-symbols-outlined text-xl">
                    delete
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]">
                  <button
                    onClick={() => handleChangeQty(item.id, item.quantity - 1)}
                    className="h-8 w-8 font-bold motion-default hover:bg-[var(--color-border)]"
                    aria-label="Giảm số lượng"
                  >
                    -
                  </button>

                  <input
                    type="number"
                    value={item.quantity}
                    readOnly
                    className="w-10 h-8 bg-transparent text-center font-semibold"
                  />

                  <button
                    onClick={() => handleChangeQty(item.id, item.quantity + 1)}
                    className="h-8 w-8 font-bold motion-default hover:bg-[var(--color-border)]"
                    aria-label="Tăng số lượng"
                  >
                    +
                  </button>
                </div>

                <p className="text-lg font-bold text-[var(--color-primary)]">
                  {(item.price * item.quantity).toLocaleString()}₫
                </p>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-4">
          <NavLink
            to="/products"
            className="flex items-center gap-2 text-primary font-bold text-sm"
          >
            <span className="material-symbols-outlined text-lg">
              arrow_back
            </span>
            Quay lại mua sắm sản phẩm khác
          </NavLink>
        </div>
      </div>

      <aside className="lg:col-span-4 sticky top-24">
        <div className="card-default space-y-6 rounded-xl p-6">
          <h2 className="border-b border-[var(--color-border)] pb-4 text-lg font-bold">
            Tóm tắt đơn hàng
          </h2>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between font-bold">
              <span>Tạm tính</span>
              <p className="text-xl font-black">{total.toLocaleString()}₫</p>
            </div>
          </div>

          <button
            type="button"
            className="btn-primary w-full justify-center gap-2 rounded-md py-4"
            onClick={handleProceed}
          >
            Tiến hành đặt hàng
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </aside>

      <NotiAuth
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
    </div>
  );
}
