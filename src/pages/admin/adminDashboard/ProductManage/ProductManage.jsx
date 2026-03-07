import {
    Plus,
    Pencil,
    Trash2,
    Search,
    Package,
    TrendingUp,
    DollarSign,
    Image,
    Loader2
} from "lucide-react";
import ProductForm from "./ProductForm.jsx";
import { useProductManageLogic } from "./Productlogic.js";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth.js";
import PaginationComponent from "../../../../components/common/PaginationComponent.jsx";
import "./Product.css";

export default function ProductManage() {
    const pm = useProductManageLogic();
    const [mounted, setMounted] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Kiểm tra quyền - chỉ ADMIN được phép
    if (user?.roleId !== "ROLE_ADMIN") {
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

                    <button
                        onClick={pm.openAdd}
                        disabled={pm.isGeneratingId}
                        className="btn-primary shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {pm.isGeneratingId ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Đang tạo...
                            </>
                        ) : (
                            <>
                                <Plus size={18} />
                                Thêm Sản Phẩm
                            </>
                        )}
                    </button>
                </div>

                {/* ===== STATS ===== */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        label="Tổng sản phẩm"
                        value={pm.totalElements}
                        icon={<Package />}
                    />
                    <StatCard
                        label="Tổng giá trị"
                        value={`${pm.globalStats.totalValue.toLocaleString("vi-VN")} ₫`}
                        icon={<DollarSign />}
                    />
                    <StatCard
                        label="Tồn kho"
                        value={pm.globalStats.totalStock}
                        icon={<TrendingUp />}
                    />
                    <StatCard
                        label="Sắp hết hàng"
                        value={pm.globalStats.lowStock}
                        icon={<Image />}
                    />
                </div>
            </div>

            {/* ===== SEARCH ===== */}
            <div className="card p-6 mb-6">
                <div className="search-box">
                    <Search size={18} className="text-neutral-400" />
                    <input
                        value={pm.search}
                        onChange={e => pm.setSearch(e.target.value)}
                        placeholder="Tìm theo tên hoặc mã sản phẩm..."
                        className="flex-1 ml-3 outline-none bg-transparent"
                    />
                </div>
            </div>

            {/* ===== TABLE ===== */}
            <div className="table-container">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="table-header">
                            <tr>
                                <th>Mã</th>
                                <th>Sản phẩm</th>
                                <th className="text-right">Giá</th>
                                <th className="text-center">Kho</th>
                                <th>Danh mục</th>
                                <th>Thương hiệu</th>
                                <th className="text-center">Ảnh</th>
                                <th className="text-center">Hành động</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y page-animate">
                            {pm.loading && (
                                <tr>
                                    <td colSpan="8" className="py-10 text-center">
                                        <div className="flex justify-center items-center">
                                            <div className="loading-spinner w-8 h-8 mr-3" />
                                            Đang tải dữ liệu...
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!pm.loading &&
                                pm.products.map((p, index) => (
                                    <tr
                                        key={p.sp_id}
                                        className="table-row"
                                        style={{
                                            animationDelay: `${index * 40}ms`
                                        }}
                                    >
                                        <td>
                                            <span className="font-mono bg-neutral-100 px-2 py-1 rounded">
                                                {p.sp_id}
                                            </span>
                                        </td>

                                        <td>
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

                                        <td className="text-right font-medium">
                                            {p.sp_price.toLocaleString(
                                                "vi-VN"
                                            )}{" "}
                                            ₫
                                        </td>

                                        <td className="text-center">
                                            <span
                                                className={`font-semibold ${p.sp_stock < 10
                                                    ? "text-red-600"
                                                    : p.sp_stock < 50
                                                        ? "text-amber-600"
                                                        : "text-emerald-600"
                                                    }`}
                                            >
                                                {p.sp_stock}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="badge-success">
                                                {p.sp_category_name}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="badge-primary">
                                                {p.sp_brand_name}
                                            </span>
                                        </td>

                                        <td className="text-center">
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
                                                    onClick={() => pm.handleDelete(p.sp_id)}
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
                                        colSpan="8"
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
                isGeneratingId={pm.isGeneratingId}
                isSubmitting={pm.isSubmitting}
                brands={pm.brands}
                categories={pm.categories}
            />
        </div>
    );
}

function StatCard({ label, value, icon }) {
    return (
        <div className="card p-6 flex items-center justify-between">
            <div>
                <p className="text-sm text-neutral-600">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                {icon}
            </div>
        </div>
    );
}
