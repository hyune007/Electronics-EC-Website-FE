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
        className="absolute inset-0 bg-black/45 backdrop-blur-[1.5px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-[92%] max-w-sm rounded-2xl border border-border bg-surface p-6 text-center shadow-xl">
        <h3 className="text-lg font-bold text-foreground">
          Cần đăng nhập để tiếp tục
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Để tiến hành đặt hàng, bạn vui lòng đăng nhập hoặc đăng ký tại đây.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Link
            to="/login"
            className="btn btn-primary px-4 py-2 text-sm"
            onClick={onClose}
          >
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className="btn btn-ghost px-4 py-2 text-sm"
            onClick={onClose}
          >
            Đăng ký
          </Link>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Đóng
        </button>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
