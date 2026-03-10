export default function OrderDetailModal({
  open,
  onClose,
  orderDetails,
  loading,
}) {
  if (!open) return null;

  const items = Array.isArray(orderDetails?.items) ? orderDetails.items : [];
  const order = orderDetails?.order || {};

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="rounded-lg w-full max-w-2xl p-6 border bg-white dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Chi tiết đơn {order?.order_id}
          </h3>
          <button onClick={onClose} className="px-3 py-1 rounded-md border">
            Đóng
          </button>
        </div>

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div>
            <div className="mb-4 text-sm space-y-1">
              <p>
                <span className="font-semibold">Khách hàng:</span>{" "}
                {order.customer_name || "--"}
              </p>
              <p>
                <span className="font-semibold">Số điện thoại:</span>{" "}
                {order.customer_phone || "--"}
              </p>
              <p>
                <span className="font-semibold">Địa chỉ:</span>{" "}
                {order.address_detail || "--"}
              </p>
              <p>
                <span className="font-semibold">Ngày đặt:</span>{" "}
                {order.created_at || "--"}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-sm text-neutral-600 uppercase text-left">
                    <th className="px-3 py-2">Sản phẩm</th>
                    <th className="px-3 py-2">Số lượng</th>
                    <th className="px-3 py-2">Giá</th>
                    <th className="px-3 py-2">Tạm tính</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.length > 0 ? (
                    items.map((it, idx) => {
                      const name =
                        it?.name ||
                        it?.productName ||
                        it?.product?.name ||
                        it?.title ||
                        "Sản phẩm";
                      const qty = Number(
                        it?.quantity || it?.qty || it?.amount || 0,
                      );
                      const price = Number(
                        it?.price || it?.unitPrice || it?.product?.price || 0,
                      );
                      const subtotal = qty * price;
                      return (
                        <tr key={idx} className="text-sm">
                          <td className="px-3 py-2">{name}</td>
                          <td className="px-3 py-2">{qty}</td>
                          <td className="px-3 py-2">
                            {price.toLocaleString("vi-VN")} ₫
                          </td>
                          <td className="px-3 py-2">
                            {subtotal.toLocaleString("vi-VN")} ₫
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-6 text-center text-sm text-neutral-600"
                      >
                        Không có sản phẩm trong đơn hàng.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-right font-semibold">
              Tổng:{" "}
              {orderDetails?.order?.total_amount?.toLocaleString("vi-VN") || 0}{" "}
              ₫
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
