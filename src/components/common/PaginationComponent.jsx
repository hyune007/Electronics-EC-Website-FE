import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PaginationComponent({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onPreviousPage,
  onNextPage,
  itemLabel = "mục",
}) {
  // Tinh toan item bat dau va ket thuc
  const startItem = currentPage * itemsPerPage + 1;
  const endItem = Math.min((currentPage + 1) * itemsPerPage, totalItems);

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-surface px-4 py-3">
      <div className="text-sm text-muted-foreground">
        Hiển thị {startItem} đến {endItem} của {totalItems} {itemLabel}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onPreviousPage}
          disabled={currentPage === 0}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          title="Trang trước"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition-colors ${
                currentPage === page
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {page + 1}
            </button>
          ))}
        </div>

        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages - 1}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          title="Trang sau"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
