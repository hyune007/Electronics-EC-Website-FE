import { Plus, Pencil, Trash2, Search, Building2, TrendingUp, ArrowDownWideNarrow, ChevronUp, ChevronDown, ArrowUpDown, Loader2, ChevronDown as ChevronDownIcon, FileSpreadsheet, Upload, Download, X } from "lucide-react";
import { useBrandLogic } from "./BrandLogic.js";
import BrandForm from "./BrandForm.jsx";
import { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth.js";
import PaginationComponent from "../../../../components/common/PaginationComponent.jsx";
import "./Brand.css";

export default function BrandManage() {
    const bm = useBrandLogic();
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
        const visibleIds = new Set((bm.paginatedBrands || []).map((b) => b.hang_id));
        setSelectedIds((prev) => prev.filter((id) => visibleIds.has(id)));
    }, [bm.paginatedBrands]);

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

    const isIdSort = bm.sortBy === "newest_id" || bm.sortBy === "oldest_id" || bm.sortBy === "id_az";
    const isNameSort = bm.sortBy === "name_az" || bm.sortBy === "name_za";

    const renderSortIcon = (column) => {
        if (column === "id") {
            if (bm.sortBy === "newest_id") return <ChevronDown size={14} className="text-indigo-600" />;
            if (bm.sortBy === "oldest_id") return <ChevronUp size={14} className="text-indigo-600" />;
            if (bm.sortBy === "id_az") return <ArrowUpDown size={14} className="text-indigo-600" />;
            return <ArrowUpDown size={14} className="text-neutral-400" />;
        }

        if (column === "name") {
            if (bm.sortBy === "name_az") return <ChevronUp size={14} className="text-indigo-600" />;
            if (bm.sortBy === "name_za") return <ChevronDown size={14} className="text-indigo-600" />;
            return <ArrowUpDown size={14} className="text-neutral-400" />;
        }

        return null;
    };

    const handleSortById = () => {
        if (bm.sortBy === "newest_id") {
            bm.setSortBy("oldest_id");
            return;
        }
        if (bm.sortBy === "oldest_id") {
            bm.setSortBy("id_az");
            return;
        }
        bm.setSortBy("newest_id");
    };

    const handleSortByName = () => {
        bm.setSortBy(bm.sortBy === "name_az" ? "name_za" : "name_az");
    };

    const pageIds = (bm.paginatedBrands || []).map((b) => b.hang_id);
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
        if (selectedIds.length === 0 || bm.isBulkDeleting) return;
        if (!window.confirm(`Xóa nhanh ${selectedIds.length} thương hiệu đã chọn?`)) return;

        await bm.handleDeleteMany(selectedIds);
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

    const downloadTemplateFile = async () => {
        const XLSX = await import("xlsx");
        const existingIds = (bm.filteredBrands || []).map((item) => item?.hang_id).filter(Boolean);
        const nextNum = getNextNumberFromIds(existingIds, "H");
        const id1 = `H${String(nextNum).padStart(2, "0")}`;
        const id2 = `H${String(nextNum + 1).padStart(2, "0")}`;
        const baseName1 = bm.filteredBrands?.[0]?.hang_name || "Samsung";
        const baseName2 = bm.filteredBrands?.[1]?.hang_name || "Apple";
        const aoa = [
            ["Mã thương hiệu", "Tên thương hiệu"],
            [id1, `${baseName1} Studio`],
            [id2, `${baseName2} Signature`],
        ];
        const worksheet = XLSX.utils.aoa_to_sheet(aoa);
        worksheet["!cols"] = [{ wch: 16 }, { wch: 30 }];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "MauThuongHieu");
        XLSX.writeFile(workbook, "brand-import-template.xlsx");
    };

    const onPickFile = () => {
        if (bm.isImportingFile) return;
        fileInputRef.current?.click();
    };

    const onSelectedFile = async (file) => {
        if (!file) return;
        await bm.handleBulkImportFile(file);
        setShowImportModal(false);
        setIsDraggingFile(false);
    };

    const onDropFile = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingFile(false);

        if (bm.isImportingFile) return;
        const file = event.dataTransfer?.files?.[0];
        await onSelectedFile(file);
    };

    return (
        <div className={`fade-in min-h-full ${mounted ? 'slide-up' : ''}`}>
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Quản Lý Thương Hiệu</h1>
                        <p className="text-neutral-600">Quản lý thông tin thương hiệu sản phẩm</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {selectedIds.length > 0 && (
                            <button
                                type="button"
                                onClick={handleQuickDelete}
                                disabled={bm.isBulkDeleting}
                                className="btn-quick-delete"
                            >
                                {bm.isBulkDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                {bm.isBulkDeleting ? "Đang xóa..." : `Xóa nhanh (${selectedIds.length})`}
                            </button>
                        )}

                        <div className="add-product-actions" ref={addMenuRef}>
                            <button
                                type="button"
                                onClick={() => setShowAddMenu((s) => !s)}
                                className="btn-primary flex items-center gap-2 shadow-lg"
                            >
                                <Plus size={18} />
                                <span>Thêm Thương Hiệu</span>
                                <ChevronDownIcon size={16} />
                            </button>

                            {showAddMenu && (
                                <div className="add-menu-dropdown">
                                    <button
                                        type="button"
                                        className="add-menu-item"
                                        onClick={() => {
                                            bm.openAdd();
                                            setShowAddMenu(false);
                                        }}
                                    >
                                        <Plus size={16} />
                                        Thêm 1 thương hiệu
                                    </button>
                                    <button
                                        type="button"
                                        className="add-menu-item"
                                        onClick={() => {
                                            setShowImportModal(true);
                                            setShowAddMenu(false);
                                        }}
                                        disabled={bm.isImportingFile}
                                    >
                                        {bm.isImportingFile ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
                                        {bm.isImportingFile ? "Đang import..." : "Thêm nhiều bằng file"}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Tổng Thương Hiệu</p>
                                <p className="text-2xl font-bold text-neutral-900">{bm.stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                <Building2 className="text-primary-600" size={24} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Kết Quả Lọc</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {bm.stats.matched}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <Search className="text-emerald-600" size={24} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Hôm Nay</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {new Date().toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <TrendingUp className="text-amber-600" size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="card p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 search-box">
                        <Search className="text-neutral-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm theo tên thương hiệu..."
                            value={bm.search}
                            onChange={(e) => bm.setSearch(e.target.value)}
                            className="flex-1 bg-transparent outline-none ml-3 text-neutral-900 placeholder-neutral-400"
                        />
                    </div>

                    <div className="sort-box sm:w-80">
                        <ArrowDownWideNarrow className="text-neutral-400" size={20} />
                        <select
                            value={bm.sortBy}
                            onChange={(e) => bm.setSortBy(e.target.value)}
                            className="flex-1 bg-transparent outline-none ml-3 text-neutral-900"
                        >
                            <option value="newest_id">Sắp xếp: Mã mới nhất</option>
                            <option value="oldest_id">Sắp xếp: Mã cũ nhất</option>
                            <option value="name_az">Sắp xếp: Tên A-Z</option>
                            <option value="name_za">Sắp xếp: Tên Z-A</option>
                            <option value="id_az">Sắp xếp: Mã A-Z</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-neutral-500">Đang sắp xếp:</span>
                    <span className={`sort-chip ${isIdSort ? "active" : ""}`}>Cột mã</span>
                    <span className={`sort-chip ${isNameSort ? "active" : ""}`}>Cột tên</span>
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
                                        aria-label="Chọn tất cả thương hiệu trên trang"
                                    />
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    <button
                                        type="button"
                                        onClick={handleSortById}
                                        className="sortable-header"
                                        title="Sắp xếp theo mã"
                                    >
                                        <span>Mã Thương Hiệu</span>
                                        {renderSortIcon("id")}
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    <button
                                        type="button"
                                        onClick={handleSortByName}
                                        className="sortable-header"
                                        title="Sắp xếp theo tên"
                                    >
                                        <span>Tên Thương Hiệu</span>
                                        {renderSortIcon("name")}
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Hành Động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {bm.loading && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="loading-spinner w-8 h-8 mr-3"></div>
                                            <span className="text-neutral-600">Đang tải dữ liệu...</span>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!bm.loading && bm.paginatedBrands.map((b, index) => (
                                <tr key={b.hang_id} className="table-row" style={{ animationDelay: `${index * 50}ms` }}>
                                    <td className="px-4 py-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(b.hang_id)}
                                            onChange={() => toggleSelectOne(b.hang_id)}
                                            aria-label={`Chọn thương hiệu ${b.hang_id}`}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm text-neutral-900 bg-neutral-100 px-3 py-1 rounded-lg">
                                            {b.hang_id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                                <Building2 className="text-primary-600" size={16} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900">{b.hang_name}</p>
                                                <p className="text-xs text-neutral-500">Thương hiệu</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => bm.openEdit(b)}
                                                className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                                                title="Chỉnh sửa"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => bm.handleDelete(b.hang_id)}
                                                className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                                title="Xóa"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {!bm.loading && bm.paginatedBrands.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center">
                                        <div className="text-center">
                                            <Building2 className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                                            <h3 className="text-lg font-medium text-neutral-900 mb-2">Không có thương hiệu</h3>
                                            <p className="text-neutral-600">
                                                {bm.search ? 'Không tìm thấy thương hiệu nào' : 'Bắt đầu bằng cách thêm thương hiệu đầu tiên'}
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
            {bm.filteredBrands.length > 0 && (
                <PaginationComponent
                    currentPage={bm.currentPage}
                    totalPages={bm.totalPages}
                    itemsPerPage={bm.itemsPerPage}
                    totalItems={bm.stats.matched}
                    onPageChange={bm.handlePageChange}
                    onPreviousPage={bm.handlePreviousPage}
                    onNextPage={bm.handleNextPage}
                    itemLabel="thương hiệu"
                />
            )}

            {/* MODAL */}
            <BrandForm
                open={bm.openForm}
                onClose={() => bm.setOpenForm(false)}
                onSubmit={{
                    form: bm.form,
                    setForm: bm.setForm,
                    handleSubmit: bm.handleSubmit
                }}
                editing={bm.editing}
            />

            {showImportModal && (
                <div
                    className="import-modal-backdrop"
                    onClick={() => {
                        if (!bm.isImportingFile) {
                            setShowImportModal(false);
                            setIsDraggingFile(false);
                        }
                    }}
                >
                    <div className="import-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="import-modal-header">
                            <div>
                                <h3>Nhập file thương hiệu</h3>
                                <p>Hỗ trợ .xlsx, .xls, .csv, .json. Khuyên dùng file mẫu .xlsx.</p>
                            </div>
                            <button
                                type="button"
                                className="import-close-btn"
                                onClick={() => {
                                    if (!bm.isImportingFile) {
                                        setShowImportModal(false);
                                        setIsDraggingFile(false);
                                    }
                                }}
                                disabled={bm.isImportingFile}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="import-modal-hero">
                            <p>Tải file mẫu để có sẵn cột chuẩn và mã thương hiệu kế tiếp.</p>
                            <div className="import-field-tags">
                                <span>Mã thương hiệu</span>
                                <span>Tên thương hiệu</span>
                            </div>
                        </div>

                        <div
                            className={`import-dropzone ${isDraggingFile ? "dragging" : ""} ${bm.isImportingFile ? "disabled" : ""}`}
                            onDragOver={(e) => {
                                e.preventDefault();
                                if (!bm.isImportingFile) setIsDraggingFile(true);
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                setIsDraggingFile(false);
                            }}
                            onDrop={onDropFile}
                        >
                            {bm.isImportingFile ? (
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
                                disabled={bm.isImportingFile}
                            >
                                <Download size={16} />
                                Tải file mẫu
                            </button>

                            <button
                                type="button"
                                className="import-cancel-btn"
                                onClick={() => {
                                    if (!bm.isImportingFile) {
                                        setShowImportModal(false);
                                        setIsDraggingFile(false);
                                    }
                                }}
                                disabled={bm.isImportingFile}
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
