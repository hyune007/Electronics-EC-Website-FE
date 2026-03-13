
import { Plus, Pencil, Trash2, Search, Users, Phone, Mail, Shield, Loader2, ChevronDown, FileSpreadsheet, Upload, Download, X } from "lucide-react";
import { useCustomerLogic } from "./CustomerLogic.js";
import CustomerForm from "./CustomerForm.jsx";
import { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth.js";
import PaginationComponent from "../../../../components/common/PaginationComponent.jsx";
import "./Customer.css";

export default function CustomerManage() {
    const cm = useCustomerLogic();
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
        const visibleIds = new Set((cm.paginatedCustomers || []).map((c) => c.kh_id));
        setSelectedIds((prev) => prev.filter((id) => visibleIds.has(id)));
    }, [cm.paginatedCustomers]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!addMenuRef.current?.contains(event.target)) {
                setShowAddMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const pageIds = (cm.paginatedCustomers || []).map((c) => c.kh_id);
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
        if (!isAdmin || selectedIds.length === 0 || cm.isBulkDeleting) return;
        if (!window.confirm(`Xóa nhanh ${selectedIds.length} khách hàng đã chọn?`)) return;

        await cm.handleDeleteMany(selectedIds);
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
        const existingIds = (cm.filteredCustomers || []).map((item) => item?.kh_id).filter(Boolean);
        const nextNum = getNextNumberFromIds(existingIds, "KH");
        const id1 = `KH${String(nextNum).padStart(3, "0")}`;
        const id2 = `KH${String(nextNum + 1).padStart(3, "0")}`;
        const aoa = [
            ["Mã khách hàng", "Họ tên", "Mật khẩu", "Số điện thoại", "Email", "Vai trò"],
            [id1, "Nguyen Van A", "123456", "0900000001", `kh${nextNum}@example.com`, "ROLE_CUSTOMER"],
            [id2, "Tran Thi B", "123456", "0900000002", `kh${nextNum + 1}@example.com`, "ROLE_CUSTOMER"],
        ];
        const worksheet = XLSX.utils.aoa_to_sheet(aoa);
        worksheet["!cols"] = [{ wch: 14 }, { wch: 24 }, { wch: 14 }, { wch: 16 }, { wch: 28 }, { wch: 16 }];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "MauKhachHang");
        XLSX.writeFile(workbook, "customer-import-template.xlsx");
    };

    const onPickFile = () => {
        if (cm.isImportingFile) return;
        fileInputRef.current?.click();
    };

    const onSelectedFile = async (file) => {
        if (!file) return;
        await cm.handleBulkImportFile(file);
        setShowImportModal(false);
        setIsDraggingFile(false);
    };

    const onDropFile = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingFile(false);

        if (cm.isImportingFile) return;
        const file = event.dataTransfer?.files?.[0];
        await onSelectedFile(file);
    };

    // Theo BE security: ADMIN + EMPLOYEE truy cập, nhưng delete customer chỉ ADMIN
    if (!isAdmin && !isEmployee) {
        return <Navigate to="/unauthorized" replace />;
    }

    return (
        <div className={`fade-in min-h-full ${mounted ? 'slide-up' : ''}`}>
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Quản Lý Khách Hàng</h1>
                        <p className="text-neutral-600">Quản lý thông tin khách hàng và tài khoản</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {isAdmin && selectedIds.length > 0 && (
                            <button
                                type="button"
                                onClick={handleQuickDelete}
                                disabled={cm.isBulkDeleting}
                                className="btn-quick-delete"
                            >
                                {cm.isBulkDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                {cm.isBulkDeleting ? "Đang xóa..." : `Xóa nhanh (${selectedIds.length})`}
                            </button>
                        )}

                        <div className="add-product-actions" ref={addMenuRef}>
                            <button
                                type="button"
                                onClick={() => setShowAddMenu((s) => !s)}
                                className="btn-primary flex items-center gap-2 shadow-lg"
                            >
                                <Plus size={18} />
                                <span>Thêm Khách Hàng</span>
                                <ChevronDown size={16} />
                            </button>

                            {showAddMenu && (
                                <div className="add-menu-dropdown">
                                    <button
                                        type="button"
                                        className="add-menu-item"
                                        onClick={() => {
                                            cm.openAdd();
                                            setShowAddMenu(false);
                                        }}
                                    >
                                        <Plus size={16} />
                                        Thêm 1 khách hàng
                                    </button>
                                    <button
                                        type="button"
                                        className="add-menu-item"
                                        onClick={() => {
                                            setShowImportModal(true);
                                            setShowAddMenu(false);
                                        }}
                                        disabled={cm.isImportingFile}
                                    >
                                        {cm.isImportingFile ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
                                        {cm.isImportingFile ? "Đang import..." : "Thêm nhiều bằng file"}
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
                                <p className="text-neutral-600 text-sm font-medium mb-1">Tổng Khách Hàng</p>
                                <p className="text-2xl font-bold text-neutral-900">{cm.stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                <Users className="text-primary-600" size={24} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Kết Quả Lọc</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {cm.stats.matched}
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
                                <p className="text-neutral-600 text-sm font-medium mb-1">Hồ Sơ Đầy Đủ</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {cm.stats.completionRate}%
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Shield className="text-amber-600" size={24} />
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
                            placeholder="Tìm theo tên hoặc SĐT..."
                            value={cm.search}
                            onChange={(e) => cm.setSearch(e.target.value)}
                            className="flex-1 bg-transparent outline-none ml-3 text-neutral-900 placeholder-neutral-400"
                        />
                    </div>

                    <div className="sm:w-64">
                        <select
                            value={cm.sortBy}
                            onChange={(e) => cm.setSortBy(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                        >
                            <option value="newest">Sắp xếp: Mới nhất</option>
                            <option value="oldest">Sắp xếp: Cũ nhất</option>
                            <option value="name_az">Sắp xếp: Tên A-Z</option>
                            <option value="name_za">Sắp xếp: Tên Z-A</option>
                            <option value="email_az">Sắp xếp: Email A-Z</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="table-container">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="table-header">
                            <tr>
                                {isAdmin && (
                                    <th className="px-4 py-4 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                        <input
                                            type="checkbox"
                                            checked={allSelectedOnPage}
                                            onChange={toggleSelectAllOnPage}
                                            aria-label="Chọn tất cả khách hàng trên trang"
                                        />
                                    </th>
                                )}
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Mã Khách Hàng
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Họ Tên
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    SĐT
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Vai Trò
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Hành Động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {cm.paginatedCustomers.map((c, index) => (
                                <tr key={c.kh_id} className="table-row" style={{ animationDelay: `${index * 50}ms` }}>
                                    {isAdmin && (
                                        <td className="px-4 py-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(c.kh_id)}
                                                onChange={() => toggleSelectOne(c.kh_id)}
                                                aria-label={`Chọn khách hàng ${c.kh_id}`}
                                            />
                                        </td>
                                    )}
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm text-neutral-900 bg-neutral-100 px-3 py-1 rounded-lg">
                                            {c.kh_id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                                <Users className="text-primary-600" size={16} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900">{c.kh_name}</p>
                                                <p className="text-xs text-neutral-500">Khách hàng</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Phone className="text-neutral-400" size={16} />
                                            <span className="text-neutral-900">{c.kh_phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Mail className="text-neutral-400" size={16} />
                                            <span className="text-neutral-900">{c.kh_mail}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="badge-primary">Khách hàng</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => cm.openEdit(c)}
                                                className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                                                title="Chỉnh sửa"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => cm.handleDelete(c.kh_id)}
                                                    className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {cm.paginatedCustomers.length === 0 && (
                                <tr>
                                    <td colSpan={isAdmin ? 7 : 6} className="px-6 py-12 text-center">
                                        <div className="text-center">
                                            <Users className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                                            <h3 className="text-lg font-medium text-neutral-900 mb-2">Không có khách hàng</h3>
                                            <p className="text-neutral-600">
                                                {cm.search ? 'Không tìm thấy khách hàng nào' : 'Bắt đầu bằng cách thêm khách hàng đầu tiên'}
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
            {cm.filteredCustomers.length > 0 && (
                <PaginationComponent
                    currentPage={cm.currentPage}
                    totalPages={cm.totalPages}
                    itemsPerPage={cm.itemsPerPage}
                    totalItems={cm.filteredCustomers.length}
                    onPageChange={cm.handlePageChange}
                    onPreviousPage={cm.handlePreviousPage}
                    onNextPage={cm.handleNextPage}
                    itemLabel="khách hàng"
                />
            )}

            {/* MODAL */}
            <CustomerForm
                open={cm.openForm}
                onClose={() => cm.setOpenForm(false)}
                onSubmit={{
                    form: cm.form,
                    setForm: cm.setForm,
                    handleSubmit: cm.handleSubmit
                }}
                editing={cm.editing}
            />

            {showImportModal && (
                <div
                    className="import-modal-backdrop"
                    onClick={() => {
                        if (!cm.isImportingFile) {
                            setShowImportModal(false);
                            setIsDraggingFile(false);
                        }
                    }}
                >
                    <div className="import-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="import-modal-header">
                            <div>
                                <h3>Nhập file khách hàng</h3>
                                <p>Hỗ trợ .xlsx, .xls, .csv, .json. Khuyên dùng file mẫu .xlsx.</p>
                            </div>
                            <button
                                type="button"
                                className="import-close-btn"
                                onClick={() => {
                                    if (!cm.isImportingFile) {
                                        setShowImportModal(false);
                                        setIsDraggingFile(false);
                                    }
                                }}
                                disabled={cm.isImportingFile}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="import-modal-hero">
                            <p>Tải file mẫu để có sẵn cột chuẩn và mã khách hàng kế tiếp.</p>
                            <div className="import-field-tags">
                                <span>Mã khách hàng</span>
                                <span>Họ tên</span>
                                <span>Mật khẩu</span>
                                <span>Số điện thoại</span>
                                <span>Email</span>
                                <span>Vai trò</span>
                            </div>
                        </div>

                        <div
                            className={`import-dropzone ${isDraggingFile ? "dragging" : ""} ${cm.isImportingFile ? "disabled" : ""}`}
                            onDragOver={(e) => {
                                e.preventDefault();
                                if (!cm.isImportingFile) setIsDraggingFile(true);
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                setIsDraggingFile(false);
                            }}
                            onDrop={onDropFile}
                        >
                            {cm.isImportingFile ? (
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
                                disabled={cm.isImportingFile}
                            >
                                <Download size={16} />
                                Tải file mẫu
                            </button>

                            <button
                                type="button"
                                className="import-cancel-btn"
                                onClick={() => {
                                    if (!cm.isImportingFile) {
                                        setShowImportModal(false);
                                        setIsDraggingFile(false);
                                    }
                                }}
                                disabled={cm.isImportingFile}
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
