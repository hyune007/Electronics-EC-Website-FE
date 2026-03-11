import { Plus, Pencil, Trash2, Search, Percent, Calendar, Tag, Gift, ArrowUpDown, Sparkles, TimerOff, CircleDot, Clock, Loader2, ChevronDown, FileSpreadsheet, Upload, Download, X } from "lucide-react";
import { useVoucherLogic } from "./VoucherLogic.js";
import VoucherForm from "./VoucherForm.jsx";
import { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth.js";
import PaginationComponent from "../../../../components/common/PaginationComponent.jsx";
import "./Voucher.css";

export default function VoucherManage() {
    const vm = useVoucherLogic();
    const [mounted, setMounted] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [isDraggingFile, setIsDraggingFile] = useState(false);
    const fileInputRef = useRef(null);
    const addMenuRef = useRef(null);
    const { user } = useAuth();
    const isAdmin = user?.roleId === "ROLE_ADMIN";
    const isEmployee = user?.roleId === "ROLE_EMPLOYEE";

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const visibleIds = new Set((vm.paginatedVouchers || []).map((v) => v.km_id));
        setSelectedIds((prev) => prev.filter((id) => visibleIds.has(id)));
    }, [vm.paginatedVouchers]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!addMenuRef.current?.contains(event.target)) {
                setShowAddMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Theo BE security: ADMIN + EMPLOYEE
    if (!isAdmin && !isEmployee) {
        return <Navigate to="/unauthorized" replace />;
    }

    const getStatusText = (startDate, endDate) => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (now < start) return 'Sắp diễn ra';
        if (now > end) return 'Đã kết thúc';
        return 'Đang hoạt động';
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        if (Number.isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString("vi-VN");
    };

    const pageIds = (vm.paginatedVouchers || []).map((v) => v.km_id);
    const allSelectedOnPage = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

    const toggleSelectAllOnPage = () => {
        if (allSelectedOnPage) {
            setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
            return;
        }
        setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    };

    const toggleSelectOne = (id) => {
        setSelectedIds((prev) => (
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        ));
    };

    const handleQuickDelete = async () => {
        if (selectedIds.length === 0 || vm.isBulkDeleting) return;
        if (!window.confirm(`Xóa nhanh ${selectedIds.length} voucher đã chọn?`)) return;

        await vm.handleDeleteMany(selectedIds);
        setSelectedIds([]);
    };

    const getNextNumberFromIds = (ids, prefix) => {
        const maxNum = (ids || []).reduce((max, id) => {
            const match = String(id || "").toUpperCase().match(new RegExp(`^${prefix}(\\d+)$`));
            if (!match) return max;
            return Math.max(max, Number(match[1]));
        }, 0);
        return maxNum + 1;
    };

    const formatDateTemplate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    const downloadTemplateFile = async () => {
        const XLSX = await import("xlsx");
        const existingIds = (vm.filteredVouchers || []).map((item) => item?.km_id).filter(Boolean);
        const nextNum = getNextNumberFromIds(existingIds, "KM");
        const id1 = `KM${String(nextNum).padStart(3, "0")}`;
        const id2 = `KM${String(nextNum + 1).padStart(3, "0")}`;
        const now = new Date();
        const start1 = formatDateTemplate(now);
        const end1 = formatDateTemplate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14));
        const start2 = formatDateTemplate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15));
        const end2 = formatDateTemplate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 29));
        const aoa = [
            ["Mã voucher", "Tên voucher", "Mô tả", "Phần trăm", "Ngày bắt đầu", "Ngày kết thúc"],
            [id1, "Giam gia don hang", "Ap dung cho don tu 500.000", 10, start1, end1],
            [id2, "Giam gia thanh vien", "Ap dung cho khach hang than thiet", 15, start2, end2],
        ];
        const worksheet = XLSX.utils.aoa_to_sheet(aoa);
        worksheet["!cols"] = [{ wch: 14 }, { wch: 24 }, { wch: 30 }, { wch: 12 }, { wch: 16 }, { wch: 16 }];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "MauVoucher");
        XLSX.writeFile(workbook, "voucher-import-template.xlsx");
    };

    const onPickFile = () => {
        if (vm.isImportingFile) return;
        fileInputRef.current?.click();
    };

    const onSelectedFile = async (file) => {
        if (!file) return;
        await vm.handleBulkImportFile(file);
        setShowImportModal(false);
        setIsDraggingFile(false);
    };

    const onDropFile = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingFile(false);

        if (vm.isImportingFile) return;
        const file = event.dataTransfer?.files?.[0];
        await onSelectedFile(file);
    };

    return (
        <div className={`fade-in min-h-full ${mounted ? 'slide-up' : ''}`}>
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Quản Lý Voucher</h1>
                        <p className="text-neutral-600">Quản lý mã giảm giá và chương trình khuyến mãi</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {selectedIds.length > 0 && (
                            <button
                                type="button"
                                onClick={handleQuickDelete}
                                disabled={vm.isBulkDeleting}
                                className="btn-quick-delete"
                            >
                                {vm.isBulkDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                {vm.isBulkDeleting ? "Đang xóa..." : `Xóa nhanh (${selectedIds.length})`}
                            </button>
                        )}

                        <div className="add-product-actions" ref={addMenuRef}>
                            <button
                                type="button"
                                onClick={() => setShowAddMenu((s) => !s)}
                                className="btn-primary flex items-center gap-2 shadow-lg"
                            >
                                <Plus size={18} />
                                <span>Thêm Voucher</span>
                                <ChevronDown size={16} />
                            </button>

                            {showAddMenu && (
                                <div className="add-menu-dropdown">
                                    <button
                                        type="button"
                                        className="add-menu-item"
                                        onClick={() => {
                                            vm.openAdd();
                                            setShowAddMenu(false);
                                        }}
                                    >
                                        <Plus size={16} />
                                        Thêm 1 voucher
                                    </button>
                                    <button
                                        type="button"
                                        className="add-menu-item"
                                        onClick={() => {
                                            setShowImportModal(true);
                                            setShowAddMenu(false);
                                        }}
                                        disabled={vm.isImportingFile}
                                    >
                                        {vm.isImportingFile ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
                                        {vm.isImportingFile ? "Đang import..." : "Thêm nhiều bằng file"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv,.json"
                    className="hidden"
                    onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) await onSelectedFile(file);
                        e.target.value = "";
                    }}
                />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Voucher Sau Lọc</p>
                                <p className="text-2xl font-bold text-neutral-900">{vm.stats.total}</p>
                                <p className="text-xs text-neutral-500 mt-1">Theo bộ lọc hiện tại</p>
                            </div>
                            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                <Gift className="text-primary-600" size={24} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Đang Hoạt Động</p>
                                <p className="text-2xl font-bold text-neutral-900">{vm.stats.activeCount}</p>
                                <p className="text-xs text-neutral-500 mt-1">Hiệu lực ngay</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <Tag className="text-emerald-600" size={24} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Sắp Diễn Ra</p>
                                <p className="text-2xl font-bold text-neutral-900">{vm.stats.upcomingCount}</p>
                                <p className="text-xs text-neutral-500 mt-1">Đang chờ kích hoạt</p>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Clock className="text-amber-600" size={24} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Hiệu Suất % Giảm</p>
                                <p className="text-2xl font-bold text-neutral-900">{vm.stats.avgPercent}%</p>
                                <p className="text-xs text-neutral-500 mt-1">Cao nhất: {vm.stats.maxPercent}%</p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <Sparkles className="text-red-600" size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Section */}
            <div className="card p-6 mb-6">
                <div className="flex flex-col xl:flex-row gap-4 xl:items-center">
                    <div className="flex-1 search-box">
                        <Search className="text-neutral-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm theo mã, tên hoặc mô tả voucher..."
                            value={vm.search}
                            onChange={(e) => vm.setSearch(e.target.value)}
                            className="flex-1 bg-transparent outline-none ml-3 text-neutral-900 placeholder-neutral-400"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 border border-neutral-200 rounded-xl bg-white">
                            <CircleDot size={16} className="text-neutral-500" />
                            <select
                                value={vm.statusFilter}
                                onChange={(e) => vm.setStatusFilter(e.target.value)}
                                className="bg-transparent text-sm text-neutral-700 outline-none"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Đang hoạt động</option>
                                <option value="upcoming">Sắp diễn ra</option>
                                <option value="expired">Đã kết thúc</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-2 border border-neutral-200 rounded-xl bg-white">
                            <ArrowUpDown size={16} className="text-neutral-500" />
                            <select
                                value={vm.sortBy}
                                onChange={(e) => vm.setSortBy(e.target.value)}
                                className="bg-transparent text-sm text-neutral-700 outline-none"
                            >
                                <option value="latest_start">Mới nhất theo ngày bắt đầu</option>
                                <option value="oldest_start">Cũ nhất theo ngày bắt đầu</option>
                                <option value="highest_percent">% giảm cao nhất</option>
                                <option value="lowest_percent">% giảm thấp nhất</option>
                                <option value="name_az">Tên A-Z</option>
                                <option value="name_za">Tên Z-A</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="table-container">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="table-header">
                            <tr>
                                <th className="px-4 py-4 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    <input
                                        type="checkbox"
                                        checked={allSelectedOnPage}
                                        onChange={toggleSelectAllOnPage}
                                        aria-label="Chọn tất cả voucher trên trang"
                                    />
                                </th>
                                <th className="px-4 py-4 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    #
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Mã Voucher
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Tên Voucher
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Giảm Giá
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Thời Gian
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Thời Lượng
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Trạng Thái
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Hành Động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {vm.paginatedVouchers.map((v, index) => (
                                <tr key={v.km_id} className="table-row" style={{ animationDelay: `${index * 50}ms` }}>
                                    <td className="px-4 py-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(v.km_id)}
                                            onChange={() => toggleSelectOne(v.km_id)}
                                            aria-label={`Chọn voucher ${v.km_id}`}
                                        />
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className="inline-flex items-center justify-center min-w-7 h-7 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold">
                                            {v.rank}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm text-neutral-900 bg-neutral-100 px-3 py-1 rounded-lg">
                                            {v.km_id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                                <Tag className="text-primary-600" size={16} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900">{v.km_name}</p>
                                                <p className="text-xs text-neutral-500 max-w-[280px] truncate">{v.km_description || "Không có mô tả"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <Percent className="text-emerald-600" size={16} />
                                                <span className="font-semibold text-emerald-600">{v.km_percent}%</span>
                                            </div>
                                            <div className="w-24 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full"
                                                    style={{ width: `${Math.min(100, Number(v.km_percent || 0))}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <div className="flex items-center gap-2 text-neutral-700 font-medium">
                                                <Calendar className="text-neutral-400" size={14} />
                                                <span>{formatDate(v.km_start_date)} - {formatDate(v.km_end_date)}</span>
                                            </div>
                                            <div className="mt-1 text-xs text-neutral-500">
                                                Hiệu lực {v.durationDays} ngày
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="inline-flex items-center gap-2 text-sm text-neutral-700">
                                            <TimerOff size={14} className="text-neutral-500" />
                                            <span>{v.durationDays} ngày</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="inline-flex items-center gap-2">
                                            <CircleDot className="text-red-500" size={14} />
                                            <span className="text-sm font-medium text-neutral-700">{getStatusText(v.km_start_date, v.km_end_date)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => vm.openEdit(v)}
                                                className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                                                title="Chỉnh sửa"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => vm.handleDelete(v.km_id)}
                                                className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                                title="Xóa"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {vm.paginatedVouchers.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="px-6 py-12 text-center">
                                        <div className="text-center">
                                            <Gift className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                                            <h3 className="text-lg font-medium text-neutral-900 mb-2">Không có voucher</h3>
                                            <p className="text-neutral-600">
                                                {vm.search ? 'Không tìm thấy voucher nào' : 'Bắt đầu bằng cách thêm voucher đầu tiên'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {vm.totalVisible > 0 && (
                <PaginationComponent
                    currentPage={vm.currentPage}
                    totalPages={vm.totalPages}
                    itemsPerPage={vm.itemsPerPage}
                    totalItems={vm.totalVisible}
                    onPageChange={vm.handlePageChange}
                    onPreviousPage={vm.handlePreviousPage}
                    onNextPage={vm.handleNextPage}
                    itemLabel="voucher"
                />
            )}

            {/* MODAL */}
            <VoucherForm
                open={vm.openForm}
                onClose={() => vm.setOpenForm(false)}
                onSubmit={{
                    form: vm.form,
                    setForm: vm.setForm,
                    handleSubmit: vm.handleSubmit,
                    isSubmitting: vm.isSubmitting
                }}
                editing={vm.editing}
            />

            {showImportModal && (
                <div
                    className="import-modal-backdrop"
                    onClick={() => {
                        if (!vm.isImportingFile) {
                            setShowImportModal(false);
                            setIsDraggingFile(false);
                        }
                    }}
                >
                    <div className="import-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="import-modal-header">
                            <div>
                                <h3>Nhập file voucher</h3>
                                <p>Hỗ trợ .xlsx, .xls, .csv, .json. Khuyên dùng file mẫu .xlsx.</p>
                            </div>
                            <button
                                type="button"
                                className="import-close-btn"
                                onClick={() => {
                                    if (!vm.isImportingFile) {
                                        setShowImportModal(false);
                                        setIsDraggingFile(false);
                                    }
                                }}
                                disabled={vm.isImportingFile}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="import-modal-hero">
                            <p>Tải file mẫu để có sẵn cột chuẩn, mã voucher kế tiếp và ngày mẫu hợp lệ.</p>
                            <div className="import-field-tags">
                                <span>Mã voucher</span>
                                <span>Tên voucher</span>
                                <span>Mô tả</span>
                                <span>Phần trăm</span>
                                <span>Ngày bắt đầu</span>
                                <span>Ngày kết thúc</span>
                            </div>
                        </div>

                        <div
                            className={`import-dropzone ${isDraggingFile ? "dragging" : ""} ${vm.isImportingFile ? "disabled" : ""}`}
                            onDragOver={(e) => {
                                e.preventDefault();
                                if (!vm.isImportingFile) setIsDraggingFile(true);
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                setIsDraggingFile(false);
                            }}
                            onDrop={onDropFile}
                        >
                            {vm.isImportingFile ? (
                                <>
                                    <Loader2 size={28} className="animate-spin" />
                                    <p>Đang import file, vui lòng chờ...</p>
                                </>
                            ) : (
                                <>
                                    <Upload size={28} />
                                    <p>Kéo thả file vào đây hoặc chọn file từ máy</p>
                                    <small>File mẫu đã có sẵn cột đúng chuẩn để nhập nhanh.</small>
                                    <button type="button" className="import-action-btn" onClick={onPickFile}>
                                        <FileSpreadsheet size={16} />
                                        Chọn file để import
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="import-modal-actions">
                            <button
                                type="button"
                                className="import-template-btn"
                                onClick={downloadTemplateFile}
                                disabled={vm.isImportingFile}
                            >
                                <Download size={16} />
                                Tải file mẫu
                            </button>

                            <button
                                type="button"
                                className="import-cancel-btn"
                                onClick={() => {
                                    if (!vm.isImportingFile) {
                                        setShowImportModal(false);
                                        setIsDraggingFile(false);
                                    }
                                }}
                                disabled={vm.isImportingFile}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
