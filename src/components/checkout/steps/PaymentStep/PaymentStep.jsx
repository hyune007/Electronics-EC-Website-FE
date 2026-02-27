import React, { useState, useEffect } from "react";
import { useCart } from "../../../../contexts/CartContext";
import { decodeJwtPayload } from "../../../../utils/jwt";
import { createBill, updateBill } from "../../../../services/billService";
import {
  createSePaySession,
  getSePayStatus,
} from "../../../../services/paymentService";

export default function PaymentStep({
  shippingInfo,
  onEditShipping,
  onComplete,
}) {
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const { cart, clearCart } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [billId, setBillId] = useState(null);
  const [sepaySession, setSepaySession] = useState(null);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState("");
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [pollingEnabled, setPollingEnabled] = useState(true);

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

  useEffect(() => {
    setSepaySession(null);
    setBillId(null);
    setPaid(false);
    setError("");
    setShowPaymentPopup(false);
    setPollingEnabled(true);
  }, [paymentMethod]);

  const handlePay = async () => {
    setError("");
    if (!info?.address?.id) {
      setError("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    const token = localStorage.getItem("authToken");
    const customerId = token ? decodeJwtPayload(token)?.sub : null;
    if (!customerId) {
      setError("Vui lòng đăng nhập lại");
      return;
    }

    const paymentMethodValue =
      paymentMethod === "bank" ? "Chuyển khoản ngân hàng" : "COD";

    setIsSubmitting(true);
    try {
      const billRes = await createBill({
        customerId,
        employeeId: null,
        addressId: info.address.id,
        paymentMethod: paymentMethodValue,
      });

      const bill = billRes.data;
      setBillId(bill.id);

      if (paymentMethod === "cod") {
        clearCart();
        onComplete?.();
        return;
      }

      const sessionRes = await createSePaySession(bill.id);
      setSepaySession(sessionRes.data);
      setShowPaymentPopup(true);
      setPollingEnabled(true);
    } catch {
      setError("Không thể tạo đơn hàng. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelPayment = async () => {
    setShowPaymentPopup(false);
    setPollingEnabled(false);

    if (!billId) {
      setSepaySession(null);
      setBillId(null);
      return;
    }

    try {
      await updateBill(billId, "Đơn đã hủy");
      setSepaySession(null);
      setBillId(null);
    } catch {
      setError("Không thể hủy đơn hàng. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    if (!billId || paymentMethod !== "bank" || !pollingEnabled) return;

    const timer = setInterval(async () => {
      try {
        const res = await getSePayStatus(billId);
        if (res.data?.paid) {
          setPaid(true);
          setPollingEnabled(false);
          clearInterval(timer);
          clearCart();
          onComplete?.();
        }
      } catch {
        // ignore
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [billId, paymentMethod, clearCart, onComplete]);

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
              { id: "bank", label: "Chuyển khoản ngân hàng/ Ví điện tử" },
              { id: "cod", label: "Thanh toán khi nhận hàng (COD)" },
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

      {/* đơn hàng */}
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

            <div className="flex justify-between font-bold text-lg border-t pt-3">
              <span>Tổng cộng</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>

            <button
              type="button"
              onClick={handlePay}
              disabled={
                isSubmitting ||
                (paymentMethod === "bank" && sepaySession && !paid)
              }
              className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-md font-bold text-lg mt-4 flex items-center justify-center gap-2"
            >
              {isSubmitting ? "ĐANG XỬ LÝ..." : "THANH TOÁN"}
              <span className="material-symbols-outlined">shield</span>
            </button>

            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          </div>
        </div>
      </aside>

      {showPaymentPopup && paymentMethod === "bank" && sepaySession && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold">Thanh toán chuyển khoản</h3>
              <button
                type="button"
                onClick={handleCancelPayment}
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                Hủy
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col items-center justify-center">
                <img
                  src={sepaySession.qrUrl}
                  alt="SePay QR"
                  className="w-64 h-64 object-contain"
                />
        <div
          className={`mt-3 text-sm font-semibold ${
            paid ? "text-green-600" : "text-amber-600"
          }`}
        >
          {paid ? "Đã thanh toán" : "Chờ thanh toán..."}
        </div>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold">Tên ngân hàng:</span> MB Bank
                </div>
                <div>
                  <span className="font-semibold">Tên người nhận:</span> Nguyễn Trường Huy
                </div>
                <div>
                  <span className="font-semibold">Số tài khoản:</span> 0349044264
                </div>
                <div>
                  <span className="font-semibold">Số tiền:</span>{" "}
                  {formatCurrency(Number(sepaySession.amount))}
                </div>
                <div>
                  <span className="font-semibold">Nội dung CK:</span>{" "}
                  {sepaySession.description}
                </div>
                <div className="text-xs text-slate-500">
                  Giữ nguyên nội dung để hệ thống tự xác nhận.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
