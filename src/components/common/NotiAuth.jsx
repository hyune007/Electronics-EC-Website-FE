import React from "react";
import { Link } from "react-router-dom";

export default function NotiAuth({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6 max-w-sm w-full text-center space-y-4">
        <h3 className="text-lg font-bold">Cần đăng nhập để tiếp tục</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Để tiến hành đặt hàng, bạn vui lòng đăng nhập hoặc đăng ký tại đây.
        </p>
        <div className="flex justify-center gap-3 mt-2">
          <Link
            to="/login"
            className="px-4 py-2 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90"
            onClick={onClose}
          >
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-md border border-slate-300 text-sm font-semibold hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
            onClick={onClose}
          >
            Đăng ký
          </Link>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 text-xs text-slate-400 hover:text-slate-600"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
