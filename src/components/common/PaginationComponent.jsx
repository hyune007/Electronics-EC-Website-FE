import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PaginationComponent({
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    onPageChange,
    onPreviousPage,
    onNextPage,
    itemLabel = "mục"
}) {
    // Tính toán item bắt đầu và kết thúc
    const startItem = (currentPage * itemsPerPage) + 1;
    const endItem = Math.min((currentPage + 1) * itemsPerPage, totalItems);

    if (totalItems === 0) {
        return null;
    }

    return (
        <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-neutral-600">
                Hiển thị {startItem} đến {endItem} của {totalItems} {itemLabel}
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onPreviousPage}
                    disabled={currentPage === 0}
                    className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-neutral-600"
                    title="Trang trước"
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i).map(page => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                                currentPage === page
                                    ? 'bg-primary-500 text-white'
                                    : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
                            }`}
                        >
                            {page + 1}
                        </button>
                    ))}
                </div>

                <button
                    onClick={onNextPage}
                    disabled={currentPage === totalPages - 1}
                    className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-neutral-600"
                    title="Trang sau"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
