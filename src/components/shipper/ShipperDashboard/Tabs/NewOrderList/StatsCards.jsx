import React from "react";

export default function StatsCards({ distanceKm }) {
  const stats = [
    // { label: "Doanh thu", value: "1.250.000đ" },
    // { label: "Đơn hoàn thành", value: "18" },
    { label: "Quãng đường", value: distanceKm ? `${distanceKm} km` : "--" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-neutral-200 flex items-center justify-between"
        >
          <div>
            <div className="text-xs text-gray-400">{s.label}</div>
            <div className="text-lg font-bold">{s.value}</div>
          </div>
          <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-primary/10 text-primary rounded-full">
            <span className="material-symbols-outlined">analytics</span>
          </div>
        </div>
      ))}
    </div>
  );
}
