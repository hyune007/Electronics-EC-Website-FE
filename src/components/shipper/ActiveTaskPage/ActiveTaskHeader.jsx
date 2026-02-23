import React from "react";

export default function ActiveTaskHeader() {
  return (
    <header className="flex items-center justify-between px-4 lg:px-6 py-3 bg-navy-dark border-b border-slate-800">
      <div className="flex items-center gap-3">
        <div className="bg-primary/20 p-2 rounded-lg">
          <span className="material-symbols-outlined text-primary">
            delivery_dining
          </span>
        </div>
          <div className="font-bold text-sm lg:text-lg">
            Chi tiết đơn hàng
        </div>
      </div>
      <div>
        <button className="bg-white/10 hover:bg-white/20 transition text-xs px-3 py-1 rounded-md flex items-center gap-1">
          <a href="/shipper-dashboard">
          <span className="material-symbols-outlined text-[16px]">
            arrow_back
          </span>
          Quay lại
          </a>
        </button>
      </div>
    </header>
  );
}
