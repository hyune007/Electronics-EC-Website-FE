import { Plus, Pencil, Trash2, Search, Percent, Calendar, Tag, Gift, ArrowUpDown, Sparkles, TimerOff, CircleDot, Clock, Loader2, ChevronDown, FileSpreadsheet, Upload, Download, X, CheckSquare, Layers, Package, Tags } from "lucide-react";
import { useVoucherLogic } from "./VoucherLogic.js";
import VoucherForm from "./VoucherForm.jsx";
import { useState, useEffect, useRef, useMemo } from "react";
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
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [targetVoucher, setTargetVoucher] = useState(null);
    const [applySearch, setApplySearch] = useState("");
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

    const applyMode = vm.quickApply?.mode || "none";
    const applyKeyword = applySearch.toLowerCase().trim();

    const visibleProducts = useMemo(() => {
        const list = Array.isArray(vm.productOptions) ? vm.productOptions : [];
        if (!applyKeyword) return list;
        return list.filter((item) => (
            String(item?.id || "").toLowerCase().includes(applyKeyword)
            || String(item?.name || "").toLowerCase().includes(applyKeyword)
        ));
    }, [applyKeyword, vm.productOptions]);

    const visibleBrands = useMemo(() => {
        const list = Array.isArray(vm.brandOptions) ? vm.brandOptions : [];
        if (!applyKeyword) return list;
        return list.filter((item) => (
            String(item?.hang_id || "").toLowerCase().includes(applyKeyword)
            || String(item?.hang_name || "").toLowerCase().includes(applyKeyword)
        ));
    }, [applyKeyword, vm.brandOptions]);

    const visibleCategories = useMemo(() => {
        const list = Array.isArray(vm.categoryOptions) ? vm.categoryOptions : [];
        if (!applyKeyword) return list;
        return list.filter((item) => (
            String(item?.dm_id || "").toLowerCase().includes(applyKeyword)
            || String(item?.dm_name || "").toLowerCase().includes(applyKeyword)
        ));
    }, [applyKeyword, vm.categoryOptions]);

    const selectedCount = applyMode === "product"
        ? (vm.quickApply?.productIds || []).length
        : applyMode === "brand"
            ? (vm.quickApply?.brandIds || []).length
            : applyMode === "category"
                ? (vm.quickApply?.categoryIds || []).length
                : 0;

    const openApplyForVoucher = async (voucher) => {
        setTargetVoucher(voucher);
        setApplySearch("");
        await vm.openApplyPanel(voucher);
        setShowApplyModal(true);
    };

    const closeApplyModal = () => {
        if (vm.isApplyingScope) return;
        setShowApplyModal(false);
        setTargetVoucher(null);
        setApplySearch("");
    };

    const toggleApplySelected = (key) => {
        if (!key) return;

        if (applyMode === "product") {
            vm.setQuickApply((prev) => ({
                ...prev,
                productIds: prev.productIds.includes(key)
                    ? prev.productIds.filter((id) => id !== key)
                    : [...prev.productIds, key],
            }));
            return;
        }

        if (applyMode === "brand") {
            vm.setQuickApply((prev) => ({
                ...prev,
                brandIds: prev.brandIds.includes(key)
                    ? prev.brandIds.filter((id) => id !== key)
                    : [...prev.brandIds, key],
            }));
            return;
        }

        if (applyMode === "category") {
            vm.setQuickApply((prev) => ({
                ...prev,
                categoryIds: prev.categoryIds.includes(key)
                    ? prev.categoryIds.filter((id) => id !== key)
                    : [...prev.categoryIds, key],
            }));
        }
    };

    const selectAllApplyVisible = () => {
        if (applyMode === "product") {
            vm.setQuickApply((prev) => ({
                ...prev,
                productIds: Array.from(new Set(visibleProducts.map((item) => item.id).filter(Boolean))),
            }));
            return;
        }

        if (applyMode === "brand") {
            vm.setQuickApply((prev) => ({
                ...prev,
                brandIds: Array.from(new Set(visibleBrands.map((item) => item.hang_id).filter(Boolean))),
            }));
            return;
        }

        if (applyMode === "category") {
            vm.setQuickApply((prev) => ({
                ...prev,
                categoryIds: Array.from(new Set(visibleCategories.map((item) => item.dm_id).filter(Boolean))),
            }));
        }
    };

    const clearApplySelected = () => {
        if (applyMode === "product") {
            vm.setQuickApply((prev) => ({ ...prev, productIds: [] }));
            return;
        }

        if (applyMode === "brand") {
            vm.setQuickApply((prev) => ({ ...prev, brandIds: [] }));
            return;
        }

        if (applyMode === "category") {
            vm.setQuickApply((prev) => ({ ...prev, categoryIds: [] }));
        }
    };

    const handleApplyVoucher = async () => {
        if (!targetVoucher?.km_id) return;
        const ok = await vm.applyScopeForVoucher(targetVoucher.km_id);
        if (ok) {
            closeApplyModal();
        }
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
                                                onClick={() => openApplyForVoucher(v)}
                                                className="p-2 text-neutral-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                                                title="Áp dụng voucher"
                                            >
                                                <CheckSquare size={16} />
                                            </button>
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
                    isSubmitting: vm.isSubmitting,
                    quickApply: vm.quickApply,
                    setQuickApply: vm.setQuickApply,
                    isLoadingApplyData: vm.isLoadingApplyData,
                    productOptions: vm.productOptions,
                    brandOptions: vm.brandOptions,
                    categoryOptions: vm.categoryOptions,
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

            {showApplyModal && (
                <div
                    className="import-modal-backdrop"
                    onClick={closeApplyModal}
                >
                    <div className="import-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="import-modal-header">
                            <div>
                                <h3>Áp dụng voucher: {targetVoucher?.km_name}</h3>
                                <p>Chọn phạm vi giảm giá theo danh mục, hãng hoặc sản phẩm (tick chọn nhiều).</p>
                            </div>
                            <button
                                type="button"
                                className="import-close-btn"
                                onClick={closeApplyModal}
                                disabled={vm.isApplyingScope}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Phạm vi áp dụng</label>
                                <div className="relative">
                                    <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                                    <select
                                        value={applyMode}
                                        onChange={(e) => vm.setQuickApply((prev) => ({ ...prev, mode: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                                    >
                                        <option value="none">Chọn phạm vi...</option>
                                        <option value="all">Toàn bộ sản phẩm</option>
                                        <option value="product">Theo sản phẩm</option>
                                        <option value="brand">Theo hãng (loại hàng)</option>
                                        <option value="category">Theo danh mục</option>
                                    </select>
                                </div>
                            </div>

                            {applyMode !== "none" && applyMode !== "all" && (
                                <>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                                        <input
                                            type="text"
                                            value={applySearch}
                                            onChange={(e) => setApplySearch(e.target.value)}
                                            placeholder={applyMode === "product" ? "Tìm sản phẩm..." : applyMode === "brand" ? "Tìm hãng..." : "Tìm danh mục..."}
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                                        />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 text-sm">
                                        <button
                                            type="button"
                                            onClick={selectAllApplyVisible}
                                            className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all duration-200"
                                        >
                                            Chọn tất cả đang lọc
                                        </button>
                                        <button
                                            type="button"
                                            onClick={clearApplySelected}
                                            className="px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-all duration-200"
                                        >
                                            Bỏ chọn hết
                                        </button>
                                        <span className="text-neutral-500">Đã chọn: {selectedCount}</span>
                                    </div>

                                    <div className="border border-neutral-200 rounded-xl max-h-64 overflow-y-auto divide-y divide-neutral-100">
                                        {vm.isLoadingApplyData ? (
                                            <div className="p-4 text-sm text-neutral-500 flex items-center gap-2">
                                                <Loader2 size={16} className="animate-spin" />
                                                Đang tải danh sách...
                                            </div>
                                        ) : (
                                            <>
                                                {applyMode === "product" && visibleProducts.map((item) => (
                                                    <label key={item.id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-neutral-50">
                                                        <input
                                                            type="checkbox"
                                                            checked={(vm.quickApply?.productIds || []).includes(item.id)}
                                                            onChange={() => toggleApplySelected(item.id)}
                                                        />
                                                        <Package size={16} className="text-neutral-500" />
                                                        <div className="text-sm">
                                                            <div className="font-medium text-neutral-900">{item.name}</div>
                                                            <div className="text-neutral-500">{item.id}</div>
                                                        </div>
                                                    </label>
                                                ))}

                                                {applyMode === "brand" && visibleBrands.map((item) => (
                                                    <label key={item.hang_id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-neutral-50">
                                                        <input
                                                            type="checkbox"
                                                            checked={(vm.quickApply?.brandIds || []).includes(item.hang_id)}
                                                            onChange={() => toggleApplySelected(item.hang_id)}
                                                        />
                                                        <Tags size={16} className="text-neutral-500" />
                                                        <div className="text-sm">
                                                            <div className="font-medium text-neutral-900">{item.hang_name}</div>
                                                            <div className="text-neutral-500">{item.hang_id}</div>
                                                        </div>
                                                    </label>
                                                ))}

                                                {applyMode === "category" && visibleCategories.map((item) => (
                                                    <label key={item.dm_id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-neutral-50">
                                                        <input
                                                            type="checkbox"
                                                            checked={(vm.quickApply?.categoryIds || []).includes(item.dm_id)}
                                                            onChange={() => toggleApplySelected(item.dm_id)}
                                                        />
                                                        <Layers size={16} className="text-neutral-500" />
                                                        <div className="text-sm">
                                                            <div className="font-medium text-neutral-900">{item.dm_name}</div>
                                                            <div className="text-neutral-500">{item.dm_id}</div>
                                                        </div>
                                                    </label>
                                                ))}

                                                {((applyMode === "product" && visibleProducts.length === 0)
                                                    || (applyMode === "brand" && visibleBrands.length === 0)
                                                    || (applyMode === "category" && visibleCategories.length === 0)) && (
                                                    <div className="p-4 text-sm text-neutral-500">Không có dữ liệu phù hợp với từ khóa.</div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </>
                            )}

                            {applyMode === "all" && (
                                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-sm text-emerald-800">
                                    Voucher sẽ được áp dụng cho toàn bộ sản phẩm.
                                </div>
                            )}
                        </div>

                        <div className="import-modal-actions">
                            <button
                                type="button"
                                className="import-cancel-btn"
                                onClick={closeApplyModal}
                                disabled={vm.isApplyingScope}
                            >
                                Đóng
                            </button>
                            <button
                                type="button"
                                className="import-action-btn"
                                onClick={handleApplyVoucher}
                                disabled={vm.isApplyingScope}
                            >
                                {vm.isApplyingScope ? <Loader2 size={16} className="animate-spin" /> : <CheckSquare size={16} />}
                                {vm.isApplyingScope ? "Đang áp dụng..." : "Áp dụng voucher"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
