import React from "react";

export default function BottomActionBar({order}) {
  return (
    <footer className="bg-[#111418] border-t border-slate-800 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-auto">
          <div className="text-xs text-slate-400">COD</div>
          <div className="font-bold text-xl">{order?.price?.toLocaleString('vi-VN') || '0đ'}</div>
        </div>

        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button className="w-full sm:w-auto bg-red-500 px-4 py-2 rounded-lg">
            Hủy đơn hàng
          </button>
          <button className="w-full sm:w-auto bg-green-600 px-4 py-2 rounded-lg font-bold">
            Xác nhận giao
          </button>
        </div>
      </div>
    </footer>
  );
}
