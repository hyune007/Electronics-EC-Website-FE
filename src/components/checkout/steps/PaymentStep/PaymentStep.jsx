import React, { useState, useEffect } from "react";
import { useCart } from "../../../../contexts/CartContext";

export default function PaymentStep({ shippingInfo, onEditShipping }) {
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const { cart } = useCart();

  const [localShippingInfo, setLocalShippingInfo] = useState(null);
  useEffect(() => {
    if (!shippingInfo) {
      const cached = localStorage.getItem("checkoutShippingInfo");
      if (cached) {
        setLocalShippingInfo(JSON.parse(cached));
      }
    }
  }, [shippingInfo]);

  const info = shippingInfo || localShippingInfo || {};

  const discount = 0;
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const total = subtotal - discount;

  const formatCurrency = (value) => value.toLocaleString("vi-VN") + "đ";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-8 space-y-6">
        <section className="bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                person_outline
              </span>
              Thông tin giao hàng
            </h2>
            <button
              type="button"
              onClick={() => onEditShipping && onEditShipping()}
              className="text-primary text-sm font-medium flex items-center gap-1"
            >
              Thay đổi
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          </div>
          <div className="p-6 space-y-4 text-sm">
            <div className="space-y-1">
              <p className="text-xs text-slate-500 font-semibold">Họ và tên</p>
              <p className="font-medium">{info.fullName || ""}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-500 font-semibold">
                Số điện thoại
              </p>
              <p className="font-medium">{info.phone || ""}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-500 font-semibold">Địa chỉ</p>
              <p className="font-medium leading-relaxed">
                {info.address
                  ? `${info.address.detailAddress}, ${info.address.ward}, ${info.address.city}`
                  : "Chưa chọn địa chỉ"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-500 font-semibold">Ghi chú</p>
              <p className="font-medium whitespace-pre-line">
                {info.note || "Không có ghi chú"}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                payments
              </span>
              Phương thức thanh toán
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {[
              { id: "bank", label: "Chuyển khoản ngân hàng" },
              { id: "cod", label: "Thanh toán khi nhận hàng (COD)" },
              { id: "wallet", label: "Ví điện tử (MoMo / ZaloPay)" },
            ].map((method) => (
              <div
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  paymentMethod === method.id
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === method.id
                        ? "border-primary"
                        : "border-slate-300"
                    }`}
                  >
                    {paymentMethod === method.id && (
                      <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                    )}
                  </div>
                  <span className="font-bold">{method.label}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* RIGHT */}
      <aside className="lg:col-span-4 lg:sticky lg:top-24">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-bold">Chi tiết đơn hàng</h2>
          </div>

          <div className="p-6 space-y-4 border-b max-h-[400px] overflow-y-auto">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold truncate">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Số lượng: {item.quantity}
                  </p>
                  <p className="text-sm font-bold text-primary">
                    {formatCurrency(item.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Tạm tính</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Mã giảm giá</span>
              <span className="text-red-500">-{formatCurrency(discount)}</span>
            </div>

            <div className="flex justify-between font-bold text-lg border-t pt-3">
              <span>Tổng cộng</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>

            <button className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-md font-bold text-lg mt-4 flex items-center justify-center gap-2">
              THANH TOÁN
              <span className="material-symbols-outlined">shield</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
