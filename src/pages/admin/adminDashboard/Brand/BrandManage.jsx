import { Plus, Pencil, Trash2, Search, Building2, TrendingUp, ArrowDownWideNarrow, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import { useBrandLogic } from "./BrandLogic.js";
import BrandForm from "./BrandForm.jsx";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth.js";
import PaginationComponent from "../../../../components/common/PaginationComponent.jsx";
import "./Brand.css";

export default function BrandManage() {
    const bm = useBrandLogic();
    const [mounted, setMounted] = useState(false);
    const { user } = useAuth();
    const isAdmin = user?.roleId === "ROLE_ADMIN";
    const isEmployee = user?.roleId === "ROLE_EMPLOYEE";

    useEffect(() => {
        setMounted(true);
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

    return (
        <div className={`fade-in min-h-full ${mounted ? 'slide-up' : ''}`}>
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Quản Lý Thương Hiệu</h1>
                        <p className="text-neutral-600">Quản lý thông tin thương hiệu sản phẩm</p>
                    </div>
                    <button 
                        onClick={bm.openAdd}
                        className="btn-primary flex items-center gap-2 shadow-lg"
                    >
                        <Plus size={18} />
                        <span>Thêm Thương Hiệu</span>
                    </button>
                </div>

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
                                    <td colSpan="3" className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="loading-spinner w-8 h-8 mr-3"></div>
                                            <span className="text-neutral-600">Đang tải dữ liệu...</span>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!bm.loading && bm.paginatedBrands.map((b, index) => (
                                <tr key={b.hang_id} className="table-row" style={{ animationDelay: `${index * 50}ms` }}>
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
                                    <td colSpan="3" className="px-6 py-12 text-center">
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
        </div>
    );
}
