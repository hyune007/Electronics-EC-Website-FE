import {
    Plus,
    Pencil,
    Trash2,
    Search,
    Package,
    TrendingUp,
    DollarSign,
    Image,
    AlertTriangle,
    ArrowDownWideNarrow,
    Loader2,
    ChevronDown,
    FileSpreadsheet,
    Upload,
    Download,
    X,
} from "lucide-react";
import ProductForm from "./ProductForm.jsx";
import { useProductManageLogic } from "./Productlogic.js";
import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth.js";
import PaginationComponent from "../../../../components/common/PaginationComponent.jsx";
import "./Product.css";

export default function ProductManage() {
    const pm = useProductManageLogic();
    const [mounted, setMounted] = useState(false);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [isDraggingFile, setIsDraggingFile] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const fileInputRef = useRef(null);
    const addMenuRef = useRef(null);
    const { user } = useAuth();
    const isAdmin = user?.roleId === "ROLE_ADMIN";
    const isEmployee = user?.roleId === "ROLE_EMPLOYEE";

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!addMenuRef.current?.contains(event.target)) {
                setShowAddMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const visibleIds = new Set((pm.products || []).map((p) => p.sp_id));
        setSelectedIds((prev) => prev.filter((id) => visibleIds.has(id)));
    }, [pm.products]);

    const downloadTemplateFile = async () => {
        const XLSX = await import("xlsx");
        // ID trong file mẫu luôn lấy theo cùng logic form: trang cuối, id lớn nhất + 1
        const nextIds = await pm.fetchNextProductIds(2);

        const firstBrandName = pm.brands?.[0]?.hang_name || pm.brands?.[0]?.name || "Ten thuong hieu";
        const secondBrandName = pm.brands?.[1]?.hang_name || pm.brands?.[1]?.name || firstBrandName;
        const firstCategoryName = pm.categories?.[0]?.name || "Ten danh muc";
        const secondCategoryName = pm.categories?.[1]?.name || firstCategoryName;

        const aoa = [
            ["ID", "Tên sản phẩm", "Giá", "Số lượng", "Mô tả", "Hình ảnh", "Thương hiệu", "Danh mục"],
            [nextIds[0], "Tai nghe Bluetooth XYZ", 990000, 0, "Tai nghe chong on chu dong", "http://example.com/headphone.jpg", firstBrandName, firstCategoryName],
            [nextIds[1], "Loa mini ABC", 450000, 0, "Loa mini ket noi bluetooth", "http://example.com/speaker.jpg", secondBrandName, secondCategoryName],
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(aoa);
        worksheet["!cols"] = [
            { wch: 14 },
            { wch: 28 },
            { wch: 12 },
            { wch: 12 },
            { wch: 32 },
            { wch: 38 },
            { wch: 14 },
            { wch: 14 },
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "MauNhapSanPham");
        XLSX.writeFile(workbook, "product-import-template.xlsx");
    };

    const onPickFile = () => {
        if (pm.isImportingFile) return;
        fileInputRef.current?.click();
    };

    const onSelectedFile = async (file) => {
        if (!file) return;
        await pm.handleBulkImportFile(file);
        setShowImportModal(false);
    };

    const onDropFile = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingFile(false);

        const file = event.dataTransfer?.files?.[0];
        await onSelectedFile(file);
    };

    const allPageIds = (pm.products || []).map((p) => p.sp_id);
    const allSelectedOnPage = allPageIds.length > 0 && allPageIds.every((id) => selectedIds.includes(id));

    const toggleSelectAllOnPage = () => {
        if (allSelectedOnPage) {
            setSelectedIds((prev) => prev.filter((id) => !allPageIds.includes(id)));
            return;
        }

        setSelectedIds((prev) => Array.from(new Set([...prev, ...allPageIds])));
    };

    const toggleSelectOne = (id) => {
        setSelectedIds((prev) => (
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        ));
    };

    const onQuickDelete = async () => {
        if (selectedIds.length === 0 || pm.isBulkDeleting) return;

        const ok = window.confirm(`Bạn chắc chắn muốn xóa nhanh ${selectedIds.length} sản phẩm đã chọn?`);
        if (!ok) return;

        await pm.handleDeleteMany(selectedIds);
        setSelectedIds([]);
    };

    // Theo BE security: ADMIN + EMPLOYEE
    if (!isAdmin && !isEmployee) {
        return <Navigate to="/unauthorized" replace />;
    }

    return (
        <div className={`min-h-full fade-in ${mounted ? "slide-up" : ""}`}>
            {/* ===== HEADER ===== */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                            Quản Lý Sản Phẩm
                        </h1>
                        <p className="text-neutral-600">
                            Quản lý thông tin sản phẩm và tồn kho
                        </p>
                    </div>

                    <div className="add-product-actions" ref={addMenuRef}>
                        {selectedIds.length > 0 && (
                            <button
                                type="button"
                                className="btn-quick-delete"
                                onClick={onQuickDelete}
                                disabled={pm.isBulkDeleting}
                            >
                                {pm.isBulkDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                {pm.isBulkDeleting ? "Đang xóa..." : `Xóa nhanh (${selectedIds.length})`}
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => setShowAddMenu((s) => !s)}
                            className="btn-primary shadow-lg"
                            title="Thêm sản phẩm"
                        >
                            <Plus size={18} />
                            Thêm sản phẩm
                            <ChevronDown size={16} />
                        </button>

                        {showAddMenu && (
                            <div className="add-menu-dropdown">
                                <button
                                    type="button"
                                    className="add-menu-item"
                                    onClick={() => {
                                        pm.openAdd();
                                        setShowAddMenu(false);
                                    }}
                                >
                                    <Plus size={16} />
                                    Thêm 1 sản phẩm (form)
                                </button>

                                <button
                                    type="button"
                                    className="add-menu-item"
                                    onClick={() => {
                                        setShowImportModal(true);
                                        setShowAddMenu(false);
                                    }}
                                    disabled={pm.isImportingFile}
                                >
                                    {pm.isImportingFile ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
                                    {pm.isImportingFile ? "Đang import..." : "Thêm nhiều sản phẩm bằng file"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv,.json"
                    className="hidden"
                    onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            await onSelectedFile(file);
                        }
                        e.target.value = "";
                    }}
                />

                {/* ===== STATS ===== */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        label="Tổng sản phẩm"
                        value={pm.globalStats.totalProducts || pm.totalElements}
                        icon={<Package />}
                        tone="primary"
                    />
                    <StatCard
                        label="Tổng giá trị"
                        value={`${pm.globalStats.totalValue.toLocaleString("vi-VN")} ₫`}
                        icon={<DollarSign />}
                        tone="success"
                    />
                    <StatCard
                        label="Tổng tồn kho"
                        value={pm.globalStats.totalStock}
                        icon={<TrendingUp />}
                        tone="info"
                    />
                    <StatCard
                        label="Sắp hết hàng"
                        value={pm.globalStats.lowStock}
                        icon={<AlertTriangle />}
                        tone="warning"
                    />
                </div>
            </div>

            {/* ===== SEARCH ===== */}
            <div className="card p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="search-box flex-1">
                        <Search size={18} className="text-neutral-400" />
                        <input
                            value={pm.search}
                            onChange={e => pm.setSearch(e.target.value)}
                            placeholder="Tìm theo tên hoặc mã sản phẩm..."
                            className="flex-1 ml-3 outline-none bg-transparent"
                        />
                    </div>

                    <div className="sort-box md:w-[320px]">
                        <ArrowDownWideNarrow size={18} className="text-neutral-400" />
                        <select
                            value={pm.sortBy}
                            onChange={(e) => pm.setSortBy(e.target.value)}
                            className="flex-1 ml-3 bg-transparent outline-none"
                        >
                            <option value="newest_id">Sắp xếp: Mã mới nhất</option>
                            <option value="oldest_id">Sắp xếp: Mã cũ nhất</option>
                            <option value="name_az">Sắp xếp: Tên A-Z</option>
                            <option value="name_za">Sắp xếp: Tên Z-A</option>
                            <option value="price_desc">Sắp xếp: Giá cao đến thấp</option>
                            <option value="price_asc">Sắp xếp: Giá thấp đến cao</option>
                            <option value="stock_desc">Sắp xếp: Tồn kho cao đến thấp</option>
                            <option value="stock_asc">Sắp xếp: Tồn kho thấp đến cao</option>
                            <option value="value_desc">Sắp xếp: Giá trị tồn kho cao nhất</option>
                            <option value="low_stock_first">Sắp xếp: Ưu tiên sắp hết hàng</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ===== TABLE ===== */}
            <div className="table-container">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="table-header">
                            <tr>
                                <th className="text-center w-12">
                                    <input
                                        type="checkbox"
                                        checked={allSelectedOnPage}
                                        onChange={toggleSelectAllOnPage}
                                        aria-label="Chọn tất cả sản phẩm trên trang"
                                    />
                                </th>
                                <th className="whitespace-nowrap">Mã</th>
                                <th className="whitespace-nowrap min-w-[250px]">Sản phẩm</th>
                                <th className="text-right whitespace-nowrap min-w-[120px]">Giá</th>
                                <th className="text-center whitespace-nowrap">Kho</th>
                                <th className="whitespace-nowrap">Danh mục</th>
                                <th className="whitespace-nowrap">Thương hiệu</th>
                                <th className="whitespace-nowrap">Khuyến mãi</th>
                                <th className="text-center whitespace-nowrap">Ảnh</th>
                                <th className="text-center whitespace-nowrap min-w-[100px]">Hành động</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y page-animate">
                            {pm.loading && pm.products.length === 0 && (
                                <tr>
                                    <td colSpan="10" className="py-10 text-center">
                                        <div className="flex justify-center items-center">
                                            <div className="loading-spinner w-8 h-8 mr-3" />
                                            Đang tải dữ liệu...
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {pm.products.map((p, index) => (
                                    <tr
                                        key={p.sp_id}
                                        className="table-row"
                                        style={{
                                            animationDelay: `${index * 40}ms`
                                        }}
                                    >
                                        <td className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(p.sp_id)}
                                                onChange={() => toggleSelectOne(p.sp_id)}
                                                aria-label={`Chọn sản phẩm ${p.sp_id}`}
                                            />
                                        </td>
                                        <td className="whitespace-nowrap">
                                            <span className="font-mono bg-neutral-100 px-2 py-1 rounded text-sm">
                                                {p.sp_id}
                                            </span>
                                        </td>

                                        <td className="min-w-[250px]">
                                            <div className="flex gap-3">
                                                <div className="w-10 h-10 bg-neutral-100 rounded-lg overflow-hidden flex items-center justify-center">
                                                    {p.sp_image ? (
                                                        <img
                                                            src={p.sp_image}
                                                            alt={p.sp_name}
                                                            className="w-full h-full object-cover"
                                                            loading="lazy"
                                                            decoding="async"
                                                            onError={(e) => {
                                                                e.currentTarget.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                                                            }}
                                                        />
                                                    ) : (
                                                        <Package
                                                            size={16}
                                                            className="text-neutral-400"
                                                        />
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="font-medium">
                                                        {p.sp_name}
                                                    </p>
                                                    {p.sp_desc && (
                                                        <p className="text-xs text-neutral-500 truncate">
                                                            {p.sp_desc}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="text-right font-medium whitespace-nowrap">
                                            <div className="flex flex-col items-end gap-1">
                                                {p?.sp_discountedPrice && p.sp_discountedPrice < p.sp_price ? (
                                                    <>
                                                        <span className="line-through text-gray-400 text-sm">
                                                            {p.sp_price.toLocaleString("vi-VN")} ₫
                                                        </span>
                                                        <span className="text-red-600 font-semibold">
                                                            {p.sp_discountedPrice.toLocaleString("vi-VN")} ₫
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="text-transparent text-sm select-none" aria-hidden="true">-</span>
                                                        <span>{p.sp_price.toLocaleString("vi-VN")} ₫</span>
                                                    </>
                                                )}
                                            </div>
                                        </td>

                                        <td className="text-center whitespace-nowrap">
                                            <span
                                                className={`font-semibold px-3 py-1 rounded-full text-sm ${p.sp_stock < 10
                                                    ? "bg-red-50 text-red-600"
                                                    : p.sp_stock < 50
                                                        ? "bg-amber-50 text-amber-600"
                                                        : "bg-emerald-50 text-emerald-600"
                                                    }`}
                                            >
                                                {p.sp_stock}
                                            </span>
                                        </td>

                                        <td className="whitespace-nowrap">
                                            <span className="badge-success whitespace-nowrap truncate block max-w-[150px]">
                                                {p.sp_category_name}
                                            </span>
                                        </td>

                                        <td className="whitespace-nowrap">
                                            <span className="badge-primary whitespace-nowrap truncate block max-w-[120px]">
                                                {p.sp_brand_name}
                                            </span>
                                        </td>

                                        <td className="whitespace-nowrap">
                                            <span className="badge-warning whitespace-nowrap truncate block max-w-[120px]">
                                                {p.sp_promotion_name}
                                            </span>
                                        </td>

                                        <td className="text-center whitespace-nowrap">
                                            {p.sp_image ? (
                                                <img
                                                    src={p.sp_image}
                                                    alt={p.sp_name}
                                                    className="w-12 h-12 mx-auto rounded-lg object-cover"
                                                    loading="lazy"
                                                    decoding="async"
                                                    onError={(e) => {
                                                        e.currentTarget.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                                                    }}
                                                />
                                            ) : (
                                                <Image
                                                    className="mx-auto text-neutral-400"
                                                    size={20}
                                                />
                                            )}
                                        </td>

                                        <td>
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => pm.openEdit(p)}
                                                    disabled={pm.deletingId === p.sp_id}
                                                    className="p-2 hover:bg-primary-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => pm.handleDelete(p)}
                                                    disabled={pm.deletingId !== null}
                                                    className="p-2 hover:bg-red-50 rounded text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
                                                    title="Xóa"
                                                >
                                                    {pm.deletingId === p.sp_id ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                            {!pm.loading && pm.products.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="9"
                                        className="text-center py-10"
                                    >
                                        <Package className="mx-auto mb-3 text-neutral-400" />
                                        Không có sản phẩm
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ===== PAGINATION ===== */}
            {!pm.loading && pm.products.length > 0 && (
                <PaginationComponent
                    currentPage={pm.page - 1}
                    totalPages={pm.totalPages}
                    itemsPerPage={12}
                    totalItems={pm.totalElements}
                    onPageChange={(page) => pm.setPage(page + 1)}
                    onPreviousPage={() => pm.setPage(p => Math.max(1, p - 1))}
                    onNextPage={() => pm.setPage(p => Math.min(pm.totalPages, p + 1))}
                    itemLabel="sản phẩm"
                />
            )}

            {/* ===== MODAL ===== */}
            <ProductForm
                open={pm.openForm}
                onClose={() => pm.setOpenForm(false)}
                onSubmit={{
                    form: pm.form,
                    setForm: pm.setForm,
                    handleSubmit: pm.handleSubmit
                }}
                editing={pm.editing}
                isSubmitting={pm.isSubmitting}
                brands={pm.brands}
                categories={pm.categories}
                promotions={pm.promotions}
            />

            {showImportModal && (
                <div
                    className="import-modal-backdrop"
                    onClick={() => {
                        if (!pm.isImportingFile) {
                            setShowImportModal(false);
                            setIsDraggingFile(false);
                        }
                    }}
                >
                    <div
                        className="import-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="import-modal-header">
                            <div>
                                <h3>Nhập file sản phẩm</h3>
                                <p>Hỗ trợ .xlsx, .xls, .csv, .json. Khuyên dùng file mẫu .xlsx.</p>
                            </div>
                            <button
                                type="button"
                                className="import-close-btn"
                                onClick={() => {
                                    if (!pm.isImportingFile) {
                                        setShowImportModal(false);
                                        setIsDraggingFile(false);
                                    }
                                }}
                                disabled={pm.isImportingFile}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="import-modal-hero">
                            <p>
                                Tải file mẫu để có sẵn cột chuẩn, mã sản phẩm kế tiếp và tên thương hiệu/danh mục dạng chữ.
                            </p>
                            <p className="text-amber-700 text-sm mt-1">
                                Tồn kho khi import luôn = 0; chỉ cập nhật tồn kho qua <strong>Quản lí nhập kho</strong>.
                            </p>
                            <div className="import-field-tags">
                                <span>ID</span>
                                <span>Tên sản phẩm</span>
                                <span>Giá</span>
                                <span>Số lượng (bỏ qua)</span>
                                <span>Mô tả</span>
                                <span>Hình ảnh</span>
                                <span>Thương hiệu</span>
                                <span>Danh mục</span>
                            </div>
                        </div>

                        <div
                            className={`import-dropzone ${isDraggingFile ? "dragging" : ""} ${pm.isImportingFile ? "disabled" : ""}`}
                            onDragOver={(e) => {
                                e.preventDefault();
                                if (!pm.isImportingFile) {
                                    setIsDraggingFile(true);
                                }
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                setIsDraggingFile(false);
                            }}
                            onDrop={onDropFile}
                        >
                            {pm.isImportingFile ? (
                                <>
                                    <Loader2 size={28} className="animate-spin" />
                                    <p>Đang import file, vui lòng chờ...</p>
                                </>
                            ) : (
                                <>
                                    <Upload size={28} />
                                    <p>Kéo thả file vào đây hoặc chọn file từ máy</p>
                                    <small>File mẫu sẽ dùng tên thương hiệu và danh mục bằng chữ để dễ nhập.</small>
                                    <button
                                        type="button"
                                        className="import-action-btn"
                                        onClick={onPickFile}
                                    >
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
                                disabled={pm.isImportingFile}
                            >
                                <Download size={16} />
                                Tải file mẫu
                            </button>

                            <button
                                type="button"
                                className="import-cancel-btn"
                                onClick={() => {
                                    if (!pm.isImportingFile) {
                                        setShowImportModal(false);
                                        setIsDraggingFile(false);
                                    }
                                }}
                                disabled={pm.isImportingFile}
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

function StatCard({ label, value, icon, tone = "primary" }) {
    const toneMap = {
        primary: "bg-primary-100 text-primary-600",
        success: "bg-emerald-100 text-emerald-600",
        info: "bg-sky-100 text-sky-600",
        warning: "bg-amber-100 text-amber-600",
        danger: "bg-rose-100 text-rose-600",
        neutral: "bg-neutral-100 text-neutral-700",
    };

    return (
        <div className="card p-6 flex items-center justify-between">
            <div>
                <p className="text-sm text-neutral-600">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${toneMap[tone] || toneMap.primary}`}>
                {icon}
            </div>
        </div>
    );
}
