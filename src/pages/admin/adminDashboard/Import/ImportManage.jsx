import { Plus, Pencil, Trash2, Search, Package, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { useImportLogic } from "./ImportLogic";
import ImportForm from "./ImportForm";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth.js";
import PaginationComponent from "../../../../components/common/PaginationComponent.jsx";

export default function ImportManage() {
    const ip = useImportLogic();
    const [mounted, setMounted] = useState(false);
    const { user } = useAuth();
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 12;

    useEffect(() => {
        setMounted(true);
    }, []);

    // Kiểm tra quyền - chỉ ADMIN được phép
    if (user?.roleId !== "ROLE_ADMIN") {
        return <Navigate to="/unauthorized" replace />;
    }

    // Tính toán phân trang
    const totalPages = Math.ceil(ip.filteredList.length / itemsPerPage);
    const paginatedList = ip.filteredList.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    const handlePageChange = (page) => setCurrentPage(page);
    const handlePreviousPage = () => setCurrentPage(p => Math.max(0, p - 1));
    const handleNextPage = () => setCurrentPage(p => Math.min(totalPages - 1, p + 1));

    return (
        <div className={`fade-in min-h-full ${mounted ? 'slide-up' : ''}`}>
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Quản Lý Nhập Kho</h1>
                        <p className="text-neutral-600">Quản lý các phiếu nhập kho và theo dõi tồn kho</p>
                    </div>
                    <button 
                        onClick={ip.openAdd}
                        className="btn-primary flex items-center gap-2 shadow-lg"
                    >
                        <Plus size={18} />
                        <span>Thêm Nhập Kho</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Tổng Phiếu Nhập</p>
                                <p className="text-2xl font-bold text-neutral-900">{ip.filteredList.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                                <Package className="text-indigo-600" size={24} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Tổng Số Lượng</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {ip.filteredList.reduce((sum, item) => sum + (item.nk_quantity || 0), 0)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <TrendingUp className="text-emerald-600" size={24} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Hôm Nay</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {ip.filteredList.filter(item => item.nk_date === new Date().toISOString().slice(0, 10)).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Calendar className="text-amber-600" size={24} />
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
                            placeholder="Tìm theo mã NK, tên sản phẩm, thương hiệu, danh mục..."
                            value={ip.search}
                            onChange={(e) => ip.setSearch(e.target.value)}
                            className="flex-1 bg-transparent outline-none ml-3 text-neutral-900 placeholder-neutral-400"
                        />
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="table-container">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="table-header">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Mã NK
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Sản phẩm
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Thương hiệu
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Danh mục
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Số lượng
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Giá
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Ngày nhập
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {ip.loading && (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="loading-spinner w-8 h-8 mr-3"></div>
                                            <span className="text-neutral-600">Đang tải dữ liệu...</span>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!ip.loading && paginatedList.map((i, index) => (
                                <tr key={i.nk_id} className="table-row" style={{ animationDelay: `${index * 50}ms` }}>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm text-neutral-900 bg-neutral-100 px-2 py-1 rounded-lg">
                                            {i.nk_id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            {i.sp_image ? (
                                                <img 
                                                    src={i.sp_image} 
                                                    alt={i.sp_name}
                                                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-neutral-100"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.nextElementSibling.style.display = 'flex';
                                                    }}
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                            ) : null}
                                            <div 
                                                className="w-10 h-10 rounded-lg bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center flex-shrink-0"
                                                style={{ display: i.sp_image ? 'none' : 'flex' }}
                                            >
                                                <Package className="text-neutral-400" size={20} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-neutral-900 truncate">{i.sp_name}</p>
                                                {i.sp_description && (
                                                    <p className="text-xs text-neutral-500 mt-1 truncate">{i.sp_description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="badge-primary">{i.sp_brand}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="badge-success">{i.sp_category}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-semibold text-neutral-900">{i.nk_quantity}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-medium text-neutral-900">
                                            {i.sp_price ? i.sp_price.toLocaleString('vi-VN') : '0'} ₫
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-neutral-600">{i.nk_date}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => ip.openEdit(i)}
                                                className="p-2 text-neutral-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                                                title="Chỉnh sửa"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => ip.handleDelete(i.nk_id)}
                                                disabled={ip.deletingId === i.nk_id}
                                                className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Xóa"
                                            >
                                                {ip.deletingId === i.nk_id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {!ip.loading && ip.filteredList.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center">
                                        <div className="text-center">
                                            <Package className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                                            <h3 className="text-lg font-medium text-neutral-900 mb-2">Không có dữ liệu nhập kho</h3>
                                            <p className="text-neutral-600">Bắt đầu bằng cách thêm phiếu nhập kho đầu tiên</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {!ip.loading && ip.filteredList.length > 0 && (
                <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    totalItems={ip.filteredList.length}
                    onPageChange={handlePageChange}
                    onPreviousPage={handlePreviousPage}
                    onNextPage={handleNextPage}
                    itemLabel="phiếu nhập"
                />
            )}

            {/* MODAL */}
            <ImportForm
                open={ip.openForm}
                onClose={() => ip.setOpenForm(false)}
                onSubmit={{
                    form: ip.form,
                    setForm: ip.setForm,
                    handleSubmit: ip.handleSubmit,
                    products: ip.products
                }}
            />
        </div>
    );
}
