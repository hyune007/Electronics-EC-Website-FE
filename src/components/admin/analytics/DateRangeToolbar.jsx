function toInputDate(value) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function DateRangeToolbar({
  from,
  to,
  onChangeFrom,
  onChangeTo,
  granularity,
  onChangeGranularity,
  onUsePreset,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-3">
          <label className="mb-1 block text-xs font-semibold text-slate-600">Từ ngày</label>
          <input
            type="date"
            value={toInputDate(from)}
            onChange={(e) => onChangeFrom?.(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
          />
        </div>
        <div className="lg:col-span-3">
          <label className="mb-1 block text-xs font-semibold text-slate-600">Đến ngày</label>
          <input
            type="date"
            value={toInputDate(to)}
            onChange={(e) => onChangeTo?.(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
          />
        </div>
        <div className="lg:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-slate-600">Nhóm thời gian</label>
          <select
            value={granularity}
            onChange={(e) => onChangeGranularity?.(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
          >
            <option value="day">Theo ngày</option>
            <option value="month">Theo tháng</option>
            <option value="year">Theo năm</option>
          </select>
        </div>
        <div className="lg:col-span-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => onUsePreset?.("7d")} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">7 ngày</button>
          <button type="button" onClick={() => onUsePreset?.("30d")} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">30 ngày</button>
          <button type="button" onClick={() => onUsePreset?.("90d")} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">90 ngày</button>
          <button type="button" onClick={() => onUsePreset?.("ytd")} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">YTD</button>
          <button type="button" onClick={() => onUsePreset?.("all")} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Toàn bộ</button>
        </div>
      </div>
    </div>
  );
}
