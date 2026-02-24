import React from "react";
import { Link, NavLink} from "react-router-dom";

export default function CompleteStep() {
  return (
    <div className="bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden">
      
      <div className="pt-12 pb-8 px-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-6">
          <span className="material-symbols-outlined text-5xl">
            task_alt
          </span>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
          Đặt hàng thành công!
        </h1>

        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Cảm ơn bạn đã mua sắm tại{" "}
          <span className="font-semibold text-primary">
            UBrainTech
          </span>
          . Đơn hàng của bạn đã được tiếp nhận và đang trong quá trình xử lý.
        </p>
      </div>

      <div className="p-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <NavLink to="/home"
          className="w-full sm:w-auto px-8 py-3 rounded-md border border-slate-300 dark:border-slate-700 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">
            arrow_back
          </span>
          Tiếp tục mua sắm
        </NavLink>

        <a
          href="#"
          className="w-full sm:w-auto px-8 py-3 rounded-md bg-primary text-white text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">
            visibility
          </span>
          Xem chi tiết đơn hàng
        </a>
      </div>

    </div>
  );
}