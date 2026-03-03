import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

export default function ReviewModal({ open, onClose, onSubmit, submitting }) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setRating(5);
      setContent("");
      setError("");
    }
  }, [open]);

  const stars = useMemo(() => [1, 2, 3, 4, 5], []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Vui lòng nhập nội dung đánh giá.");
      return;
    }
    setError("");
    onSubmit?.({ rating, content: content.trim() });
  };

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9998] flex items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 w-[90%] max-w-lg z-10">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold">Viết đánh giá</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <p className="text-sm font-semibold mb-2">Chất lượng sản phẩm</p>
            <div className="flex items-center gap-2">
              {stars.map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                  aria-label={`Đánh giá ${star} sao`}
                >
                  <span
                    className={`material-symbols-outlined text-2xl ${
                      star <= rating
                        ? "text-yellow-500 filled"
                        : "text-slate-300"
                    }`}
                  >
                    star
                  </span>
                </button>
              ))}
              <span className="text-xs text-slate-500">{rating}/5</span>
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-semibold mb-2"
              htmlFor="review-content"
            >
              Nhận xét của bạn
            </label>
            <textarea
              id="review-content"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="Chia sẻ trải nghiệm mua hàng và sử dụng sản phẩm"
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting && (
                <span className="material-symbols-outlined text-sm animate-spin">
                  progress_activity
                </span>
              )}
              Gửi đánh giá
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
