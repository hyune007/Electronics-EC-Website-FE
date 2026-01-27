import React from "react";
import vi from "../../../../../../i18n/vi.js";

export default function ReviewSummary() {
  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700">
        <h4 className="text-sm font-bold mb-4">{vi.product.review.title}</h4>
        <div className="text-center mb-6">
          <div className="text-xl font-black text-primary dark:text-white mb-1">
            4.8
          </div>
          <div className="flex justify-center text-yellow-500 mb-2">
            <span className="material-symbols-outlined filled">star</span>
            <span className="material-symbols-outlined filled">star</span>
            <span className="material-symbols-outlined filled">star</span>
            <span className="material-symbols-outlined filled">star</span>
            <span className="material-symbols-outlined filled">star</span>
          </div>
          <p className="text-slate-500 text-xs">
            {vi.product.review.basedOn.replace(
              "{count}",
              String(vi.product.rating.count),
            )}
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold w-4">5</span>
            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 w-[85%]"></div>
            </div>
            <span className="text-[10px] text-slate-500 w-8">85%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold w-4">4</span>
            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 w-[10%]"></div>
            </div>
            <span className="text-[10px] text-slate-500 w-8">10%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold w-4">3</span>
            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 w-[3%]"></div>
            </div>
            <span className="text-[10px] text-slate-500 w-8">3%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold w-4">2</span>
            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 w-[1%]"></div>
            </div>
            <span className="text-[10px] text-slate-500 w-8">1%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold w-4">1</span>
            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 w-[1%]"></div>
            </div>
            <span className="text-[10px] text-slate-500 w-8">1%</span>
          </div>
        </div>
      </div>
      <button className="w-full py-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
        {vi.product.review.writeButton}
      </button>
    </div>
  );
}
