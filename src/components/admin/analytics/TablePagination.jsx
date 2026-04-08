import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TablePagination({
  page,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}) {
  const totalPages = Math.max(1, Math.ceil(Number(totalItems || 0) / Number(pageSize || 1)));
  const safePage = Math.min(Math.max(1, Number(page || 1)), totalPages);
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, totalItems);

  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
      <span>
        Hiển thị {start}-{end} / {totalItems}
      </span>
      <div className="flex items-center gap-2">
        {typeof onPageSizeChange === "function" && (
          <label className="flex items-center gap-1">
            <span className="text-slate-500">/trang</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded border border-slate-200 px-1.5 py-1 text-xs text-slate-700"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
        )}
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={14} />
          Trước
        </button>
        <span className="font-medium text-slate-700">
          {safePage}/{totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Sau
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
