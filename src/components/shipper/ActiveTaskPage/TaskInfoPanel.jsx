import React from "react";

export default function TaskInfoPanel({ order }) {
  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  console.log(order);
  return (
    <div className="flex flex-col flex-1 overflow-y-auto p-3 lg:p-4 space-y-3 text-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-2">

        <div className="text-sm font-semibold flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary text-[18px]">
            local_shipping
          </span>
          Đơn hàng:
          <span className="text-primary font-bold">
            #{order?.id}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-primary hover:bg-primary/80 transition text-white text-xs px-3 py-1 rounded-md flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">
              call
            </span>
            Liên hệ
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:border-primary/40 transition">
        <div className="space-y-0.5">
          <div className="font-semibold text-sm flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[17px]">
              person
            </span>
            {order?.customer?.name}
          </div>
          <div className="text-xs text-slate-400 flex items-start gap-1.5">
            <span className="material-symbols-outlined text-[15px]">
              location_on
            </span>
            {order?.address?.detailAddress}, {order?.address?.ward}, {order?.address?.city}
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px]">
              phone
            </span>
            {order?.customer?.phone}
          </div>
        </div>
        <div className="flex gap-2">
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {order?.detailBills?.map((d, i) => (
          <div
            key={i}
            className="bg-slate-900 border border-slate-800 rounded-md p-2.5 hover:border-primary/40 hover:bg-slate-800/60 transition"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-medium text-xs text-slate-100 leading-tight">
                  {d.product?.name}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  <span className="text-primary font-semibold">
                    {" "}• SL: {d.quantity}
                  </span>
                </div>
              </div>
              <div className="font-semibold text-xs text-primary whitespace-nowrap">
                {formatCurrency(d.price)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
