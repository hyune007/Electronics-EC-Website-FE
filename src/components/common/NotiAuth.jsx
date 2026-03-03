import React from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";

export default function NotiAuth({ open, onClose }) {
  if (!open) return null;

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6 max-w-sm w-[90%] mx-auto text-center space-y-4 z-10">
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

  return createPortal(modal, document.body);
}
