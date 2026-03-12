import React from "react";

export default function Stepper({ currentStep = 0, view, onSelectView }) {
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
    <div className="mb-10">
      <div className="relative flex justify-between max-w-4xl mx-auto items-center">
        <div className="absolute top-5 w-full h-[2px] bg-slate-200" />
        <div
          className="absolute top-5 h-[2px] bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />

        {steps.map((step, index) => {
          const isActive = index <= activeIndex;

          return (
            <div
              key={step.id}
              onClick={() => {
                if (onSelectView && index <= activeIndex) {
                  onSelectView(step.id);
                }
              }}
              className="flex flex-col items-center gap-2 px-4 cursor-pointer"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all z-0
                ${isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "bg-white border-2 border-slate-200 text-slate-400"
                  }`}
              >
                <span className="material-symbols-outlined text-xl z-0">
                  {step.icon}
                </span>
              </div>

              <span
                className={`text-sm ${isActive
                    ? "font-bold text-primary"
                    : "font-medium text-slate-500"
                  }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
