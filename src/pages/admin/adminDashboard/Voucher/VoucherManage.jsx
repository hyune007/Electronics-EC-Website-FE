import { Plus, Pencil, Trash2, Search, Percent, Calendar, Tag, Clock, Gift, ChevronLeft, ChevronRight } from "lucide-react";
import { useVoucherLogic } from "./VoucherLogic.js";
import VoucherForm from "./VoucherForm.jsx";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth.js";
import PaginationComponent from "../../../../components/common/PaginationComponent.jsx";
import "./Voucher.css";

export default function VoucherManage() {
    const vm = useVoucherLogic();
    const [mounted, setMounted] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Kiểm tra quyền - chỉ ADMIN được phép
    if (user?.roleId !== "ROLE_ADMIN") {
        return <Navigate to="/unauthorized" replace />;
    }

    const getStatusBadge = (startDate, endDate) => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (now < start) return 'badge-warning';
        if (now > end) return 'badge-danger';
        return 'badge-success';
    };

    const getStatusText = (startDate, endDate) => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (now < start) return 'Sắp diễn ra';
        if (now > end) return 'Đã kết thúc';
        return 'Đang hoạt động';
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
                    <button 
                        onClick={vm.openAdd}
                        className="btn-primary flex items-center gap-2 shadow-lg"
                    >
                        <Plus size={18} />
                        <span>Thêm Voucher</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Tổng Voucher</p>
                                <p className="text-2xl font-bold text-neutral-900">{vm.filteredVouchers.length}</p>
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
                                <p className="text-2xl font-bold text-neutral-900">
                                    {vm.filteredVouchers.filter(v => {
                                        const now = new Date();
                                        const start = new Date(v.km_start_date);
                                        const end = new Date(v.km_end_date);
                                        return now >= start && now <= end;
                                    }).length}
                                </p>
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
                                <p className="text-2xl font-bold text-neutral-900">
                                    {vm.filteredVouchers.filter(v => new Date() < new Date(v.km_start_date)).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Clock className="text-amber-600" size={24} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Đã Kết Thúc</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {vm.filteredVouchers.filter(v => new Date() > new Date(v.km_end_date)).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <Calendar className="text-red-600" size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Section */}
            <div className="card p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 search-box">
                        <Search className="text-neutral-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm theo tên voucher..."
                            value={vm.search}
                            onChange={(e) => vm.setSearch(e.target.value)}
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
                                                <p className="text-xs text-neutral-500">Voucher</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Percent className="text-emerald-600" size={16} />
                                            <span className="font-semibold text-emerald-600">{v.km_percent}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <div className="flex items-center gap-2 text-neutral-600">
                                                <Calendar className="text-neutral-400" size={14} />
                                                <span>{v.km_start_date}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-neutral-600">
                                                <Clock className="text-neutral-400" size={14} />
                                                <span>{v.km_end_date}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={getStatusBadge(v.km_start_date, v.km_end_date)}>
                                            {getStatusText(v.km_start_date, v.km_end_date)}
                                        </span>
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
                                    <td colSpan="6" className="px-6 py-12 text-center">
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
            {vm.filteredVouchers.length > 0 && (
                <PaginationComponent
                    currentPage={vm.currentPage}
                    totalPages={vm.totalPages}
                    itemsPerPage={vm.itemsPerPage}
                    totalItems={vm.filteredVouchers.length}
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
        </div>
    );
}
