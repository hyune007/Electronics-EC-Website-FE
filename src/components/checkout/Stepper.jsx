import React from "react";
import PropTypes from "prop-types";

export default function Stepper({
  currentStep = 0,
  view,
  onSelectView,
  onBlockedClick,
}) {
  const steps = [
    { id: "cart", icon: "shopping_cart", label: "Giỏ hàng" },
    { id: "infor", icon: "person", label: "Thông tin" },
    { id: "payment", icon: "payments", label: "Thanh toán" },
    { id: "complete", icon: "check_circle", label: "Hoàn tất" },
  ];

  const activeIndex =
    typeof view === "string"
      ? steps.findIndex((s) => s.id === view)
      : currentStep;

  const progress = (activeIndex / (steps.length - 1)) * 100;

  return (
    <div className="mb-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-5 shadow-sm sm:mb-10 sm:px-6">
      <div className="relative mx-auto flex max-w-4xl items-center justify-between">
        <div className="absolute top-5 h-[2px] w-full bg-[var(--color-border)]" />
        <div
          className="absolute top-5 h-[2px] bg-[var(--color-primary)] transition-all duration-220 ease-standard"
          style={{ width: `${progress}%` }}
        />

        {steps.map((step, index) => {
          const isActive = index <= activeIndex;
          const isClickable = Boolean(onSelectView) && index <= activeIndex;

          return (
            <button
              type="button"
              key={step.id}
              onClick={() => {
                if (isClickable) {
                  onSelectView(step.id);
                  return;
                }

                onBlockedClick?.(step.id);
              }}
              className={`flex flex-col items-center gap-2 px-2 text-center sm:px-4 ${
                isClickable ? "cursor-pointer" : "cursor-not-allowed"
              }`}
            >
              <div
                className={`z-0 flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-220 ease-standard
                ${
                  isActive
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-sm"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]"
                }`}
              >
                <span className="material-symbols-outlined text-xl z-0">
                  {step.icon}
                </span>
              </div>

              <span
                className={`text-xs sm:text-sm ${
                  isActive
                    ? "font-bold text-[var(--color-primary)]"
                    : "font-medium text-[var(--color-text-muted)]"
                }`}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

Stepper.propTypes = {
  currentStep: PropTypes.number,
  view: PropTypes.string,
  onSelectView: PropTypes.func,
  onBlockedClick: PropTypes.func,
};
