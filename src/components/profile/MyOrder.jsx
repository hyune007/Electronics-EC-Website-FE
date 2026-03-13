import { useEffect, useState } from "react";
import vi from "../../i18n/vi";
import OrderDetailModal from "../customer/product/OrderDetailModalCustomer.jsx";
import { useAuth } from "../../hooks/useAuth";
import { getBillsByCustomer } from "../../services/customer/billServiceCustomer";

export default function MyOrder() {
  const [filter, setFilter] = useState("all");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchCustomerBills = async () => {
      if (!user?.id) {
        setOrders([]);
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setLoadError("");
        const response = await getBillsByCustomer(user.id);
        const payload = response?.data;
        let bills = [];
        if (Array.isArray(payload)) {
          bills = payload;
        } else if (Array.isArray(payload?.data)) {
          bills = payload.data;
        }
        const mappedOrders = bills.map((bill) => {
          const rawDate = bill?.date;
          const formattedDate = rawDate
            ? new Date(rawDate).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              })
            : "--";
          return {
            id: bill?.id ?? "",
            date: formattedDate,
            total: Number(bill?.totalAmount) || 0,
            status: String(bill?.status || "pending"),
            raw: bill,
          };
        });

        setOrders(mappedOrders);
      } catch (error) {
        console.error("Failed to load customer bills:", error);
        setLoadError("Không thể tải đơn hàng. Vui lòng thử lại sau.");
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerBills();
  }, [user?.id]);

  const filtered = orders.filter(
    (o) => filter === "all" || o.status === filter,
  );

  const formatVND = (n) => {
    const value = Number(n);
    if (!Number.isFinite(value)) return "0 ₫";
    return `${new Intl.NumberFormat("vi-VN").format(value)} ₫`;
  };

  const badgeClassFor = (status) => {
    const map = {
      "Chờ xác nhận": "bg-yellow-100 text-yellow-700 border border-yellow-200",
      "Đơn đang chờ giao":
        "bg-yellow-100 text-yellow-700 border border-yellow-200",
      "Đang giao": "bg-blue-100 text-blue-700 border border-blue-200",
      "Đã giao": "bg-green-100 text-green-700 border border-green-200",
      "Đã hủy": "bg-red-100 text-red-700 border border-red-200",
    };

    const base =
      map[status] || "bg-slate-100 text-slate-700 border border-slate-200";

    return (
      base
        .split(" ")
        .map((c) => `${c} dark:${c}`)
        .join(" ") + " rounded-md px-3 py-1 text-xs font-medium"
    );
  };

  const filters = [
    ["all", vi.profile.myOrder.filters.all],
    ["Chờ xác nhận", vi.profile.myOrder.filters.pending],
    ["Đơn đang chờ giao", vi.profile.myOrder.filters.waiting_shipping],
    ["Đang giao", vi.profile.myOrder.filters.shipping],
    ["Đã giao", vi.profile.myOrder.filters.delivered],
    ["Đã hủy", vi.profile.myOrder.filters.cancelled],
  ];

  const statusLabel = {
    pending: "Chờ xác nhận",
    waiting_shipping: "Đơn đang chờ giao",
    shipping: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
  };

  const showingText = `Hiển thị ${filtered.length} trên ${orders.length} đơn hàng`;

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);

  const openDetail = (o) => {
    setDetailOrder(o || null);
    setDetailModalOpen(true);
  };

  const closeDetail = () => {
    setDetailModalOpen(false);
    setDetailOrder(null);
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <>
          <tr>
            <td
              className="px-6 py-8 text-sm text-center text-slate-500"
              colSpan={5}
            >
              Đang tải đơn hàng...
            </td>
          </tr>
        </>
      );
    }

    if (loadError) {
      return (
        <>
          <tr>
            <td
              className="px-6 py-8 text-sm text-center text-red-500"
              colSpan={5}
            >
              {loadError}
            </td>
          </tr>
        </>
      );
    }

    if (!filtered.length) {
      return (
        <>
          <tr>
            <td
              className="px-6 py-8 text-sm text-center text-slate-500"
              colSpan={5}
            >
              Chưa có đơn hàng phù hợp.
            </td>
          </tr>
        </>
      );
    }

    return (
      <>
        {filtered.map((o) => (
          <tr key={o.id} className="transition-colors">
            <td className="px-6 py-5 text-sm font-medium dark:group-hover:text-slate-100">
              {o.id}
            </td>

            <td className="px-6 py-5 text-sm dark:text-slate-300 dark:group-hover:text-slate-100">
              {o.date}
            </td>

            <td className="px-6 py-5 text-sm">{formatVND(o.total)}</td>

            <td className="px-6 py-5">
              <span className={badgeClassFor(o.status)}>
                {statusLabel[o.status] || o.status}
              </span>
            </td>

            <td className="px-6 py-5 text-right">
              <button
                onClick={() => openDetail(o)}
                className="text-sm font-medium dark:text-[var(--accent-light)] flex items-center gap-1 ml-auto nav-link"
              >
                {vi.profile.myOrder.viewDetail}
                <span className="material-symbols-outlined text-[18px]">
                  chevron_right
                </span>
              </button>
            </td>
          </tr>
        ))}
      </>
    );
  };

  return (
    <div className="rounded-2xl shadow-sm border overflow-hidden bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 rounded-lg bg-[var(--accent-light)] dark:bg-slate-700 dark:text-slate-100">
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold">
              {vi.profile.myOrder.title}
            </h1>
            <p className="text-sm mt-1 dark:text-slate-300">
              {vi.profile.myOrder.desc}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6 py-2 bg-slate-50 p-2 rounded-md dark:bg-slate-900/40">
          {filters.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
              className={`px-4 py-1.5 rounded-md text-sm transition ease-in-out duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--accent-light)]
              ${
                filter === key
                  ? "bg-[var(--accent-light)] font-semibold shadow-sm border border-[var(--accent-light)] dark:bg-[var(--primary-navy)] dark:text-white"
                  : "bg-white border border-slate-200 dark:bg-transparent dark:text-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <table className="w-full text-left border-collapse no-row-hover">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              {vi.profile.myOrder.headers.map((h, i) => (
                <th
                  key={h}
                  className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider ${
                    i === 4 ? "text-right" : ""
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200/40 dark:divide-slate-700/10">
            {renderBody()}
          </tbody>
        </table>

        <div className="px-6 py-4 bg-white border-t border-slate-100 dark:bg-slate-900 dark:border-t dark:border-slate-700 flex items-center justify-between">
          <p className="text-sm dark:text-slate-300">{showingText}</p>
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
              disabled
            >
              <span className="material-symbols-outlined text-[20px]">
                chevron_left
              </span>
            </button>
            <button className="w-8 h-8 rounded-md bg-[var(--primary-navy)] text-sm font-medium">
              1
            </button>
            <button className="p-2 rounded-md border border-slate-200 hover:bg-slate-50">
              <span className="material-symbols-outlined text-[20px]">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>
      <OrderDetailModal
        open={detailModalOpen}
        onClose={closeDetail}
        orderId={detailOrder?.id}
        order={detailOrder?.raw}
        user={user}
      />
    </div>
  );
}
