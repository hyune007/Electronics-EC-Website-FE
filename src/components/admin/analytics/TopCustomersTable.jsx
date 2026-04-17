import { useMemo, useState } from "react";

const PAGE_SIZE = 6;

export default function TopCustomersTable({ rows }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("totalSpent");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const safeRows = Array.isArray(rows) ? rows : [];
    const list = q
      ? safeRows.filter((item) => (
        String(item.customerName || "").toLowerCase().includes(q)
        || String(item.customerId || "").toLowerCase().includes(q)
      ))
      : safeRows;

    return [...list].sort((a, b) => {
      const aa = a?.[sortKey];
      const bb = b?.[sortKey];
      if (typeof aa === "number" && typeof bb === "number") {
        return sortDir === "asc" ? aa - bb : bb - aa;
      }
      return sortDir === "asc"
        ? String(aa || "").localeCompare(String(bb || ""), "vi", { sensitivity: "base" })
        : String(bb || "").localeCompare(String(aa || ""), "vi", { sensitivity: "base" });
    });
  }, [rows, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const setSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("desc");
  };

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Tìm khách hàng..."
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Khách hàng</th>
              <th className="px-3 py-2 text-center cursor-pointer" onClick={() => setSort("orders")}>Đơn</th>
              <th className="px-3 py-2 text-right cursor-pointer" onClick={() => setSort("totalSpent")}>Doanh thu</th>
              <th className="px-3 py-2 text-right cursor-pointer" onClick={() => setSort("aov")}>AOV</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, idx) => (
              <tr key={`${row.customerId}-${idx}`} className="border-t border-slate-100">
                <td className="px-3 py-2">
                  <div className="font-medium text-slate-800">{row.customerName}</div>
                  <div className="text-xs text-slate-500">{row.customerId || "N/A"}</div>
                </td>
                <td className="px-3 py-2 text-center">{row.orders}</td>
                <td className="px-3 py-2 text-right">{Number(row.totalSpent || 0).toLocaleString("vi-VN")} ₫</td>
                <td className="px-3 py-2 text-right">{Number(row.aov || 0).toLocaleString("vi-VN")} ₫</td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan="4" className="px-3 py-8 text-center text-slate-400">Không có dữ liệu</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>Trang {safePage}/{totalPages}</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded border border-slate-200 px-2 py-1 hover:bg-slate-50">Trước</button>
          <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded border border-slate-200 px-2 py-1 hover:bg-slate-50">Sau</button>
        </div>
      </div>
    </div>
  );
}
