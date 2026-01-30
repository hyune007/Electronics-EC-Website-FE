import { useState } from "react";
import orders from "../../mocks/mockFakeOrders";
import vi from "../../i18n/vi";

export default function MyOrder() {
  const [filter, setFilter] = useState("all");

  const filtered = orders.filter(
    (o) => filter === "all" || o.status === filter,
  );

  const formatVND = (n) =>
    typeof n === "number"
      ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫"
      : n;

  const badgeClassFor = (status) => {
    const map = {
      pending: "bg-blue-100 text-blue-700 border border-blue-200",
      confirmed: "bg-green-100 text-green-700 border border-green-200",
      delivered: "bg-green-100 text-green-700 border border-green-200",
      shipping: "bg-yellow-100 text-yellow-700 border border-yellow-200",
      cancelled: "bg-red-100 text-red-700 border border-red-200",
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
    ["pending", vi.profile.myOrder.filters.pending],
    ["confirmed", vi.profile.myOrder.filters.confirmed],
    ["shipping", vi.profile.myOrder.filters.shipping],
    ["delivered", vi.profile.myOrder.filters.delivered],
    ["cancelled", vi.profile.myOrder.filters.cancelled],
  ];

  const statusLabel = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    shipping: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
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
                  key={i}
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
            {filtered.map((o, idx) => (
              <tr key={o.id} className="transition-colors">
                <td className="px-6 py-5 text-sm font-medium dark:group-hover:text-slate-100">
                  {`HD${String(idx + 1).padStart(3, "0")}`}
                </td>

                <td className="px-6 py-5 text-sm dark:text-slate-300 dark:group-hover:text-slate-100">
                  {o.date}
                </td>

                <td className="px-6 py-5 text-sm">{formatVND(o.total)}</td>

                <td className="px-6 py-5">
                  <span className={badgeClassFor(o.status)}>
                    {statusLabel[o.status]}
                  </span>
                </td>

                <td className="px-6 py-5 text-right">
                  <button className="text-sm font-medium dark:text-[var(--accent-light)] flex items-center gap-1 ml-auto nav-link">
                    {vi.profile.myOrder.viewDetail}
                    <span className="material-symbols-outlined text-[18px]">
                      chevron_right
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-6 py-4 bg-white border-t border-slate-100 dark:bg-slate-900 dark:border-t dark:border-slate-700 flex items-center justify-between">
          <p className="text-sm dark:text-slate-300">
            {vi.profile.myOrder.showing
              .replace("{shown}", String(filtered.length))
              .replace("{total}", String(orders.length))}
          </p>
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
    </div>
  );
}
