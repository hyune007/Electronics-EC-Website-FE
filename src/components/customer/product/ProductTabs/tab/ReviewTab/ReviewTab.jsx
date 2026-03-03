import React from "react";
import vi from "../../../../../../i18n/vi.js";
import ReviewCard from "./ReviewCard.jsx";

export default function ReviewTab({ reviews, loading, onWriteReview }) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold">{vi.product.review.title}</h4>
        <button
          type="button"
          onClick={onWriteReview}
          className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          {vi.product.review.writeButton}
        </button>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center gap-3 text-slate-500">
            <span className="material-symbols-outlined animate-spin">
              progress_activity
            </span>
            <span>Đang tải đánh giá...</span>
          </div>
        ) : reviews?.length ? (
          reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        ) : (
          <div className="text-center py-10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 mb-3">
              Chưa có đánh giá nào cho sản phẩm này.
            </p>
            <button
              type="button"
              onClick={onWriteReview}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90"
            >
              Viết đánh giá đầu tiên
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
