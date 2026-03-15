import React from "react";
import { NavLink } from "react-router-dom";

export default function CompleteStep() {
  return (
    <div className="card-default overflow-hidden rounded-xl">
      <div className="px-8 pb-8 pt-12 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full border border-[var(--color-success)] bg-[color-mix(in_oklab,var(--color-success)_14%,white)] text-[var(--color-success)]">
          <span className="material-symbols-outlined text-5xl">task_alt</span>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-[var(--color-text)]">
          Đặt hàng thành công!
        </h1>

        <p className="mx-auto max-w-md leading-relaxed text-[var(--color-text-muted)]">
          Cảm ơn bạn đã mua sắm tại{" "}
          <span className="font-semibold text-[var(--color-primary)]">
            UBrainTech
          </span>
          . Đơn hàng của bạn đã được tiếp nhận và đang trong quá trình xử lý.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 p-8 sm:flex-row">
        <NavLink
          to="/home"
          className="btn-secondary flex w-full items-center justify-center gap-2 px-8 py-3 text-sm font-bold sm:w-auto"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Tiếp tục mua sắm
        </NavLink>

        <a
          href="#"
          className="btn-primary flex w-full items-center justify-center gap-2 px-8 py-3 text-sm font-bold sm:w-auto"
        >
          <span className="material-symbols-outlined text-sm">visibility</span>
          Xem chi tiết đơn hàng
        </a>
      </div>
    </div>
  );
}
