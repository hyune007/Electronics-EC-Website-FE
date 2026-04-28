import React, { useMemo } from "react";
import PropTypes from "prop-types";
import vi from "../../../../../../i18n/vi.js";

export default function ReviewSummary({ stats, onWriteReview }) {
  const safeStats = useMemo(
    () => ({
      average: stats?.average || 0,
      total: stats?.total || 0,
      breakdown: stats?.breakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    }),
    [stats],
  );

  const percentage = (rating) => {
    if (!safeStats.total) return 0;
    const count = safeStats.breakdown[rating] || 0;
    return Math.round((count / safeStats.total) * 100);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700">
        <h4 className="text-sm font-bold mb-4">{vi.product.review.title}</h4>
        <div className="text-center mb-6">
          <div className="text-xl font-black text-primary dark:text-white mb-1">
            {safeStats.average.toFixed(1)}
          </div>
          <div className="flex justify-center text-yellow-500 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`material-symbols-outlined ${
                  star <= Math.round(safeStats.average)
                    ? "filled"
                    : "text-slate-300"
                }`}
              >
                star
              </span>
            ))}
          </div>
          <p className="text-slate-500 text-xs">
            {vi.product.review.basedOn.replace(
              "{count}",
              String(safeStats.total),
            )}
          </p>
        </div>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const pct = percentage(rating);
            return (
              <div className="flex items-center gap-3" key={rating}>
                <span className="text-xs font-bold w-4">{rating}</span>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-slate-500 w-8">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
      <button
        type="button"
        onClick={onWriteReview}
        className="w-full py-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        {vi.product.review.writeButton}
      </button>
    </div>
  );
}

ReviewSummary.propTypes = {
  stats: PropTypes.shape({
    average: PropTypes.number,
    total: PropTypes.number,
    breakdown: PropTypes.shape({
      1: PropTypes.number,
      2: PropTypes.number,
      3: PropTypes.number,
      4: PropTypes.number,
      5: PropTypes.number,
    }),
  }),
  onWriteReview: PropTypes.func,
};
