import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { createPortal } from "react-dom";
import { getBillDetails } from "../../../services/customer/billDetailServiceCustomer";
import { formatVND } from "../../../utils/priceFormatter";
import Warning from "../../common/Warning";

export default function OrderDetailModal({ open, onClose, orderId, order }) {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState(null);
  const [isReturnMode, setIsReturnMode] = useState(false);
  const [selectedReturnItems, setSelectedReturnItems] = useState([]);
  const [returnReason, setReturnReason] = useState("");
  const [showReturnNotice, setShowReturnNotice] = useState(false);

  const navyDark = "var(--color-navy-light)";

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    const fetch = async () => {
      try {
        setLoading(true);
        const id = orderId || order?.id;
        if (!id) {
          setPayload(null);
          return;
        }
        const resp = await getBillDetails(id);
        const data = resp?.data ?? resp;
        if (!mounted) return;
        setPayload(data);
      } catch (err) {
        console.error("Failed to load bill details", err);
        if (mounted) setPayload(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => {
      mounted = false;
    };
  }, [open, orderId, order]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const getStatusBadge = (s) => {
    const key = String(s || "").toLowerCase();
    const base =
      "px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight";
    if (key.includes("trả") || key.includes("return")) {
      return <span className={base + " bg-slate-200 text-slate-700"}>{s}</span>;
    }
    if (
      key.includes("chờ") ||
      key.includes("pending") ||
      key.includes("waiting_shipping")
    ) {
      return (
        <span className={base + " bg-yellow-100 text-yellow-800"}>{s}</span>
      );
    }
    if (key.includes("đang giao") || key.includes("shipping")) {
      return <span className={base + " bg-blue-100 text-blue-800"}>{s}</span>;
    }
    if (key.includes("đã giao") || key.includes("delivered")) {
      return <span className={base + " bg-green-100 text-green-800"}>{s}</span>;
    }
    if (
      key.includes("hủy") ||
      key.includes("cancel") ||
      key.includes("canceled")
    )
      return <span className={base + " bg-red-100 text-red-800"}>{s}</span>;
    return (
      <span
        className={
          base +
          " bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100"
        }
      >
        {s}
      </span>
    );
  };

  const items = ((p) => {
    if (!p) return [];
    if (Array.isArray(p)) return p;
    return p.data || p.items || p.details || p.products || [];
  })(payload);

  const shippingCost = Number(order?.shippingFee ?? payload?.ship_fee ?? 0);
  const itemsTotal = items.reduce(
    (sum, it) =>
      sum +
      Number(
        it?.subtotal ??
          it?.total ??
          Number(it?.price || 0) * Number(it?.quantity || 1),
      ),
    0,
  );
  const totalAmount = Number(
    order?.totalAmount ?? order?.total_amount ?? itemsTotal + shippingCost,
  );

  const formatAddress = (addr) => {
    if (!addr) return "-";
    if (typeof addr === "string") return addr;
    const detail = addr.detailAddress || addr.detail_address || "";
    const ward =
      typeof addr.ward === "string" ? addr.ward : addr.ward?.name || "";
    const district =
      typeof addr.district === "string"
        ? addr.district
        : addr.district?.name || "";
    const city =
      typeof addr.city === "string" ? addr.city : addr.city?.name || "";
    return [detail, ward, district, city].filter(Boolean).join(", ") || "-";
  };

  const status = payload?.status || order?.status || "Đang xử lý";
  const normalizedStatus = String(status).toLowerCase();
  const isDeliveredOrder =
    normalizedStatus.includes("đã giao") ||
    normalizedStatus.includes("delivered");

  const itemKeyOf = (it, idx) => String(it?.id ?? it?.product?.id ?? idx);
  const allItemKeys = items.map((it, idx) => itemKeyOf(it, idx));
  const isAllSelected =
    allItemKeys.length > 0 && selectedReturnItems.length === allItemKeys.length;

  const toggleReturnItem = (itemKey) => {
    setSelectedReturnItems((prev) =>
      prev.includes(itemKey)
        ? prev.filter((id) => id !== itemKey)
        : [...prev, itemKey],
    );
  };

  const toggleSelectAll = () => {
    setSelectedReturnItems((prev) =>
      prev.length === allItemKeys.length ? [] : allItemKeys,
    );
  };

  const openReturnMode = () => {
    setIsReturnMode(true);
    setSelectedReturnItems([]);
    setReturnReason("");
  };

  const cancelReturnMode = () => {
    setIsReturnMode(false);
    setSelectedReturnItems([]);
    setReturnReason("");
  };

  const confirmReturnRequest = () => {
    if (selectedReturnItems.length === 0 || !returnReason.trim()) return;

    // UI flow only: return API is not wired yet.
    console.log("Return request", {
      orderId: orderId || order?.id,
      itemIds: selectedReturnItems,
      reason: returnReason.trim(),
    });

    cancelReturnMode();
    setShowReturnNotice(true);
  };

  const renderItemsBody = () => {
    if (loading) {
      return (
        <tr>
          <td
            colSpan={isReturnMode ? 5 : 4}
            className="py-10 text-center text-slate-400 animate-pulse uppercase text-xs tracking-widest"
          >
            Đang tải dữ liệu...
          </td>
        </tr>
      );
    }

    if (items.length === 0) {
      return (
        <tr>
          <td
            colSpan={isReturnMode ? 5 : 4}
            className="py-10 text-center text-slate-400 italic"
          >
            Danh sách trống
          </td>
        </tr>
      );
    }

    return items.map((it, idx) => {
      const qty = Number(it?.quantity ?? it?.qty ?? 1);
      const price = Number(it?.price ?? it?.unit_price ?? 0);
      const subtotal = Number(it?.subtotal ?? price * qty);
      const itemKey = itemKeyOf(it, idx);
      const imagePath = it?.image || it?.product?.image || "";

      let imageUrl = null;
      if (imagePath) {
        imageUrl = imagePath.startsWith("http")
          ? imagePath
          : `https://ec-website-be-312564370609.asia-southeast1.run.app${imagePath}`;
      }

      return (
        <tr
          key={itemKey}
          className="group transition-colors duration-220 ease-standard hover:bg-[var(--color-muted)]"
        >
          {isReturnMode && (
            <td className="py-4 pl-1">
              <input
                type="checkbox"
                checked={selectedReturnItems.includes(itemKey)}
                onChange={() => toggleReturnItem(itemKey)}
                className="h-4 w-4 accent-[var(--color-primary)]"
              />
            </td>
          )}

          <td className="py-4 pl-1">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded border border-[var(--color-border)] bg-[var(--color-muted)]">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="product"
                    className="h-full w-full object-cover transition-transform duration-220 ease-standard group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-400 font-bold uppercase">
                    No Pic
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                  {it?.name || it?.productName || "Sản phẩm"}
                </span>
                <span className="text-[9px] text-slate-400 uppercase tracking-tighter">
                  SKU: {itemKey}
                </span>
              </div>
            </div>
          </td>
          <td className="py-4 text-center">
            <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-bold text-slate-600 dark:text-slate-300">
              {qty}
            </span>
          </td>
          <td className="py-4 text-right text-xs font-medium text-[var(--color-text-muted)]">
            {formatVND(price)}
          </td>
          <td className="py-4 text-right pr-1">
            <span className="font-semibold text-[var(--color-text)]">
              {formatVND(subtotal)}
            </span>
          </td>
        </tr>
      );
    });
  };

  return createPortal(
    <div
      style={{ zIndex: 2147483650 }}
      className="fixed inset-0 flex items-center justify-center p-4 font-sans"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng chi tiết đơn hàng"
        className="fixed inset-0 bg-[var(--color-overlay)]"
        style={{ zIndex: 2147483649, border: "none", padding: 0, margin: 0 }}
      />
      <div
        style={{ zIndex: 2147483650 }}
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg"
      >
        <div
          style={{ backgroundColor: navyDark }}
          className="flex items-center justify-between p-5"
        >
          <div>
            <h3 className="text-xl font-semibold text-slate-100">
              Chi tiết đơn hàng
            </h3>
            <p className="text-xs font-medium text-slate-300 mt-1 uppercase tracking-wider">
              Mã:{" "}
              <span className="font-bold text-slate-100">
                {orderId || order?.id}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 text-white transition-all duration-220 ease-standard hover:bg-white/20"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="space-y-8 overflow-y-auto bg-[var(--color-surface)] p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2 border-l-4 border-slate-900 dark:border-slate-400 pl-3">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-xs tracking-widest">
                  Thông tin giao hàng
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-md border border-[var(--color-border)] bg-[var(--color-muted)] p-5">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Người nhận
                  </div>
                  <div className="font-semibold text-[var(--color-text)]">
                    {order?.customer?.name || "-"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Điện thoại
                  </div>
                  <div className="font-semibold text-[var(--color-text)]">
                    {order?.customer?.phone || order?.phone || "-"}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Địa chỉ
                  </div>
                  <div className="text-sm leading-relaxed text-[var(--color-text-muted)]">
                    {formatAddress(order?.address)}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div
                style={{ backgroundColor: navyDark }}
                className="rounded-md p-5 text-white shadow-lg border border-transparent"
              >
                <div className="text-[10px] uppercase font-bold opacity-70">
                  Tổng thanh toán
                </div>
                <div className="text-3xl font-black mt-2 text-white">
                  {formatVND(totalAmount)}
                </div>
                <div className="mt-5 pt-3 border-t border-white/10 flex justify-between items-center text-sm">
                  <span className="opacity-70 text-xs">Phí giao:</span>
                  <span className="font-semibold text-xs">
                    {formatVND(shippingCost)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
                <span className="text-xs font-bold uppercase text-[var(--color-text-muted)]">
                  Trạng thái
                </span>
                {getStatusBadge(status)}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 border-l-4 border-slate-900 dark:border-slate-400 pl-3">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-xs tracking-widest">
                Sản phẩm đã chọn
              </h4>

              {isDeliveredOrder && !isReturnMode && items.length > 0 && (
                <button
                  type="button"
                  onClick={openReturnMode}
                  className="rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Trả hàng
                </button>
              )}
            </div>

            {isReturnMode && (
              <label className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text)]">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 accent-[var(--color-primary)]"
                />
                <span>Chọn tất cả</span>
              </label>
            )}

            <div className="bg-white dark:bg-slate-800 overflow-hidden">
              <table className="w-full text-left border-none">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-[10px] font-bold uppercase text-[var(--color-text-muted)]">
                    {isReturnMode && <th className="pb-3 pl-1 w-10">Chọn</th>}
                    <th className="pb-3 pl-1 font-bold">Sản phẩm</th>
                    <th className="pb-3 text-center">SL</th>
                    <th className="pb-3 text-right">Đơn giá</th>
                    <th className="pb-3 text-right pr-1">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {renderItemsBody()}
                </tbody>
              </table>
            </div>

            {isReturnMode && (
              <div className="space-y-3 rounded-md border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
                <div className="text-sm font-medium text-[var(--color-text)]">
                  Đã chọn {selectedReturnItems.length} sản phẩm để trả hàng
                </div>

                <div>
                  <label
                    htmlFor="return-reason"
                    className="mb-1 block text-sm font-medium text-[var(--color-text)]"
                  >
                    Lý do trả hàng
                  </label>
                  <textarea
                    id="return-reason"
                    rows={3}
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="Vui lòng nhập lý do trả hàng..."
                    className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={cancelReturnMode}
                    className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={confirmReturnRequest}
                    disabled={
                      selectedReturnItems.length === 0 || !returnReason.trim()
                    }
                    className="rounded-md bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Xác nhận trả hàng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Warning
        open={showReturnNotice}
        onClose={() => setShowReturnNotice(false)}
        title="Đã ghi nhận yêu cầu"
        message="Yêu cầu trả hàng của bạn đã được ghi nhận. Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất."
        buttonText="Đã hiểu"
      />
    </div>,
    document.body,
  );
}

OrderDetailModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  orderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  order: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
    shippingFee: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    totalAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    total_amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    phone: PropTypes.string,
    customer: PropTypes.shape({
      name: PropTypes.string,
      phone: PropTypes.string,
    }),
    address: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        detailAddress: PropTypes.string,
        detail_address: PropTypes.string,
        ward: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.shape({ name: PropTypes.string }),
        ]),
        district: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.shape({ name: PropTypes.string }),
        ]),
        city: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.shape({ name: PropTypes.string }),
        ]),
      }),
    ]),
  }),
};
