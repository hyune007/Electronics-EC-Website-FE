import React, { useMemo } from "react";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN");
};

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export default function ReviewCard({ review }) {
  const initials = useMemo(() => getInitials(review?.customer?.name), [review]);
  const fullName = review?.customer?.name || "Người dùng";
  const dateLabel = formatDate(review?.reviewDate);
  const rating = Number(review?.rating) || 0;

  return (
    <div className="flex gap-3 pb-6 border-b border-slate-200 dark:border-slate-800 last:border-0">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base">
          {initials}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h5 className="font-bold">{fullName}</h5>
            <div
              className="flex text-yellow-500 text-sm"
              aria-label={`Đánh giá ${rating} sao`}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`material-symbols-outlined text-xs ${
                    star <= rating ? "filled" : "text-slate-300"
                  }`}
                >
                  star
                </span>
              ))}
            </div>
          </div>
          {dateLabel && (
            <span className="text-xs text-slate-400">{dateLabel}</span>
          )}
        </div>
        <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line">
          {review?.content}
        </p>
      </div>
    </div>
  );
}
