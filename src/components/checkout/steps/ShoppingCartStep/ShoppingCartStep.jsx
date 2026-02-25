import { useCart } from "../../../../contexts/CartContext";
import { useAuth } from "../../../../hooks/useAuth";
import { useState } from "react";
import NotiAuth from "../../../common/NotiAuth";
import { NavLink } from "react-router-dom";

export default function ShoppingCartStep({ onProceed }) {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const { isAuthenticated, isCustomer } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-8 space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Giỏ hàng của bạn
            <span className="text-slate-400 text-lg font-normal ml-2">
              ({cart.length} sản phẩm)
            </span>
          </h2>
        </div>

        {cart.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-md p-4 flex gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-50 rounded-md overflow-hidden flex-shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col flex-1 justify-between py-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold hover:text-primary cursor-pointer">
                    {item.name}
                  </h3>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-slate-300 hover:text-red-500"
                >
                  <span className="material-symbols-outlined text-xl">
                    delete
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-slate-50">
                  <button
                    onClick={() => handleChangeQty(item.id, item.quantity - 1)}
                    className="w-8 h-8 hover:bg-slate-200 font-bold"
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
                    className="w-8 h-8 hover:bg-slate-200 font-bold"
                  >
                    +
                  </button>
                </div>

                <p className="text-lg font-bold text-primary">
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
        <div className="bg-white rounded-md p-6 shadow-lg border border-slate-100 space-y-6">
          <h2 className="text-lg font-bold border-b pb-4">Tóm tắt đơn hàng</h2>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between text-sm">
              <span>Tạm tính</span>
              <span>{total.toLocaleString()}₫</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Phí vận chuyển (COD)</span>
              <span className="text-green-600 font-medium">Miễn phí</span>
            </div>

            <div className="pt-4 border-t border-dashed flex justify-between items-end">
              <span className="font-bold">Tổng thanh toán</span>
              <div className="text-right">
                <p className="text-2xl font-black text-primary">
                  {total.toLocaleString()}₫
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-md font-bold flex items-center justify-center gap-2"
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
