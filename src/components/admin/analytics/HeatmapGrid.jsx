function heatColor(value, max) {
  if (!max || max <= 0 || value <= 0) return "bg-slate-100";
  const ratio = value / max;
  if (ratio > 0.8) return "bg-emerald-600";
  if (ratio > 0.6) return "bg-emerald-500";
  if (ratio > 0.4) return "bg-emerald-400";
  if (ratio > 0.2) return "bg-emerald-300";
  return "bg-emerald-200";
}

export default function HeatmapGrid({ data }) {
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const safeData = Array.isArray(data) ? data : [];
  const max = safeData.reduce((m, item) => Math.max(m, Number(item?.value || 0)), 0);

  const lookup = {};
  safeData.forEach((item) => {
    const key = `${item.day}-${item.hour}`;
    lookup[key] = Number(item.value || 0);
  });

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[760px]">
        <div className="mb-2 grid grid-cols-[80px_repeat(24,minmax(0,1fr))] gap-1 text-[10px] text-slate-500">
          <div></div>
          {hours.map((h) => (
            <div key={h} className="text-center">{h}</div>
          ))}
        </div>
        {days.map((day, dayIndex) => (
          <div key={day} className="mb-1 grid grid-cols-[80px_repeat(24,minmax(0,1fr))] gap-1 items-center">
            <div className="text-xs font-semibold text-slate-600">{day}</div>
            {hours.map((hour) => {
              const value = lookup[`${dayIndex}-${hour}`] || 0;
              return (
                <div
                  key={`${dayIndex}-${hour}`}
                  title={`${day} ${hour}:00 - ${value} đơn`}
                  className={`h-5 rounded ${heatColor(value, max)} transition-colors`}
                ></div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
