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
  const [currentPage, setCurrentPage] = useState(1);
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

  const RETURN_STATUSES = ['Yêu cầu trả hàng', 'Đã trả hàng', 'Từ chối trả hàng'];
  
  const filtered = orders.filter((o) => {
  if (filter === 'all') return true;
  
  if (filter === 'Trả hàng') {
    return RETURN_STATUSES.includes(o.status);
  }
  
  return o.status === filter;
});
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedOrders = filtered.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, user?.id]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const formatVND = (n) => {
    const value = Number(n);
    if (!Number.isFinite(value)) return "0 ₫";
    return `${new Intl.NumberFormat("vi-VN").format(value)} ₫`;
  };

  const badgeClassFor = (status) => {
    const resolved = statusLabel[status] || status;
    const map = {
      "Chờ xác nhận": "badge-pending",
      "Đơn đang chờ giao": "badge-warning",
      "Đang giao": "badge-info",
      "Đã giao": "badge-success",
      "Đã hủy": "badge-danger",
      "Trả hàng": "badge-return",
    };

    return map[resolved] || "badge-default";
  };

  const filters = [
    ["all", vi.profile.myOrder.filters.all],
    ["Chờ xác nhận", vi.profile.myOrder.filters.pending],
    ["Đơn đang chờ giao", vi.profile.myOrder.filters.waiting_shipping],
    ["Đang giao", vi.profile.myOrder.filters.shipping],
    ["Đã giao", vi.profile.myOrder.filters.delivered],
    ["Đã hủy", vi.profile.myOrder.filters.cancelled],
    ["Trả hàng", "Trả hàng"],
  ];

  const statusLabel = {
    pending: "Chờ xác nhận",
    waiting_shipping: "Đơn đang chờ giao",
    shipping: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
    returned: "Trả hàng",
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
        <tr>
          <td
            className="px-6 py-8 text-sm text-center text-slate-500"
            colSpan={5}
          >
            Đang tải đơn hàng...
          </td>
        </tr>
      );
    }

    if (loadError) {
      return (
        <tr>
          <td
            className="px-6 py-8 text-sm text-center text-red-500"
            colSpan={5}
          >
            {loadError}
          </td>
        </tr>
      );
    }

    if (!filtered.length) {
      return (
        <tr>
          <td
            className="px-6 py-8 text-sm text-center text-slate-500"
            colSpan={5}
          >
            Chưa có đơn hàng phù hợp.
          </td>
        </tr>
      );
    }

    return (
      <>
        {paginatedOrders.map((o) => (
          <tr key={o.id} className="transition-colors">
            <td className="px-6 py-5 text-sm font-medium dark:group-hover:text-slate-100">
              {o.id}
            </td>

            <td className="px-6 py-5 text-sm dark:text-slate-300 dark:group-hover:text-slate-100">
              {o.date}
            </td>

            <td className="px-6 py-5 text-sm">{formatVND(o.total)}</td>

            <td className="px-6 py-5">
              <span
                className={`badge-default ${badgeClassFor(o.status)} whitespace-nowrap`}
              >
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
    <div className="card-default overflow-hidden rounded-2xl border">
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="rounded-lg bg-[var(--accent-light)] p-3 text-[var(--color-primary)]">
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold">
              {vi.profile.myOrder.title}
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {vi.profile.myOrder.desc}
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-md bg-[var(--color-muted)] p-2 py-2">
          {filters.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
              className={`rounded-md px-4 py-1.5 text-sm transition ease-in-out duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--accent-light)]
              ${
                filter === key
                  ? "border border-[var(--color-primary)] bg-[var(--accent-light)] font-semibold text-[var(--color-primary)]"
                  : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <table className="w-full text-left border-collapse no-row-hover">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-muted)]">
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

          <tbody className="divide-y divide-[var(--color-border)]">
            {renderBody()}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            {filtered.length === 0
              ? showingText
              : `Hiển thị ${startIndex + 1}-${Math.min(
                  startIndex + paginatedOrders.length,
                  filtered.length,
                )} trên ${filtered.length} đơn hàng`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="h-8 w-8 rounded-md border border-[var(--color-border)] text-[var(--color-text-muted)] motion-default hover:text-[var(--color-primary)] disabled:opacity-50"
              disabled={safeCurrentPage === 1 || filtered.length === 0}
            >
              <span className="material-symbols-outlined text-[20px]">
                chevron_left
              </span>
            </button>
            <button className="h-8 min-w-8 rounded-md bg-[var(--primary-navy)] px-2 text-sm font-medium text-white">
              {safeCurrentPage}
            </button>
            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className="h-8 w-8 rounded-md border border-[var(--color-border)] text-[var(--color-text-muted)] motion-default hover:text-[var(--color-primary)] disabled:opacity-50"
              disabled={safeCurrentPage === totalPages || filtered.length === 0}
            >
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
