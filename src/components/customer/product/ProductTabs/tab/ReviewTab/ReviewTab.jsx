import React from "react";
import vi from "../../../../../../i18n/vi.js";

export default function ReviewTab() {
  return (
    <>
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
            <p className="text-slate-500 text-xs">Dựa trên 124 đánh giá</p>
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

      <div className="mt-12 space-y-6">
        <div className="flex gap-3 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base">
              HN
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h5 className="font-bold">Hoàng Nam</h5>
                <div className="flex text-yellow-500 text-sm">
                  <span className="material-symbols-outlined filled text-xs">
                    star
                  </span>
                  <span className="material-symbols-outlined filled text-xs">
                    star
                  </span>
                  <span className="material-symbols-outlined filled text-xs">
                    star
                  </span>
                  <span className="material-symbols-outlined filled text-xs">
                    star
                  </span>
                  <span className="material-symbols-outlined text-xs">
                    star
                  </span>
                </div>
              </div>
              <span className="text-xs text-slate-400">2 ngày trước</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {vi.product.review.reviewers.hn.text}
            </p>
            <div className="flex gap-4">
              <button className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary">
                <span className="material-symbols-outlined text-sm">
                  thumb_up
                </span>{" "}
                Hữu ích (12)
              </button>
              <button className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary">
                Phản hồi
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold text-base">
              MT
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h5 className="font-bold">Minh Tú</h5>
                <div className="flex text-yellow-500 text-sm">
                  <span className="material-symbols-outlined filled text-xs">
                    star
                  </span>
                  <span className="material-symbols-outlined filled text-xs">
                    star
                  </span>
                  <span className="material-symbols-outlined filled text-xs">
                    star
                  </span>
                  <span className="material-symbols-outlined filled text-xs">
                    star
                  </span>
                  <span className="material-symbols-outlined text-xs">
                    star
                  </span>
                </div>
              </div>
              <span className="text-xs text-slate-400">1 tuần trước</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Máy mạnh, chơi game rất mượt. Tuy nhiên pin có vẻ tụt nhanh hơn
              một chút so với kỳ vọng nếu dùng cường độ cao. Shop tư vấn nhiệt
              tình.
            </p>
            <div className="flex gap-4">
              <button className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary">
                <span className="material-symbols-outlined text-sm">
                  thumb_up
                </span>{" "}
                Hữu ích (3)
              </button>
              <button className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary">
                Phản hồi
              </button>
            </div>
          </div>
        </div>

        <div className="text-center pt-8">
          <button className="text-primary font-bold hover:underline">
            {vi.product.review.seeMore}
          </button>
        </div>
      </div>
    </>
  );
}
