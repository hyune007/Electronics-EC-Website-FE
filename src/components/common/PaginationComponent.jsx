import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

export default function PaginationComponent({
    currentPage, // 0-indexed
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

    if (totalItems <= 0 || totalPages <= 0) {
        return null;
    }

    // Xử lý hiển thị trang thông minh có dấu '...'
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 0; i < totalPages; i++) pages.push(i);
            return pages;
        }

        pages.push(0); // Trang đầu tiên

        let start = Math.max(1, currentPage - 1);
        let end = Math.min(totalPages - 2, currentPage + 1);

        if (currentPage <= 2) {
            end = 3;
        } else if (currentPage >= totalPages - 3) {
            start = totalPages - 4;
        }

        if (start > 1) {
            pages.push('dots-start');
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < totalPages - 2) {
            pages.push('dots-end');
        }

        pages.push(totalPages - 1); // Trang cuối cùng
        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 mt-6 bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="text-sm text-neutral-500 font-medium">
                Hiển thị <span className="text-neutral-900 font-semibold">{startItem}</span> - <span className="text-neutral-900 font-semibold">{endItem}</span> trong tổng số <span className="text-neutral-900 font-semibold">{totalItems}</span> {itemLabel}
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-neutral-50 rounded-xl border border-neutral-200/60">
                <button
                    onClick={onPreviousPage}
                    disabled={currentPage === 0}
                    className={`flex items-center justify-center h-9 w-9 rounded-lg transition-colors duration-200 ${
                        currentPage === 0 
                        ? 'text-neutral-300 cursor-not-allowed' 
                        : 'text-neutral-600 hover:bg-white hover:text-primary-600 hover:shadow-sm'
                    }`}
                    title="Trang trước"
                >
                    <ChevronLeft size={18} strokeWidth={2.5} />
                </button>

                <div className="flex items-center hidden sm:flex">
                    {getPageNumbers().map((page, index) => {
                        if (page === 'dots-start' || page === 'dots-end') {
                            return (
                                <div key={`dots-${index}`} className="flex items-center justify-center w-8 h-9 text-neutral-400">
                                    <MoreHorizontal size={16} />
                                </div>
                            );
                        }

                        const isActive = currentPage === page;
                        return (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`flex items-center justify-center min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-semibold transition-colors duration-200 mx-0.5 ${
                                    isActive
                                        ? 'bg-white text-primary-600 shadow-sm border border-neutral-200/60'
                                        : 'text-neutral-600 hover:bg-white hover:text-primary-600'
                                }`}
                            >
                                {page + 1}
                            </button>
                        );
                    })}
                </div>
                
                {/* Mobile view showing current page only to save space */}
                <div className="flex sm:hidden items-center justify-center px-4 h-9 font-semibold text-sm text-neutral-700">
                    Trang {currentPage + 1} / {totalPages}
                </div>

                <button
                    onClick={onNextPage}
                    disabled={currentPage === totalPages - 1}
                    className={`flex items-center justify-center h-9 w-9 rounded-lg transition-colors duration-200 ${
                        currentPage === totalPages - 1
                        ? 'text-neutral-300 cursor-not-allowed' 
                        : 'text-neutral-600 hover:bg-white hover:text-primary-600 hover:shadow-sm'
                    }`}
                    title="Trang sau"
                >
                    <ChevronRight size={18} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
}
