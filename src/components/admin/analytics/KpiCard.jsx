export default function KpiCard({
  title,
  value,
  subValue,
  icon,
  trend,
  tone = "blue",
}) {
  const toneMap = {
    blue: {
      card: "from-blue-50 to-white border-blue-100",
      iconText: "text-blue-700",
      iconBg: "bg-blue-100",
    },
    emerald: {
      card: "from-emerald-50 to-white border-emerald-100",
      iconText: "text-emerald-700",
      iconBg: "bg-emerald-100",
    },
    amber: {
      card: "from-amber-50 to-white border-amber-100",
      iconText: "text-amber-700",
      iconBg: "bg-amber-100",
    },
    rose: {
      card: "from-rose-50 to-white border-rose-100",
      iconText: "text-rose-700",
      iconBg: "bg-rose-100",
    },
    violet: {
      card: "from-violet-50 to-white border-violet-100",
      iconText: "text-violet-700",
      iconBg: "bg-violet-100",
    },
  };

  const toneValue = toneMap[tone] || toneMap.blue;

  return (
    <div className={`rounded-2xl border p-5 bg-gradient-to-br ${toneValue.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
          {subValue && <p className="mt-1 text-xs text-slate-500">{subValue}</p>}
          {trend && (
            <p className={`mt-2 text-xs font-semibold ${trend.positive ? "text-emerald-600" : "text-rose-600"}`}>
              {trend.label}
            </p>
          )}
        </div>
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${toneValue.iconBg} ${toneValue.iconText}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
