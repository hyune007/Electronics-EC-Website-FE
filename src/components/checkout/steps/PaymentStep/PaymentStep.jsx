import React, { useState, useEffect } from "react";
import { useCart } from "../../../../contexts/CartContext";
import { decodeJwtPayload } from "../../../../utils/jwt";
import {
  createBill,
  updateBill,
  getShippingFee,
} from "../../../../services/billService";
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
  const [shippingFee, setShippingFee] = useState(0);
  const [customerId, setCustomerId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const id = token ? decodeJwtPayload(token)?.sub : null;
    if (!id) return;

    setCustomerId(id);

    if (!shippingInfo) {
      const cached = localStorage.getItem("checkoutShippingInfo");
      if (cached) {
        setLocalShippingInfo(JSON.parse(cached));
      }
    }
  }, [shippingInfo]);

  const info = shippingInfo || localShippingInfo || {};

  useEffect(() => {
    if (!info?.address?.id || !customerId) return;

    const fetchShippingFee = async () => {
      try {
        const res = await getShippingFee(customerId, info.address.id);
        setShippingFee(res.data);
      } catch {
        setShippingFee(0);
      }
    };

    fetchShippingFee();
  }, [info?.address?.id, customerId]);

  const discount = 0;
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const total = subtotal - discount + shippingFee;

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
      // Lưu orderId và full bill vào sessionStorage để CompleteStep lấy
      sessionStorage.setItem("lastOrderId", bill.id);
      try {
        sessionStorage.setItem("lastOrder", JSON.stringify(bill));
      } catch {}

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
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <section className="card-default overflow-hidden rounded-xl">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--color-primary)]">
                person_outline
              </span>
              Thông tin giao hàng
            </h2>
            <button
              type="button"
              onClick={() => onEditShipping && onEditShipping()}
              className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] motion-default hover:opacity-80"
            >
              Thay đổi
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          </div>
          <div className="p-6 space-y-4 text-sm">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[var(--color-text-muted)]">
                Họ và tên
              </p>
              <p className="font-medium">{info.fullName || ""}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-[var(--color-text-muted)]">
                Số điện thoại
              </p>
              <p className="font-medium">{info.phone || ""}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-[var(--color-text-muted)]">
                Địa chỉ
              </p>
              <p className="font-medium leading-relaxed">
                {info.address
                  ? `${info.address.detailAddress}, ${info.address.ward}, ${info.address.district}, ${info.address.city}`
                  : "Chưa chọn địa chỉ"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-[var(--color-text-muted)]">
                Ghi chú
              </p>
              <p className="font-medium whitespace-pre-line">
                {info.note || "Không có ghi chú"}
              </p>
            </div>
          </div>
        </section>

        <section className="card-default overflow-hidden rounded-xl">
          <div className="border-b border-[var(--color-border)] px-6 py-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--color-primary)]">
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
                className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-220 ease-standard ${
                  paymentMethod === method.id
                    ? "border-[var(--color-primary)] bg-[color-mix(in_oklab,var(--color-primary)_8%,white)]"
                    : "border-[var(--color-border)] hover:bg-[var(--color-muted)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      paymentMethod === method.id
                        ? "border-[var(--color-primary)]"
                        : "border-[var(--color-border)]"
                    }`}
                  >
                    {paymentMethod === method.id && (
                      <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]"></div>
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
        <div className="card-default rounded-xl">
          <div className="border-b border-[var(--color-border)] px-6 py-4">
            <h2 className="text-lg font-bold">Chi tiết đơn hàng</h2>
          </div>

          <div className="max-h-[400px] space-y-4 overflow-y-auto border-b border-[var(--color-border)] p-6">
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
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Số lượng: {item.quantity}
                  </p>
                  <p className="text-sm font-bold text-[var(--color-primary)]">
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
              <span>Phí vận chuyển</span>
              <span>{formatCurrency(shippingFee)}</span>
            </div>

            <div className="flex justify-between border-t border-[var(--color-border)] pt-3 text-lg font-bold">
              <span>Tổng cộng</span>
              <span className="text-[var(--color-primary)]">
                {formatCurrency(total)}
              </span>
            </div>

            <button
              type="button"
              onClick={handlePay}
              disabled={
                isSubmitting ||
                (paymentMethod === "bank" && sepaySession && !paid)
              }
              className="btn-primary mt-4 flex w-full items-center justify-center gap-2 rounded-md py-4 text-lg"
            >
              {isSubmitting ? "ĐANG XỬ LÝ..." : "THANH TOÁN"}
              <span className="material-symbols-outlined">shield</span>
            </button>

            {error && (
              <p className="mt-3 text-sm text-[var(--color-danger)]">{error}</p>
            )}
          </div>
        </div>
      </aside>

      {showPaymentPopup && paymentMethod === "bank" && sepaySession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-overlay)] px-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
              <h3 className="text-lg font-bold">Thanh toán chuyển khoản</h3>
              <button
                type="button"
                onClick={handleCancelPayment}
                className="font-semibold text-[var(--color-danger)] motion-default hover:opacity-80"
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
                  <span className="font-semibold">Tên người nhận:</span> Nguyễn
                  Trường Huy
                </div>
                <div>
                  <span className="font-semibold">Số tài khoản:</span>{" "}
                  0349044264
                </div>
                <div>
                  <span className="font-semibold">Số tiền:</span>{" "}
                  {formatCurrency(Number(sepaySession.amount))}
                </div>
                <div>
                  <span className="font-semibold">Nội dung CK:</span>{" "}
                  {sepaySession.description}
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">
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
